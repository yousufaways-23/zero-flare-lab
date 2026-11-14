"use client";

/**
 * InvestigationsView (M4) — investigation atlas over the recovered NASA PSI
 * combustion corpus. Two states driven by the store:
 *   A. Atlas (selectedInvestigation === null): filterable card grid with
 *      corpus-total provenance, the STDCE-2 honest scope note and the
 *      documented-gaps strip.
 *   B. Workspace (selection set): delegates to InvestigationWorkspace.
 */

import { useMemo, useState } from "react";
import { ArrowRight, ExternalLink, GitCompare, Info, Search } from "lucide-react";
import { useAppStore } from "@/lib/app-store";
import {
  getCorpusTotals,
  getGaps,
  getInvestigations,
  type Gap,
  type Investigation,
} from "@/lib/data/catalog";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { InvestigationWorkspace } from "./InvestigationWorkspace";

const ALL = "all";

function gapStatusStyle(status: Gap["status"]): string {
  switch (status) {
    case "absent":
      return "border-border/60 bg-muted/30 text-muted-foreground";
    case "not-indexed":
      return "border-amber-500/40 bg-amber-500/10 text-amber-300";
    case "inaccessible":
      return "border-red-400/40 bg-red-400/10 text-red-300";
    case "no-evidence-found":
      return "border-[#5799d1]/40 bg-[#5799d1]/10 text-[#5799d1]";
  }
}

export function InvestigationsView() {
  const selected = useAppStore((s) => s.selectedInvestigation);
  if (selected) return <InvestigationWorkspace accession={selected} />;
  return <InvestigationAtlas />;
}

function InvestigationAtlas() {
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const compareSelection = useAppStore((s) => s.compareSelection);
  const all = useMemo(() => getInvestigations(), []);
  const totals = useMemo(() => getCorpusTotals(), []);
  const gaps = useMemo(() => getGaps(), []);

  const [query, setQuery] = useState("");
  const [sub, setSub] = useState(ALL);
  const [ptype, setPtype] = useState(ALL);

  const subAreas = useMemo(
    () => [...new Set(all.map((i) => i.subResearchArea).filter((x): x is string => !!x))].sort(),
    [all],
  );
  const projectTypes = useMemo(
    () => [...new Set(all.map((i) => i.projectType).filter((x): x is string => !!x))].sort(),
    [all],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return all.filter((i) => {
      if (sub !== ALL && i.subResearchArea !== sub) return false;
      if (ptype !== ALL && i.projectType !== ptype) return false;
      if (needle) {
        const hay = `${i.title} ${i.shortLabel} ${i.accession} ${i.keywords.join(" ")}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }
      return true;
    });
  }, [all, query, sub, ptype]);

  return (
    <div className="min-w-0 pb-24">
      {/* header */}
      <header className="mb-5">
        <h1 className="text-2xl font-bold ember-gradient-text sm:text-3xl">
          Investigations — NASA PSI combustion evidence
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          {totals.tables} recovered tables · {totals.rows.toLocaleString("en-US")} rows ·{" "}
          {totals.columns.toLocaleString("en-US")} columns — SHA-256-verified vs project manifest.
        </p>
        <p className="provenance-strip mt-2 max-w-3xl">
          {totals.method}. Investigation records: NASA Physical Sciences Informatics (psi.nasa.gov). Open a card
          for the embedded evidence workspace: data studio, equipment, authentic media, equation context, graph and
          gaps.
        </p>
      </header>

      {/* filter bar */}
      <div className="glass-panel mb-5 flex flex-wrap items-center gap-2.5 rounded-xl p-3">
        <div className="relative min-w-0 flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search title, keywords or accession…"
            className="h-9 pl-8 text-sm"
            aria-label="Search investigations"
          />
        </div>
        <Select value={sub} onValueChange={setSub}>
          <SelectTrigger size="sm" className="w-full text-xs sm:w-[220px]" aria-label="Filter by sub-research area">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL} className="text-xs">All sub-research areas</SelectItem>
            {subAreas.map((s) => (
              <SelectItem key={s} value={s} className="text-xs">
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={ptype} onValueChange={setPtype}>
          <SelectTrigger size="sm" className="w-full text-xs sm:w-[200px]" aria-label="Filter by project type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL} className="text-xs">All project types</SelectItem>
            {projectTypes.map((p) => (
              <SelectItem key={p} value={p} className="text-xs">
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="ml-auto shrink-0 text-xs text-muted-foreground" aria-live="polite">
          {filtered.length} of {all.length} investigations
        </span>
      </div>

      {/* card grid */}
      {filtered.length === 0 ? (
        <div className="glass-panel rounded-xl p-10 text-center text-sm text-muted-foreground">
          No investigations match the current filters.
        </div>
      ) : (
        <div className="grid items-stretch gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((inv) => (
            <InvestigationCard
              key={inv.accession}
              inv={inv}
              inCompare={compareSelection.includes(inv.accession)}
              onOpen={() => openInvestigation(inv.accession)}
              onCompare={() => toggleCompare(inv.accession)}
            />
          ))}
        </div>
      )}

      {/* honest scope note + documented gaps */}
      <section className="mt-6 grid min-w-0 grid-cols-1 gap-4 lg:grid-cols-[1fr_1.2fr]">
        <div className="glass-panel rounded-xl p-4">
          <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            <Info className="h-3.5 w-3.5" /> Honest scope note — STDCE-2 / PSI-47
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            PSI-47 is fluid-physics / aerosol feasibility evidence, not a combustion study: the recovered record is
            DAFT/DAFT-2 (&ldquo;Dust and Aerosol Measurement Feasibility Test&rdquo;), which de-risks the SAME
            smoke-aerosol measurement chain. Its 2-row table is a feasibility record — do not read it as combustion
            outcomes.
          </p>
        </div>
        <div className="glass-panel rounded-xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Documented gaps across the corpus
          </h3>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {gaps.map((g) => (
              <span
                key={g.id}
                title={g.detail}
                className={`inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] leading-snug ${gapStatusStyle(g.status)}`}
              >
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current" aria-hidden="true" />
                <span className="truncate">{g.topic}</span>
              </span>
            ))}
          </div>
          <p className="provenance-strip mt-3">
            Statuses: absent (data does not exist) · not-indexed (exists but not in our corpus) · inaccessible
            (exists, we cannot access) · no-evidence-found (searched, nothing found).
          </p>
        </div>
      </section>
    </div>
  );
}

function InvestigationCard({
  inv,
  inCompare,
  onOpen,
  onCompare,
}: {
  inv: Investigation;
  inCompare: boolean;
  onOpen: () => void;
  onCompare: () => void;
}) {
  /* data-richness accent — origin's evidence-lab rhythm: recovered rows earn a visible accent
   * (absolute bar: .glass-panel's unlayered border CSS would beat Tailwind border utilities) */
  const rich = inv.tableRows >= 100;
  const hasData = inv.tableIds.length > 0;
  return (
    <article
      className={`glass-panel group relative flex min-w-0 flex-col overflow-hidden rounded-xl p-4 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_14px_36px_-16px_rgba(3,11,38,0.9)]`}
    >
      {rich && (
        <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-[#5799d1]/80 shadow-[0_0_8px_rgba(87,153,209,0.5)]" title="data-rich: 100+ recovered rows" />
      )}
      {!rich && hasData && (
        <span aria-hidden="true" className="absolute left-0 top-3 bottom-3 w-[3px] rounded-full bg-border" />
      )}
      {/* stretched open target */}
      <button
        className="absolute inset-0 z-10 cursor-pointer"
        onClick={onOpen}
        aria-label={`Open investigation ${inv.accession} — ${inv.shortLabel}`}
      />

      <div className="relative z-0 flex h-full flex-col">
        <div className="flex items-baseline gap-2 pr-16">
          <span className="shrink-0 font-mono text-xs font-semibold text-primary">{inv.accession}</span>
          <span className="min-w-0 truncate text-base font-semibold">{inv.shortLabel}</span>
        </div>
        <h3 className="mt-1 line-clamp-2 min-h-[2.4rem] text-xs leading-relaxed text-muted-foreground" title={inv.title}>
          {inv.title}
        </h3>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {inv.subResearchArea && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px]">
              {inv.subResearchArea}
            </Badge>
          )}
          {inv.projectType && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px] text-muted-foreground">
              {inv.projectType}
            </Badge>
          )}
        </div>

        <div className="mono-readout mt-2.5 text-[11px]">
          {hasData ? (
            <>
              {inv.tableIds.length} {inv.tableIds.length === 1 ? "table" : "tables"} · {inv.tableRows.toLocaleString("en-US")} rows
              {rich && <span className="ml-1.5 rounded border border-[#5799d1]/40 px-1 text-[9px] uppercase tracking-wide">data-rich</span>}
              {inv.duplicateRows > 0 && <span className="text-amber-300/90"> · {inv.duplicateRows} dup</span>}
            </>
          ) : (
            <span className="font-mono text-[10.5px] text-amber-200/60">metadata record — no bundled experimental table</span>
          )}
        </div>

        {inv.keywords.length > 0 && (
          <div className="mt-2.5 flex flex-wrap gap-1">
            {inv.keywords.slice(0, 3).map((k) => (
              <span
                key={k}
                className="rounded-full border border-border/40 px-2 py-0.5 text-[10px] text-muted-foreground"
              >
                {k}
              </span>
            ))}
            {inv.keywords.length > 3 && (
              <span className="rounded-full border border-border/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground">
                +{inv.keywords.length - 3}
              </span>
            )}
          </div>
        )}

        <div className="mt-auto flex items-end justify-between gap-2 pt-3">
          {inv.doi ? (
            <a
              href={`https://doi.org/${inv.doi}`}
              target="_blank"
              rel="noopener noreferrer"
              className="relative z-20 inline-flex items-center gap-1 text-[10px] text-muted-foreground transition-colors hover:text-primary"
              onClick={(e) => e.stopPropagation()}
            >
              DOI {inv.doi} <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span />
          )}
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            View investigation <ArrowRight className="h-3 w-3" aria-hidden="true" />
          </span>
        </div>
      </div>

      {/* corner compare action */}
      <button
        onClick={onCompare}
        className={`absolute right-2 top-2 z-20 inline-flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] transition-colors ${
          inCompare
            ? "border-primary/70 bg-primary/20 text-primary"
            : "border-border/60 bg-[color:var(--space-raised)]/80 text-muted-foreground hover:border-primary/50 hover:text-primary"
        }`}
        aria-label={inCompare ? `In compare — click to remove ${inv.accession} from the comparison` : `Compare — add ${inv.accession} to the cross-study comparison`}
        title="Add to comparison (max 4) — opens the Compare view"
      >
        <GitCompare className="h-3 w-3" />
        {inCompare ? "In compare" : "Compare"}
      </button>
    </article>
  );
}
