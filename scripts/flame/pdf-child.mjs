#!/usr/bin/env node
/**
 * FLAME EVIDENCE LAB — PDF extraction child (memory/crash-isolated).
 *
 * Invoked by src/lib/ingest/extract.ts via execFile(process.execPath, …) so it
 * runs under the same runtime as the parent (bun or node). Plain Node APIs only.
 *
 * Args: <pdfAbsPath> <textOutPath> <metaOutPath> <manifestOutPath> <mediaDirAbs> <progressPath> <donePath> <fileId>
 *
 * Writes results INCREMENTALLY so that a timeout or crash mid-way (pathological
 * pages have driven pdfjs into unbounded loops on real NASA slide decks) still
 * leaves the parent with everything that completed:
 *   1. textOutPath    — full text layer (after getText)
 *   2. metaOutPath    — { totalPages, pageTexts[], tables[] } (after getTable)
 *   3. manifestOutPath— JSONL, one line {file,page,width,height} per written image
 *   4. mediaDirAbs    — <fileId>-pdfimgNN.png files, one page at a time
 *   progressPath      — single line naming the current stage/page (post-mortem)
 *   donePath          — written last; presence means the child completed fully
 *
 * Image policy (bounded memory): pages ≤ 15, ≤ 8 images/page, ≤ 16 MP/image,
 * ≤ 30 images/file; base64 dataUrl disabled; decoded buffers released per page.
 */
import { writeFileSync, appendFileSync, mkdirSync, readFileSync } from "node:fs";
import path from "node:path";

const [pdfPath, textOut, metaOut, manifestOut, mediaDir, progressPath, donePath, fileId, skipThroughArg] = process.argv.slice(2);
// Parent-driven crash recovery: when a pathological page kills the pdfjs image
// worker (no JS exception — the pending promise never settles and the process
// exits 0 with a stale progress marker), the parent re-runs this child with
// skipThrough = <crash page> so pages 1..skipThrough are not attempted again.
const skipThrough = Math.max(0, Number(skipThroughArg || 0) || 0);

// Self-guard: if any stage hangs (pathological pages freeze pdfjs workers with
// the main thread idle), exit so the parent can register partial results.
// unref() keeps the timer from holding the event loop open on the normal path.
const guard = setTimeout(() => {
  try {
    appendFileSync(progressPath, " [CHILD-GUARD-120s]");
  } catch {
    /* best effort */
  }
  process.exit(3);
}, 120_000);
if (typeof guard.unref === "function") guard.unref();

async function main() {
  writeFileSync(progressPath, "start");
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array((await import("node:fs")).readFileSync(pdfPath)) });
  try {
    // ---- 1. text ----
    writeFileSync(progressPath, "text");
    const textResult = await parser.getText();
    const full = textResult.text || "";
    const pageTexts = textResult.pages.map((p) => p.text);
    const totalPages = textResult.total ?? pageTexts.length;
    mkdirSync(path.dirname(textOut), { recursive: true });
    writeFileSync(textOut, full, "utf8");

    // ---- 2. tables (vector operators, first 20 pages) ----
    writeFileSync(progressPath, "tables");
    const tables = [];
    try {
      const tableResult = await parser.getTable({ first: 20 });
      for (const pt of tableResult.pages) {
        for (let ti = 0; ti < pt.tables.length && tables.length < 20; ti++) {
          const rows = pt.tables[ti].map((r) => r.map((c) => c.trim()));
          if (rows.length >= 2 && rows.some((r) => r.length >= 2)) {
            tables.push({ page: pt.num, rows });
          }
        }
      }
    } catch {
      /* table stage failure is reported by the parent via the heuristic fallback */
    }
    mkdirSync(path.dirname(metaOut), { recursive: true });
    writeFileSync(metaOut, JSON.stringify({ totalPages, chars: full.length, pageTexts, tables }), "utf8");

    // ---- 3. images, one page at a time ----
    mkdirSync(mediaDir, { recursive: true });
    // Resume support: on a retry, continue numbering after the images already
    // recorded in the manifest (pages ≤ skipThrough are never re-attempted,
    // so nothing is duplicated).
    let written = 0;
    try {
      const prev = readFileSync(manifestOut, "utf8");
      written = prev.split("\n").filter((l) => l.trim()).length;
    } catch {
      /* first run: no manifest yet */
    }
    let skippedHuge = 0;
    for (let page = 1; page <= Math.min(15, totalPages) && written < 30; page++) {
      if (page <= skipThrough) continue;
      writeFileSync(progressPath, `images:${page}/${Math.min(15, totalPages)}`);
      let pageImages;
      try {
        const res = await parser.getImage({ partial: [page], imageThreshold: 100, imageDataUrl: false, imageBuffer: true });
        pageImages = res.pages[0]?.images ?? [];
      } catch {
        continue; // one bad page does not stop the rest
      }
      for (const img of pageImages.slice(0, 8)) {
        if (written >= 30) break;
        if (!img.data || !img.width || !img.height) continue;
        if (img.width * img.height > 16_000_000) {
          skippedHuge++;
          continue;
        }
        if (img.width < 50 || img.height < 50) continue;
        try {
          written++;
          const file = `${fileId}-pdfimg${String(written).padStart(2, "0")}.png`;
          writeFileSync(path.join(mediaDir, file), Buffer.from(img.data));
          appendFileSync(manifestOut, JSON.stringify({ file, page, width: img.width, height: img.height }) + "\n", "utf8");
        } catch {
          written--; // a single unwritable image must not kill the stage
          continue;
        }
      }
    }
    writeFileSync(progressPath, "done");
    writeFileSync(metaOut.replace(/\.json$/, ".imgstats.json"), JSON.stringify({ written, skippedHuge }), "utf8");
    writeFileSync(donePath, new Date().toISOString(), "utf8");
  } finally {
    clearTimeout(guard);
    await parser.destroy().catch(() => undefined);
  }
}

main().catch((e) => {
  console.error(String(e?.stack ?? e));
  process.exit(1);
});
