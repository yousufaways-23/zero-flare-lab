"use client";
/**
 * ZERO FLARE — per-investigation chart suite ("Charts" tab), Phase 5 W4.
 *
 * Chart selection is now scientifically curated (src/lib/science/chart-columns.ts):
 * conditions and responses the experiment was actually about, with fill-rate
 * ranking as fallback. Integrity fixes in this revision:
   *   - the "trend" chart uses the recorded test number when one exists, and is
   *     explicitly labelled "row-index order (not a time axis)" otherwise;
 *   - categorical counts and group means no longer share one y-axis;
 *   - the correlation scatter names its axes and declares its selection bias;
 *   - new chart types appear ONLY where the data supports them (time axis,
 *     box plots at n ≥ 8, condition→response with paired n ≥ 8);
 *   - every chart carries a metadata footer: unit, n, missingness, measured-
 *     vs-derived status, and a cautious interpretation;
 *   - columns with too few values get an explicit "insufficient data" state
 *     instead of a misleading chart.
 *
 * Everything is computed client-side from the recovered NASA PSI rows in the
 * bundled corpus (src/data/generated) — no invented data, no server round-trip.
 */
import { useMemo, useState } from "react";
import {
  Bar, BarChart, CartesianGrid, ErrorBar, Line, LineChart, ResponsiveContainer,
  Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import { getTablesForInvestigation, type DataTable } from "@/lib/data/catalog";
import { resolveChartColumns, type ChartCol } from "@/lib/science/chart-columns";

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

/** n below which no distribution/relationship claim is charted. */
const MIN_N = 8;

function toNum(v: string | undefined): number | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim().replace(/,/g, "");
  if (!s || s === "-" || s === "—" || s.toLowerCase() === "n/a") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

/** Section shell — shared panel frame. */
function Panel({ title, subtitle, children, tone }: { title: string; subtitle?: string; children: React.ReactNode; tone?: "declined" }) {
  return (
    <section
      className={
        tone === "declined"
          ? "rounded-xl border border-[#B08A2E]/30 bg-[#B08A2E]/[0.06] p-4"
          : "rounded-xl border border-white/10 bg-[#0F1B2D]/60 p-4"
      }
    >
      <h4 className="text-sm font-semibold text-[#E5EEF8]">{title}</h4>
      {subtitle ? <p className="mt-0.5 text-xs text-[#8FA3BD]">{subtitle}</p> : null}
      <div className="mt-3">{children}</div>
    </section>
  );
}

/** Shared honesty footer for a single chart. */
function ChartMeta({ unit, n, total, status, interpretation, extra }: {
  unit?: string | null;
  n: number;
  total: number;
  status: "measured" | "derived" | null;
  interpretation?: string;
  extra?: string;
}) {
  const missing = total > 0 ? Math.max(0, total - n) : 0;
  const pct = total > 0 ? Math.round((missing / total) * 100) : 0;
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-0.5 border-t border-white/5 px-1 pt-1.5 text-[10px] leading-relaxed text-[#5A6B7A]">
      {unit ? <span>unit: <span className="font-mono text-[#8FA3BD]">{unit}</span></span> : null}
      <span>n = {n}/{total} rows</span>
      {missing > 0 ? <span>· {pct}% missing (never filled)</span> : null}
      {status ? (
        <span className="rounded border border-white/10 px-1 font-mono uppercase tracking-wide">
          {status === "measured" ? "measured" : "derived"}
        </span>
      ) : null}
      {extra ? <span>· {extra}</span> : null}
      {interpretation ? <span className="text-[#7A8CA3]">cautious: {interpretation}</span> : null}
    </p>
  );
}

function columnValues(table: DataTable, col: ChartCol): number[] {
  return table.rows.map((r) => toNum(r[col.idx])).filter((v): v is number => v !== null);
}

function Histograms({ table, numCols }: { table: DataTable; numCols: ChartCol[] }) {
  const picks = useMemo(() => {
    return numCols.map((c) => {
      const values = columnValues(table, c);
      const profile = table.columns[c.idx];
      if (profile?.histogram && profile.histogram.counts.length) {
        const h = profile.histogram;
        return {
          col: c,
          data: h.counts.map((count, i) => ({ bin: `${Number(h.binStart[i].toFixed(2))}`, count })),
          n: values.length,
        };
      }
      if (!values.length) return { col: c, data: [], n: 0 };
      const min = Math.min(...values), max = Math.max(...values);
      const span = max - min || 1;
      const bins = 10;
      const counts = new Array(bins).fill(0);
      for (const v of values) {
        const b = Math.min(bins - 1, Math.floor(((v - min) / span) * bins));
        counts[b] += 1;
      }
      return {
        col: c,
        data: counts.map((count, i) => ({ bin: Number((min + (span / bins) * (i + 0.5)).toPrecision(4)), count })),
        n: values.length,
      };
    });
  }, [table, numCols]);

  const shown = picks.filter((d) => d.n >= MIN_N && d.data.length > 0);
  const declined = picks.filter((d) => d.n < MIN_N);

  return (
    <Panel
      title="Numeric distributions"
      subtitle={
        numCols.length
          ? "Recovered values per numeric column — bins computed from the real rows (missing values excluded, never filled)."
          : undefined
      }
    >
      {numCols.length === 0 ? (
        <p className="text-xs text-[#8FA3BD]">
          No analysis-ready numeric column (≥ 30% fill) in the recovered table — no distribution is claimed.
        </p>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            {shown.map((h, i) => (
              <div key={h.col.name} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
                <p className="mb-1 px-1 text-xs text-[#8FA3BD]">
                  <span className="font-mono text-[#E5EEF8]">{h.col.name}</span>
                  {h.col.spec?.role === "response" ? <span className="ml-1.5 rounded bg-[#3E9B7A]/20 px-1 text-[10px] text-[#7FD8B4]">response</span> : null}
                  {h.col.spec?.role === "condition" ? <span className="ml-1.5 rounded bg-[#4784D9]/20 px-1 text-[10px] text-[#9CC3F1]">condition</span> : null}
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
                <ChartMeta
                  unit={h.col.unit}
                  n={h.n}
                  total={table.rowCount}
                  status={h.col.spec?.status ?? null}
                  interpretation={h.col.spec?.interpretation}
                />
              </div>
            ))}
          </div>
          {shown.length === 0 ? (
            <p className="text-xs text-[#8FA3BD]">
              Every numeric column has n &lt; {MIN_N} usable values — distributions are declined rather than drawn from noise.
            </p>
          ) : null}
          {declined.length > 0 ? (
            <p className="mt-2 text-[11px] text-[#5A6B7A]">
              Declined for n &lt; {MIN_N}: {declined.map((d) => d.col.name).join(", ")}.
            </p>
          ) : null}
        </>
      )}
    </Panel>
  );
}

function CorrelationScatter({ table, numCols }: { table: DataTable; numCols: ChartCol[] }) {
  const best = useMemo(() => {
    const cols = numCols.filter((c) => c.fillRate >= 0.5).slice(0, 10);
    let scanned = 0;
    let top: { a: ChartCol; b: ChartCol; r: number; points: { x: number; y: number }[]; n: number } | null = null;
    for (let i = 0; i < cols.length; i++) {
      for (let j = i + 1; j < cols.length; j++) {
        const xs: number[] = [], ys: number[] = [];
        for (const row of table.rows) {
          const x = toNum(row[cols[i].idx]);
          const y = toNum(row[cols[j].idx]);
          if (x !== null && y !== null) { xs.push(x); ys.push(y); }
        }
        if (xs.length < MIN_N) continue;
        scanned += 1;
        let sx = 0, sy = 0;
        const n = xs.length;
        for (let k = 0; k < n; k++) { sx += xs[k]; sy += ys[k]; }
        const mx = sx / n, my = sy / n;
        let num = 0, dx = 0, dy = 0;
        for (let k = 0; k < n; k++) {
          const a = xs[k] - mx, b = ys[k] - my;
          num += a * b; dx += a * a; dy += b * b;
        }
        const den = Math.sqrt(dx * dy);
        const r = den === 0 ? NaN : num / den;
        if (Number.isFinite(r) && (!top || Math.abs(r) > Math.abs(top.r))) {
          top = { a: cols[i], b: cols[j], r, n, points: xs.map((x, k) => ({ x, y: ys[k] })) };
        }
      }
    }
    return top && Math.abs(top.r) >= 0.25 ? { ...top, scanned } : null;
  }, [table, numCols]);

  if (!best) {
    return (
      <Panel title="Pairwise correlation" subtitle="No numeric column pair reaches |r| ≥ 0.25 with at least 8 paired observations — no scatter is claimed rather than a noise plot.">
        <p className="text-xs text-[#8FA3BD]">This is itself evidence: the recovered table does not support a simple two-variable story for this experiment.</p>
      </Panel>
    );
  }
  const unitA = best.a.unit ? ` (${best.a.unit})` : "";
  const unitB = best.b.unit ? ` (${best.b.unit})` : "";
  return (
    <Panel
      title="Strongest pairwise correlation"
      subtitle={`${best.a.name} × ${best.b.name} — Pearson r = ${best.r.toFixed(3)} (n = ${best.n} paired rows). Selection bias: strongest of ${best.scanned} eligible pairs scanned — exploratory; correlation ≠ causation, conditions vary by design.`}
    >
      <ResponsiveContainer width="100%" height={260}>
        <ScatterChart margin={{ top: 8, right: 16, bottom: 28, left: -6 }}>
          <CartesianGrid stroke={C.grid} />
          <XAxis
            type="number" dataKey="x" tick={AXIS.tick} domain={["auto", "auto"]}
            label={{ value: `${best.a.name}${unitA}`, position: "insideBottom", offset: -16, fill: C.axis, fontSize: 11 }}
          />
          <YAxis
            type="number" dataKey="y" tick={AXIS.tick} domain={["auto", "auto"]} width={56}
            label={{ value: `${best.b.name}${unitB}`, angle: -90, position: "insideLeft", offset: 18, fill: C.axis, fontSize: 11 }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "strongest of N pairs" }} />
          <Scatter data={best.points} fill={C.cyan} fillOpacity={0.75} />
        </ScatterChart>
      </ResponsiveContainer>
      <ChartMeta
        n={best.n}
        total={table.rowCount}
        status={null}
        extra={`${best.scanned} pairs scanned · strongest reported`}
      />
    </Panel>
  );
}

function CategoricalBreakdown({ table, catCols, numCols }: { table: DataTable; catCols: ChartCol[]; numCols: ChartCol[] }) {
  const [catIdx, setCatIdx] = useState(0);
  const [drill, setDrill] = useState<string | null>(null);
  const cat = catCols[Math.min(catIdx, catCols.length - 1)];

  const view = useMemo(() => {
    if (!cat) return null;
    const keyNum = numCols.find((c) => c.spec?.role === "response") ?? [...numCols].sort((a, b) => b.fillRate - a.fillRate)[0];
    const counts = new Map<string, number>();
    const numVals = new Map<string, number[]>();
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
    return {
      keyNum,
      data: entries.map(([label, count]) => {
        const arr = numVals.get(label) ?? [];
        const mean = keyNum && arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : null;
        return { label: label.length > 22 ? label.slice(0, 21) + "…" : label, count, mean: mean === null ? null : +mean.toFixed(3), full: label };
      }),
    };
  }, [table, cat, numCols]);

  if (!cat || !view || !view.data.length) return null;

  const drillRows = drill
    ? table.rows.filter((r) => (r[cat.idx] ?? "").trim() === drill).slice(0, 5)
    : [];

  return (
    <Panel
      title="Categorical breakdown"
      subtitle={`Counts by ${cat.name} — and, when a response column exists, its group mean on a separate chart with its own axis. Click a bar to inspect sample rows.`}
    >
      {catCols.length > 1 ? (
        <div className="mb-2 flex flex-wrap gap-1">
          {catCols.slice(0, 6).map((c, i) => (
            <button
              key={c.name}
              onClick={() => { setCatIdx(i); setDrill(null); }}
              className={`rounded-md border px-2 py-0.5 text-[11px] ${i === catIdx ? "border-[#D2451E]/60 bg-[#D2451E]/15 text-[#FFB59B]" : "border-white/10 text-[#8FA3BD] hover:text-[#E5EEF8]"}`}
            >
              {c.name}
            </button>
          ))}
        </div>
      ) : null}

      {/* counts — own axis */}
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={view.data} margin={{ top: 8, right: 12, bottom: 40, left: -14 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: C.axis, fontSize: 10 }} angle={-28} textAnchor="end" interval={0} height={52} />
          <YAxis tick={AXIS.tick} allowDecimals={false} label={{ value: "rows", angle: -90, position: "insideLeft", offset: 22, fill: C.axis, fontSize: 11 }} />
          <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(71,132,217,0.08)" }} />
          <Bar
            dataKey="count" name="rows" fill={C.blue} radius={[3, 3, 0, 0]}
            onClick={(d: { full?: string }) => setDrill(d.full === drill ? null : (d.full ?? null))}
            style={{ cursor: "pointer" }}
          />
        </BarChart>
      </ResponsiveContainer>
      <ChartMeta n={view.data.reduce((a, d) => a + d.count, 0)} total={table.rowCount} status={null} extra={`categories with ${cat.name} recorded`} />

      {/* group means — separate chart, own axis */}
      {view.keyNum && view.data.some((d) => d.mean !== null) ? (
        <>
          <p className="mt-4 mb-1 px-1 text-xs text-[#8FA3BD]">
            Group mean of <span className="font-mono text-[#E5EEF8]">{view.keyNum.name}</span> per {cat.name} — separate scale, do not compare bar heights with the counts chart.
          </p>
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={view.data.filter((d) => d.mean !== null)} margin={{ top: 8, right: 12, bottom: 40, left: -8 }}>
              <CartesianGrid stroke={C.grid} vertical={false} />
              <XAxis dataKey="label" tick={{ fill: C.axis, fontSize: 10 }} angle={-28} textAnchor="end" interval={0} height={52} />
              <YAxis
                tick={AXIS.tick} domain={["auto", "auto"]}
                label={{ value: view.keyNum.unit ? `mean ${view.keyNum.name} (${view.keyNum.unit})` : `mean ${view.keyNum.name}`, angle: -90, position: "insideLeft", offset: 8, fill: C.axis, fontSize: 10 }}
              />
              <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(210,69,30,0.08)" }} />
              <Bar dataKey="mean" name={`mean ${view.keyNum.name}`} fill={C.orange} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
          <ChartMeta
            unit={view.keyNum.unit}
            n={view.data.reduce((a, d) => a + (d.mean !== null ? d.count : 0), 0)}
            total={table.rowCount}
            status={view.keyNum.spec?.status ?? null}
            interpretation={view.keyNum.spec?.interpretation}
            extra="group sizes differ — means are not equally weighted evidence"
          />
        </>
      ) : null}

      {/* drill-down sample rows */}
      {drill ? (
        <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.02] p-2">
          <p className="px-1 text-[11px] text-[#8FA3BD]">
            Sample rows where <span className="font-mono text-[#E5EEF8]">{cat.name}</span> = <span className="font-mono text-[#FFB59B]">{drill}</span> (first 5):
          </p>
          <div className="mt-1 overflow-x-auto">
            <table className="w-full text-left text-[11px]">
              <thead>
                <tr className="text-[#5A6B7A]">
                  {table.columns.slice(0, 6).map((c) => (
                    <th key={c.name} className="px-2 py-1 font-medium">{c.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="font-mono text-[#AEBFD4]">
                {drillRows.map((r, i) => (
                  <tr key={i} className="border-t border-white/5">
                    {r.slice(0, 6).map((cell, j) => (
                      <td key={j} className="max-w-[180px] truncate px-2 py-1">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </Panel>
  );
}

/** Test-sequence plot: recorded test number when curated, honest row-index otherwise. */
function SequencePlot({ table, numCols, sequence }: { table: DataTable; numCols: ChartCol[]; sequence: ChartCol | null }) {
  const primary = useMemo(
    () => numCols.find((c) => c.spec?.role === "response") ?? [...numCols].sort((a, b) => b.fillRate - a.fillRate)[0],
    [numCols],
  );
  const data = useMemo(() => {
    if (!primary) return null;
    if (sequence) {
      const pts = table.rows
        .map((row) => ({ x: toNum(row[sequence.idx]), value: toNum(row[primary.idx]) }))
        .filter((p): p is { x: number; value: number } => p.x !== null && p.value !== null)
        .sort((a, b) => a.x - b.x);
      return pts.length >= 4 ? { pts, primary, seq: sequence } : null;
    }
    const pts = table.rows
      .map((row, i) => ({ x: i + 1, value: toNum(row[primary.idx]) }))
      .filter((p): p is { x: number; value: number } => p.value !== null);
    return pts.length >= 4 ? { pts, primary, seq: null } : null;
  }, [table, primary, sequence]);

  if (!data) return null;
  const bySequence = Boolean(data.seq);
  return (
    <Panel
      title={bySequence ? "Test-sequence trend" : "Row-index order (not a time axis)"}
      subtitle={
        bySequence
          ? `${data.primary.name} across recorded ${data.seq!.name} — the lab notebook order, not a controlled variable.`
          : `${data.primary.name} plotted by row position in the recovered table. The x-axis is the order rows were recovered in — it is NOT a measured time or trial axis, so no trend claim is made.`
      }
    >
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data.pts} margin={{ top: 8, right: 12, bottom: bySequence ? 24 : 8, left: -14 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis
            dataKey="x" tick={AXIS.tick}
            label={bySequence ? { value: data.seq!.name, position: "insideBottom", offset: -12, fill: C.axis, fontSize: 11 } : undefined}
          />
          <YAxis
            tick={AXIS.tick} domain={["auto", "auto"]}
            label={{ value: data.primary.unit ? `${data.primary.name} (${data.primary.unit})` : data.primary.name, angle: -90, position: "insideLeft", offset: 8, fill: C.axis, fontSize: 10 }}
          />
          <Tooltip contentStyle={TOOLTIP_STYLE} />
          <Line type="monotone" dataKey="value" name={data.primary.name} stroke={C.teal} strokeWidth={2} dot={{ r: 2, fill: C.teal }} />
        </LineChart>
      </ResponsiveContainer>
      <ChartMeta
        unit={data.primary.unit}
        n={data.pts.length}
        total={table.rowCount}
        status={data.primary.spec?.status ?? null}
        interpretation={bySequence ? undefined : "x is file row order — any apparent pattern is not evidence of change over time"}
      />
    </Panel>
  );
}

/** Time-series: only when a curated date column parses for enough rows. */
function TimeSeries({ table, numCols, timeColumn }: { table: DataTable; numCols: ChartCol[]; timeColumn: ChartCol | null }) {
  const primary = useMemo(
    () => numCols.find((c) => c.spec?.role === "response") ?? [...numCols].sort((a, b) => b.fillRate - a.fillRate)[0],
    [numCols],
  );
  const parsed = useMemo(() => {
    if (!timeColumn || !primary) return null;
    const pts: { t: number; value: number }[] = [];
    let ambiguous = 0;
    for (const row of table.rows) {
      const raw = (row[timeColumn.idx] ?? "").trim();
      const v = toNum(row[primary.idx]);
      if (!raw || v === null) continue;
      const t = parseDateCell(raw);
      if (t === null) { ambiguous += 1; continue; }
      pts.push({ t, value: v });
    }
    // campaign-year guard: recorded typos like "5/15/2103" exist in source CSVs.
    // Excluded points are COUNTED AND REPORTED, never silently corrected.
    let implausible = 0;
    if (pts.length) {
      const years = pts.map((p) => new Date(p.t).getUTCFullYear()).sort((a, b) => a - b);
      const medianYear = years[Math.floor(years.length / 2)];
      const kept = pts.filter((p) => Math.abs(new Date(p.t).getUTCFullYear() - medianYear) <= 5);
      // apply the guard only when it removes a minority — a majority removal
      // would mean the column format itself is misparsed, and hiding that
      // behind a guard would be dishonest
      if (kept.length >= pts.length * 0.5 && kept.length < pts.length) {
        implausible = pts.length - kept.length;
        pts.length = 0;
        pts.push(...kept);
      }
    }
    const usable = pts.length >= MIN_N && new Set(pts.map((p) => p.t)).size >= 3;
    return usable ? { pts: pts.sort((a, b) => a.t - b.t), ambiguous, implausible, primary } : null;
  }, [table, timeColumn, primary]);

  if (!parsed) return null;
  return (
    <Panel
      title="Recorded time course"
      subtitle={`${parsed.primary.name} by ${timeColumn!.name} as recorded. Test dates are campaign records, not regular sampling — gaps in time carry no meaning.`}
    >
      <ResponsiveContainer width="100%" height={200}>
        <ScatterChart margin={{ top: 8, right: 12, bottom: 4, left: -14 }}>
          <CartesianGrid stroke={C.grid} />
          <XAxis
            dataKey="t" type="number" domain={["dataMin", "dataMax"]} tick={AXIS.tick}
            tickFormatter={(t: number) => new Date(t).toISOString().slice(0, 10)}
          />
          <YAxis
            dataKey="value" type="number" tick={AXIS.tick} domain={["auto", "auto"]}
            label={{ value: parsed.primary.unit ? `${parsed.primary.name} (${parsed.primary.unit})` : parsed.primary.name, angle: -90, position: "insideLeft", offset: 8, fill: C.axis, fontSize: 10 }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(t) => new Date(Number(t)).toISOString().slice(0, 10)}
          />
          <Scatter data={parsed.pts} name={parsed.primary.name} fill={C.gold} fillOpacity={0.8} />
        </ScatterChart>
      </ResponsiveContainer>
      <ChartMeta
        unit={parsed.primary.unit}
        n={parsed.pts.length}
        total={table.rowCount}
        status={parsed.primary.spec?.status ?? null}
        extra={[
          parsed.ambiguous ? `${parsed.ambiguous} rows skipped (ambiguous date format)` : null,
          parsed.implausible ? `${parsed.implausible} rows excluded (implausible recorded year, shown as recorded in Data tab)` : null,
        ].filter(Boolean).join(" · ") || undefined}
        interpretation="campaign date order — not a controlled time variable"
      />
    </Panel>
  );
}

/**
 * Parse a recorded date cell to a timestamp; null when unresolvable.
 * Handles ISO (yyyy-mm-dd), d/m vs m/d with disambiguation (ambiguous → null),
 * compact yyyymmdd numbers and Excel serial dates.
 */
function parseDateCell(raw: string): number | null {
  const s = raw.trim();
  if (!s) return null;
  const iso = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (iso) return Date.UTC(+iso[1], +iso[2] - 1, +iso[3]);
  const slash = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{2,4})$/);
  if (slash) {
    const a = +slash[1], b = +slash[2];
    let y = +slash[3];
    if (y < 100) y += 2000;
    if (a > 12 && b <= 12) return Date.UTC(y, b - 1, a); // d/m/y
    if (b > 12 && a <= 12) return Date.UTC(y, a - 1, b); // m/d/y
    return null; // genuinely ambiguous — refuse to guess
  }
  if (/^\d{8}$/.test(s)) {
    const y = +s.slice(0, 4), m = +s.slice(4, 6), d = +s.slice(6, 8);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return Date.UTC(y, m - 1, d);
    return null;
  }
  const serial = Number(s);
  if (Number.isFinite(serial) && serial > 20000 && serial < 60000) {
    return Date.UTC(1899, 11, 30) + serial * 86400000;
  }
  return null;
}

/** Quartiles (linear interpolation) for box plots. */
function quartiles(values: number[]): { q1: number; med: number; q3: number } {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (p: number) => {
    const pos = p * (sorted.length - 1);
    const lo = Math.floor(pos), hi = Math.ceil(pos);
    return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
  };
  return { q1: at(0.25), med: at(0.5), q3: at(0.75) };
}

/** Box-and-whisker summaries: one mini-plot per column with ITS OWN scale (columns have different units — a shared axis would be misleading). */
function BoxPlots({ table, numCols }: { table: DataTable; numCols: ChartCol[] }) {
  const picks = useMemo(
    () =>
      numCols
        .map((c) => ({ col: c, values: columnValues(table, c) }))
        .filter((d) => d.values.length >= MIN_N)
        .slice(0, 4),
    [table, numCols],
  );
  if (picks.length === 0) return null;
  const W = 300, H = 170, padL = 44, padR = 10, padT = 12, padB = 34;

  return (
    <Panel
      title="Spread summaries (box plots)"
      subtitle="Box = interquartile range, line = median, whiskers = min/max of recovered values — each column on its own scale (units differ). No outlier fencing is applied: extremes are real recorded values, shown as such."
    >
      <div className="grid gap-4 sm:grid-cols-2">
        {picks.map((d, i) => {
          const { q1, med, q3 } = quartiles(d.values);
          const min = Math.min(...d.values), max = Math.max(...d.values);
          const span = max - min || 1;
          const y = (v: number) => padT + (1 - (v - min) / span) * (H - padT - padB);
          const cx = (W - padL - padR) / 2 + padL;
          const bw = 56;
          const color = i % 2 === 0 ? C.orange : C.blue;
          return (
            <div key={d.col.name} className="rounded-lg border border-white/5 bg-white/[0.02] p-2">
              <p className="mb-1 px-1 text-xs text-[#8FA3BD]">
                <span className="font-mono text-[#E5EEF8]">{d.col.name}</span> · n={d.values.length}
              </p>
              <svg viewBox={`0 0 ${W} ${H}`} className="h-auto w-full" role="img" aria-label={`Box plot of ${d.col.name}`}>
                {[0, 0.5, 1].map((f) => (
                  <g key={f}>
                    <line x1={padL} x2={W - padR} y1={y(min + f * span)} y2={y(min + f * span)} stroke={C.grid} />
                    <text x={padL - 5} y={y(min + f * span) + 3} textAnchor="end" fontSize="9" fill={C.axis}>
                      {Number((min + f * span).toPrecision(3))}
                    </text>
                  </g>
                ))}
                <line x1={cx} x2={cx} y1={y(min)} y2={y(max)} stroke={color} strokeWidth={1} />
                <line x1={cx - bw / 3} x2={cx + bw / 3} y1={y(min)} y2={y(min)} stroke={color} strokeWidth={1} />
                <line x1={cx - bw / 3} x2={cx + bw / 3} y1={y(max)} y2={y(max)} stroke={color} strokeWidth={1} />
                <rect x={cx - bw / 2} y={y(q3)} width={bw} height={Math.max(2, y(q1) - y(q3))} fill={color} fillOpacity={0.25} stroke={color} rx={3} />
                <line x1={cx - bw / 2} x2={cx + bw / 2} y1={y(med)} y2={y(med)} stroke={color} strokeWidth={2} />
              </svg>
              <ChartMeta
                unit={d.col.unit}
                n={d.values.length}
                total={table.rowCount}
                status={d.col.spec?.status ?? null}
                interpretation={d.col.spec?.interpretation}
              />
            </div>
          );
        })}
      </div>
    </Panel>
  );
}

/** Condition → response: binned mean response ± SD, only with paired n ≥ 8. */
function ConditionResponse({ table, numCols }: { table: DataTable; numCols: ChartCol[] }) {
  const model = useMemo(() => {
    const condition = numCols.find((c) => c.spec?.role === "condition");
    const response = numCols.find((c) => c.spec?.role === "response");
    if (!condition || !response || condition.idx === response.idx) return null;
    const pairs = table.rows
      .map((r) => ({ x: toNum(r[condition.idx]), y: toNum(r[response.idx]) }))
      .filter((p): p is { x: number; y: number } => p.x !== null && p.y !== null);
    if (pairs.length < MIN_N) return null;
    const xs = pairs.map((p) => p.x).sort((a, b) => a - b);
    const binEdges: number[] = [];
    const NBINS = Math.min(8, Math.max(3, Math.floor(Math.sqrt(pairs.length))));
    for (let i = 1; i < NBINS; i++) binEdges.push(xs[Math.floor((i / NBINS) * xs.length)]);
    const bins = new Map<number, number[]>();
    for (const p of pairs) {
      let b = 0;
      while (b < binEdges.length && p.x >= binEdges[b]) b += 1;
      const arr = bins.get(b) ?? [];
      arr.push(p.y);
      bins.set(b, arr);
    }
    const data = [...bins.entries()]
      .sort((a, b) => a[0] - b[0])
      .map(([b, ys]) => {
        const xlo = b === 0 ? xs[0] : binEdges[b - 1];
        const xhi = b < binEdges.length ? binEdges[b] : xs[xs.length - 1];
        const mean = ys.reduce((a, v) => a + v, 0) / ys.length;
        const sd = Math.sqrt(ys.reduce((a, v) => a + (v - mean) ** 2, 0) / Math.max(1, ys.length - 1));
        return {
          label: `${Number(xlo.toPrecision(3))}–${Number(xhi.toPrecision(3))}`,
          mean: +mean.toFixed(3),
          sd: +sd.toFixed(3),
          n: ys.length,
        };
      });
    return { condition, response, data };
  }, [table, numCols]);

  if (!model || model.data.length < 3) return null;
  return (
    <Panel
      title="Condition → response summary"
      subtitle={`Mean ${model.response.name} per quantile bin of ${model.condition.name} (≤ 8 bins, computed in-browser). Whiskers are ±1 SD of the group. Binning is a summary, not a model — no dose-response claim is made.`}
    >
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={model.data} margin={{ top: 8, right: 12, bottom: 40, left: -8 }}>
          <CartesianGrid stroke={C.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: C.axis, fontSize: 10 }} angle={-20} textAnchor="end" height={48} />
          <YAxis
            tick={AXIS.tick} domain={["auto", "auto"]}
            label={{ value: model.response.unit ? `mean ${model.response.name} (${model.response.unit})` : `mean ${model.response.name}`, angle: -90, position: "insideLeft", offset: 8, fill: C.axis, fontSize: 10 }}
          />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            formatter={(value, name, item) => {
              const p = item?.payload as { n?: number };
              return [`${value} (n=${p?.n ?? "?"})`, String(name)];
            }}
          />
          <Bar dataKey="mean" name={`mean ${model.response.name}`} fill={C.teal} fillOpacity={0.55} radius={[3, 3, 0, 0]}>
            <ErrorBar dataKey="sd" direction="y" width={5} strokeWidth={1.25} stroke="#9CC3F1" />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <ChartMeta
        unit={model.response.unit}
        n={model.data.reduce((a, d) => a + d.n, 0)}
        total={table.rowCount}
        status={model.response.spec?.status ?? null}
        interpretation={model.response.spec?.interpretation}
        extra="binned summary — unequal group sizes"
      />
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
function TableCharts({ table, accession }: { table: DataTable; accession: string }) {
  const resolved = useMemo(() => resolveChartColumns(table, accession), [table, accession]);
  const hasNumeric = resolved.numCols.length > 0;

  return (
    <div className="space-y-4">
      {resolved.curated && resolved.specNote ? (
        <p className="rounded-lg border border-[#37DCF2]/25 bg-[#37DCF2]/[0.06] px-3 py-2 text-[11px] leading-relaxed text-[#9CC3F1]">
          <span className="font-semibold text-[#37DCF2]">Curated chart selection.</span> {resolved.specNote}
        </p>
      ) : null}
      <Histograms table={table} numCols={resolved.numCols} />
      {hasNumeric ? <BoxPlots table={table} numCols={resolved.numCols} /> : null}
      {hasNumeric ? <CorrelationScatter table={table} numCols={resolved.numCols} /> : null}
      {resolved.catCols.length ? <CategoricalBreakdown table={table} catCols={resolved.catCols} numCols={resolved.numCols} /> : null}
      {hasNumeric ? <SequencePlot table={table} numCols={resolved.numCols} sequence={resolved.sequence} /> : null}
      {hasNumeric ? <TimeSeries table={table} numCols={resolved.numCols} timeColumn={resolved.timeColumn} /> : null}
      {hasNumeric ? <ConditionResponse table={table} numCols={resolved.numCols} /> : null}
      <Completeness table={table} />
      {!hasNumeric && resolved.catCols.length === 0 ? (
        <Panel tone="declined" title="No analysis-ready columns" subtitle="Nothing chartable is claimed.">
          <p className="text-xs text-[#8FA3BD]">
            The recovered table has no numeric column with ≥ 30% fill and no categorical column with a usable value
            spread. This is recorded honestly rather than forced into a chart.
          </p>
        </Panel>
      ) : null}
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
          <TableCharts table={t} accession={accession} />
        </div>
      ))}
    </div>
  );
}
