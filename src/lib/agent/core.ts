// FLAME EVIDENCE LAB — CIR-1 agent core: natural conversation + typed tool orchestration
// Behaviour contract (spec M6): small-talk answers naturally with NO tool calls;
// scientific requests use tools; every number in the reply comes from tool output;
// the agent cites provenance and states limitations; it never invents data.

import { getToolCatalogue, executeTool, type ScenarioToolContext, type ToolResult } from "@/lib/agent/tools";
import { geminiProvider, geminiToolSubsetNames, runGeminiAgent } from "@/lib/agent/gemini";
import { getBindings } from "@/lib/server/bindings";
import { guardPublicHttpUrl, safeFetch } from "@/lib/server/safe-fetch";

// Turn-scoped Gemini artifacts: set when Route 0 runs, consumed by runAgent to
// merge trace/charts/uiActions into the AgentResponse (request-scoped, no
// concurrency leak because Node handles each request synchronously through the
// agent's own closure).
let currentScenarioContext: ScenarioToolContext | null = null;
let lastGeminiTrace: { name: string; summary: string; provenance: string; ok: boolean }[] = [];
let lastGeminiCharts: unknown[] = [];
let lastGeminiActions: Record<string, unknown>[] = [];
import type { ChartSpec } from "@/lib/app-store";

/** Environment id → scenario physics seed (kPa from the challenge-documented concepts). */
const ENV_SCENARIO: Record<string, { gravity: number; o2: number; pressureKpa: number; stationType: string }> = {
  earth: { gravity: 1, o2: 0.21, pressureKpa: 101.3, stationType: "spacecraft-cabin" },
  iss: { gravity: 1e-6, o2: 0.21, pressureKpa: 101.3, stationType: "iss-module" },
  moon: { gravity: 0.166, o2: 0.3, pressureKpa: 70.3, stationType: "lunar-habitat" },
  mars: { gravity: 0.38, o2: 0.21, pressureKpa: 70.3, stationType: "pressurized-rover" },
  spacecraft: { gravity: 1e-6, o2: 0.21, pressureKpa: 101.3, stationType: "spacecraft-cabin" },
  spacesuit: { gravity: 1e-6, o2: 1.0, pressureKpa: 29.6, stationType: "spacecraft-cabin" },
};

/** Build the request-scoped scenario tool context (CODEX Phase 2 — replaces
 *  the former module-global setScenarioToolContext; each request gets an
 *  immutable context object derived from the validated client payload). */
function buildScenarioContext(ctx: AgentContext): ScenarioToolContext | null {
  const envSeed = ENV_SCENARIO[ctx.environment ?? ""] ?? null;
  return {
    stationType: envSeed?.stationType,
    gravity: envSeed?.gravity,
    o2: envSeed?.o2,
    pressureKpa: envSeed?.pressureKpa,
    ventilationCmS: 5,
    compartments: ctx.facility?.compartments.map((c, i) => ({
      id: `c-${i + 1}`,
      name: c.name,
      lengthM: Math.max(1, Math.sqrt(Math.max(c.areaM2, 1))),
      widthM: Math.max(1, Math.sqrt(Math.max(c.areaM2, 1))),
      heightM: Math.max(1.8, c.heightM),
      materials: c.materials,
      ventilationCmS: c.ventilation === "forced" ? 8 : c.ventilation === "quiescent" ? 0.5 : 5,
      ignitionSources: c.ignitionSources > 1 ? ["electronics", "hot-surface"] : ["electronics"],
      detection: c.detection === "integrated" ? ["photoelectric", "ionization"] : c.detection === "local" ? ["photoelectric"] : [],
      suppression: c.detection === "integrated" ? ["co2"] : ["portable-ext"],
    })),
  };
}

export interface ChatTurn {
  role: "user" | "assistant";
  content: string;
}

export interface AgentContext {
  view?: string;
  environment?: string;
  environmentLabel?: string;
  investigation?: string | null;
  investigationTab?: string | null;
  selection?: string | null;
  /** §8 — when set, the agent operates as the scenario Fire Safety Assistant. */
  role?: "fire-safety";
  /** Compact facility screening summary (§7.1/§8) — ids and numbers only. */
  facility?: {
    name: string;
    layoutImageAttached: boolean;
    compartments: {
      name: string;
      areaM2: number;
      heightM: number;
      volumeM3: number;
      materials: string[];
      ignitionSources: number;
      ventilation: string;
      detection: string;
      screeningScore?: number;
    }[];
    screeningScores?: { name: string; score: number; label: string }[];
  };
  /** §11.1 — selected 3D Lab equipment. */
  equipment?: string | null;
  /** §11.1 — active scenario pillar. */
  scenarioPillar?: string | null;
}

export interface AgentResponse {
  reply: string;
  toolTrace: { name: string; args: Record<string, unknown>; summary: string; provenance: string; ok: boolean }[];
  charts: ChartSpec[];
  uiActions: Record<string, unknown>[];
  sources: string[];
  mode: "natural" | "tool-driven";
  llm: "live" | "unavailable";
}

export function buildSystemPrompt(ctx: AgentContext, opts: { nativeToolCalling?: boolean } = {}): string {
  // Route 0 (Gemini native) declares a curated subset and gets a matching
  // prompt; Routes 1/2 keep the full catalogue plus the fenced toolcall protocol.
  const names = opts.nativeToolCalling ? new Set(geminiToolSubsetNames()) : null;
  const catalogue = getToolCatalogue()
    .filter((t) => !names || names.has(t.name))
    .map((t) => `- ${t.name}(${Object.entries(t.args).map(([k, v]) => `${k}: ${v}`).join(", ")}): ${t.description}`)
    .join("\n");

  const contextLines: string[] = [];
  if (ctx.view) contextLines.push(`- current section: ${ctx.view}`);
  if (ctx.environmentLabel) contextLines.push(`- selected mission environment: ${ctx.environmentLabel}${ctx.environment ? ` (${ctx.environment})` : ""}`);
  if (ctx.investigation) contextLines.push(`- user is viewing investigation ${ctx.investigation}${ctx.investigationTab ? ` (tab: ${ctx.investigationTab})` : ""}`);
  if (ctx.selection) contextLines.push(`- user selection reference: ${ctx.selection}`);
  if (ctx.equipment) contextLines.push(`- user is inspecting 3D Lab equipment: ${ctx.equipment}`);
  if (ctx.scenarioPillar) contextLines.push(`- active scenario pillar: ${ctx.scenarioPillar}`);
  if (ctx.facility) {
    contextLines.push(`- facility under screening: "${ctx.facility.name}"${ctx.facility.layoutImageAttached ? " (layout image attached as a visual reference — NOT parsed)" : ""}`);
    for (const c of ctx.facility.compartments) {
      contextLines.push(`  · compartment "${c.name}": ${c.areaM2} m² × ${c.heightM} m (${c.volumeM3.toFixed(0)} m³), materials [${c.materials.join(", ")}], ${c.ignitionSources} ignition source(s), ventilation ${c.ventilation}, detection ${c.detection}${typeof c.screeningScore === "number" ? `, deterministic screening ${c.screeningScore}/100` : ""}`);
    }
    if (ctx.facility.screeningScores?.length) {
      contextLines.push(`- deterministic screening ranking (from the transparent arithmetic in the UI, weights are policy choices): ${ctx.facility.screeningScores.map((s) => `${s.name}=${s.score} (${s.label})`).join("; ")}`);
    }
  }

  const fireSafetyRole = ctx.role === "fire-safety"
    ? `
FIRE SAFETY ASSISTANT ROLE (§8 — you are currently serving inside the Scenarios experience)
You help researchers and space-safety specialists evaluate fire risks for the facility defined above (ISS, lunar or Martian station, spacecraft or rover concepts).
- GROUND EVERY RECOMMENDATION: use get_findings, search_evidence, get_atmospheres, identify_evidence_gaps (and other tools) to attach NASA PSI evidence to each recommendation. Cite the investigation accession or source in every factual claim.
- STRUCTURE: when asked for an analysis, organize the answer as: (1) facility risk assessment, (2) compartment ranking review (compare with the deterministic screening scores and comment on divergences), (3) prevention recommendations, (4) detection strategy + sensor placement guidance, (5) suppression context, (6) integrated safety-system notes, (7) evidence gaps and open questions.
- ASK, DON'T ASSUME: if essential parameters are missing (e.g., a compartment with no materials specified, unknown ventilation), ASK targeted follow-up questions instead of inventing values. A material with no microgravity evidence must be called out as an evidence gap — never assumed safe.
- RELIABILITY BANDS: clearly distinguish (a) experimentally validated findings (name the investigation), (b) derived engineering judgement, (c) AI-generated interpretation. State explicitly that this is research decision support, NOT a certified operational procedure or a replacement for NASA safety standards and qualified engineering review.
- LIMITS: no suppressant agent ranking (no comparative dataset), no CFD/fire-growth claims, no partial-gravity extrapolation of microgravity models.
`
    : "";

  return `You are CIR-1, the research copilot of the ZERO FLARE team's FLAME EVIDENCE LAB — an evidence-grounded AI research assistant over NASA microgravity combustion evidence (NASA Space Apps challenge "Flame in Freefall"). Your name is CIR-1 (after the Combustion Integrated Rack you are modelled on); introduce yourself as CIR-1 when asked who you are.

PRODUCT CONTEXT
- Evidence base: 24 NASA PSI combustion investigations (metadata + 22 recovered experimental tables, 2,009 rows, SHA-256-verified against the project manifest), findings registry, gap registry, verified equation registry, model registry (FLEX extinction v2 verified reproduction; CFI-G exploratory; SPICE negative result), authentic NASA media index, official source registry.
- This is research decision support, NOT a certified spacecraft fire-safety system. Never issue operational fire-emergency instructions; official mission procedures always take precedence.

USER CONTEXT (answer with this awareness)
${contextLines.length ? contextLines.join("\n") : "- no specific context yet"}
${fireSafetyRole}

BEHAVIOUR RULES
1. CONVERSATION FIRST: greetings, thanks, identity questions, small talk and chit-chat get a natural, warm, brief reply with NO tool calls. Never force a scientific tool for social messages.
2. TOOLS FOR FACTS: any question about evidence, data, investigations, equations, calculations, models, media, equipment, sources or navigation MUST go through tools. You have NO memory of numbers — every number you state must come from tool output in this conversation. If a tool returns nothing, say so honestly (distinguish: absent / not indexed / inaccessible / no evidence found).
3. HONESTY: never invent measurements, citations, graph values, model performance or safety guidance. Refuse out-of-domain model inputs (e.g., FLEX refuses gravity > 0.02 g). Present negative results as negative. Mention key caveats compactly.
3b. EXTERNAL EVIDENCE: when a user asks whether something is studied/exists in the literature and the LOCAL corpus has nothing, use search_external_literature or check_gap_externally BEFORE concluding anything — absence in this platform is not absence in the field. If the external tool fails, say the check was unavailable and make no claim either way. External NTRS results are reported with their ntrs.nasa.gov citation URLs and dates.
4. STYLE: concise, expert, friendly. Prefer 2-6 sentences plus compact structure. Cite provenance (source file, NASA id, DOI/URL) for every factual claim. Use markdown sparingly (bold key values, bullets for lists). No emojis.

TOOL PROTOCOL
${
  opts.nativeToolCalling
    ? `You have NATIVE function calling: emit tool calls through the function-calling interface itself — NEVER emit fenced \`\`\`toolcall\`\`\` blocks or JSON-in-text. After each round the tool results arrive as function responses; when you have enough evidence, reply with the final natural answer (no function call).
Rules: max 4 tool calls per round; choose the best tools yourself; if a calculation needs parameters the user did not give, either pick clearly-labelled sensible defaults FROM CONTEXT (e.g., current environment values) and say so, or ask for exactly the missing values. Never fabricate tool inputs presented as user data. Pass plain numbers (e.g. 527.5), never arithmetic expressions. Keep answers SHORT — after one or two tool rounds, compose the final reply from what the tools returned.`
    : `When tools are needed, reply with EXACTLY one fenced block and nothing else after it:
\`\`\`toolcall
{"toolCalls": [{"name": "...", "args": {...}}], "say": "one short sentence before running tools (optional)"}
\`\`\`
Rules: max 4 tool calls per turn; choose the best tools yourself; if a calculation needs parameters the user did not give, either pick clearly-labelled sensible defaults FROM CONTEXT (e.g., current environment values) and say so, or ask for exactly the missing values. Never fabricate tool inputs presented as user data. IMPORTANT: tool args must be a VALID JSON object — compute all unit conversions yourself and pass plain numbers (e.g. "pressureMmHg": 527.5), never arithmetic expressions like "10.2 * 51.715".`
}

AVAILABLE TOOLS
${catalogue}

Reply now. For small talk: just answer naturally (no tools). For evidence questions: use ${
  opts.nativeToolCalling ? "the native function-calling interface" : "the toolcall block"
}.`;
}

// ---- LLM provider (server-side only) ----
// Provider 0: Gemini native tool-calling agent via @google/genai (CODEX Phase 3;
// preferred free tier). Provider 1: any OpenAI-compatible endpoint via env (free
// tiers: Google AI Studio / Groq / Z.ai open platform — see start.sh). Provider
// 2: z-ai-web-dev-sdk (platform-managed credential). Keys stay server-side.

let compatCache: { base: string; key: string; model: string } | null | undefined;
function compatibleProvider(): { base: string; key: string; model: string } | null {
  if (compatCache !== undefined) return compatCache;
  const key = process.env.LLM_API_KEY;
  const base = process.env.LLM_BASE_URL;
  const model = process.env.LLM_MODEL ?? "gpt-4o-mini";
  compatCache = key && base ? { base: base.replace(/\/$/, ""), key, model } : null;
  return compatCache;
}

async function callOpenAICompatible(
  provider: { base: string; key: string; model: string },
  systemPrompt: string,
  messages: ChatTurn[],
): Promise<string | null> {
  // LLM_BASE_URL is operator-provided env — validate the endpoint is a plain
  // http/https URL to a public host, then fetch it directly (same validated
  // guard + direct fetch pattern as the NASA API client).
  const endpoint = `${provider.base}/chat/completions`;
  guardPublicHttpUrl(endpoint, "LLM endpoint");
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${provider.key}`,
    },
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.4,
      max_tokens: 2048,
    }),
    signal: AbortSignal.timeout(55000),
  });
  if (!res.ok) throw new Error(`LLM HTTP ${res.status}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  const content = data?.choices?.[0]?.message?.content;
  return typeof content === "string" && content.trim() ? content : null;
}

/**
 * Route 1.5 — Cloudflare Workers AI (zero-key provider on the edge deployment).
 * The `AI` binding ships with the Worker itself: no API key management, and the
 * fenced-```toolcall``` protocol below works with any text-completion model.
 * Text model default: llama-3.3-70b-instruct (fast, free-tier Workers AI).
 */
async function callWorkersAI(systemPrompt: string, messages: ChatTurn[]): Promise<string | null> {
  const ai = getBindings()?.AI;
  if (!ai) return null;
  const model = process.env.WORKERS_AI_MODEL ?? "@cf/meta/llama-3.3-70b-instruct-fp8-fast";
  const result = (await Promise.race([
    ai.run(model, {
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      temperature: 0.4,
      max_tokens: 2048,
    }),
    new Promise((_, reject) => setTimeout(() => reject(new Error("Workers AI timeout")), 55_000)),
  ])) as { response?: unknown } | undefined;
  const content = result?.response;
  return typeof content === "string" && content.trim() ? content : null;
}

export async function callLLM(
  systemPrompt: string,
  messages: ChatTurn[],
  opts: { nativePrompt?: string; plain?: boolean } = {},
): Promise<string | null> {
  // Route 0 — Gemini native tool-calling agent (CODEX Phase 3; preferred free tier).
  // The reply text is produced inside runGeminiAgent's loop; trace/charts/actions
  // are captured for the current invocation via module-scoped turn state set by
  // runAgent before calling callLLM. `plain` skips Route 0 for internal prompts
  // (e.g. the post-tool synthesizer) that are not agent turns.
  const gem = geminiProvider();
  if (gem.enabled && !opts.plain) {
    try {
      const agent = await runGeminiAgent(opts.nativePrompt ?? systemPrompt, messages, async (name, args) => {
        const { executeTool } = await import("@/lib/agent/tools");
        return executeTool(name, args, currentScenarioContext);
      }, { maxRounds: 5 });
      if (agent.reply) {
        lastGeminiTrace = agent.toolTrace;
        lastGeminiCharts = agent.charts;
        lastGeminiActions = agent.uiActions;
        return agent.reply;
      }
      if (agent.toolTrace.length > 0) {
        // the loop ran real tools but exhausted its rounds before composing the
        // final text — surface the trace honestly instead of "unavailable"
        lastGeminiTrace = agent.toolTrace;
        lastGeminiCharts = agent.charts;
        lastGeminiActions = agent.uiActions;
        const lines = agent.toolTrace
          .map((t, i) => `${i + 1}. **${t.name}** — ${t.summary}`)
          .join("\n");
        return `I ran the tools but reached my reasoning-round budget before composing the full answer. Here is what they returned:\n\n${lines}`;
      }
      console.error("[copilot] Gemini agent returned no text — falling back");
    } catch (err) {
      console.error("[copilot] Gemini agent failed:", (err as Error).message);
      // fall through to other providers
    }
  }
  // Route 1 — user-supplied OpenAI-compatible provider (free tiers supported)
  const provider = compatibleProvider();
  if (provider) {
    try {
      const content = await callOpenAICompatible(provider, systemPrompt, messages);
      if (content) return content;
      console.error("[copilot] OpenAI-compatible provider returned empty content");
    } catch (err) {
      console.error("[copilot] OpenAI-compatible provider failed:", (err as Error).message);
      // fall through to platform SDK as backup
    }
  }
  // Route 2 — platform SDK (z-ai-web-dev-sdk)
  try {
    const { default: ZAI } = await import("z-ai-web-dev-sdk");
    const zai = await ZAI.create();
    const completion = await zai.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...messages.map((m) => ({ role: m.role, content: m.content })),
      ],
      thinking: { type: "disabled" },
    });
    const content = completion?.choices?.[0]?.message?.content;
    return typeof content === "string" ? content : null;
  } catch (err) {
    console.error("[copilot] LLM unavailable:", (err as Error).message);
    return null;
  }
}

interface ToolCallBlock {
  toolCalls: { name: string; args: Record<string, unknown> }[];
  say?: string;
}

function sanitizeArgsJson(raw: string): string {
  // Some models emit arithmetic inside JSON numeric fields (e.g. 10.2 * 51.715).
  // Evaluate only simple "number op number" products/quotients in numeric value positions — never eval().
  return raw.replace(
    /(:\s*)(-?\d+(?:\.\d+)?)\s*([*/])\s*(-?\d+(?:\.\d+)?)/g,
    (_m, colon: string, a: string, op: string, b: string) => {
      const x = Number(a);
      const y = Number(b);
      const v = op === "*" ? x * y : y === 0 ? NaN : x / y;
      return Number.isFinite(v) ? `${colon}${Number(v.toFixed(6))}` : `${colon}${a}`;
    },
  );
}

function parseToolCalls(reply: string): ToolCallBlock | null {
  const fence = reply.match(/```toolcall\s*([\s\S]*?)```/);
  const raw = fence ? fence[1] : null;
  if (!raw) {
    // also accept a bare JSON object with toolCalls
    const m = reply.match(/\{\s*"toolCalls"[\s\S]*\}/);
    if (!m) return null;
    try {
      const parsed = JSON.parse(sanitizeArgsJson(m[0])) as ToolCallBlock;
      return Array.isArray(parsed.toolCalls) ? parsed : null;
    } catch {
      return null;
    }
  }
  try {
    const parsed = JSON.parse(sanitizeArgsJson(raw)) as ToolCallBlock;
    return Array.isArray(parsed.toolCalls) && parsed.toolCalls.length ? parsed : null;
  } catch {
    return null;
  }
}

export async function runAgent(messages: ChatTurn[], ctx: AgentContext): Promise<AgentResponse> {
  const systemPrompt = buildSystemPrompt(ctx);
  const nativePrompt = buildSystemPrompt(ctx, { nativeToolCalling: true });

  // CODEX Phase 2 — request-scoped scenario context (replaces the former
  // module-global setScenarioToolContext): derived from the validated request
  // and passed through the tool-execution closure, never stored on a module.
  const scenarioContext = buildScenarioContext(ctx);
  currentScenarioContext = scenarioContext;
  lastGeminiTrace = [];
  lastGeminiCharts = [];
  lastGeminiActions = [];

  const first = await callLLM(systemPrompt, messages.slice(-12), { nativePrompt });

  if (first === null) {
    // LLM unavailable — fall back to a graceful deterministic notice (tools stay usable via UI).
    // If Route 0 (Gemini) produced artifacts before failing, surface them honestly.
    const hadGeminiArtifacts = lastGeminiTrace.length > 0 || lastGeminiCharts.length > 0;
    return {
      reply: "The AI service is momentarily unavailable. You can still use the sections directly — Investigations, Compare, Scenarios, 3D Lab and the equation registry compute everything deterministically without the LLM. Please retry in a moment.",
      toolTrace: hadGeminiArtifacts ? lastGeminiTrace.map((t) => ({ name: t.name, args: {}, summary: t.summary, provenance: t.provenance, ok: t.ok })) : [],
      charts: (lastGeminiCharts as ChartSpec[]) ?? [],
      uiActions: lastGeminiActions,
      sources: [],
      mode: hadGeminiArtifacts ? "tool-driven" : "natural",
      llm: "unavailable",
    };
  }
  // Route 0 artifacts (Gemini native tool calling) merge into the response trace
  const geminiTrace = lastGeminiTrace;
  const geminiCharts = lastGeminiCharts as ChartSpec[];
  const geminiActions = lastGeminiActions;

  let current = first;
  const toolTrace: AgentResponse["toolTrace"] = [];
  const charts: ChartSpec[] = [];
  const uiActions: Record<string, unknown>[] = [];
  const sources = new Set<string>();
  const results: ToolResult[] = [];

  // up to 2 tool rounds (a failed call may need one retry with corrected args)
  for (let round = 0; round < 2; round++) {
    const block = parseToolCalls(current);
    if (!block) break;

    const roundStart = results.length;
    for (const call of block.toolCalls.slice(0, 4)) {
      if (toolTrace.length >= 6) break; // bounded tool budget
      const res = await executeTool(call.name, call.args ?? {}, scenarioContext);
      results.push(res);
      toolTrace.push({ name: call.name, args: call.args ?? {}, summary: res.summary, provenance: res.provenance, ok: res.ok });
      if (res.chart) charts.push(res.chart);
      if (res.provenance && res.provenance !== "-" && res.provenance !== "UI action") sources.add(res.provenance);
      const data = res.data as { action?: string } | undefined;
      if (data && typeof data === "object" && "action" in data && data.action) {
        uiActions.push(data as Record<string, unknown>);
      }
    }

    // grounded summarization turn (also serves as the retry planner)
    const resultsText = results
      .map((r, i) => `[${i + 1}] tool=${r.tool} ok=${r.ok}\nsummary: ${r.summary}\nprovenance: ${r.provenance}\ndata: ${(JSON.stringify(r.data) ?? "null").slice(0, 3500)}`)
      .join("\n\n");

    const roundResults = results.slice(roundStart);
    const hadFailure = roundResults.some((r) => !r.ok);
    const summarizerPrompt = `${systemPrompt}

You just executed tools for the user's request. ${hadFailure ? "Some tool calls FAILED — if you can fix the failure with corrected arguments (e.g., exact column names listed in the failure), reply with a NEW toolcall block containing ONLY the corrected call(s). Otherwise write the final answer." : "Write the final answer now."}
RULES:
- Use ONLY the tool results below for every number and claim; cite provenance inline (e.g., "source: PSI-69_FLEX.csv, NASA PSI").
- Be concise and structured; bold the key values.
- If a tool refused or found nothing, say exactly that and, where useful, suggest the next best action.
- Do NOT emit another toolcall block unless you are correcting a failed call.
- If results include chart(s), mention that the chart is displayed with the reply.
- If UI actions were executed (navigate/save/compare), tell the user what changed on screen.

TOOL RESULTS:
${resultsText}

USER'S LAST MESSAGE: ${messages[messages.length - 1]?.content ?? ""}`;

    current = (await callLLM(
      summarizerPrompt,
      [
        { role: "user", content: messages[messages.length - 1]?.content ?? "" },
      ],
      { plain: true }, // internal synthesis turn — never re-enter the Gemini agent loop
    )) ?? "";
  }

  // strip any residual protocol fences from the final reply (never leak the tool protocol)
  const cleanReply = current
    .replace(/```toolcall[\s\S]*?```/g, "")
    .replace(/```\s*toolcall[\s\S]*$/g, "")
    .trim();

  const fallbackText = results
    .map((r, i) => `[${i + 1}] ${r.tool}: ${r.summary}`)
    .join("\n");

  // Route 0 (Gemini) artifacts merge: when the Gemini loop ran the tools, its
  // trace/charts/actions are the authoritative record.
  const mergedTrace = geminiTrace.length ? geminiTrace.map((t2) => ({ name: t2.name, args: {}, summary: t2.summary, provenance: t2.provenance, ok: t2.ok })) : toolTrace;
  const mergedCharts = geminiCharts.length ? geminiCharts : charts;
  const mergedActions = geminiActions.length ? geminiActions : uiActions;
  return {
    reply: cleanReply || fallbackText || "I ran the tools but could not produce a summary; the trace below shows exactly what they returned.",
    toolTrace: mergedTrace,
    charts: mergedCharts,
    uiActions: mergedActions,
    sources: [...sources],
    mode: mergedTrace.length ? "tool-driven" : "natural",
    llm: "live",
  };
}
