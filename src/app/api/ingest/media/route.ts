/**
 * GET /api/ingest/media?path=<relative path>
 *
 * Serves extracted figures / uploaded media from the ingestion layers.
 * Security: path-resolved and separator-aware whitelist (data/media …,
 * data/raw/batches …, data/extracted/batches …) — no traversal, no arbitrary
 * filesystem reads; X-Content-Type-Options: nosniff on every response;
 * active-content types (.svg, .pdf) are forced to download so an uploaded
 * file can never execute same-origin script.
 *
 * Ported from SECOND_EVIDENCE unchanged (security-reviewed).
 */
import { NextResponse } from "next/server";
import { promises as fs } from "node:fs";
import path from "node:path";
import { isEdgeRuntime } from "@/lib/server/bindings";

export const runtime = "nodejs";

const MIME: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".bmp": "image/bmp",
  ".tif": "image/tiff",
  ".tiff": "image/tiff",
  ".svg": "image/svg+xml",
  ".pdf": "application/pdf",
  ".csv": "text/csv",
  ".txt": "text/plain; charset=utf-8",
  ".json": "application/json",
};

export async function GET(request: Request) {
  // Edge posture: extracted/uploaded media binaries are not part of the
  // immutable edge release (the 2,393 historical media binaries are unrecovered
  // — status shown honestly in Data & Sources). Available imagery on the edge:
  // the verified NASA Images catalogue and brand assets under /media.
  if (isEdgeRuntime()) {
    return NextResponse.json(
      {
        error: "edge_immutable_corpus",
        detail:
          "Extracted media binaries are not part of the immutable edge release. Available imagery: the verified NASA Images catalogue and brand assets under /media.",
      },
      { status: 501 },
    );
  }
  const url = new URL(request.url);
  const rel = url.searchParams.get("path");
  if (!rel) return NextResponse.json({ error: "missing_path" }, { status: 400 });

  // Resolve completely (handles .., ./, absolute and mixed separators), then
  // whitelist with a path-separator-aware prefix so `data/media-evil` cannot
  // pass as `data/media`.
  const abs = path.resolve(process.cwd(), rel);
  const allowedRoots = [
    path.join(process.cwd(), "data", "media"),
    path.join(process.cwd(), "data", "raw", "batches"),
    path.join(process.cwd(), "data", "extracted", "batches"),
  ];
  const allowed = allowedRoots.some((root) => abs === root || abs.startsWith(root + path.sep));
  if (!allowed) {
    return NextResponse.json({ error: "forbidden_path", detail: "Only ingestion media/raw/extracted paths are served." }, { status: 403 });
  }

  try {
    const data = await fs.readFile(abs);
    const ext = path.extname(abs).toLowerCase();
    if (!MIME[ext]) {
      return NextResponse.json({ error: "unsupported_media_type", detail: `.${ext.replace(".", "")} is not served.` }, { status: 415 });
    }
    // Inline only passive raster images; SVG and PDF carry active content
    // (scripts / viewer JS) and are therefore forced to download.
    const inlineSafe = MIME[ext].startsWith("image/") && ext !== ".svg";
    const safeName = path.basename(abs).replace(/["\\\r\n]/g, "_");
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": MIME[ext],
        "Cache-Control": "private, max-age=60",
        "X-Content-Type-Options": "nosniff",
        ...(inlineSafe ? {} : { "Content-Disposition": `attachment; filename="${safeName}"` }),
      },
    });
  } catch {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
