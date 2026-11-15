"use client";

// ZERO FLARE — EvidenceCoverageMap (audit P1 #1; Phase 5 W7 two-layer rewrite).
// Layer 1 "Original corpus coverage": the canonical matrix from PSI metadata,
// recovered tables and the typed graph. Layer 2 "Enriched evidence coverage":
// the same matrix lifted into layered evidence states (observed /
// reported_primary / reported_secondary / conditions_only / derived /
// external_context / not_applicable / not_reported_after_search /
// not_recovered / inaccessible / not_indexed) with a documented search trail
// on every gap cell — zero unsearched gaps, truthful not-reported states kept.

import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/app-store";
import {
  buildCoverageRows, buildEvidenceRows, COVERAGE_DIMENSIONS, COVERAGE_META, EVIDENCE_META,
  type CoverageStatus, type EvidenceStatus,
} from "@/lib/science/coverage";
import { Badge } from "@/components/ui/badge";
import { Table as TablesIcon, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

const CELL_STYLE: Record<CoverageStatus, string> = {
  observed: "bg-emerald-500/25 text-emerald-700 border-emerald-500/50",
  reported: "bg-[#5799d1]/20 text-[#5799d1] border-[#5799d1]/45",
  "condition-only": "bg-amber-500/20 text-amber-700 border-amber-500/45",
  "not-in-corpus": "border-dashed border-muted-foreground/50 text-muted-foreground",
  "not-recorded": "bg-muted/40 text-muted-foreground/70 border-border/50",
};

const DOT_STYLE: Record<CoverageStatus, string> = {
  observed: "bg-emerald-500",
  reported: "bg-[#5799d1]",
  "condition-only": "bg-amber-500",
  "not-in-corpus": "bg-transparent border border-dashed border-muted-foreground/60",
  "not-recorded": "bg-muted-foreground/30",
};

const EVIDENCE_CELL_STYLE: Record<EvidenceStatus, string> = {
  observed: "bg-emerald-500/25 text-emerald-700 border-emerald-500/50",
  reported_primary: "bg-[#5799d1]/20 text-[#5799d1] border-[#5799d1]/45",
  reported_secondary: "bg-[#5799d1]/12 text-[#9ccae9] border-[#5799d1]/35 border-dashed",
  derived: "bg-violet-500/20 text-[#c4b5fd] border-violet-400/40",
  conditions_only: "bg-amber-500/20 text-amber-700 border-amber-500/45",
  external_context: "bg-[#3E9B7A]/15 text-[#7FD8B4] border-[#3E9B7A]/40",
  not_applicable: "bg-muted/40 text-muted-foreground/70 border-border/50",
  not_reported_after_search: "border-dashed border-amber-500/50 text-amber-600",
  not_recovered: "border-dashed border-red-400/40 text-red-300",
  inaccessible: "border-dashed border-red-400/40 text-red-300",
  not_indexed: "border-dashed border-muted-foreground/50 text-muted-foreground",
};

const EVIDENCE_DOT_STYLE: Record<EvidenceStatus, string> = {
  observed: "bg-emerald-500",
  reported_primary: "bg-[#5799d1]",
  reported_secondary: "bg-[#5799d1]/60",
  derived: "bg-violet-400",
  conditions_only: "bg-amber-500",
  external_context: "bg-[#3E9B7A]",
  not_applicable: "bg-muted-foreground/30",
  not_reported_after_search: "bg-transparent border border-dashed border-amber-500/60",
  not_recovered: "bg-transparent border border-dashed border-red-400/60",
  inaccessible: "bg-transparent border border-dashed border-red-400/60",
  not_indexed: "bg-transparent border border-dashed border-muted-foreground/60",
};

type Layer = "corpus" | "evidence";

export function EvidenceCoverageMap() {
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  const [layer, setLayer] = useState<Layer>("corpus");
  const corpusRows = useMemo(() => buildCoverageRows(), []);
  const evidenceRows = useMemo(() => buildEvidenceRows(), []);

  const corpusSummary = useMemo(() => {
    const counts: Record<CoverageStatus, number> = { observed: 0, reported: 0, "condition-only": 0, "not-in-corpus": 0, "not-recorded": 0 };
    for (const r of corpusRows) for (const d of COVERAGE_DIMENSIONS) counts[r.cells[d.id].status] += 1;
    return counts;
  }, [corpusRows]);

  const evidenceSummary = useMemo(() => {
    const counts = Object.fromEntries(
      (Object.keys(EVIDENCE_META) as EvidenceStatus[]).map((s) => [s, 0]),
    ) as Record<EvidenceStatus, number>;
    for (const r of evidenceRows) for (const d of COVERAGE_DIMENSIONS) counts[r.cells[d.id].status] += 1;
    return counts;
  }, [evidenceRows]);

  const rows = layer === "corpus" ? corpusRows : evidenceRows;

  return (
    <div className="glass-panel mt-6 rounded-xl p-5 sm:p-6" aria-labelledby="coverage-map-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="coverage-map-title" className="flex items-center gap-2 text-sm font-semibold">
          <TablesIcon className="h-4 w-4 text-primary" aria-hidden="true" />
          Evidence coverage map — what the corpus can and cannot answer
        </h3>
        {/* two-layer toggle */}
        <div role="tablist" aria-label="Coverage layer" className="flex overflow-hidden rounded-lg border border-border/60">
          <button
            role="tab"
            aria-selected={layer === "corpus"}
            onClick={() => setLayer("corpus")}
            className={cn(
              "px-3 py-1.5 text-[11px] font-medium transition-colors",
              layer === "corpus" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            Original corpus coverage
          </button>
          <button
            role="tab"
            aria-selected={layer === "evidence"}
            onClick={() => setLayer("evidence")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium transition-colors",
              layer === "evidence" ? "bg-primary/20 text-primary" : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Layers className="h-3 w-3" aria-hidden="true" /> Enriched evidence coverage
          </button>
        </div>
      </div>

      <p className="mt-2 max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
        {layer === "corpus"
          ? "Statuses from PSI metadata, recovered tables and the typed graph — this layer answers: what does THIS corpus hold?"
          : "The same matrix lifted with the archive: papers and verified media reconcile gap cells into layered states, and every gap cell carries the documented search trail (PSI → recovered tables → archive papers → verified media). Zero unsearched gaps — but “not reported” stays “not reported”."}
      </p>

      {/* legend */}
      <div className="mt-3 flex flex-wrap gap-1.5" aria-label="Coverage legend">
        {layer === "corpus"
          ? (Object.keys(COVERAGE_META) as CoverageStatus[]).map((s) => (
              <Badge key={s} variant="outline" className={cn("gap-1.5 text-[10px]", CELL_STYLE[s])} title={COVERAGE_META[s].title}>
                <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLE[s])} aria-hidden="true" />
                {COVERAGE_META[s].label}
              </Badge>
            ))
          : (Object.keys(EVIDENCE_META) as EvidenceStatus[]).map((s) => (
              <Badge key={s} variant="outline" className={cn("gap-1.5 text-[10px]", EVIDENCE_CELL_STYLE[s])} title={EVIDENCE_META[s].title}>
                <span className={cn("h-1.5 w-1.5 rounded-full", EVIDENCE_DOT_STYLE[s])} aria-hidden="true" />
                {EVIDENCE_META[s].label}
              </Badge>
            ))}
      </div>

      <div className="mt-4 max-h-[460px] overflow-auto rounded-lg border border-border/50 data-scroll">
        <div role="table" aria-label="Evidence coverage by investigation and dimension" className="min-w-[820px]">
          <div role="row" className="sticky top-0 z-10 grid grid-cols-[minmax(120px,1.4fr)_repeat(8,minmax(72px,1fr))] border-b border-border/60 bg-[color:var(--research)] px-2 py-1.5">
            <span role="columnheader" className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Investigation</span>
            {COVERAGE_DIMENSIONS.map((d) => (
              <span key={d.id} role="columnheader" className="text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground" title={d.label}>
                {d.label}
              </span>
            ))}
          </div>
          {rows.map((r) => (
            <div role="row" key={r.accession} className="grid grid-cols-[minmax(120px,1.4fr)_repeat(8,minmax(72px,1fr))] items-center border-b border-border/25 px-2 py-1 hover:bg-accent/30">
              <div role="cell" className="flex min-w-0 items-center gap-1.5">
                <button
                  onClick={() => openInvestigation(r.accession)}
                  className="shrink-0 rounded font-mono text-[10px] text-primary hover:underline"
                  aria-label={`Open investigation ${r.accession}`}
                >
                  {r.accession}
                </button>
                <span className="truncate text-[10px] text-muted-foreground" title={r.shortLabel}>{r.shortLabel}</span>
              </div>
              {COVERAGE_DIMENSIONS.map((d) => {
                const cell = layer === "corpus"
                  ? (corpusRows.find((cr) => cr.accession === r.accession)?.cells[d.id] ?? null)
                  : (evidenceRows.find((er) => er.accession === r.accession)?.cells[d.id] ?? null);
                if (!cell) return <div role="cell" key={d.id} />;
                const isEvidence = layer === "evidence";
                const status = cell.status as CoverageStatus & EvidenceStatus;
                return (
                  <div role="cell" key={d.id} className="flex justify-center px-0.5 py-0.5">
                    <span
                      className={cn(
                        "inline-flex w-full items-center justify-center gap-1 rounded border px-1 py-0.5 text-[9px] leading-none",
                        isEvidence ? EVIDENCE_CELL_STYLE[status] : CELL_STYLE[status as CoverageStatus],
                      )}
                      title={`${r.accession} · ${d.label}: ${cell.note}${"searchTrail" in cell && cell.searchTrail ? `\n\nSearch trail:\n• ${cell.searchTrail.join("\n• ")}` : ""}`}
                    >
                      <span
                        className={cn("h-1.5 w-1.5 shrink-0 rounded-full", isEvidence ? EVIDENCE_DOT_STYLE[status] : DOT_STYLE[status as CoverageStatus])}
                        aria-hidden="true"
                      />
                      <span className="hidden truncate sm:inline">
                        {isEvidence ? EVIDENCE_META[status].label : COVERAGE_META[status as CoverageStatus].label}
                      </span>
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] leading-snug text-muted-foreground">
          {layer === "corpus" ? (
            <>
              {corpusSummary.observed} observed · {corpusSummary.reported} reported · {corpusSummary["condition-only"]} conditions-only ·{" "}
              {corpusSummary["not-in-corpus"]} not in corpus · {corpusSummary["not-recorded"]} not recorded — across {corpusRows.length} investigations ×{" "}
              {COVERAGE_DIMENSIONS.length} dimensions.
            </>
          ) : (
            <>
              {evidenceSummary.observed} observed · {evidenceSummary.reported_primary} reported (primary) · {evidenceSummary.reported_secondary} reported
              (secondary) · {evidenceSummary.derived} derived · {evidenceSummary.conditions_only} conditions-only · {evidenceSummary.external_context} external
              context · {evidenceSummary.not_applicable} n/a · {evidenceSummary.not_reported_after_search} not reported (searched) ·{" "}
              {evidenceSummary.not_recovered} not recovered · {evidenceSummary.inaccessible} inaccessible · {evidenceSummary.not_indexed} not indexed —
              across {evidenceRows.length} investigations × {COVERAGE_DIMENSIONS.length} dimensions.
            </>
          )}
        </p>
        <p className="max-w-xl text-[10px] italic leading-snug text-muted-foreground">
          Cell status describes THIS corpus (and, in the enriched layer, the archive reconciliation). "Not reported" is
          not "does not exist in science" — use CIR-1's external check (NASA NTRS) before citing a field-wide gap.
        </p>
      </div>
    </div>
  );
}
