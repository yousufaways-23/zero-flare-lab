/**
 * POST /api/ingest      — upload a batch (multipart/form-data, field "files",
 *                         ≤10 files). Returns the full batch receipt.
 * GET  /api/ingest      — cumulative totals + batch index (list view).
 * GET  /api/ingest?id=… — full receipt for one batch.
 *
 * PUT  /api/ingest      — { action: "confirm-all-uploads" } marks that the
 *                         user has finished uploading (gates the audit), or
 *                         { action: "run-global-audit" } which refuses unless
 *                         the confirmation flag is set.
 *
 * Ported from SECOND_EVIDENCE; pipeline lives in src/lib/ingest.
 *
 * Edge posture (Cloudflare release): the corpus ships immutable and
 * SHA-256-verified, so mutating operations (uploads, audit confirmation) are
 * honestly refused with 501 while every read-only view keeps working. The
 * pipeline is imported dynamically so Node-only extraction libraries are
 * never loaded into the edge bundle.
 */
import { NextResponse } from "next/server";
import { loadBatchIndex, loadCumulative, loadReceipt } from "@/lib/ingest/storage";
import { rateLimit, clientIp, pruneRateBuckets, RATE_LIMITS } from "@/lib/server/rate-limit";
import { isEdgeRuntime } from "@/lib/server/bindings";

export const runtime = "nodejs";
export const maxDuration = 300;

const EDGE_UNAVAILABLE = {
  error: "edge_immutable_corpus",
  detail:
    "This edge release ships the immutable, SHA-256-verified corpus — uploading new source files is a local/server-deployment capability. All read-only views (recovery ledger, batch index, receipts, cumulative totals) remain fully available here.",
};

function edgeGate(): NextResponse | null {
  if (!isEdgeRuntime()) return null;
  return NextResponse.json(EDGE_UNAVAILABLE, { status: 501 });
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const id = url.searchParams.get("id");
  if (id) {
    if (!/^B-\d{8}-\d{3}$/.test(id)) {
      return NextResponse.json({ error: "invalid_batch_id" }, { status: 400 });
    }
    const receipt = await loadReceipt(id);
    if (!receipt) return NextResponse.json({ error: "not_found" }, { status: 404 });
    return NextResponse.json(receipt);
  }
  const [index, cumulative] = await Promise.all([loadBatchIndex(), loadCumulative()]);
  return NextResponse.json({ cumulative, batches: [...index].reverse() });
}

export async function POST(request: Request) {
  const gate = edgeGate();
  if (gate) return gate;
  pruneRateBuckets();
  const rl = rateLimit(`ingest:${clientIp(request)}`, RATE_LIMITS.ingest.limit, RATE_LIMITS.ingest.windowMs);
  if (!rl.ok) {
    return NextResponse.json(
      { error: "rate_limited", detail: "Batch upload budget reached for this client — batches are heavy by design. Please wait and retry." },
      { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } },
    );
  }
  try {
    const form = await request.formData();
    const entries = form.getAll("files");
    const files: { name: string; bytes: Buffer }[] = [];
    for (const e of entries) {
      if (e instanceof File) {
        files.push({ name: e.name || "unnamed", bytes: Buffer.from(await e.arrayBuffer()) });
      }
    }
    if (files.length === 0) {
      return NextResponse.json({ error: "no_files", detail: "Attach files under the 'files' field." }, { status: 400 });
    }
    const { runBatch } = await import("@/lib/ingest/pipeline");
    const receipt = await runBatch(files);
    return NextResponse.json(receipt);
  } catch (e) {
    return NextResponse.json({ error: "batch_failed", detail: (e as Error).message }, { status: 400 });
  }
}

export async function PUT(request: Request) {
  const gate = edgeGate();
  if (gate) return gate;
  let body: { action?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }
  if (body.action === "confirm-all-uploads") {
    const { markUserConfirmed } = await import("@/lib/ingest/pipeline");
    const cumulative = await markUserConfirmed();
    return NextResponse.json({
      ok: true,
      cumulative,
      message:
        "Marked: all source files confirmed uploaded. The global audit is now unlocked. No model has been trained — the audit only reconciles, deduplicates and pre-assesses eligibility.",
    });
  }
  if (body.action === "run-global-audit") {
    const { runGlobalAudit } = await import("@/lib/ingest/pipeline");
    const result = await runGlobalAudit();
    return NextResponse.json(result, { status: result.ok ? 200 : 423 });
  }
  return NextResponse.json({ error: "unknown_action" }, { status: 400 });
}
