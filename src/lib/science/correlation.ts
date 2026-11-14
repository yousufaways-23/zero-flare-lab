/**
 * ZERO FLARE — correlation analysis over recovered PSI tables (§2).
 *
 * Computes Pearson correlation matrices client-side from the canonical corpus
 * rows, with per-pair sample sizes and a minimum-n threshold. This is
 * EXPLORATORY association within a single table's conditions — never a causal
 * claim, never pooled across investigations.
 */

import { getTable, type DataTable } from "@/lib/data/catalog";

export interface CorrelationCell {
  colA: string;
  colB: string;
  r: number | null;
  n: number;
}

export interface CorrelationMatrix {
  tableId: string;
  columns: string[];
  cells: CorrelationCell[];
  /** threshold below which we decline to compute (small-n honesty) */
  minN: number;
}

function pearson(xs: number[], ys: number[]): number | null {
  const n = Math.min(xs.length, ys.length);
  if (n < 2) return null;
  let sx = 0;
  let sy = 0;
  for (let i = 0; i < n; i++) {
    sx += xs[i];
    sy += ys[i];
  }
  const mx = sx / n;
  const my = sy / n;
  let sxy = 0;
  let sxx = 0;
  let syy = 0;
  for (let i = 0; i < n; i++) {
    const dx = xs[i] - mx;
    const dy = ys[i] - my;
    sxy += dx * dy;
    sxx += dx * dx;
    syy += dy * dy;
  }
  if (sxx === 0 || syy === 0) return null;
  const r = sxy / Math.sqrt(sxx * syy);
  return Number.isFinite(r) ? r : null;
}

/**
 * Correlate the numeric columns of one table. Blank/missing cells drop the
 * row pairwise (pairwise deletion, n reported per pair). Columns with <60%
 * fill are skipped — too sparse to be informative.
 */
export function computeCorrelationMatrix(table: DataTable, minN = 8, maxCols = 10): CorrelationMatrix {
  const numericCols = table.columns
    .filter((c) => c.type === "numeric" && c.fillRate >= 0.6)
    .slice(0, maxCols);

  // extract numeric series per column (pairwise-complete at cell level)
  const series = numericCols.map((c) => {
    const vals = table.rows.map((r) => {
      const v = Number((r[c.index] ?? "").trim());
      return Number.isFinite(v) ? v : null;
    });
    return { name: c.name, unit: c.unit, vals };
  });

  const cells: CorrelationCell[] = [];
  for (let i = 0; i < series.length; i++) {
    for (let j = i + 1; j < series.length; j++) {
      const xs: number[] = [];
      const ys: number[] = [];
      const a = series[i].vals;
      const b = series[j].vals;
      for (let k = 0; k < a.length; k++) {
        if (a[k] !== null && b[k] !== null) {
          xs.push(a[k] as number);
          ys.push(b[k] as number);
        }
      }
      const n = xs.length;
      cells.push({
        colA: series[i].name,
        colB: series[j].name,
        r: n >= minN ? pearson(xs, ys) : null,
        n,
      });
    }
  }

  return {
    tableId: table.id,
    columns: series.map((s) => s.name),
    cells,
    minN,
  };
}

/** Strength band for colour mapping — |r| bands, direction shown by sign. */
export function correlationBand(r: number | null): "strong" | "moderate" | "weak" | "none" | "insufficient" {
  if (r === null) return "insufficient";
  const a = Math.abs(r);
  if (a >= 0.7) return "strong";
  if (a >= 0.4) return "moderate";
  if (a >= 0.2) return "weak";
  return "none";
}

export function getCorrelationForTable(tableId: string): CorrelationMatrix | null {
  const t = getTable(tableId);
  return t ? computeCorrelationMatrix(t) : null;
}
