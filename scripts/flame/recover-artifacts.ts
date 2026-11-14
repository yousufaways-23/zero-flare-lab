#!/usr/bin/env bun
/**
 * FLAME EVIDENCE LAB — artifact-layer recovery (ops script, not ingestion).
 *
 * Context: a sandbox filesystem restore wiped the derived batch layers
 * (data/raw/batches/**, data/extracted/batches/**, data/media/batches/**)
 * while leaving the evidence ledger intact (data/ingest/**: registry,
 * per-batch state, cumulative totals) and the original uploads intact
 * (upload/**). This script rebuilds ONLY the missing artifact layers by
 * replaying the deterministic extraction walk recorded in each batch state
 * file — it never touches the registry, ledger, knowledge base or receipts,
 * and it never re-registers entities (no duplicate science side effects).
 *
 * Safety properties:
 *  - SHA-256 verified against the persisted state before anything is written.
 *  - Per-file checkpoint (data/ingest/recovery-progress.json, atomic write),
 *    so the script can be killed and re-run; it resumes where it stopped.
 *  - Duplicates are re-preserved raw but NOT re-extracted (mirrors pipeline).
 *  - Final pass verifies every recorded rawPath / extractedPath / media path.
 *
 * Usage: bun scripts/flame/recover-artifacts.mjs [--verify-only]
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync, renameSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { inspectArchive, extractByKind } from "../../src/lib/ingest/extract.ts";

const here = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(here, "..", "..");
process.chdir(ROOT);

const MAX_FILE_BYTES = 300 * 1024 * 1024; // must mirror pipeline.ts
const UPLOAD_DIR = path.join(ROOT, "upload");
const STATE_GLOB = ["B-20261109-001", "B-20261109-002", "B-20261109-003", "B-20261109-004"];
const PROGRESS_REL = "data/ingest/recovery-progress.json";

const verifyOnly = process.argv.includes("--verify-only");

// ---------------------------------------------------------------- progress ---
type Progress = { [batchId: string]: { [fileId: string]: true } };
function loadProgress(): Progress {
  try {
    return JSON.parse(readFileSync(path.join(ROOT, PROGRESS_REL), "utf8"));
  } catch {
    return {};
  }
}
function saveProgress(p: Progress) {
  const abs = path.join(ROOT, PROGRESS_REL);
  const tmp = abs + ".tmp";
  writeFileSync(tmp, JSON.stringify(p));
  renameSync(tmp, abs);
}

// ------------------------------------------------------------------ utils ----
import crypto from "node:crypto";
const sha256 = (b: Buffer) => crypto.createHash("sha256").update(b).digest("hex");

function log(...a: unknown[]) {
  console.log(`[${new Date().toISOString().slice(11, 19)}]`, ...a);
}

// ------------------------------------------------------------- uploads map ---
// Lazy map: upload originals total ~666 MB; keep name -> abs path and read
// bytes on demand so peak memory stays bounded by a single file.
const uploadByName = new Map<string, string>();
{
  const { readdirSync } = await import("node:fs");
  for (const n of readdirSync(UPLOAD_DIR)) {
    const abs = path.join(UPLOAD_DIR, n);
    let st;
    try {
      st = (await import("node:fs")).statSync(abs);
    } catch {
      continue;
    }
    if (!st.isFile()) continue;
    const sanitised = path.basename(n).replace(/[/\\]/g, "_");
    uploadByName.set(sanitised, abs);
  }
}
log(`upload/ scanned: ${uploadByName.size} candidate originals`);

// --------------------------------------------------------------- recovery ----
const progress = loadProgress();
const problems: string[] = [];

async function recoverFile(input, rec: any, batchId: string, records: Map<string, any>) {
  if (progress[batchId]?.[rec.id]) return;

  // Integrity gate: the bytes must hash to what the ledger recorded.
  const got = sha256(input.bytes);
  if (got !== rec.sha256) {
    problems.push(
      `${batchId}/${rec.id} ${rec.name}: sha256 mismatch (expected ${rec.sha256}, got ${got}) — skipped`,
    );
    return;
  }

  // 1. Raw preservation FIRST (every status, mirroring processFile).
  const rawRel = `data/raw/batches/${batchId}/${rec.id}-${rec.name.replace(/[/\\]/g, "_")}`;
  const rawAbs = path.resolve(ROOT, rawRel);
  if (rawAbs !== ROOT && !rawAbs.startsWith(ROOT + path.sep)) {
    throw new Error("raw path escapes project root");
  }
  mkdirSync(path.dirname(rawAbs), { recursive: true });
  writeFileSync(rawAbs, input.bytes);

  // 2. Extraction replay (duplicates and oversized files stay raw-only).
  const oversized = input.bytes.length > MAX_FILE_BYTES;
  if (rec.status !== "duplicate" && !oversized) {
    if (rec.kind === "archive") {
      const inv = await inspectArchive(input);
      // Replicate the pipeline's extraction summary for archives (see
      // pipeline.ts: status "registered", no text/tables, archiveEntries +
      // the inventory note in unresolved, in the original order).
      const unresolved = [
        ...inv.unresolved,
        `Archive inventoried: ${inv.entries.length} entries hashed${
          inv.children.length
            ? `; ${inv.children.length} supported entries extracted as child files below/alongside`
            : "; no supported entries to extract"
        }.`,
      ];
      const extractAbs = path.join(ROOT, "data/extracted/batches", batchId, `${rec.id}.extract.json`);
      mkdirSync(path.dirname(extractAbs), { recursive: true });
      writeFileSync(
        extractAbs,
        JSON.stringify(
          {
            file: rec.name,
            batchId,
            sha256: rec.sha256,
            kind: rec.kind,
            status: rec.status,
            domain: rec.domain,
            text: undefined,
            tables: [],
            equations: undefined,
            entities: [],
            publication: undefined,
            media: [],
            archiveEntries: inv.entries,
            errors: inv.errors,
            unresolved,
          },
          null,
          2,
        ),
      );
      for (const child of inv.children) {
        const crec = records.get(child.fileId);
        if (!crec) {
          problems.push(
            `${batchId}/${child.fileId}: re-derived archive child missing from persisted state — skipped (state/fileTree divergence)`,
          );
          continue;
        }
        await recoverFile(child, crec, batchId, records);
      }
    } else {
      const t0 = Date.now();
      const out = await extractByKind(input, rec.kind as any, rawAbs);
      log(`  extracted ${batchId}/${rec.id} (${rec.kind}, ${((Date.now() - t0) / 1000).toFixed(1)}s)`);
      // Replicate the pipeline's per-file extraction summary (pipeline.ts
      // writes this right after extractByKind; status/domain come from the
      // persisted state so the rebuilt file matches the ledger exactly).
      const extractRel = `data/extracted/batches/${batchId}/${rec.id}.extract.json`;
      const extractAbs = path.join(ROOT, extractRel);
      mkdirSync(path.dirname(extractAbs), { recursive: true });
      writeFileSync(
        extractAbs,
        JSON.stringify(
          {
            file: rec.name,
            batchId,
            sha256: rec.sha256,
            kind: rec.kind,
            status: rec.status,
            domain: rec.domain,
            text: out.text
              ? { ...out.text, pageTexts: out.text.pageTexts?.slice(0, 200) }
              : undefined,
            tables: out.tables,
            equations: out.equations,
            entities: out.entities,
            publication: out.publication,
            media: (out.media ?? []).map((m: any) => ({ ...m })),
            archiveEntries: out.archiveEntries,
            errors: out.errors,
            unresolved: out.unresolved,
          },
          null,
          2,
        ),
      );
    }
  }

  progress[batchId] = progress[batchId] ?? {};
  progress[batchId][rec.id] = true;
  saveProgress(progress);
}

// ------------------------------------------------------------------- main ----
for (const batchId of STATE_GLOB) {
  const stateAbs = path.join(ROOT, "data/ingest/batches", `${batchId}.json`);
  if (!existsSync(stateAbs)) {
    problems.push(`${batchId}: state file missing — cannot recover`);
    continue;
  }
  const state = JSON.parse(readFileSync(stateAbs, "utf8"));
  const records = new Map<string, any>(state.files.map((f: any) => [f.id, f]));
  const tops = state.files.filter((f: any) => /^f\d{3}$/.test(f.id));
  const done = tops.filter((t: any) => progress[batchId]?.[t.id]).length;
  log(`${batchId}: ${tops.length} top-level uploads (${done} already recovered)`);

  for (const rec of tops) {
    if (progress[batchId]?.[rec.id]) continue;
    const uploadAbs = uploadByName.get(rec.name);
    if (!uploadAbs) {
      problems.push(`${batchId}/${rec.id} ${rec.name}: original upload not found in upload/ — skipped`);
      progress[batchId] = progress[batchId] ?? {};
      progress[batchId][rec.id] = true; // cannot recover; don't loop forever
      saveProgress(progress);
      continue;
    }
    const bytes = readFileSync(uploadAbs);
    log(`${batchId}/${rec.id} ${rec.name} (${(bytes.length / 1024 / 1024).toFixed(1)} MB, ${rec.status})`);
    await recoverFile(
      { name: rec.name, bytes, batchId, fileId: rec.id },
      rec,
      batchId,
      records,
    );
  }
}

// ------------------------------------------------------- verification pass ---
log("verification pass…");
let vRaw = 0, vRawBad = 0, vExt = 0, vExtBad = 0, vMedia = 0, vMediaBad = 0, vFiles = 0;
for (const batchId of STATE_GLOB) {
  const stateAbs = path.join(ROOT, "data/ingest/batches", `${batchId}.json`);
  if (!existsSync(stateAbs)) continue;
  const state = JSON.parse(readFileSync(stateAbs, "utf8"));
  for (const f of state.files) {
    vFiles++;
    if (f.rawPath) {
      const p = path.join(ROOT, f.rawPath);
      if (existsSync(p)) vRaw++;
      else {
        vRawBad++;
        if (problems.length < 400) problems.push(`${batchId}/${f.id}: rawPath missing (${f.rawPath})`);
      }
    }
    if (f.extractedPath) {
      const p = path.join(ROOT, f.extractedPath);
      if (existsSync(p)) vExt++;
      else {
        vExtBad++;
        if (problems.length < 400) problems.push(`${batchId}/${f.id}: extractedPath missing (${f.extractedPath})`);
      }
    }
    for (const m of f.media ?? []) {
      // Media records with `caption:` pseudo-paths are caption metadata attached
      // to adjacent figures (original pipeline behaviour) — never files on disk.
      if (!m.path || !m.path.startsWith("data/media/")) continue;
      vMedia++;
      if (!existsSync(path.join(ROOT, m.path))) {
        vMediaBad++;
        if (problems.length < 400) problems.push(`${batchId}/${f.id}: media missing (${m.path})`);
      }
    }
  }
}

log("=====================================================");
log(`files checked      : ${vFiles}`);
log(`raw preserved      : ${vRaw} ok, ${vRawBad} missing`);
log(`extracted texts    : ${vExt} ok, ${vExtBad} missing`);
log(`media binaries     : ${vMedia} ok, ${vMediaBad} missing`);
log(`problems           : ${problems.length}`);
if (problems.length) {
  log("first problems:");
  for (const p of problems.slice(0, 25)) log("  -", p);
}
const complete = vRawBad === 0 && vExtBad === 0 && vMediaBad === 0 && problems.length === 0;
log(complete ? "RECOVERY COMPLETE ✅" : "RECOVERY INCOMPLETE — see problems above ❌");
if (!complete && !verifyOnly) process.exitCode = 2;
