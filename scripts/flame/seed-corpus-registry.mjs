#!/usr/bin/env node
/**
 * FLAME EVIDENCE LAB — one-time registry seed for the pre-U1 bundled corpus.
 *
 * The 19 experimental-table CSVs in data/raw/ were ingested by the v2 corpus
 * pipeline (scripts/flame/ingest.mjs) BEFORE the U1 batched-ingestion system
 * existed, so they are absent from the U1 global SHA-256 registry. This script
 * registers them with the marker batch id "PRE-U1-CORPUS" so that any later
 * upload containing byte-identical files (e.g. the experimental-table CSVs
 * inside the PSI investigation ZIP archives) is correctly detected as a
 * duplicate of content the project already holds, instead of being counted
 * and re-registered as new knowledge.
 *
 * The marker is NOT a batch: data/ingest/batches.json and cumulative.json are
 * untouched, so the first real upload still receives batch id B-<date>-001.
 *
 * Idempotent: re-running adds nothing new. Honest: files that changed since
 * the corpus snapshot get their current hash; nothing is assumed.
 */
import { readFileSync, writeFileSync, readdirSync, existsSync, renameSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..", "..");
const RAW = join(ROOT, "data", "raw");
const REGISTRY = join(ROOT, "data", "ingest", "registry.json");
const MARKER = "PRE-U1-CORPUS";

function sha256(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

let registry = { version: 1, entries: {} };
if (existsSync(REGISTRY)) {
  try {
    registry = JSON.parse(readFileSync(REGISTRY, "utf8"));
    if (!registry.entries) registry.entries = {};
  } catch {
    console.error("registry.json exists but is not valid JSON — refusing to overwrite.");
    process.exit(1);
  }
}

const csvs = readdirSync(RAW).filter((f) => f.endsWith(".csv")).sort();
let added = 0;
let already = 0;
for (const file of csvs) {
  const bytes = readFileSync(join(RAW, file));
  const sha = sha256(bytes);
  if (registry.entries[sha]) {
    already++;
    continue;
  }
  registry.entries[sha] = {
    sha256: sha,
    firstSeenBatch: MARKER,
    firstSeenName: `data/raw/${file}`,
    firstSeenAt: "2026-11-09T00:00:00.000Z", // corpus MANIFEST generation date
    sizeBytes: bytes.length,
    kind: "csv",
  };
  added++;
}

const tmp = `${REGISTRY}.tmp`;
writeFileSync(tmp, JSON.stringify(registry, null, 2), "utf8");
renameSync(tmp, REGISTRY);
console.log(`corpus csvs scanned : ${csvs.length}`);
console.log(`registry entries +  : ${added}`);
console.log(`already present     : ${already}`);
console.log(`total registry size : ${Object.keys(registry.entries).length}`);
