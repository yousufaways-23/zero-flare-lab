// ZERO FLARE — rebuild-all: single documented command that regenerates every
// derived artifact from the immutable raw layer and re-syncs all indexes.
// Run after any data or content update (Task: "after every data or content
// update, automatically synchronize the relevant indexes").
//
//   node scripts/flame/rebuild-all.mjs
//
// Stages: corpus → data layer → canonical manifests → knowledge-base stats.
// The knowledge text index itself is produced by the ingestion pipeline
// (batches), so this script verifies its currency against data/raw mtime.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PY = process.env.PYTHON ?? "python";

function run(cmd, args) {
  console.log(`\n▶ ${cmd} ${args.join(" ")}`);
  execFileSync(cmd, args, { stdio: "inherit", cwd: ROOT, shell: false });
}

let failures = 0;

// 1 — corpus.json from data/raw (honest stats)
try {
  run(PY, ["scripts/build_corpus.py"]);
} catch {
  failures++;
}

// 2 — investigations/graph/findings data layer (+ spec integrity cases)
try {
  run(PY, ["scripts/generate_data_layer.py"]);
} catch {
  failures++;
}

// 3 — canonical data manifest (sha256 for every raw/generated/asset record)
try {
  run("node", ["scripts/flame/build-canonical-manifest.mjs"]);
} catch {
  failures++;
}

// 4 — knowledge index currency check: warn when data/raw is newer than the index
try {
  const idxPath = path.join(ROOT, "knowledge", "index.json");
  if (existsSync(idxPath)) {
    const idxMtime = statSync(idxPath).mtimeMs;
    const rawDir = path.join(ROOT, "data", "raw");
    const newer = [];
    for (const f of (await import("node:fs")).readdirSync(rawDir)) {
      const p = path.join(rawDir, f);
      if (statSync(p).mtimeMs > idxMtime) newer.push(f);
    }
    if (newer.length) {
      console.log(`\n⚠ knowledge/index.json predates ${newer.length} raw file(s): ${newer.slice(0, 4).join(", ")}${newer.length > 4 ? "…" : ""}`);
      console.log("  → run an ingestion batch over them to refresh the text index (the pipeline is the only writer).");
    } else {
      const idx = JSON.parse(readFileSync(idxPath, "utf8"));
      console.log(`\n✓ knowledge index current: ${idx.docs?.length ?? 0} document extracts`);
    }
  }
} catch (e) {
  console.error("index check failed:", e.message);
  failures++;
}

console.log(failures === 0 ? "\n✓ rebuild-all complete" : `\n✗ rebuild-all finished with ${failures} stage failure(s)`);
process.exit(failures === 0 ? 0 : 1);
