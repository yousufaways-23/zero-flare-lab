// GET /api/ai-status — honest CIR-1 provider status (§17.3).
// Runs a REAL minimal provider probe (never a green light just because an env
// var exists). Result cached 60 s so dashboards can poll without burning
// free-tier quota. Errors are sanitized — no headers, no key material.
//
// SSRF posture: the URL host is a compile-time literal (HTTPS only); the only
// variable part is the model id, which is validated against a strict
// allowlist regex before it may appear in the URL. No user input reaches
// this route's fetch at all.
import { NextResponse } from "next/server";
import { getBindings } from "@/lib/server/bindings";
import { guardPublicHttpUrl } from "@/lib/server/safe-fetch";

export const runtime = "nodejs";

const CACHE_MS = 60_000;
const MODEL_ID_RE = /^[a-z0-9][a-z0-9.\-]{0,60}$/;

type Status = "live" | "error" | "unconfigured";
interface AiStatus {
  provider: string;
  model: string;
  configured: boolean;
  status: Status;
  checkedAt: string;
  latencyMs?: number;
  error?: string;
  capabilities: { nativeToolCalling: boolean };
  degradedMode: string;
}

let cache: { at: number; value: AiStatus } | null = null;

function probeUrl(model: string): string | null {
  if (!MODEL_ID_RE.test(model)) return null; // reject anything non-model-id-shaped
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`;
  try {
    guardPublicHttpUrl(url, "gemini probe");
    return url;
  } catch {
    return null;
  }
}

function providerConfig(): { key: string; model: string } | null {
  const key = process.env.AI_API_KEY ?? process.env.GEMINI_API_KEY ?? "";
  const model = process.env.AI_MODEL ?? "gemini-3.5-flash-lite";
  if (!key) return null;
  return { key, model };
}

async function probe(key: string, model: string): Promise<AiStatus> {
  const started = Date.now();
  const base: AiStatus = {
    provider: "google-gemini",
    model,
    configured: true,
    status: "error",
    checkedAt: new Date().toISOString(),
    capabilities: { nativeToolCalling: true },
    degradedMode: "deterministic tools (all sections keep computing without the LLM)",
  };
  const url = probeUrl(model);
  if (!url) return { ...base, error: "invalid model id" };
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: "Reply with exactly: OK" }] }],
        generationConfig: { maxOutputTokens: 16, thinkingConfig: { thinkingLevel: "low" } },
      }),
      signal: AbortSignal.timeout(12_000),
    });
    const latency = Date.now() - started;
    if (res.ok) {
      const body = (await res.json()) as { candidates?: unknown };
      const answered = Array.isArray(body?.candidates) && body.candidates.length > 0;
      return { ...base, status: answered ? "live" : "error", latencyMs: latency, error: answered ? undefined : "empty response" };
    }
    const text = await res.text().catch(() => "");
    let reason = `HTTP ${res.status}`;
    try {
      const j = JSON.parse(text) as { error?: { message?: string } };
      if (j?.error?.message) reason = `HTTP ${res.status}: ${j.error.message.slice(0, 160)}`;
    } catch {
      /* keep generic reason */
    }
    return { ...base, latencyMs: latency, error: reason };
  } catch (err) {
    return { ...base, error: `probe failed: ${(err as Error).message.slice(0, 160)}` };
  }
}

/** Real minimal probe of the Workers AI binding (edge deployment provider). */
async function probeWorkersAi(model: string): Promise<AiStatus> {
  const started = Date.now();
  const base: AiStatus = {
    provider: "cloudflare-workers-ai",
    model,
    configured: true,
    status: "error",
    checkedAt: new Date().toISOString(),
    capabilities: { nativeToolCalling: false },
    degradedMode: "deterministic tools (all sections keep computing without the LLM)",
  };
  try {
    const ai = getBindings()?.AI;
    if (!ai) return { ...base, error: "binding unavailable" };
    const result = (await Promise.race([
      ai.run(model, {
        messages: [{ role: "user", content: "Reply with exactly: OK" }],
        max_tokens: 16,
      }),
      new Promise((_, reject) => setTimeout(() => reject(new Error("timeout")), 12_000)),
    ])) as { response?: unknown } | undefined;
    const latency = Date.now() - started;
    const answered = typeof result?.response === "string" && result.response.trim().length > 0;
    return { ...base, status: answered ? "live" : "error", latencyMs: latency, error: answered ? undefined : "empty response" };
  } catch (err) {
    return { ...base, error: `probe failed: ${(err as Error).message.slice(0, 160)}` };
  }
}

export async function GET() {
  const now = Date.now();
  if (cache && now - cache.at < CACHE_MS) {
    return NextResponse.json({ ...cache.value, cached: true });
  }
  const cfg = providerConfig();
  const bindings = getBindings();
  let value: AiStatus;
  if (cfg) {
    value = await probe(cfg.key, cfg.model);
  } else if (bindings?.AI) {
    // Zero-key edge provider: the Workers AI binding ships with the deployment.
    value = await probeWorkersAi(process.env.WORKERS_AI_MODEL ?? "@cf/meta/llama-3.3-70b-instruct-fp8-fast");
  } else {
    value = {
      provider: "google-gemini",
      model: process.env.AI_MODEL ?? "gemini-3.5-flash-lite",
      configured: false,
      status: "unconfigured" as Status,
      checkedAt: new Date().toISOString(),
      capabilities: { nativeToolCalling: true },
      degradedMode: "deterministic tools (all sections keep computing without the LLM)",
    };
  }
  cache = { at: now, value };
  return NextResponse.json({ ...value, cached: false });
}
