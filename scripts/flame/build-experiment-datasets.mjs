// Build the Experiment Dataset layer (CODEX Phase 1) →
// src/data/generated/experiment_datasets.json
//
// Reads the team's canonical Experiment_X_cleaned.csv files (never modified),
// maps them to PSI accessions via experiment_names.csv, computes column
// profiles + a validation baseline, and validates the mapping.
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const EXP_DIR = path.join(ROOT, "data", "experiments");
const OUT = path.join(ROOT, "src", "data", "generated", "experiment_datasets.json");

// ---- load the authoritative mapping ----
const parseCsv = (text) => {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(",").map((h) => h.trim());
  return lines.slice(1).map((l) => {
    const cells = l.split(",");
    return Object.fromEntries(header.map((h, i) => [h, (cells[i] ?? "").trim()]));
  });
};

const names = parseCsv(readFileSync(path.join(EXP_DIR, "experiment_names.csv"), "utf8")).map((r) => ({
  experiment_id: r.experiment_id,
  original_zip: r.original_zip,
  accession: (r.original_zip.match(/PSI-(\d+)/) ?? [null, null])[1] ? `PSI-${r.original_zip.match(/PSI-(\d+)/)[1]}` : null,
}));

const mergeManifestRaw = readFileSync(path.join(EXP_DIR, "merge_manifest.csv"), "utf8");
const mergeManifest = parseCsv(mergeManifestRaw);
const mergeErrors = parseCsv(readFileSync(path.join(EXP_DIR, "merge_errors.csv"), "utf8"));

// known accession corrections where the names file lacks a PSI number
const KNOWN_EXTRA = { Experiment_14: null, Experiment_15: "PSI-101" }; // SAME-R reference data

function profileColumn(values) {
  const nonEmpty = values.filter((v) => v !== "" && v !== null && v !== undefined);
  const numeric = nonEmpty.map((v) => Number(v)).filter((v) => Number.isFinite(v));
  const numericRatio = nonEmpty.length ? numeric.length / nonEmpty.length : 0;
  const isNumeric = numericRatio >= 0.8;
  const unique = new Set(nonEmpty);
  const profile = {
    type: isNumeric ? "numeric" : "categorical",
    filled: nonEmpty.length,
    missing: values.length - nonEmpty.length,
    unique: unique.size,
  };
  if (isNumeric && numeric.length) {
    const sorted = [...numeric].sort((a, b) => a - b);
    profile.min = sorted[0];
    profile.max = sorted[sorted.length - 1];
    profile.mean = +(numeric.reduce((a, b) => a + b, 0) / numeric.length).toFixed(4);
    profile.median = sorted[Math.floor(sorted.length / 2)];
    profile.zeros = numeric.filter((v) => v === 0).length;
  } else if (nonEmpty.length) {
    const counts = {};
    for (const v of nonEmpty) counts[v] = (counts[v] ?? 0) + 1;
    profile.top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([v, n]) => `${v} (${n})`);
  }
  return profile;
}

function csvRows(text) {
  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(",").map((h) => h.trim());
  return {
    header,
    rows: lines.slice(1).map((l) => l.split(",").map((c) => c.trim())),
  };
}

const experiments = [];
const warnings = [];

const files = readdirSync(EXP_DIR).filter((f) => /^Experiment_\d+_cleaned\.csv$/.test(f));
for (const file of files.sort((a, b) => {
  const na = Number(a.match(/Experiment_(\d+)/)[1]);
  const nb = Number(b.match(/Experiment_(\d+)/)[1]);
  return na - nb;
})) {
  const experiment_id = file.replace("_cleaned.csv", "");
  const nameRec = names.find((n) => n.experiment_id === experiment_id);
  const buf = readFileSync(path.join(EXP_DIR, file));
  const sha256 = createHash("sha256").update(buf).digest("hex");
  const { header, rows } = csvRows(buf.toString("utf8"));

  // duplicate rows (exact string match)
  const seen = new Set();
  let duplicates = 0;
  for (const r of rows) {
    const key = r.join("\u0001");
    if (seen.has(key)) duplicates++;
    else seen.add(key);
  }

  const column_profiles = header.map((h, i) => ({ name: h, ...profileColumn(rows.map((r) => r[i] ?? "")) }));

  // mapping resolution: names file is authoritative; KNOWN_EXTRA fills gaps
  let accession = nameRec?.accession ?? KNOWN_EXTRA[experiment_id] ?? null;
  if (!accession) warnings.push(`${experiment_id}: no PSI accession in experiment_names.csv (reference/support experiment)`);

  // data-volume comparison vs canonical corpus where both exist
  let vs_canonical = null;
  try {
    const corpus = JSON.parse(readFileSync(path.join(ROOT, "src", "data", "generated", "corpus.json"), "utf8"));
    const ct = corpus.tables.find((t) => t.investigation === accession);
    if (ct) vs_canonical = { canonical_rows: ct.rowCount, canonical_file: ct.file, team_rows: rows.length, more_rows_in_team_package: rows.length > ct.rowCount };
  } catch { /* corpus optional */ }

  experiments.push({
    experiment_id,
    psi_accession: accession,
    psi_name: nameRec?.original_zip ?? null,
    cleaned_file: `data/experiments/${file}`,
    sha256,
    rows: rows.length,
    columns: header.length,
    column_names: header,
    column_profiles,
    duplicate_rows: duplicates,
    vs_canonical,
    merge_manifest_rows: mergeManifest.filter((m) => m.experiment_id === experiment_id).length,
    merge_errors: mergeErrors.filter((m) => m.experiment_id === experiment_id).map((m) => ({ source_file: m.source_file, error: (m.error ?? "").slice(0, 140) })),
  });
}

// validation baseline: reproducible stats fixture for the query layer (CODEX Phase 1 PASS evidence)
const validation_baseline = experiments.map((e) => ({
  experiment_id: e.experiment_id,
  psi_accession: e.psi_accession,
  rows: e.rows,
  columns: e.columns,
  sha256: e.sha256,
  numeric_columns: e.column_profiles.filter((p) => p.type === "numeric").length,
  total_missing: e.column_profiles.reduce((a, p) => a + p.missing, 0),
  duplicate_rows: e.duplicate_rows,
}));

const registry = {
  registry_version: "1.0",
  generatedAt: new Date().toISOString(),
  source_policy: "Team-supplied canonical cleaned files (Experiment_X_cleaned.csv) — never modified; group_*.csv treated as supporting outputs; merge_manifest/merge_errors preserved for provenance",
  experiment_count: experiments.length,
  experiments,
  validation_baseline,
  warnings,
};

writeFileSync(OUT, JSON.stringify(registry, null, 1), "utf8");
JSON.parse(readFileSync(OUT, "utf8"));
console.log(`experiment datasets written: ${OUT}`);
console.log(`experiments: ${experiments.length} | with PSI accession: ${experiments.filter((e) => e.psi_accession).length} | warnings: ${warnings.length}`);
const enriched = experiments.filter((e) => e.vs_canonical?.more_rows_in_team_package);
console.log(`experiments with MORE rows than canonical corpus: ${enriched.length}`);
for (const e of enriched) console.log(`  ${e.experiment_id} (${e.psi_accession}): team ${e.rows} vs canonical ${e.vs_canonical.canonical_rows}`);
