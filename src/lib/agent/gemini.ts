// ZERO FLARE — Gemini provider adapter (CODEX Phase 3).
//
// Native function/tool calling via the official @google/genai SDK.
// Provider selection:
//   AI_PROVIDER=gemini   → @google/genai (preferred: free tier, tool calling)
//   LLM_API_KEY+LLM_BASE_URL → any OpenAI-compatible endpoint (Groq/Z.ai/etc.)
//   (default fallback)   → z-ai-web-dev-sdk platform SDK
//
// The API key is read from env (server-side only): AI_API_KEY / GEMINI_API_KEY.
// Never hardcoded, never shipped to the browser, never logged.
import type { ContentListUnion, FunctionDeclaration, Tool as GeminiTool } from "@google/genai";
import { getToolCatalogue, type ToolResult } from "@/lib/agent/tools";

export interface GeminiProvider {
  enabled: boolean;
  model: string;
}

export function geminiProvider(): GeminiProvider {
  const key = process.env.AI_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.LLM_API_KEY;
  const provider = (process.env.AI_PROVIDER ?? "").toLowerCase();
  const enabled = Boolean(key) && (provider === "gemini" || provider === "" || provider === "auto");
  return { enabled, model: process.env.AI_MODEL ?? "gemini-3.5-flash-lite" };
}

/** Native declarations carry a curated subset of the 42-tool registry.
 *  Full-catalogue payloads make Gemini 3.x thinking models exceed response
 *  deadlines (>32 s before the first round); 18 core tools cover the research
 *  journeys. Everything else stays reachable through the deterministic UI. */
const GEMINI_TOOL_ALLOWLIST = new Set([
  "search_evidence",
  "search_knowledge_base",
  "list_investigations",
  "get_investigation",
  "query_dataset",
  "eda_statistics",
  "list_experiment_datasets",
  "resolve_experiment",
  "query_experiment_dataset",
  "search_equations",
  "calculate_equation",
  "run_mathematical_model",
  "check_model_applicability",
  "run_flex_model",
  "get_findings",
  "navigate",
  "generate_chart",
  "analyze_fire_safety_scenario",
]);

/** Names of the tools declared natively to Gemini (prompt mirrors this subset). */
export function geminiToolSubsetNames(): string[] {
  return getToolCatalogue()
    .map((t) => t.name)
    .filter((n) => GEMINI_TOOL_ALLOWLIST.has(n));
}

/** Convert the tool registry into Gemini FunctionDeclarations (curated subset). */
function toolDeclarations(): FunctionDeclaration[] {
  return getToolCatalogue()
    .filter((t) => GEMINI_TOOL_ALLOWLIST.has(t.name))
    .map((t) => ({
      name: t.name,
      description: t.description.slice(0, 500),
      parameters: {
        type: "object",
        properties: Object.fromEntries(
          Object.entries(t.args).map(([k, v]) => [k, { type: "string", description: v.slice(0, 200) }]),
        ),
        required: [] as string[],
      },
    } as unknown as FunctionDeclaration));
}

/** @google/genai v3 wraps the API body: { response: { candidates, ... } }.
 *  Some SDK paths return the body directly — unwrap defensively. */
function unwrapResponse(response: unknown): Record<string, unknown> {
  const r = response as { response?: unknown } & Record<string, unknown>;
  const inner = r?.response;
  if (inner && typeof inner === "object" && !Array.isArray(inner) && "candidates" in (inner as object)) {
    return inner as Record<string, unknown>;
  }
  return response as Record<string, unknown>;
}

interface GeminiPart {
  text?: string;
  thought?: boolean;
  functionCall?: { name?: string; args?: Record<string, unknown> };
  thoughtSignature?: string;
  [k: string]: unknown;
}

function responseParts(response: unknown): GeminiPart[] {
  const body = unwrapResponse(response);
  const candidates = body?.candidates as { content?: { parts?: GeminiPart[] } }[] | undefined;
  return candidates?.[0]?.content?.parts ?? [];
}

interface GeminiToolCall {
  name: string;
  args: Record<string, unknown>;
}

/** Extract function-call parts from a Gemini response. */
function extractToolCalls(response: unknown): GeminiToolCall[] {
  return responseParts(response)
    .filter((p) => p.functionCall?.name)
    .map((p) => ({ name: p.functionCall!.name as string, args: p.functionCall!.args ?? {} }));
}

function extractText(response: unknown): string | null {
  const texts = responseParts(response)
    .filter((p) => typeof p.text === "string" && !p.thought && p.text.trim())
    .map((p) => p.text as string);
  const joined = texts.join("\n").trim();
  return joined || null;
}

/** Execute a Gemini-driven agent turn with native tool calling.
 *  Returns the final text plus the tool trace. */
export async function runGeminiAgent(
  systemPrompt: string,
  messages: { role: string; content: string }[],
  executeToolFn: (name: string, args: Record<string, unknown>) => Promise<ToolResult>,
  opts: { maxRounds?: number } = {},
): Promise<{ reply: string | null; toolTrace: { name: string; summary: string; provenance: string; ok: boolean }[]; charts: unknown[]; uiActions: Record<string, unknown>[] }> {
  const { GoogleGenAI } = await import("@google/genai");
  const prov = geminiProvider();
  const ai = new GoogleGenAI({
    apiKey: process.env.AI_API_KEY ?? process.env.GEMINI_API_KEY ?? process.env.LLM_API_KEY,
    httpOptions: { timeout: 32000 }, // per-call ceiling (42-tool payloads think longer); the loop keeps its own deadline
  });
  const tools: GeminiTool[] = [{ functionDeclarations: toolDeclarations() }];

  const contents: { role: string; parts: Record<string, unknown>[] }[] = [
    ...messages.slice(-12).map((m) => ({ role: m.role === "assistant" ? "model" : "user", parts: [{ text: m.content }] })),
  ];

  const toolTrace: { name: string; summary: string; provenance: string; ok: boolean }[] = [];
  const charts: unknown[] = [];
  const uiActions: Record<string, unknown>[] = [];
  let lastText: string | null = null;

  // Flash models intermittently return 503/504 "high demand"/deadline — retry
  // with backoff, then fall back to sibling free-tier models, all inside a hard
  // wall-clock budget so the API route keeps its own deadline.
  const DEADLINE_MS = 50000;
  const startedAt = Date.now();
  const timeLeft = () => DEADLINE_MS - (Date.now() - startedAt);
  const RETRY_DELAYS_MS = [1500, 3500];
  const MODEL_CHAIN = [...new Set([prov.model, "gemini-3.5-flash", "gemini-3.6-flash"])];

  async function generateWithRetry(): Promise<unknown> {
    let lastErr: unknown;
    for (const model of MODEL_CHAIN) {
      for (let attempt = 0; attempt <= RETRY_DELAYS_MS.length; attempt++) {
        if (timeLeft() < 6000) {
          if (lastErr) throw lastErr;
          throw new Error("gemini deadline exhausted before first attempt");
        }
        try {
          return await ai.models.generateContent({
            model,
            contents: contents as ContentListUnion,
            config: {
              systemInstruction: systemPrompt,
              tools,
              temperature: 0.4,
              // Gemini 3.x defaults to deep thinking — with a large research
              // prompt + tool catalogue it exceeded every deadline. "low"
              // keeps tool choice sharp while returning within budget.
              thinkingConfig: { thinkingLevel: "low" },
            } as never,
          });
        } catch (err) {
          lastErr = err;
          const msg = String((err as Error)?.message ?? err);
          const retriable =
            /50[034]|429|UNAVAILABLE|DEADLINE_EXCEEDED|overloaded|high demand|INTERNAL|Deadline expired/i.test(msg);
          if (!retriable) throw err;
          if (attempt === RETRY_DELAYS_MS.length) break; // next model in the chain
          await new Promise((r) => setTimeout(r, RETRY_DELAYS_MS[attempt]));
        }
      }
    }
    throw lastErr instanceof Error ? lastErr : new Error(String(lastErr));
  }

  const maxRounds = opts.maxRounds ?? 3;
  for (let round = 0; round < maxRounds; round++) {
    if (timeLeft() < 8000) break; // no budget for another round — return what we have
    const response = await generateWithRetry();

    const calls = extractToolCalls(response);
    const text = extractText(response);
    if (text) lastText = text;
    // ops diagnostics (no secrets): round behaviour of the tool loop
    console.info(`[copilot] gemini round ${round + 1}: ${calls.length} tool call(s) [${calls.map((c) => c.name).join(", ")}], text=${Boolean(text).toString()}`);

    if (calls.length === 0) break; // final answer reached

    // execute tools, then continue the conversation with the model's own parts
    // (functionCall + thoughtSignature preserved verbatim — Gemini 3 requires
    // the signature round-tripped) followed by the function responses.
    const rawModelParts = responseParts(response).filter((p) => p.functionCall?.name);
    const responsePartsOut: Record<string, unknown>[] = [];
    for (const call of calls.slice(0, 4)) {
      const result: ToolResult = await executeToolFn(call.name, call.args);
      toolTrace.push({ name: call.name, summary: result.summary, provenance: result.provenance, ok: result.ok });
      if (result.chart) charts.push(result.chart);
      const data = result.data as { action?: string } | undefined;
      if (data && typeof data === "object" && "action" in data) uiActions.push(data as Record<string, unknown>);
      responsePartsOut.push({
        functionResponse: {
          name: call.name,
          response: { summary: result.summary, ok: result.ok, data: JSON.stringify(result.data ?? null).slice(0, 3500) },
        },
      });
    }
    contents.push({ role: "model", parts: rawModelParts as Record<string, unknown>[] });
    contents.push({ role: "user", parts: responsePartsOut });
  }

  return { reply: lastText, toolTrace, charts, uiActions };
}
