// FLAME EVIDENCE LAB — external research search API (server-side)
// POST { source: "ntrs" | "images", query, limit }  → live NASA search with provenance
// GET → integration status registry (honest capabilities)

import { NextResponse } from "next/server";
import { searchNtrs, searchNasaImages, probePsiStudy, getIntegrationStatus } from "@/lib/external/nasa";
import { rateLimit, clientIp, pruneRateBuckets, RATE_LIMITS } from "@/lib/server/rate-limit";

export async function GET() {
  return NextResponse.json({ integrations: getIntegrationStatus() });
}

export async function POST(req: Request) {
  pruneRateBuckets();
  const rl = rateLimit(`external:${clientIp(req)}`, RATE_LIMITS.external.limit, RATE_LIMITS.external.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { ok: false, error: "rate_limited", detail: "External-search budget reached for this client — NASA endpoints are shared infrastructure; please wait." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }
  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ ok: false, error: "invalid JSON body" }, { status: 400 });
  }
  const source = String(body.source ?? "ntrs");
  const query = String(body.query ?? "").slice(0, 300);
  const limit = Math.min(12, Math.max(1, Number(body.limit) || 8));

  if (source === "ntrs") {
    const result = await searchNtrs(query, limit);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  }
  if (source === "images") {
    const result = await searchNasaImages(query, limit);
    return NextResponse.json(result, { status: result.ok ? 200 : 502 });
  }
  if (source === "psi-probe") {
    const accession = String(body.accession ?? "");
    if (!accession) return NextResponse.json({ ok: false, error: "accession required" }, { status: 400 });
    const probe = await probePsiStudy(accession, body.fileName ? String(body.fileName) : undefined);
    return NextResponse.json(probe);
  }
  return NextResponse.json({ ok: false, error: `unknown source "${source}"` }, { status: 400 });
}
