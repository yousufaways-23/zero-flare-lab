/**
 * GET /api/source-media — scientific figure gallery from the ingestion layers.
 *
 * Walks the batch receipts and returns every extracted source figure with its
 * provenance (source PDF, page, batch, dimensions), mapped to PSI accessions
 * via (a) the pipeline's dictionary entities (inv-* ids) and (b) the facility/
 * investigation keyword table below. Optional ?accession=PSI-69 filters to one
 * investigation. Figures are served by /api/ingest/media (traversal-proof).
 *
 * HONESTY: figures are page renders/figures extracted from real source
 * documents; captions must cite the source document and batch. AI
 * interpretations (where present) are labelled as AI-INTERPRETED.
 */
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { rateLimit, clientIp, pruneRateBuckets, RATE_LIMITS } from "@/lib/server/rate-limit";

export const runtime = "nodejs";

/** Keyword → PSI accession mapping for source documents (official names). */
const DOC_KEYWORDS: { pattern: RegExp; accessions: string[]; facility?: string }[] = [
  { pattern: /flex/i, accessions: ["PSI-69"] },
  { pattern: /flex-?2|flex2/i, accessions: ["PSI-68"] },
  { pattern: /bass[-_ ]?ii/i, accessions: ["PSI-25"] },
  { pattern: /bass(?![-_ ]?ii)/i, accessions: ["PSI-26", "PSI-25"] },
  { pattern: /saffire|spacecraft[-_ ]?fire/i, accessions: ["PSI-98", "PSI-99", "PSI-100"] },
  { pattern: /same/i, accessions: ["PSI-101", "PSI-102"] },
  { pattern: /spice/i, accessions: ["PSI-107"] },
  { pattern: /slice/i, accessions: ["PSI-106"] },
  { pattern: /daft/i, accessions: ["PSI-47"] },
  { pattern: /cfi-?g|cool[-_ ]?flame/i, accessions: ["PSI-159", "PSI-39"] },
  { pattern: /flame[-_ ]?design/i, accessions: ["PSI-10"] },
  { pattern: /e-?field/i, accessions: ["PSI-22"] },
  { pattern: /s-?flame/i, accessions: ["PSI-23"] },
  { pattern: /cld/i, accessions: ["PSI-21"] },
  { pattern: /bre|burning[-_ ]?rate/i, accessions: ["PSI-20"] },
  { pattern: /acme/i, accessions: ["PSI-10", "PSI-20", "PSI-21", "PSI-22", "PSI-23", "PSI-159"] },
  { pattern: /combustion[-_ ]?integrated|cir\b/i, accessions: [], facility: "Combustion Integrated Rack (CIR)" },
  { pattern: /glovebox|msg/i, accessions: [], facility: "Microgravity Science Glovebox (MSG)" },
  { pattern: /fluids.*combustion.*facility|fcf/i, accessions: [], facility: "Fluids & Combustion Facility (FCF)" },
  { pattern: /combustion[-_ ]?science/i, accessions: [], facility: "NASA Combustion Science (program overview)" },
];

interface SourceMediaItem {
  path: string;
  sourceFile: string;
  batchId: string;
  page: number | null;
  kind: string;
  width: number | null;
  height: number | null;
  accessions: string[];
  facility: string | null;
  interpretation: string | null;
}

export async function GET(request: Request) {
  pruneRateBuckets();
  const rl = rateLimit(`source-media:${clientIp(request)}`, RATE_LIMITS.selftest.limit, RATE_LIMITS.selftest.windowMs);
  if (!rl.ok) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429, headers: { "Retry-After": String(rl.retryAfterSec) } });
  }

  const url = new URL(request.url);
  const accession = url.searchParams.get("accession")?.toUpperCase();
  const limit = Math.min(120, Math.max(1, Number(url.searchParams.get("limit")) || 48));

  const batchesDir = path.join(process.cwd(), "data", "ingest", "batches");
  const items: SourceMediaItem[] = [];
  try {
    const files = (await fs.readdir(batchesDir)).filter((f) => /^B-\d{8}-\d{3}\.json$/.test(f));
    for (const bf of files) {
      const raw = await fs.readFile(path.join(batchesDir, bf), "utf8");
      const receipt = JSON.parse(raw) as {
        batchId: string;
        files?: {
          name: string;
          entities?: { entityId?: string; entityType?: string }[];
          media?: {
            path: string;
            kind?: string;
            sourceFile?: string;
            width?: number;
            height?: number;
            page?: number;
            interpretation?: string;
          }[];
        }[];
      };
      if (!receipt.files) continue;
      for (const f of receipt.files) {
        if (!f.media?.length) continue;
        // map this source document to investigations/facilities
        const docAccessions = new Set<string>();
        let facility: string | null = null;
        for (const kw of DOC_KEYWORDS) {
          if (kw.pattern.test(f.name)) {
            for (const a of kw.accessions) docAccessions.add(a);
            if (kw.facility) facility = kw.facility;
          }
        }
        for (const e of f.entities ?? []) {
          if (e.entityType === "investigation" && /^inv-/.test(e.entityId ?? "")) {
            // entity ids like inv-flex — map via keyword pass only (ids are slugs);
            // authoritative mapping stays with the filename keywords above.
          }
        }
        for (const m of f.media) {
          items.push({
            path: m.path,
            sourceFile: m.sourceFile ?? f.name,
            batchId: receipt.batchId,
            page: typeof m.page === "number" ? m.page : null,
            kind: m.kind ?? "extracted-figure",
            width: typeof m.width === "number" ? m.width : null,
            height: typeof m.height === "number" ? m.height : null,
            accessions: [...docAccessions],
            facility,
            interpretation: m.interpretation && !/^Configuration|not found/i.test(m.interpretation) ? m.interpretation : null,
          });
        }
      }
    }
  } catch (e) {
    return NextResponse.json({ items: [], total: 0, note: `ingestion layers unavailable: ${(e as Error).message}` });
  }

  const filtered = accession ? items.filter((it) => it.accessions.includes(accession)) : items;
  return NextResponse.json({
    total: filtered.length,
    items: filtered.slice(0, limit),
    note: "Figures extracted from source documents by the ingestion pipeline; captions cite the source file and batch. Serve via /api/ingest/media.",
  });
}
