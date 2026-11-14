// ZERO FLARE — Experiment Dataset query layer (CODEX Phase 1).
//
// Reads the team's canonical cleaned files (via the generated profile layer)
// and the raw cleaned CSVs from data/experiments at request time for full-row
// queries. Exact/unique column resolution, filtering, stats, grouping.
// Missing values are preserved as missing (never zero-filled).
//
// Runtime-portable: CSV text resolves through the edge-aware corpus reader
// (D1 overlay → /corpus static assets on Cloudflare; repository file on Node)
// with a per-file module cache — identical rows on every runtime.

import path from "node:path";
import experimentsRegistryJson from "@/data/generated/experiment_datasets.json";
import { readCorpusText } from "@/lib/ingest/storage";

export interface ExperimentColumnProfile {
  name: string;
  type: "numeric" | "categorical";
  filled: number;
  missing: number;
  unique: number;
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  zeros?: number;
  top?: string[];
}

export interface ExperimentDataset {
  experiment_id: string;
  psi_accession: string | null;
  psi_name: string | null;
  cleaned_file: string;
  sha256: string;
  rows: number;
  columns: number;
  column_names: string[];
  column_profiles: ExperimentColumnProfile[];
  duplicate_rows: number;
  vs_canonical: { canonical_rows: number; canonical_file: string; team_rows: number; more_rows_in_team_package: boolean } | null;
  merge_errors: { source_file: string; error: string }[];
}

const REG = experimentsRegistryJson as unknown as {
  registry_version: string;
  experiment_count: number;
  experiments: ExperimentDataset[];
  validation_baseline: unknown[];
  warnings: string[];
};

export function listExperimentDatasets(): ExperimentDataset[] {
  return REG.experiments;
}

export function getExperimentDataset(idOrAccession: string): ExperimentDataset | undefined {
  const q = idOrAccession.trim().toLowerCase();
  return REG.experiments.find(
    (e) => e.experiment_id.toLowerCase() === q || (e.psi_accession && e.psi_accession.toLowerCase() === q),
  );
}

/** Resolve free-text names: "SAME-R" → PSI-101 experiment, "FLEX-2" → PSI-68, etc. */
export function resolveExperiment(query: string): ExperimentDataset[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const scored = REG.experiments.map((e) => {
    const hay = `${e.experiment_id} ${e.psi_accession ?? ""} ${e.psi_name ?? ""}`.toLowerCase();
    let score = 0;
    for (const token of q.split(/\s+/).filter((w) => w.length > 1)) {
      if (hay.includes(token)) score += 2;
      // acronym-style match: "samer" matches "same-r" fragment in psi_name
      if (token.length >= 4 && hay.replace(/[-\s]/g, "").includes(token.replace(/[-\s]/g, ""))) score += 1;
    }
    return { e, score };
  });
  return scored.filter((s) => s.score > 0).sort((a, b) => b.score - a.score).slice(0, 5).map((s) => s.e);
}

export interface DatasetQueryResult {
  experiment_id: string;
  psi_accession: string | null;
  columns_selected: string[];
  matched_rows: number;
  total_rows: number;
  filters_applied: string[];
  stats: Record<string, { n: number; mean: number | null; min: number | null; max: number | null; median: number | null; missing: number }> | null;
  groups: Record<string, Record<string, number>> | null;
  sample_rows: Record<string, string>[];
  warnings: string[];
}

export interface DatasetFilter {
  column: string;
  op: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains";
  value: string;
}

/** Per-file cleaned-CSV cache (immutable artifacts — never invalidated). */
const csvCache = new Map<string, string>();

async function loadCleanedCsv(cleanedFile: string): Promise<string | null> {
  const basename = path.basename(cleanedFile);
  const hit = csvCache.get(basename);
  if (hit !== undefined) return hit;
  const text = await readCorpusText(path.posix.join("data/experiments", basename));
  if (text !== null) csvCache.set(basename, text);
  return text;
}

/**
 * Query a cleaned experiment dataset with exact column resolution.
 * Column matching is exact (case-insensitive) — ambiguous partial matches are
 * reported, not guessed. Numeric stats use pairwise-valid observations.
 */
export async function queryExperimentDataset(
  experimentId: string,
  opts: { columns?: string[]; filters?: DatasetFilter[]; statsColumns?: string[]; groupBy?: string; limit?: number } = {},
): Promise<DatasetQueryResult | { error: string }> {
  const e = getExperimentDataset(experimentId);
  if (!e) return { error: `unknown experiment "${experimentId}" — use listExperimentDatasets or resolveExperiment` };

  const warnings: string[] = [];
  const text = await loadCleanedCsv(e.cleaned_file);
  if (text === null) {
    return { error: `cleaned file not available on this runtime: ${path.basename(e.cleaned_file)} (the immutable corpus mirror serves it in production; run locally for full-file access)` };
  }

  const lines = text.replace(/^\uFEFF/, "").split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(",").map((h) => h.trim());
  const rawRows = lines.slice(1).map((l) => l.split(",").map((c) => c.trim()));

  // exact column resolution (case-insensitive); partial matches reported
  const resolveCol = (name: string): { idx: number; matched: string } | { error: string } => {
    const lower = name.toLowerCase();
    const exact = header.findIndex((h) => h.toLowerCase() === lower);
    if (exact >= 0) return { idx: exact, matched: header[exact] };
    const partial = header.filter((h) => h.toLowerCase().includes(lower));
    if (partial.length === 1) return { idx: header.indexOf(partial[0]), matched: partial[0] };
    if (partial.length > 1) return { error: `ambiguous column "${name}" — matches: ${partial.join(", ")}. Use the exact column name.` };
    return { error: `column "${name}" not found. Available: ${header.join(", ")}` };
  };

  // filters
  let filtered = rawRows;
  const filtersApplied: string[] = [];
  for (const f of opts.filters ?? []) {
    const res = resolveCol(f.column);
    if ("error" in res) return { error: res.error };
    const before = filtered.length;
    filtered = filtered.filter((row) => {
      const cell = row[res.idx] ?? "";
      if (f.op === "eq") return cell.toLowerCase() === f.value.toLowerCase();
      if (f.op === "neq") return cell.toLowerCase() !== f.value.toLowerCase();
      if (f.op === "contains") return cell.toLowerCase().includes(f.value.toLowerCase());
      const a = Number(cell);
      const b = Number(f.value);
      if (!Number.isFinite(a) || !Number.isFinite(b)) return false;
      if (f.op === "gt") return a > b;
      if (f.op === "gte") return a >= b;
      if (f.op === "lt") return a < b;
      return a <= b;
    });
    filtersApplied.push(`${f.column} ${f.op} ${f.value} (${before}→${filtered.length})`);
  }

  // stats (pairwise-valid numeric observations; missing preserved as missing count)
  let stats: DatasetQueryResult["stats"] = null;
  if (opts.statsColumns?.length) {
    stats = {};
    for (const sc of opts.statsColumns) {
      const res = resolveCol(sc);
      if ("error" in res) {
        warnings.push(res.error);
        continue;
      }
      const vals: number[] = [];
      let missing = 0;
      for (const row of filtered) {
        const cell = row[res.idx] ?? "";
        if (cell === "") { missing++; continue; }
        const v = Number(cell);
        if (Number.isFinite(v)) vals.push(v);
        else missing++;
      }
      const sorted = [...vals].sort((a, b) => a - b);
      stats[res.matched] = {
        n: vals.length,
        mean: vals.length ? +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(4) : null,
        min: vals.length ? sorted[0] : null,
        max: vals.length ? sorted[sorted.length - 1] : null,
        median: vals.length ? sorted[Math.floor(sorted.length / 2)] : null,
        missing,
      };
    }
  }

  // grouping: mean of a numeric column per category (group_by "catCol:numericCol")
  let groups: DatasetQueryResult["groups"] = null;
  if (opts.groupBy) {
    const [catName, numName] = opts.groupBy.split(":").map((s) => s.trim());
    const catRes = resolveCol(catName);
    const numRes = resolveCol(numName);
    if ("error" in catRes) warnings.push(catRes.error);
    else if ("error" in numRes) warnings.push(numRes.error);
    else {
      groups = {};
      const acc = new Map<string, number[]>();
      for (const row of filtered) {
        const g = row[catRes.idx] ?? "";
        const v = Number(row[numRes.idx] ?? "");
        if (!g || !Number.isFinite(v)) continue;
        const key = g.length > 24 ? `${g.slice(0, 23)}…` : g;
        (acc.get(key) ?? acc.set(key, []).get(key)!).push(v);
      }
      for (const [k, vals] of acc) {
        groups[k] = { n: vals.length, mean: +(vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(4), min: Math.min(...vals), max: Math.max(...vals) };
      }
    }
  }

  // sample rows (selected columns or all)
  const selectedCols = opts.columns?.length ? opts.columns : header;
  const resolvedCols = selectedCols.map((c) => resolveCol(c));
  const badCol = resolvedCols.find((r) => "error" in r);
  if (badCol) return { error: (badCol as { error: string }).error };
  const limit = Math.min(50, Math.max(1, opts.limit ?? 10));
  const sample_rows = filtered.slice(0, limit).map((row) => {
    const o: Record<string, string> = {};
    for (const rc of resolvedCols as { idx: number; matched: string }[]) o[rc.matched] = row[rc.idx] ?? "";
    return o;
  });

  return {
    experiment_id: e.experiment_id,
    psi_accession: e.psi_accession,
    columns_selected: (resolvedCols as { idx: number; matched: string }[]).map((r) => r.matched),
    matched_rows: filtered.length,
    total_rows: rawRows.length,
    filters_applied: filtersApplied,
    stats,
    groups,
    sample_rows,
    warnings,
  };
}


