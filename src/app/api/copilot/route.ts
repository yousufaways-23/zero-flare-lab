import { NextRequest, NextResponse } from "next/server";
import { runAgent, type ChatTurn, type AgentContext } from "@/lib/agent/core";
import { rateLimit, clientIp, pruneRateBuckets, RATE_LIMITS } from "@/lib/server/rate-limit";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Validate the compact facility summary from the client — numbers only, ids only. */
function parseFacilityContext(raw: unknown): AgentContext["facility"] {
  if (!raw || typeof raw !== "object") return undefined;
  const f = raw as Record<string, unknown>;
  const name = typeof f.name === "string" ? f.name.slice(0, 120) : "unnamed facility";
  const layoutImageAttached = f.layoutImageAttached === true;
  const compartments = Array.isArray(f.compartments)
    ? (f.compartments as Record<string, unknown>[])
        .filter((c) => c && typeof c === "object")
        .slice(0, 12)
        .map((c) => ({
          name: typeof c.name === "string" ? c.name.slice(0, 80) : "unnamed",
          areaM2: Number.isFinite(Number(c.areaM2)) ? Number(c.areaM2) : 0,
          heightM: Number.isFinite(Number(c.heightM)) ? Number(c.heightM) : 0,
          volumeM3: Number.isFinite(Number(c.volumeM3)) ? Number(c.volumeM3) : 0,
          materials: Array.isArray(c.materials) ? (c.materials as unknown[]).filter((m) => typeof m === "string").slice(0, 8) as string[] : [],
          ignitionSources: Number.isFinite(Number(c.ignitionSources)) ? Number(c.ignitionSources) : 0,
          ventilation: typeof c.ventilation === "string" ? c.ventilation : "unknown",
          detection: typeof c.detection === "string" ? c.detection : "none",
          screeningScore: Number.isFinite(Number(c.screeningScore)) ? Number(c.screeningScore) : undefined,
        }))
    : [];
  const screeningScores = Array.isArray(f.screeningScores)
    ? (f.screeningScores as Record<string, unknown>[])
        .filter((s) => s && typeof s === "object" && typeof s.name === "string")
        .slice(0, 12)
        .map((s) => ({
          name: String(s.name).slice(0, 80),
          score: Number.isFinite(Number(s.score)) ? Number(s.score) : 0,
          label: typeof s.label === "string" ? s.label : "",
        }))
    : undefined;
  if (!compartments.length && !screeningScores?.length) return undefined;
  return { name, layoutImageAttached, compartments, screeningScores };
}

export async function POST(req: NextRequest) {
  pruneRateBuckets();
  const rl = rateLimit(`copilot:${clientIp(req)}`, RATE_LIMITS.copilot.limit, RATE_LIMITS.copilot.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", detail: "CIR-1 request budget reached for this client. The deterministic sections keep working — please retry shortly." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }
  try {
    const body = await req.json();
    const messages: ChatTurn[] = Array.isArray(body?.messages)
      ? body.messages
          .filter((m: unknown) => {
            const mm = m as { role?: string; content?: string };
            return mm && typeof mm.content === "string" && (mm.role === "user" || mm.role === "assistant");
          })
          .slice(-12)
          .map((m: { role: "user" | "assistant"; content: string }) => ({ role: m.role, content: m.content.slice(0, 6000) }))
      : [];
    if (!messages.length) {
      return NextResponse.json({ error: "messages required" }, { status: 400 });
    }
    const ctx: AgentContext = {
      view: typeof body?.context?.view === "string" ? body.context.view : undefined,
      environment: typeof body?.context?.environment === "string" ? body.context.environment : undefined,
      environmentLabel: typeof body?.context?.environmentLabel === "string" ? body.context.environmentLabel : undefined,
      investigation: typeof body?.context?.investigation === "string" ? body.context.investigation : null,
      investigationTab: typeof body?.context?.investigationTab === "string" ? body.context.investigationTab : null,
      selection: typeof body?.context?.selection === "string" ? body.context.selection : null,
      role: body?.context?.role === "fire-safety" ? "fire-safety" : undefined,
      equipment: typeof body?.context?.equipment === "string" ? body.context.equipment : null,
      scenarioPillar: typeof body?.context?.scenarioPillar === "string" ? body.context.scenarioPillar : null,
      facility: parseFacilityContext(body?.context?.facility),
    };
    const result = await runAgent(messages, ctx);
    return NextResponse.json(result);
  } catch (err) {
    console.error("[api/copilot]", err);
    return NextResponse.json({ error: "copilot failure" }, { status: 500 });
  }
}
