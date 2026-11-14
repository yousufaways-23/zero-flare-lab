#!/usr/bin/env bun
/**
 * Smoke test for the HTML data-URI image extractor (pre-flight before a real
 * batch). Runs the production extractByKind("html") path on a given HTML file
 * under a throwaway TEST batch id, prints counts + samples, and lists what was
 * written so the test artifacts can be cleaned up.
 *
 * Usage: bun scripts/flame/test-html-embed.mjs <file.html>
 */
import { readFileSync, rmSync, readdirSync, existsSync } from "node:fs";
import path from "node:path";
import { extractByKind } from "../../src/lib/ingest/extract.ts";

const file = process.argv[2];
if (!file) {
  console.error("usage: bun scripts/flame/test-html-embed.mjs <file.html>");
  process.exit(1);
}
const TEST_BATCH = "TEST-HTML-EMBED";
const bytes = readFileSync(file);
const input = { name: path.basename(file), bytes, batchId: TEST_BATCH, fileId: "t001" };

const t0 = Date.now();
const out = await extractByKind(input, "html", file);
const ms = Date.now() - t0;

console.log("kind:", out.kind);
console.log("text chars:", out.text?.chars, "headings:", out.text?.headings?.slice(0, 3));
console.log("tables:", out.tables.length);
console.log("media extracted:", out.media.length);
console.log("unresolved:", JSON.stringify(out.unresolved, null, 1));
console.log("errors:", JSON.stringify(out.errors));
console.log("elapsed ms:", ms);
if (out.media.length) {
  console.log("first media:", JSON.stringify(out.media[0], null, 1));
  console.log("last media:", JSON.stringify(out.media[out.media.length - 1], null, 1));
  const withDims = out.media.filter((m) => m.width).length;
  const withOrigin = out.media.filter((m) => m.originName).length;
  const withCaption = out.media.filter((m) => m.captionNote).length;
  const withPage = out.media.filter((m) => m.page).length;
  console.log(
    `provenance: dims=${withDims} originName=${withOrigin} caption=${withCaption} page=${withPage}`,
  );
  // experiments represented (from originName prefix before __)
  const experiments = new Set(
    out.media.map((m) => (m.originName ?? "").split("__")[0]).filter(Boolean),
  );
  console.log("origin-name prefixes:", [...experiments].join(", "));
}

// cleanup test artifacts
for (const dir of ["data/media/batches", "data/extracted/batches"]) {
  const p = path.join(process.cwd(), dir, TEST_BATCH);
  if (existsSync(p)) {
    const n = readdirSync(p).length;
    rmSync(p, { recursive: true, force: true });
    console.log(`cleaned ${p} (${n} files)`);
  }
}
