"use client";
/**
 * ZERO FLARE — per-investigation chart suite ("Charts" tab).
 *
 * Auto-generates a visualization pack for each recovered experiment table:
 *   1. Numeric distributions (histograms, up to 4 best-filled columns)
 *   2. Strongest pairwise correlation scatter (Pearson r shown with n)
 *   3. Categorical breakdown (counts + group means of a key numeric)
 *   4. Trial-order trend of the primary numeric measure
 *   5. Column completeness bar (fill-rate honesty — missing data stays missing)
 *
 * Everything is computed client-side from the recovered NASA PSI rows in the
 * bundled corpus (src/data/generated) — no invented data, no server round-trip.
 * Each panel carries the table's SHA-256 provenance footer.
 */
import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, Cell, Line, LineChart, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import { getTablesForInvestigation, type DataTable } from "@/lib/data/catalog";

const C = {
  orange: "#D2451E",
  blue: "#4784D9",
  teal: "#3E9B7A",
  gold: "#B08A2E",
  cyan: "#37DCF2",
  axis: "#8FA3BD",
  grid: "rgba(148, 163, 184, 0.15)",
};

const TOOLTIP_STYLE = {
  background: "#0F1B2D",
  border: "1px solid rgba(148,163,184,0.35)",
  borderRadius: 8,
  color: "#E5EEF8",
  fontSize: 12,
} as const;

const AXIS = { tick: { fill: C.axis, fontSize: 11 } } as const;

function toNum(v: string | undefined): number | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim().replace(/,/g, "");
  if (!s || s === "-" || s === "—" || s.toLowerCase() === "n/a") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

interface NumCol { idx: number; name: string; fillRate: number }
interface CatCol { idx: number; name: string; fillRate: number }

function pearson(xs: number[], ys: number[]): number {
  const n = Math.min(xs.length, ys.length);
  if (n < 3) return NaN;
  let sx = 0, sy = 0;
  for (let i = 0; i < n; i++) { sx += xs[i]; sy += ys[i]; }
  const mx = sx / n, my = sy / n;
  let num = 0, dx = 0, dy = 0;
  for (let i = 0; i < n; i++) {
    const a = xs[i] - mx, b = ys[i] - my;
    num += a * b; dx += a * a; dy += b * b;
  }
  const den = Math.sqrt(dx * dy);
  return den === 0 ? NaN : num / den;
}

/** Section shell — shared panel frame. */
function Panel({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-white/10 bg-[#0F1B2D]/60 p-4">
      <h4 className="text-sm font-semibold text-[#E5EEF8]">{title}</h4>
      {subtitle ? <p className="mt-0.5 text-xs text-[#8FA3BD]">{subtitle}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

function Histograms({ table, numCols }: { table: DataTable; numCols: NumCol[] }) {
  const picks = useMemo(() => {
    return [...numCols].sort((a, b) => b.fillRate - a.fillRate).slice(0, 4).map((c) => {
      const values = table.rows.map((r) => toNum(r[c.idx])).filter((v): v is number => v !== null);
      const profile = table.columns[c.idx];
      if (profile?.histogram && profile.histogram.counts.length) {
        const h = profile.histogram;
        return {
          name: c.name,
          data: h.counts.map((count, i) => ({
            bin: `${Number(h.binStart[i].toFixed(2))}`,
            count,
          })),
          n: values.length,
        };
      }
      // compute 10 equal-width bins from the raw rows
      if (!values.length) return { name: c.name, data: [], n: 0 };
      const min = Math.min(...values), max = Math.max(...values);
      const span = max - min || 1;
      const bins = 10;
      const counts = new Array(bins).fill(0);
      for (const v of values) {
        const b = Math.min(bins - 1, Math.floor(((v - min) / span) * bins));
        counts[b] += 1;
      }
      return {
        name: c.name,
        data: counts.map((count, i) => ({ bin: Number((min + (span / bins) * (i + 0.5)).toPrecision(4)), count })),
        n: values.length,
      };
    }).filter((d) => d.data.length > 0);
  }, [table, numCols]);

  if (!picks.length) return null;
  return (
    <Panel
      title="Numeric distributions"
      subtitle="Recovered values per numeric column — bins computed from the real rows (missing values excluded, never filled)."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {picks.map((h, i) => (
          <div key={h.name} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
            <p className="mb-1 px-1 text-xs text-[#8FA3BD]">
              <span className="font-mono text-[#E5EEF8]">{h.name}</span> · n={h.n}
            </p>
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={h.data} margin={{ top: 4, right: 6, bottom: 0, left: -18 }}>
                <CartesianGrid stroke={C.grid} vertical={false} />
                <XAxis dataKey="bin" tick={AXIS.tick} interval="preserveStartEnd" />
                <YAxis tick={AXIS.tick} allowDecimals={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(210,69,30,0.08)" }} />
                <Bar dataKey="count" fill={i % 2 === 0 ? C.orange : C.blue} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function CorrelationScatter({ table, numCols }: { table: DataTable; numCols: NumCol[] }) {
  const best = useMemo(() => {
    const cols = numCols.filter((c) => c.fillRate >= 0.5).slice(0, 10);
    let top: { a: NumCol; b: NumCol; r: number; points: { x: number; y: number }[]; n: number } | null = null;
    for (let i = 0; i < cols.length; i++) {
      for (let j = i + 1; j < cols.length; j++) {
        const xs: number[] = [], ys: number[] = [];
        for (const row of table.rows) {
          const x = toNum(row[cols[i].idx]);
          const y = toNum(row[cols[j].idx]);
          if (x !== null && y !== null) { xs.push(x); ys.push(y); }
        }
        const r = pearson(xs, ys);
        if (Number.isFinite(r) && (!top || Math.abs(r) > Math.abs(top.r))) {
          top = {
            a: cols[i], b: cols[j], r,
            n: xs.length,
            points: xs.map((x, k) => ({ x, y: ys[k] })),
          };
        }
      }
    }
    return top && Math.abs(top.r) >= 0.25 ? top : null;
  }, [table, numCols]);

  if (!best) {
    return (
      <Panel title="Pairwise correlation" subtitle="No numeric column pair reaches |r| ≥ 0.25 with enough paired observations — no scatter is claimed rather than a noise plot.">
        <p className="text-xs text-[#8FA3BD]">This is itself evidence: the recovered table does not support a simple two-variable story for this experiment.</p>
      </Panel>
    );
  }
  return (
    <Panel
      title="Strongest pairwise correlation"
      subtitle={`${best.a.name} × ${best.b.name} — Pearson r = ${best.r.toFixed(3)} (n = ${best.n} paired rows). Correlation ≠ causation; conditions vary by design.`}
    >
      <ResponsiveContainer width="100%" height={240}>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: -12 }}>
          <CartesianGrid stroke={C.grid} />
          <XAxis type="number" dataKey="x" name={best.a.name} tick={AXIS.tick} domain={["auto", "auto"]} />
          <YAxis type="number" dataKey="y" name={best.b.name} tick={AXIS.tick} domain={["auto", "auto"]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} />
          <Scatter data={best.points} fill={C.cyan} fillOpacity={0.75} />
        </ScatterChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function CategoricalBreakdown({ table, catCols, numCols }: { table: DataTable; catCols: CatCol[]; numCols: NumCol[] }) {
  const [catIdx, setCatIdx] = useState(0);
  const cat = catCols[Math.min(catIdx, catCols.length - 1)];
  const view = useMemo(() => {
    if (!cat) return null;
    const counts = new Map<string, number>();
    const numVals = new Map<string, number[]>();
    const keyNum = [...numCols].sort((a, b) => b.fillRate - a.fillRate)[0];
    for (const row of table.rows) {
      const k = (row[cat.idx] ?? "").trim();
      if (!k) continue;
      counts.set(k, (counts.get(k) ?? 0) + 1);
      if (keyNum) {
        const v = toNum(row[keyNum.idx]);
        if (v !== null) {
          const arr = numVals.get(k) ?? [];
          arr.push(v);
          numVals.set(k, arr);
        }
      }
    }
    const entries = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12);
    const keyNumName = [...numCols].sort((a, b) => b.fillRate - a.fillRate)[0]?.name;
    return {
      data: entries.map(([label, count]) => ({
        label: label.length > 22 ? label.slice(0, 21) + "…" : label,
        count,
        mean: keyNum ? (() => {
          const arr = numVals.get(label) ?? [];
          return arr.length ? +(arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(3) : null;
        })() : null,
      })),
      keyNumName,
    };
  }, [table, cat, numCols, catIdx]);

  if (!cat || !view || !view.data.length) return null;
  return (
    <Panel
      title="Categorical breakdown"
      subtitle={`Counts by ${cat.name}${view.keyNumName ? ` · orange bars show the mean of ${view.keyNumName} per group` : ""}.` }
    >
      {catCols.length > 1 ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {catCols.slice(0, 6).map((c, i) => (
            <button
              key={c.name}
              onClick={() => setCatIdx(i)}
              className={`rounded-md border px-2 py-0.5 text-[11px] ${i === catIdx ? "border-[#D2451E]/60 bg-[#D2451E]/15 text-[#FFB59B]" : "border-white/10 text-[#8FA3BD] hover:text-[#E5EEF8]"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      ) : null}
      <ResponsiveContainer width="100%" height={230}>
        <BarChart data={view.data} margin={{ top: 8, right: 12, bottom: 40, left: -14 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: C.axis, fontSize: 10 }} angle={-28} textAnchor="end" interval={0} height={52} />
          <YAxis tick={AXIS.tick} allowDecimals={false} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(71,132,217,0.08)" }} />
          <Bar dataKey="count" name="rows" fill={C.blue} radius={[3, 3, 0, 0]} />
          {view.data.some((d) => d.mean !== null) ? (
            <Bar dataKey="mean" name="group mean (key numeric)" fill={C.orange} radius={[3, 3, 0, 0]} />
          ) : null}
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function TrialTrend({ table, numCols }: { table: DataTable; numCols: NumCol[] }) {
  const primary = useMemo(() => [...numCols].sort((a, b) => b.fillRate - a.fillRate)[0], [numCols]);
  const data = useMemo(() => {
    if (!primary) return null;
    const pts = table.rows
      .map((row, i) => ({ trial: i + 1, value: toNum(row[primary.idx]) }))
      .filter((p): p is { trial: number; value: number } => p.value !== null);
    return pts.length >= 4 ? { pts, name: primary.name } : null;
  }, [table, primary]);

  if (!data) return null;
  return (
    <Panel
      title="Trial-order trend"
      subtitle={`${data.name} across the recovered trial sequence (row order as recorded in the PSI table).`}
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data.pts} margin={{ top: 8, right: 12, bottom: 4, left: -14 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="trial" tick={AXIS.tick} />
          <YAxis tick={AXIS.tick} domain={["auto", "auto"]} />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line type="monotone" dataKey="value" name={data.name} stroke={C.teal} strokeWidth={2} dot={{ r: 2, fill: C.teal }} />
        </LineChart>
      </ResponsiveContainer>
    </Panel>
  );
}

function Completeness({ table }: { table: DataTable }) {
  const data = useMemo(
    () =>
      table.columns.map((c) => ({
        name: c.name.length > 20 ? c.name.slice(0, 19) + "…" : c.name,
        filled: Math.round((c.fillRate ?? 0) * 100),
        missing: 100 - Math.round((c.fillRate ?? 0) * 100),
      })),
    [table],
  );
  return (
    <Panel
      title="Column completeness"
      subtitle="Fill rate per column — the missing share is shown honestly and is never zero-filled anywhere in the platform."
    >
      <ResponsiveContainer width="100%" height={Math.max(140, data.length * 26)}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 0, left: 30 }}>
          <CartesianGrid stroke={C.grid} horizontal={false} />
          <XAxis type="number" domain={[0, 100]} tick={AXIS.tick} unit="%" />
          <YAxis type="category" dataKey="name" tick={{ fill: C.axis, fontSize: 10 }} width={110} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(59,155,122,0.08)" }} />
          <Bar dataKey="filled" stackId="a" fill={C.teal} radius={[0, 3, 3, 0]} />
          <Bar dataKey="missing" stackId="a" fill="rgba(148,163,184,0.25)" radius={[0, 3, 3, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
}

/** Per-table chart pack. */
function TableCharts({ table }: { table: DataTable }) {
  const numCols: NumCol[] = table.columns
    .map((c, idx) => ({ idx, name: c.name, fillRate: c.fillRate ?? 0 }))
    .filter((c) => c.fillRate >= 0.3 && table.rows.some((r) => toNum(r[c.idx]) !== null));
  const catCols: CatCol[] = table.columns
    .map((c, idx) => ({ idx, name: c.name, fillRate: c.fillRate ?? 0 }))
    .filter((c) => {
      if (c.fillRate < 0.4) return false;
      const uniq = new Set(table.rows.map((r) => (r[c.idx] ?? "").trim()).filter(Boolean));
      return uniq.size >= 2 && uniq.size <= Math.max(12, Math.floor(table.rows.length / 3));
    });
  const hasNumeric = numCols.length > 0;

  return (
    <div className="space-y-4">
      <Histograms table={table} numCols={numCols} />
      {hasNumeric ? <CorrelationScatter table={table} numCols={numCols} /> : null}
      {catCols.length ? <CategoricalBreakdown table={table} catCols={catCols} numCols={numCols} /> : null}
      {hasNumeric ? <TrialTrend table={table} numCols={numCols} /> : null}
      <Completeness table={table} />
      <p className="px-1 font-mono text-[11px] text-[#5A6B7A]">
        {table.file} · sha256:{table.sha256.slice(0, 12)} · recovered from NASA PSI (psidatabase.nasa.gov) · {table.rowCount} rows × {table.columnCount} columns — charts recomputed in-browser from the recovered rows.
      </p>
    </div>
  );
}

/** The "Charts" tab body. */
export function ChartsTab({ accession }: { accession: string }) {
  const tables = getTablesForInvestigation(accession);
  if (!tables.length) {
    return (
      <div className="rounded-xl border border-white/10 bg-[#0F1B2D]/60 p-6">
        <h3 className="text-sm font-semibold text-[#E5EEF8]">No recovered table for {accession}</h3>
        <p className="mt-2 text-xs leading-relaxed text-[#8FA3BD]">
          This investigation is a metadata record in the PSI repository — no experimental table was bundled, so no chart pack is generated.
          Charting absent data would violate the honesty contract; the Compare and Research Tools sections only visualize recovered rows.
        </p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {tables.map((t) => (
        <div key={t.id} className="space-y-3">
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="text-base font-semibold text-[#E5EEF8]">{t.label}</h3>
            <span className="font-mono text-[11px] text-[#5A6B7A]">{t.rowCount} rows</span>
          </div>
          <TableCharts table={t} />
        </div>
      ))}
    </div>
  );
}
