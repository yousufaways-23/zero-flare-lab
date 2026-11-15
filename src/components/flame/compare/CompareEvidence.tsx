"use client";

/**
 * ZERO FLARE — CompareEvidence (Phase 5 W5): the visual evidence layer of the
 * Compare workspace, placed between the condition matrix and the evidence
 * graph. Four sections, all honesty-gated:
 *
 *  1. Comparison summary — the gate verdict restated in plain language;
 *  2. Aligned small multiples — one curated response per investigation, same
 *     chart geometry, explicitly NOT on a shared axis (units differ);
 *  3. Derived overlay — ONLY when the gate returns direct/conditional AND a
 *     unit-compatible condition→response pair exists on both sides;
 *  4. Original source figures — page-attributed extractions from the archive
 *     papers, labelled candidate-level until citation-verified;
 *  5. Provenance strip — accession → sha256 → rows × cols → papers → media.
 *
 * Nothing here fabricates data; every number recomputes in-browser from the
 * recovered corpus.
 */

import { useMemo } from "react";
import {
  Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Scatter, ScatterChart, Tooltip, XAxis, YAxis,
} from "recharts";
import { FileText, GitCompare, ImageOff, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react";
import { getTablesForInvestigation, type DataTable, type Investigation } from "@/lib/data/catalog";
import { resolveChartColumns } from "@/lib/science/chart-columns";
import { accessionsForPaperLabel } from "@/lib/science/coverage";
import paperFigures from "@/data/generated/paper-figures.json";

interface FigureAsset { asset: string; page: number; bytes: number }
interface PaperEntry {
  file: string;
  pages: number;
  figures_published?: FigureAsset[];
  investigations_linked: string[];
  link_status: string;
  figure_captions: { n: string; caption: string }[];
  error?: string;
}

const REG = paperFigures as unknown as { papers: PaperEntry[] };

const C = {
  orange: "#D2451E",
  blue: "#4784D9",
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

function toNum(v: string | undefined): number | null {
  if (v === undefined || v === null) return null;
  const s = String(v).trim().replace(/,/g, "");
  if (!s || s === "-" || s === "—" || s.toLowerCase() === "n/a") return null;
  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function shortTitle(file: string): string {
  return file.replace(/\.pdf$/, "").replace(/^1-s2\.0-S\d+-.*$/, "Journal article (Elsevier)").replace(/^nihms-\d+$/, "PMC open-access manuscript").replace(/_/g, " ").slice(0, 80);
}

function histogramData(table: DataTable, colIdx: number): { data: { bin: string; count: number }[]; n: number } {
  const values = table.rows.map((r) => toNum(r[colIdx])).filter((v): v is number => v !== null);
  const profile = table.columns[colIdx];
  if (profile?.histogram && profile.histogram.counts.length) {
    const h = profile.histogram;
    return { data: h.counts.map((count, i) => ({ bin: `${Number(h.binStart[i].toFixed(2))}`, count })), n: values.length };
  }
  if (!values.length) return { data: [], n: 0 };
  const min = Math.min(...values), max = Math.max(...values);
  const span = max - min || 1;
  const bins = 10;
  const counts = new Array(bins).fill(0);
  for (const v of values) {
    const b = Math.min(bins - 1, Math.floor(((v - min) / span) * bins));
    counts[b] += 1;
  }
  return { data: counts.map((count, i) => ({ bin: String(Number((min + (span / bins) * (i + 0.5)).toPrecision(4))), count })), n: values.length };
}

export interface GateVerdict {
  level: "direct" | "conditional" | "not-comparable";
  reasons: string[];
}

export function CompareEvidence({ selected, gate }: { selected: Investigation[]; gate: GateVerdict | null }) {
  /* per-investigation curated response column */
  const responses = useMemo(
    () =>
      selected.map((inv) => {
        const tables = getTablesForInvestigation(inv.accession);
        const table = tables[0];
        if (!table) return { inv, table: null as DataTable | null, col: null as number | null, name: null as string | null, unit: null as string | null };
        const resolved = resolveChartColumns(table, inv.accession);
        const col = resolved.numCols.find((c) => c.spec?.role === "response") ?? resolved.numCols[0];
        if (!col) return { inv, table, col: null, name: null, unit: null };
        return { inv, table, col: col.idx, name: col.name, unit: col.unit };
      }),
    [selected],
  );

  const gatePasses = gate?.level === "direct" || gate?.level === "conditional";

  /* derived overlay: gate passed AND a unit-compatible condition→response pair on both sides */
  const overlay = useMemo(() => {
    if (!gatePasses || selected.length !== 2) return null;
    const [a, b] = selected;
    const ta = getTablesForInvestigation(a.accession)[0];
    const tb = getTablesForInvestigation(b.accession)[0];
    if (!ta || !tb) return null;
    const ra = resolveChartColumns(ta, a.accession);
    const rb = resolveChartColumns(tb, b.accession);
    const ca = ra.numCols.find((c) => c.spec?.role === "condition");
    const cb = rb.numCols.find((c) => c.spec?.role === "condition");
    const pa = ra.numCols.find((c) => c.spec?.role === "response");
    const pb = rb.numCols.find((c) => c.spec?.role === "response");
    if (!ca || !cb || !pa || !pb) return null;
    if ((ca.unit ?? null) !== (cb.unit ?? null) || (pa.unit ?? null) !== (pb.unit ?? null)) return null;
    const seriesA: { x: number; y: number }[] = [];
    const seriesB: { x: number; y: number }[] = [];
    for (const row of ta.rows) {
      const x = toNum(row[ca.idx]), y = toNum(row[pa.idx]);
      if (x !== null && y !== null) seriesA.push({ x, y });
    }
    for (const row of tb.rows) {
      const x = toNum(row[cb.idx]), y = toNum(row[pb.idx]);
      if (x !== null && y !== null) seriesB.push({ x, y });
    }
    if (seriesA.length < 8 || seriesB.length < 8) return null;
    return {
      condition: { name: ca.name, unit: ca.unit ?? null },
      response: { name: pa.name, unit: pa.unit ?? null },
      a: { inv: a, points: seriesA },
      b: { inv: b, points: seriesB },
    };
  }, [gatePasses, selected]);

  /* archive figures per selected investigation */
  const figures = useMemo(
    () =>
      selected.map((inv) => {
        const papers = REG.papers.filter(
          (p) =>
            !p.error &&
            p.investigations_linked.some((label) => accessionsForPaperLabel(label).includes(inv.accession.toUpperCase())) &&
            (p.figures_published?.length ?? 0) > 0,
        );
        return { inv, papers: papers.slice(0, 2) };
      }),
    [selected],
  );

  const anyFigures = figures.some((f) => f.papers.length > 0);

  return (
    <div className="flex flex-col gap-5">
      {/* 1 — comparison summary */}
      <section>
        <h2 className="mb-2 text-sm font-semibold">Comparison summary</h2>
        <div
          className={
            gatePasses
              ? "rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07] p-4"
              : "rounded-xl border border-amber-500/30 bg-amber-500/[0.07] p-4"
          }
        >
          <div className="flex items-center gap-2">
            {gate?.level === "direct" ? (
              <ShieldCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
            ) : gate?.level === "conditional" ? (
              <ShieldAlert className="h-4 w-4 text-amber-400" aria-hidden="true" />
            ) : (
              <ShieldX className="h-4 w-4 text-amber-400" aria-hidden="true" />
            )}
            <span className="text-sm font-semibold">
              {gate?.level === "direct"
                ? "Directly comparable — pooled plots permitted"
                : gate?.level === "conditional"
                  ? "Conditionally comparable — pooled plots only with the caveats below"
                  : "Not directly comparable — read as complementary evidence classes"}
            </span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-foreground/85">
            {selected.map((i) => `${i.shortLabel} (${i.accession})`).join(" and ")}{" "}
            {gate?.level === "not-comparable"
              ? "measure related physics under conditions the gate judges too different to pool: the differences are stated, not hidden. Compare their findings side by side — do not average them."
              : "share enough recorded context to overlay, with the gate's caveats attached to every derived view below."}
          </p>
          {gate?.reasons.length ? (
            <ul className="mt-2 list-inside list-disc text-[11px] leading-relaxed text-muted-foreground">
              {gate.reasons.slice(0, 4).map((r, i) => (
                <li key={i}>{r}</li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      {/* 2 — aligned small multiples */}
      {responses.some((r) => r.col !== null) ? (
        <section>
          <h2 className="mb-2 text-sm font-semibold">Aligned small multiples — one response per investigation</h2>
          <p className="mb-2.5 max-w-3xl text-xs leading-relaxed text-muted-foreground">
            Same chart geometry for every investigation; axes are intentionally NOT shared (columns and units differ
            across experiments). This is a shape comparison, not a value comparison.
          </p>
          <div className="grid gap-4 md:grid-cols-2">
            {responses.map(({ inv, table, col, name, unit }) =>
              table && col !== null && name ? (
                <div key={inv.accession} className="rounded-xl border border-white/10 bg-[#0F1B2D]/60 p-3">
                  <p className="text-xs">
                    <span className="rounded bg-[#be5f35]/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#eeb086]">{inv.accession}</span>{" "}
                    <span className="font-mono text-[#E5EEF8]">{name}</span>
                    {unit ? <span className="text-[#8FA3BD]"> ({unit})</span> : null}
                  </p>
                  <ResponsiveContainer width="100%" height={150}>
                    <BarChart data={histogramData(table, col).data} margin={{ top: 4, right: 6, bottom: 0, left: -20 }}>
                      <CartesianGrid stroke={C.grid} vertical={false} />
                      <XAxis dataKey="bin" tick={{ fill: C.axis, fontSize: 10 }} interval="preserveStartEnd" />
                      <YAxis tick={{ fill: C.axis, fontSize: 10 }} allowDecimals={false} />
                      <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ fill: "rgba(210,69,30,0.08)" }} />
                      <Bar dataKey="count" fill={C.orange} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <p className="mt-1 border-t border-white/5 px-1 pt-1.5 text-[10px] text-[#5A6B7A]">
                    n = {histogramData(table, col).n}/{table.rowCount} rows · sha256:{table.sha256.slice(0, 8)} · recomputed in-browser
                  </p>
                </div>
              ) : (
                <div key={inv.accession} className="rounded-xl border border-white/10 bg-[#0F1B2D]/60 p-3">
                  <p className="text-xs">
                    <span className="rounded bg-[#be5f35]/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#eeb086]">{inv.accession}</span>{" "}
                    <span className="text-[#8FA3BD]">no analysis-ready response column — small multiple declined.</span>
                  </p>
                </div>
              ),
            )}
          </div>
        </section>
      ) : null}

      {/* 3 — derived overlay (gate-gated) */}
      {gatePasses ? (
        overlay ? (
          <section>
            <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
              Derived overlay
              <span className="rounded border border-[#37DCF2]/40 bg-[#37DCF2]/10 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-[#37DCF2]">
                derived · gate: {gate?.level}
              </span>
            </h2>
            <p className="mb-2.5 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              {overlay.response.name}
              {overlay.response.unit ? ` (${overlay.response.unit})` : ""} against {overlay.condition.name}
              {overlay.condition.unit ? ` (${overlay.condition.unit})` : ""} — the same physical quantities recorded on both
              experiments, overlaid because the comparability gate permits it with caveats. This plot is DERIVED from the
              recovered tables, not a published figure.
            </p>
            <div className="rounded-xl border border-white/10 bg-[#0F1B2D]/60 p-3">
              <ResponsiveContainer width="100%" height={280}>
                <ScatterChart margin={{ top: 8, right: 16, bottom: 26, left: -6 }}>
                  <CartesianGrid stroke={C.grid} />
                  <XAxis
                    type="number" dataKey="x" tick={{ fill: C.axis, fontSize: 11 }} domain={["auto", "auto"]}
                    label={{ value: `${overlay.condition.name}${overlay.condition.unit ? ` (${overlay.condition.unit})` : ""}`, position: "insideBottom", offset: -14, fill: C.axis, fontSize: 11 }}
                  />
                  <YAxis
                    type="number" dataKey="y" tick={{ fill: C.axis, fontSize: 11 }} domain={["auto", "auto"]} width={56}
                    label={{ value: `${overlay.response.name}${overlay.response.unit ? ` (${overlay.response.unit})` : ""}`, angle: -90, position: "insideLeft", offset: 16, fill: C.axis, fontSize: 11 }}
                  />
                  <Tooltip contentStyle={TOOLTIP_STYLE} cursor={{ strokeDasharray: "3 3" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Scatter name={overlay.a.inv.shortLabel} data={overlay.a.points} fill={C.orange} fillOpacity={0.75} />
                  <Scatter name={overlay.b.inv.shortLabel} data={overlay.b.points} fill={C.cyan} fillOpacity={0.75} />
                </ScatterChart>
              </ResponsiveContainer>
              <p className="mt-1 border-t border-white/5 px-1 pt-1.5 text-[10px] text-[#5A6B7A]">
                n = {overlay.a.points.length} ({overlay.a.inv.accession}) + {overlay.b.points.length} ({overlay.b.inv.accession}) paired rows · unit-compatible pair verified · overlay computed in-browser
              </p>
            </div>
          </section>
        ) : (
          <section>
            <h2 className="mb-2 text-sm font-semibold">Derived overlay</h2>
            <div className="rounded-xl border border-white/10 bg-[#0F1B2D]/60 p-4">
              <p className="text-xs leading-relaxed text-[#8FA3BD]">
                The gate permits a conditional comparison, but no unit-compatible condition→response column pair exists
                across these tables (or either side has fewer than 8 paired rows) — no overlay is drawn rather than a
                unit-mismatched one.
              </p>
            </div>
          </section>
        )
      ) : null}

      {/* 4 — original source figures */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <FileText className="h-4 w-4 text-primary" aria-hidden="true" /> Original source figures
        </h2>
        {anyFigures ? (
          <div className="grid gap-4 md:grid-cols-2">
            {figures.map(({ inv, papers }) => (
              <div key={inv.accession} className="rounded-xl border border-white/10 bg-[#0F1B2D]/60 p-3">
                <p className="text-xs">
                  <span className="rounded bg-[#be5f35]/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#eeb086]">{inv.accession}</span>{" "}
                  <span className="text-[#8FA3BD]">
                    {papers.length ? `${papers.length} archive paper${papers.length === 1 ? "" : "s"} with published figures` : "no published archive figure links this investigation"}
                  </span>
                </p>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {papers.flatMap((p) =>
                    p.figures_published!.slice(0, 2).map((f) => (
                      <a
                        key={f.asset}
                        href={f.asset}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group rounded-md border border-border/50 p-1.5 hover:border-primary/50"
                        title={`Figure from page ${f.page} of ${shortTitle(p.file)} — opens full resolution`}
                      >
                        { }
                        <img src={f.asset} alt={`Figure from page ${f.page} of ${shortTitle(p.file)}`} loading="lazy" className="h-24 w-full rounded object-contain object-top" />
                        <span className="mt-1 block text-[10px] leading-snug text-muted-foreground group-hover:text-primary">
                          {shortTitle(p.file)} · page {f.page} · {(f.bytes / 1024).toFixed(0)} KB ·{" "}
                          <span className="font-mono uppercase">candidate link</span>
                        </span>
                      </a>
                    )),
                  )}
                  {!papers.length ? (
                    <p className="col-span-2 flex items-center gap-1.5 text-[11px] text-[#8FA3BD]">
                      <ImageOff className="h-3 w-3" /> Original figures stay absent rather than approximated — the archive
                      holds no page-attributed figure for this investigation yet.
                    </p>
                  ) : null}
                </div>
                {papers.length ? (
                  <p className="mt-2 text-[10px] leading-relaxed text-[#5A6B7A]">
                    Extracted from the Fold Data archive PDFs (unmodified, page-attributed). Paper↔investigation links
                    are candidate-level (full-text name occurrence) until citation-verified.
                  </p>
                ) : null}
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-white/10 bg-[#0F1B2D]/60 p-4">
            <p className="text-xs leading-relaxed text-[#8FA3BD]">
              No page-attributed archive figure links to any investigation in this selection. Original figures stay
              absent rather than approximated.
            </p>
          </div>
        )}
      </section>

      {/* 5 — provenance strip */}
      <section>
        <h2 className="mb-2 flex items-center gap-2 text-sm font-semibold">
          <GitCompare className="h-4 w-4 text-primary" aria-hidden="true" /> Provenance chain
        </h2>
        <div className="grid gap-2 md:grid-cols-2">
          {responses.map(({ inv, table }) => (
            <div key={inv.accession} className="flex flex-wrap items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.02] px-3 py-2 text-[10px] text-[#8FA3BD]">
              <span className="rounded bg-[#be5f35]/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#eeb086]">{inv.accession}</span>
              <span>→</span>
              {table ? (
                <>
                  <span className="font-mono text-[#AEBFD4]">{table.file}</span>
                  <span>→</span>
                  <span className="font-mono">sha256:{table.sha256.slice(0, 12)}</span>
                  <span>→</span>
                  <span>{table.rowCount} rows × {table.columnCount} cols</span>
                </>
              ) : (
                <span>no recovered table — metadata record only</span>
              )}
              <span>→</span>
              <span>
                {(() => {
                  const n = REG.papers.filter(
                    (p) => !p.error && p.investigations_linked.some((label) => accessionsForPaperLabel(label).includes(inv.accession.toUpperCase())),
                  ).length;
                  return `${n} archive paper${n === 1 ? "" : "s"}`;
                })()}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
