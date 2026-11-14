"use client";

// ZERO FLARE — EvidenceCoverageMap (audit P1 #1): the corpus-wide coverage
// matrix across gravity, oxygen, pressure, fuel, scale, hardware, outcome and
// measurement context. Cells derive from the canonical catalog; every status
// distinguishes corpus gaps from field-wide absence (never "does not exist").

import { useMemo } from "react";
import { useAppStore } from "@/lib/app-store";
import {
  buildCoverageRows, COVERAGE_DIMENSIONS, COVERAGE_META, type CoverageStatus,
} from "@/lib/science/coverage";
import { Badge } from "@/components/ui/badge";
import { Table as TablesIcon } from "lucide-react";
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

export function EvidenceCoverageMap() {
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  const rows = useMemo(() => buildCoverageRows(), []);

  const summary = useMemo(() => {
    const counts: Record<CoverageStatus, number> = { observed: 0, reported: 0, "condition-only": 0, "not-in-corpus": 0, "not-recorded": 0 };
    for (const r of rows) for (const d of COVERAGE_DIMENSIONS) counts[r.cells[d.id].status] += 1;
    return counts;
  }, [rows]);

  return (
    <div className="glass-panel mt-6 rounded-xl p-5 sm:p-6" aria-labelledby="coverage-map-title">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 id="coverage-map-title" className="flex items-center gap-2 text-sm font-semibold">
          <TablesIcon className="h-4 w-4 text-primary" aria-hidden="true" />
          Evidence coverage map — what the corpus can and cannot answer
        </h3>
        <div className="flex flex-wrap gap-1.5" aria-label="Coverage legend">
          {(Object.keys(COVERAGE_META) as CoverageStatus[]).map((s) => (
            <Badge key={s} variant="outline" className={cn("gap-1.5 text-[10px]", CELL_STYLE[s])} title={COVERAGE_META[s].title}>
              <span className={cn("h-1.5 w-1.5 rounded-full", DOT_STYLE[s])} aria-hidden="true" />
              {COVERAGE_META[s].label}
            </Badge>
          ))}
        </div>
      </div>

      <div className="mt-4 max-h-[420px] overflow-auto rounded-lg border border-border/50 data-scroll">
        {/* matrix */}
        <div role="table" aria-label="Evidence coverage by investigation and dimension" className="min-w-[760px]">
          {/* header */}
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
                const cell = r.cells[d.id];
                return (
                  <div role="cell" key={d.id} className="flex justify-center px-0.5 py-0.5">
                    <span
                      className={cn("inline-flex w-full items-center justify-center gap-1 rounded border px-1 py-0.5 text-[9px] leading-none", CELL_STYLE[cell.status])}
                      title={`${r.accession} · ${d.label}: ${cell.note}`}
                    >
                      <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", DOT_STYLE[cell.status])} aria-hidden="true" />
                      <span className="hidden truncate sm:inline">{COVERAGE_META[cell.status].label}</span>
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
          {summary.observed} observed · {summary.reported} reported · {summary["condition-only"]} conditions-only ·{" "}
          {summary["not-recorded"]} not recorded — across {rows.length} investigations × {COVERAGE_DIMENSIONS.length} dimensions.
        </p>
        <p className="max-w-xl text-[10px] italic leading-snug text-muted-foreground">
          Cell status describes THIS corpus. “Not in corpus” is not “does not exist in science” —
          use CIR-1’s external check (NASA NTRS) before citing a field-wide gap.
        </p>
      </div>
    </div>
  );
}
