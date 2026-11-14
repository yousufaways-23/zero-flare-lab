"use client";

// ZERO FLARE — CorrelationHeatmap: within-table Pearson association matrix
// computed from recovered rows. Exploratory association ONLY — pairwise n is
// shown, small-n pairs are declined (insufficient), and the panel states that
// correlation is not causation and is within one experiment's conditions.

import { useMemo, useState } from "react";
import { getTables } from "@/lib/data/catalog";
import { computeCorrelationMatrix, correlationBand, type CorrelationMatrix } from "@/lib/science/correlation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table2 } from "lucide-react";
import { cn } from "@/lib/utils";

const BAND_STYLE: Record<string, string> = {
  strong: "bg-[#4784d9]/60 text-white border-[#4784d9]/70",
  moderate: "bg-[#4784d9]/35 text-[#cfe2fb] border-[#4784d9]/45",
  weak: "bg-[#4784d9]/15 text-[#a9c6ee] border-[#4784d9]/25",
  none: "bg-white/[0.04] text-muted-foreground border-border/40",
  insufficient: "border-dashed border-border/50 text-muted-foreground/70",
};

export function CorrelationHeatmap({ initialTableId }: { initialTableId?: string | null }) {
  const tables = useMemo(
    () => getTables().filter((t) => t.columns.filter((c) => c.type === "numeric" && c.fillRate >= 0.6).length >= 3),
    [],
  );
  const [tableId, setTableId] = useState<string>(initialTableId ?? tables[0]?.id ?? "");
  const matrix: CorrelationMatrix | null = useMemo(() => {
    const t = tables.find((x) => x.id === tableId);
    return t ? computeCorrelationMatrix(t) : null;
  }, [tables, tableId]);

  if (tables.length === 0) {
    return (
      <p className="provenance-strip">
        No recovered table has enough well-filled numeric columns for correlation analysis. Missing
        data stays missing — no matrix is fabricated.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Table2 className="h-4 w-4 text-primary" aria-hidden />
          Correlation analysis — within-experiment association matrix
        </h3>
        <Select value={tableId} onValueChange={setTableId}>
          <SelectTrigger size="sm" className="w-[300px] text-xs" aria-label="Choose a recovered table">
            <SelectValue placeholder="Choose a recovered table" />
          </SelectTrigger>
          <SelectContent>
            {tables.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label} ({t.rowCount} rows)
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {matrix && (
        <>
          <div className="research-panel overflow-auto rounded-lg p-3 data-scroll">
            <div
              role="table"
              aria-label={`Pearson correlation matrix for ${matrix.tableId}`}
              className="min-w-[560px]"
            >
              {/* column headers */}
              <div role="row" className="grid" style={{ gridTemplateColumns: `minmax(120px, 1.2fr) repeat(${matrix.columns.length}, minmax(64px, 88px))` }}>
                <span role="columnheader" className="pb-1.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">pair</span>
                {matrix.columns.map((c, i) => (
                  <span key={c} role="columnheader" className="pb-1.5 text-center text-[9px] font-medium text-muted-foreground" title={c}>
                    #{i + 1}
                  </span>
                ))}
              </div>
              {matrix.columns.map((rowCol, i) => (
                <div
                  role="row"
                  key={rowCol}
                  className="grid items-center border-t border-border/25 py-1"
                  style={{ gridTemplateColumns: `minmax(120px, 1.2fr) repeat(${matrix.columns.length}, minmax(64px, 88px))` }}
                >
                  <span role="cell" className="truncate pr-2 text-[10px] text-foreground/85" title={rowCol}>
                    <span className="font-mono text-primary">#{i + 1}</span> {rowCol}
                  </span>
                  {matrix.columns.map((colCol, j) => {
                    if (j < i) return <span key={colCol} role="cell" className="px-1" />;
                    if (i === j) {
                      return (
                        <span key={colCol} role="cell" className="px-0.5">
                          <span className="block rounded border border-border/40 bg-white/[0.06] py-1 text-center text-[9px] text-muted-foreground">1.0</span>
                        </span>
                      );
                    }
                    const cell = matrix.cells.find(
                      (c) => (c.colA === rowCol && c.colB === colCol) || (c.colA === colCol && c.colB === rowCol),
                    );
                    const band = correlationBand(cell?.r ?? null);
                    return (
                      <span key={colCol} role="cell" className="px-0.5">
                        <span
                          className={cn("block rounded border py-1 text-center font-mono text-[9px]", BAND_STYLE[band])}
                          title={
                            cell
                              ? `${rowCol} × ${colCol}: r = ${cell.r === null ? "not computed" : cell.r.toFixed(3)}, pairwise n = ${cell.n}${cell.r === null ? " (below the minimum sample threshold)" : ""}`
                              : "no pair"
                          }
                        >
                          {cell?.r === null || !cell ? "n<min" : cell.r.toFixed(2)}
                        </span>
                      </span>
                    );
                  })}
                </div>
              ))}
            </div>
            {/* column legend */}
            <div className="mt-2 grid grid-cols-1 gap-x-4 gap-y-0.5 text-[9px] text-muted-foreground sm:grid-cols-2">
              {matrix.columns.map((c, i) => (
                <span key={c} className="truncate">
                  <span className="font-mono text-primary">#{i + 1}</span> {c}
                </span>
              ))}
            </div>
          </div>
          <p className="provenance-strip">
            Pearson r computed pairwise from recovered rows (rows with missing values in either column are
            excluded; pairwise n shown in each cell tooltip; pairs below n={matrix.minN} are declined, never
            imputed). This is EXPLORATORY ASSOCIATION within one experiment's conditions — it is not a causal
            claim and is not comparable across investigations with different setups.
          </p>
        </>
      )}
    </div>
  );
}
