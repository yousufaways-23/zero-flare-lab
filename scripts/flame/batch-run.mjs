#!/usr/bin/env node
/**
 * FLAME EVIDENCE LAB — real source-batch runner (CLI entrypoint for the
 * production ingestion pipeline in src/lib/ingest).
 *
 * Usage:
 *   bun scripts/flame/batch-run.mjs <file1> … <fileN> [--note "operator note"]
 *
 * - 1..10 files per run (the pipeline enforces the same limit as the API).
 * - Runs the exact pipeline behind POST /api/ingest (raw preservation first,
 *   SHA-256 dedup, recursive archive opening, per-format extraction, science
 *   entity/equation registration, cumulative ledger, receipt persistence).
 * - Afterwards it updates knowledge/investigation-map.json (cumulative,
 *   merge-safe across batches) and writes reports/BATCH_RECEIPT_<id>.md.
 * - Prints a compact receipt summary to stdout.
 *
 * Honesty: nothing here trains models; the receipt carries the standing
 * deferred-training statement from the pipeline.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync, renameSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { runBatch } from "../../src/lib/ingest/pipeline.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
process.chdir(ROOT); // the pipeline resolves all storage layers from cwd

// ---- args -------------------------------------------------------------------
const argv = process.argv.slice(2);
const notes = [];
const files = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === "--note") {
    notes.push(argv[++i] ?? "");
  } else files.push(argv[i]);
}
if (files.length === 0) {
  console.error("usage: bun scripts/flame/batch-run.mjs <file1> … <fileN> [--note …]");
  process.exit(1);
}
for (const f of files) {
  if (!existsSync(f)) {
    console.error(`file not found: ${f}`);
    process.exit(1);
  }
}

// ---- corpus linkage (investigations already known to the bundled corpus) ----
let corpus = { experiments: [] };
try {
  corpus = JSON.parse(readFileSync(path.join(ROOT, "src/data/generated/corpus.json"), "utf8"));
} catch {
  /* corpus linkage is optional decoration, not a claim */
}
const corpusByPsi = new Map(corpus.experiments.map((e) => [e.id, e]));

// ---- run the pipeline -------------------------------------------------------
const uploads = files.map((p) => ({
  name: path.basename(p).replace(/[/\\]/g, "_"),
  bytes: readFileSync(p),
}));
console.log(`running batch with ${uploads.length} upload(s):`);
for (const u of uploads) console.log(`  - ${u.name} (${(u.bytes.length / 1024 / 1024).toFixed(2)} MB)`);
const t0 = Date.now();
const receipt = await runBatch(uploads);
console.log(`pipeline finished in ${((Date.now() - t0) / 1000).toFixed(1)} s`);

// ---- group receipt files by top-level upload --------------------------------
const tops = receipt.files.filter((f) => /^f\d{3}$/.test(f.id));
const childrenOf = (topId) => receipt.files.filter((f) => f.id.startsWith(topId + "-"));

const psiFromName = (name) => {
  const m = name.match(/PSI-(\d+)(?:[.\s]|$)/i);
  return m ? `PSI-${m[1]}` : null;
};

// ---- investigation map (cumulative) -----------------------------------------
const mapRel = "knowledge/investigation-map.json";
let map = { version: 1, updatedAt: new Date().toISOString(), investigations: {} };
if (existsSync(mapRel)) {
  try {
    map = JSON.parse(readFileSync(mapRel, "utf8"));
    if (!map.investigations) map.investigations = {};
  } catch {
    console.error("knowledge/investigation-map.json is not valid JSON — refusing to overwrite.");
    process.exit(1);
  }
}

for (const top of tops) {
  const psiId = psiFromName(top.name) ?? `UPLOAD-${top.id}`;
  const corpusRec = corpusByPsi.get(psiId);
  const kids = childrenOf(top.id);
  const inv =
    map.investigations[psiId] ??
    {
      psiId,
      label: corpusRec?.short ?? top.name.replace(/\.zip$/i, ""),
      title: corpusRec?.name ?? top.name.replace(/\.zip$/i, ""),
      psiPage: psiId.startsWith("PSI-") ? `https://psi.nasa.gov/physci/repo/data/investigations/${psiId}` : undefined,
      firstSeenBatch: receipt.batchId,
      batches: [],
      batchEvidence: {},
    };
  // prefer canonical corpus labels when available
  if (corpusRec) {
    inv.label = corpusRec.short;
    inv.title = corpusRec.name;
  }
  if (!inv.batches.includes(receipt.batchId)) inv.batches.push(receipt.batchId);
  // Multi-part uploads (e.g. "PSI-23 (part 1)" + "(part 2)") map to the same
  // investigation; key the evidence by batchId+uploadId so parts never
  // overwrite each other. Single-part batches keep the plain batchId key
  // (backward-compatible with existing map entries).
  let evKey = receipt.batchId;
  if (inv.batchEvidence[evKey] && inv.batchEvidence[evKey].archive !== top.name) {
    evKey = `${receipt.batchId}:${top.id}`;
  }
  inv.batchEvidence[evKey] = {
    archive: top.name,
    archiveSha256: top.sha256,
    archiveSizeBytes: top.sizeBytes,
    entriesInventoried: top.archiveEntries?.length ?? 0,
    childFileCount: kids.length,
    files: [
      {
        id: top.id,
        name: top.name,
        kind: top.kind,
        status: top.status,
        sha256: top.sha256,
      },
      ...kids.map((k) => ({
        id: k.id,
        name: k.name,
        kind: k.kind,
        status: k.status,
        sha256: k.sha256,
        pages: k.text?.pages,
        tables: k.tables.length,
        equations: (k.equations?.matchedKnown.length ?? 0) + (k.equations?.heuristicFormulas.length ?? 0),
        entities: k.entities.length,
        media: k.media.length,
        duplicateOf: k.duplicateOf ? `${k.duplicateOf.batchId}/${k.duplicateOf.name}` : undefined,
      })),
    ],
  };
  inv.corpusTables = corpusRec?.tables?.map((t) => t.file) ?? [];
  map.investigations[psiId] = inv;
}
map.updatedAt = new Date().toISOString();
mkdirSync(path.dirname(path.join(ROOT, mapRel)), { recursive: true });
writeFileSync(path.join(ROOT, mapRel) + ".tmp", JSON.stringify(map, null, 2), "utf8");
renameSync(path.join(ROOT, mapRel) + ".tmp", path.join(ROOT, mapRel));

// ---- receipt markdown ---------------------------------------------------------
const fmt = (n) => (n ?? 0).toLocaleString("en-US");
const esc = (s) => String(s ?? "").replace(/\|/g, "\\|");
const statusIcon = { extracted: "✅", duplicate: "♻️", registered: "📦", unsupported: "⚠️", failed: "❌" };

const lines = [];
lines.push(`# FLAME EVIDENCE LAB — Batch Receipt ${receipt.batchId}`);
lines.push("");
lines.push(`**Received:** ${receipt.receivedAt}  `);
lines.push(`**Declared uploads:** ${receipt.fileCount} (processed file records incl. archive children: ${receipt.totals.files})`);
lines.push("");
lines.push("## Model impact");
lines.push("");
lines.push(receipt.modelImpact);
lines.push("");
lines.push("## Batch totals");
lines.push("");
lines.push(`| metric | value |`);
lines.push(`|---|---|`);
lines.push(`| files processed (incl. children) | ${fmt(receipt.totals.files)} |`);
lines.push(`| extracted | ${fmt(receipt.totals.extracted)} |`);
lines.push(`| duplicates (byte-identical, preserved) | ${fmt(receipt.totals.duplicates)} |`);
lines.push(`| unsupported / failed | ${fmt(receipt.totals.unsupported)} (failed: ${fmt(receipt.totals.failed)}) |`);
lines.push(`| documents with text layer | ${fmt(receipt.totals.documents)} |`);
lines.push(`| pages | ${fmt(receipt.totals.pages)} |`);
lines.push(`| text characters | ${fmt(receipt.totals.chars)} |`);
lines.push(`| tables | ${fmt(receipt.totals.tables)} (${fmt(receipt.totals.tableRows)} rows) |`);
lines.push(`| equation matches (registry + heuristic) | ${fmt(receipt.totals.equations)} |`);
lines.push(`| figure / media entries | ${fmt(receipt.totals.figures)} (media assets on disk: ${fmt(receipt.totals.mediaAssets)}) |`);
lines.push(`| entity mentions | ${fmt(receipt.totals.entities)} (new entity types: ${fmt(receipt.totals.newEntities)}) |`);
lines.push("");
lines.push("## Cumulative ingestion ledger");
lines.push("");
lines.push(`| metric | value |`);
lines.push(`|---|---|`);
for (const [k, v] of Object.entries(receipt.cumulative)) {
  if (k === "userConfirmedAllUploads" || k === "lastBatchId" || k === "updatedAt") continue;
  lines.push(`| ${k} | ${fmt(v)} |`);
}
lines.push(`| lastBatchId | ${receipt.cumulative.lastBatchId} |`);
lines.push(`| userConfirmedAllUploads | ${receipt.cumulative.userConfirmedAllUploads} |`);
lines.push("");
lines.push("## Per-upload detail");
for (const top of tops) {
  const psiId = psiFromName(top.name) ?? `UPLOAD-${top.id}`;
  const inv = map.investigations[psiId];
  const kids = childrenOf(top.id);
  const partTag = top.name.match(/\(part\s*\d+\)/i)?.[0] ?? ""; // multi-part disambiguator
  lines.push("");
  lines.push(`### ${psiId}${partTag ? ` ${partTag}` : ""} — ${esc(inv?.label ?? top.name)}`);
  lines.push("");
  lines.push(`- **Archive:** \`${esc(top.name)}\` — ${fmt(top.sizeBytes)} bytes, SHA-256 \`${top.sha256}\``);
  lines.push(`- **Investigation:** ${esc(inv?.title ?? "not parsed")}  ·  PSI page: ${inv?.psiPage ?? "—"}`);
  if (inv?.corpusTables?.length) lines.push(`- **Pre-existing corpus tables (v2 layer):** ${inv.corpusTables.map((t) => `\`${t}\``).join(", ")}`);
  lines.push(`- **Archive inventory:** ${fmt(top.archiveEntries?.length ?? 0)} entries hashed; ${fmt(kids.filter((k) => k.status !== "duplicate" && k.status !== "unsupported" && k.status !== "failed").length)} extracted as child files`);
  lines.push("");
  lines.push(`| # | file | kind | status | pages | tables | eq | entities | media | notes |`);
  lines.push(`|---|---|---|---|---|---|---|---|---|---|`);
  lines.push(`| ${top.id} | ${esc(top.name)} | ${top.kind} | ${statusIcon[top.status] ?? ""} ${top.status} | — | — | — | — | — | top-level archive |`);
  for (const k of kids) {
    const dupNote = k.duplicateOf ? `dup of ${esc(k.duplicateOf.batchId)}/${esc(k.duplicateOf.name)}` : "";
    const errNote = k.errors.length ? `error: ${esc(k.errors[0]).slice(0, 90)}` : "";
    lines.push(
      `| ${k.id} | ${esc(k.name)} | ${k.kind} | ${statusIcon[k.status] ?? ""} ${k.status} | ${k.text?.pages ?? "—"} | ${k.tables.length} | ${(k.equations?.matchedKnown.length ?? 0) + (k.equations?.heuristicFormulas.length ?? 0)} | ${k.entities.length} | ${k.media.length} | ${[dupNote, errNote].filter(Boolean).join("; ")} |`,
    );
  }
}
lines.push("");
lines.push("## Honest register — unresolved issues & limitations (as recorded by the pipeline)");
lines.push("");
if (receipt.unresolvedIssues.length === 0) lines.push("- none recorded");
for (const u of receipt.unresolvedIssues) lines.push(`- ${u}`);
lines.push("");
lines.push("## Duplicate provenance key");
lines.push("");
lines.push(`- \`PRE-U1-CORPUS/<name>\` — byte-identical to a file that was already part of the bundled v2 corpus (data/raw) before the batched-ingestion system existed. The copy inside this batch is preserved in the raw layer but was not re-registered or re-extracted.`);
lines.push(`- \`<batchId>/<name>\` — byte-identical to a file registered earlier in the same batch (e.g. a shared logo or a duplicated engineering report appearing in several archives).`);
lines.push("");
if (notes.length) {
  lines.push("## Operator notes (this run)");
  lines.push("");
  for (const n of notes) lines.push(`- ${n}`);
  lines.push("");
}
lines.push("## Artifacts");
lines.push("");
lines.push(`- Full machine-readable receipt: \`data/ingest/batches/${receipt.batchId}.json\``);
lines.push(`- Investigation map: \`knowledge/investigation-map.json\``);
lines.push(`- Knowledge entities: \`knowledge/entities.json\` · text index: \`knowledge/index.json\``);
lines.push(`- Raw preserved bytes: \`data/raw/batches/${receipt.batchId}/\` · extraction JSON: \`data/extracted/batches/${receipt.batchId}/\` · media: \`data/media/batches/${receipt.batchId}/\``);

const reportRel = `reports/BATCH_RECEIPT_${receipt.batchId}.md`;
mkdirSync(path.dirname(path.join(ROOT, reportRel)), { recursive: true });
writeFileSync(path.join(ROOT, reportRel), lines.join("\n"), "utf8");

// ---- compact stdout summary ---------------------------------------------------
console.log("\n==== BATCH RECEIPT ====");
console.log(`batchId            ${receipt.batchId}`);
console.log(`uploads            ${receipt.fileCount}`);
console.log(`files (incl kids)  ${receipt.totals.files}`);
console.log(`extracted          ${receipt.totals.extracted}`);
console.log(`duplicates         ${receipt.totals.duplicates}`);
console.log(`unsupported/failed ${receipt.totals.unsupported} / ${receipt.totals.failed}`);
console.log(`documents/pages    ${receipt.totals.documents} / ${receipt.totals.pages}`);
console.log(`tables (rows)      ${receipt.totals.tables} (${receipt.totals.tableRows})`);
console.log(`equations          ${receipt.totals.equations}`);
console.log(`figures/media      ${receipt.totals.figures} / ${receipt.totals.mediaAssets}`);
console.log(`entities (new)     ${receipt.totals.entities} (${receipt.totals.newEntities})`);
console.log(`cumulative batches ${receipt.cumulative.batches}`);
console.log(`report             ${reportRel}`);
console.log(`map                knowledge/investigation-map.json`);
