"use client";

/**
 * CompareView (M5) — cross-investigation evidence comparison.
 * Up to four investigations side by side: condition matrix (research-panel),
 * shared MiniGraph slice, and gap discovery. All cell values come from the
 * recovered records; missing values stay missing (em-dash, never zero).
 */

import { useMemo, useState } from "react";
import { AlertTriangle, GitCompare, ShieldCheck, ShieldX, X } from "lucide-react";
import { useAppStore } from "@/lib/app-store";
import { auditComparability } from "@/lib/science/comparability";
import { CrossExperimentCoverage } from "@/components/flame/compare/CrossExperimentCoverage";
import {
  getEquipmentForInvestigation,
  getGaps,
  getGapsForInvestigation,
  getGraph,
  getInvestigation,
  getInvestigations,
  type Gap,
  type Investigation,
} from "@/lib/data/catalog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MiniGraph } from "@/components/flame/investigations/MiniGraph";
import { GapExplorer } from "@/components/flame/gaps/GapExplorer";
import { cn } from "@/lib/utils";

const MAX_COMPARE = 4;
const MISSING = "—";

/** Same refinement as the workspace: exact accession or accession-scoped ids only. */
function strictGapsFor(acc: string): Gap[] {
  return getGapsForInvestigation(acc).filter((g) =>
    g.related.some((r) => r === acc || r.startsWith(`${acc}_`)),
  );
}

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

const QUICK_PICKS: { label: string; ids: string[] }[] = [
  { label: "FLEX vs CFI-G (droplet vs gaseous)", ids: ["PSI-69", "PSI-159"] },
  { label: "SAFFIRE I vs II vs III (flight series)", ids: ["PSI-98", "PSI-99", "PSI-100"] },
  { label: "SAME vs SAME-R (smoke detection)", ids: ["PSI-102", "PSI-101"] },
];

export function CompareView() {
  const compareSelection = useAppStore((s) => s.compareSelection);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const clearCompare = useAppStore((s) => s.clearCompare);
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  const all = useMemo(() => getInvestigations(), []);
  const [note, setNote] = useState<string | null>(null);

  const selected = useMemo(
    () =>
      compareSelection
        .map((acc) => all.find((i) => i.accession === acc))
        .filter((i): i is Investigation => !!i),
    [compareSelection, all],
  );

  const addable = useMemo(
    () => all.filter((i) => !compareSelection.includes(i.accession)),
    [all, compareSelection],
  );
  const full = compareSelection.length >= MAX_COMPARE;

  const addInvestigation = (acc: string) => {
    if (compareSelection.includes(acc)) return;
    if (full) {
      setNote(`Maximum ${MAX_COMPARE} investigations — remove one first.`);
      return;
    }
    setNote(null);
    toggleCompare(acc);
  };

  const removeInvestigation = (acc: string) => {
    setNote(null);
    toggleCompare(acc);
  };

  /* typed graph — fuel edges per investigation */
  const graph = useMemo(() => getGraph(), []);
  const fuelsByAcc = useMemo(() => {
    const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
    const map = new Map<string, string[]>();
    for (const e of graph.edges) {
      if (e.type !== "studies_fuel") continue;
      const label = nodeById.get(e.dst)?.label ?? e.dst;
      const list = map.get(e.source);
      if (list) {
        if (!list.includes(label)) list.push(label);
      } else {
        map.set(e.source, [label]);
      }
    }
    return map;
  }, [graph]);

  /* comparability gate (M4) — deterministic audit derived from the records themselves */
  const gate = useMemo(() => (selected.length > 1 ? auditComparability(selected) : null), [selected]);
  const warnings = useMemo(() => {
    const out: { text: string; support?: string }[] = [];
    if (gate) {
      for (const r of gate.reasons) out.push({ text: r });
    }
    const isSaffire = (i: Investigation) => /saffire|spacecraft fire/i.test(`${i.title} ${i.shortLabel}`);
    if (selected.some(isSaffire)) {
      const support = selected
        .flatMap((i) => i.integrityCases)
        .find((c) => /saffire/i.test(c.case) || /saffire/i.test(c.issue))
        ?.issue;
      out.push({
        text: "SAFFIRE is large-scale post-ISS testing; chamber experiments differ in scale.",
        support,
      });
    }
    const isBass = (i: Investigation) => /bass|burning and suppression/i.test(`${i.title} ${i.shortLabel}`);
    if (selected.some(isBass)) {
      const bassAccs = selected.filter(isBass).map((i) => i.accession);
      const support = getGaps().find((g) =>
        g.related.some((r) => bassAccs.some((a) => r === a || r.startsWith(`${a}_`))) && /spread|outcome/i.test(g.detail),
      )?.detail;
      out.push({
        text: "BASS tables are test-condition inventories without measured spread-rate outcomes.",
        support,
      });
    }
    return out;
  }, [gate, selected]);

  /* union of investigation-scoped gaps */
  const unionGaps = useMemo(() => {
    const seen = new Map<string, Gap>();
    for (const inv of selected) {
      for (const g of strictGapsFor(inv.accession)) seen.set(g.id, g);
    }
    return [...seen.values()];
  }, [selected]);

  const dim = (label: string, render: (i: Investigation) => React.ReactNode) => ({ label, render });
  const matrixRows = useMemo(
    () => [
      dim("Title", (i) => (
        <span className="font-medium leading-snug">{i.title}</span>
      )),
      dim("Research area", (i) => val(i.researchArea)),
      dim("Sub-research", (i) => val(i.subResearchArea)),
      dim("Project type", (i) => val(i.projectType)),
      dim("Flight platform", (i) => val(i.flightPlatform)),
      dim("Monitoring center", (i) => val(i.monitoringCenter)),
      dim("Start – End", (i) => (
        <span className="font-mono">
          {i.startDate ?? MISSING} → {i.endDate ?? MISSING}
        </span>
      )),
      dim("Tables", (i) => <span className="font-mono">{String(i.tableIds.length)}</span>),
      dim("Rows", (i) => <span className="font-mono">{i.tableRows.toLocaleString("en-US")}</span>),
      dim("Duplicate rows", (i) => (
        <span className={cn("font-mono", i.duplicateRows > 0 && "font-semibold text-amber-700")}>
          {String(i.duplicateRows)}
        </span>
      )),
      dim("Hardware", (i) => {
        const eq = getEquipmentForInvestigation(i.accession);
        return eq.length > 0 ? <span className="leading-snug">{eq.map((e) => e.name).join(" · ")}</span> : miss();
      }),
      dim("DOIs", (i) =>
        i.doi ? (
          <a
            href={`https://doi.org/${i.doi}`}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all text-[#3d6ea0] underline decoration-dotted underline-offset-2 hover:text-[#2c5a92]"
          >
            {i.doi}
          </a>
        ) : (
          miss()
        ),
      ),
      dim("Fuels studied", (i) => {
        const fuels = fuelsByAcc.get(i.accession);
        return fuels && fuels.length > 0 ? (
          <span className="leading-snug">{fuels.join(", ")}</span>
        ) : (
          miss()
        );
      }),
      dim("Related investigations", (i) =>
        i.related.length > 0 ? (
          <span className="flex flex-wrap gap-1">
            {i.related.map((r) =>
              getInvestigation(r) ? (
                <button
                  key={r}
                  onClick={() => openInvestigation(r)}
                  className="rounded-full border border-[#5799d1]/40 px-1.5 py-0.5 font-mono text-[10px] text-[#9ccae9] transition-colors hover:border-[#9ccae9]"
                >
                  {r}
                </button>
              ) : (
                <span
                  key={r}
                  className="rounded-full border border-border/60 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground"
                >
                  {r}
                </span>
              ),
            )}
          </span>
        ) : (
          miss()
        ),
      ),
    ],
    [fuelsByAcc, openInvestigation],
  );

  return (
    <div className="min-w-0 pb-24">
      {/* header */}
      <header className="mb-5">
        <h1 className="text-2xl font-bold ember-gradient-text sm:text-3xl">Compare — cross-investigation evidence</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-muted-foreground">
          Select up to {MAX_COMPARE} investigations to line up flight conditions, hardware, fuels and documented
          gaps side by side. The comparability gate audits every pairing before any cross-study claim.
        </p>
      </header>

      {/* comparability gate verdict (M4) */}
      {gate && (
        <div
          role="status"
          className={`mb-5 flex flex-wrap items-start gap-3 rounded-xl border p-4 ${
            gate.level === "direct"
              ? "border-emerald-500/40 bg-emerald-500/10"
              : gate.level === "conditional"
                ? "border-amber-500/40 bg-amber-500/10"
                : "border-destructive/50 bg-destructive/10"
          }`}
        >
          {gate.level === "not-comparable" ? (
            <ShieldX className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-hidden="true" />
          ) : (
            <ShieldCheck className={`mt-0.5 h-5 w-5 shrink-0 ${gate.level === "direct" ? "text-emerald-600" : "text-amber-600"}`} aria-hidden="true" />
          )}
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">
              Comparability gate:{" "}
              {gate.level === "direct"
                ? "conditions match — direct comparison defensible"
                : gate.level === "conditional"
                  ? "comparison possible WITH CAVEATS"
                  : "NOT directly comparable"}
            </p>
            {gate.reasons.length > 0 && (
              <ul className="mt-1.5 space-y-1 text-[11px] leading-snug text-muted-foreground">
                {gate.reasons.slice(0, 4).map((r, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span aria-hidden="true">·</span> {r}
                  </li>
                ))}
              </ul>
            )}
            {gate.requirements.length > 0 && (
              <p className="mt-1.5 text-[11px] italic text-muted-foreground">{gate.requirements[0]}</p>
            )}
            <p className="mt-1.5 font-mono text-[10px] text-muted-foreground/80">
              audit: gravity [{gate.dimensions[0].values.map((v) => `${v.accession}:${v.value}`).join(", ")}] · scale [{gate.dimensions[1].values.map((v) => v.value).join(", ")}] · outcome [{gate.dimensions[5]?.values.map((v) => v.value).join(", ") ?? "—"}]
            </p>
          </div>
        </div>
      )}

      {/* corpus-wide condition coverage (Task 3B) — visible in both empty and selected states */}
      <CrossExperimentCoverage />

      {/* selection bar */}
      <div className="glass-panel mb-5 flex flex-wrap items-center gap-2.5 rounded-xl p-3">
        <GitCompare className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
        <Select key={compareSelection.join(",")} onValueChange={addInvestigation}>
          <SelectTrigger
            size="sm"
            disabled={full || addable.length === 0}
            className="w-full text-xs sm:w-[280px]"
            aria-label="Add an investigation to the comparison"
          >
            <SelectValue placeholder={full ? `Max ${MAX_COMPARE} reached` : "Add investigation…"} />
          </SelectTrigger>
          <SelectContent>
            {addable.map((i) => (
              <SelectItem key={i.accession} value={i.accession} className="text-xs">
                <span className="font-mono text-[#8a4526]">{i.accession}</span> — {i.shortLabel}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {selected.map((inv) => (
          <span
            key={inv.accession}
            className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 py-1 pl-2.5 pr-1 text-xs"
          >
            <span className="shrink-0 font-mono text-primary">{inv.accession}</span>
            <span className="min-w-0 max-w-[130px] truncate text-muted-foreground">{inv.shortLabel}</span>
            <button
              onClick={() => removeInvestigation(inv.accession)}
              className="shrink-0 rounded-full p-1 text-muted-foreground transition-colors hover:bg-primary/20 hover:text-primary"
              aria-label={`Remove ${inv.accession} from comparison`}
            >
              <X className="h-3 w-3" />
            </button>
          </span>
        ))}

        {selected.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => {
              clearCompare();
              setNote(null);
            }}
          >
            Clear
          </Button>
        )}
        <span className="ml-auto shrink-0 text-xs text-muted-foreground" aria-live="polite">
          {selected.length} / {MAX_COMPARE}
        </span>
        {(note || full) && (
          <span className="w-full text-[11px] text-amber-300 sm:w-auto">
            {note ?? `Maximum ${MAX_COMPARE} investigations — remove one first.`}
          </span>
        )}
      </div>

      {/* empty state */}
      {selected.length === 0 ? (
        <div className="glass-panel rounded-xl p-6 sm:p-10">
          <h2 className="text-sm font-semibold">Nothing selected yet</h2>
          <p className="mt-1.5 max-w-2xl text-xs leading-relaxed text-muted-foreground">
            Add investigations above, or start from a curated comparison. Quick picks reference accessions in the
            recovered corpus: FLEX (PSI-69), CFI-G (PSI-159), the SAFFIRE flight series (PSI-98/99/100), SAME
            (PSI-102) and its reflight SAME-R (PSI-101).
          </p>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {QUICK_PICKS.map((p) => (
              <Button
                key={p.label}
                variant="outline"
                size="sm"
                className="h-9 justify-start text-xs"
                onClick={() => useAppStore.setState({ compareSelection: p.ids })}
              >
                <GitCompare className="h-3.5 w-3.5 text-primary" />
                {p.label}
              </Button>
            ))}
          </div>
          <p className="provenance-strip mt-4">
            Matrix cells recompute in-browser from recovered PSI records, the typed evidence graph and the
            equipment registry. Missing cells stay em-dash — never zero.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {/* condition matrix */}
          <section>
            <h2 className="mb-2 text-sm font-semibold">Condition matrix</h2>
            <div className="research-panel overflow-hidden rounded-xl">
              <div className="overflow-x-auto data-scroll">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border/60">
                      <th className="sticky left-0 z-10 w-[128px] bg-[#0a1638] px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Dimension
                      </th>
                      {selected.map((inv) => (
                        <th key={inv.accession} className="min-w-[180px] px-3 py-2.5 text-left align-top">
                          <button
                            onClick={() => openInvestigation(inv.accession)}
                            className="group text-left"
                            title={`Open ${inv.accession} workspace`}
                          >
                            <span className="inline-block rounded bg-[#be5f35]/15 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-[#eeb086] group-hover:bg-[#be5f35]/25">
                              {inv.accession}
                            </span>
                            <span className="mt-1 block font-semibold leading-tight text-[color:var(--research-foreground)] group-hover:underline">
                              {inv.shortLabel}
                            </span>
                          </button>
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {matrixRows.map((row) => (
                      <tr key={row.label} className="border-b border-border/30">
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-[#0a1638] px-3 py-2 text-left align-top text-[11px] font-medium text-foreground"
                        >
                          {row.label}
                        </th>
                        {selected.map((inv) => (
                          <td key={inv.accession} className="whitespace-normal px-3 py-2 align-top leading-snug">
                            {row.render(inv)}
                          </td>
                        ))}
                      </tr>
                    ))}
                    {warnings.length > 0 && (
                      <tr className="bg-amber-500/10">
                        <th
                          scope="row"
                          className="sticky left-0 z-10 bg-[color:var(--research)] px-3 py-2.5 text-left align-top text-[11px] font-semibold text-amber-700"
                        >
                          Comparability warnings
                        </th>
                        <td colSpan={selected.length} className="px-3 py-2.5">
                          <div className="flex flex-col gap-2">
                            {warnings.map((w, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-2 rounded-md border border-amber-500/40 bg-amber-500/10 px-2.5 py-1.5"
                              >
                                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-600" />
                                <div className="min-w-0">
                                  <div className="text-[11px] font-medium leading-snug text-amber-800">{w.text}</div>
                                  {w.support && (
                                    <div className="mt-0.5 text-[10px] leading-snug text-amber-700/80">
                                      From the records: {w.support}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <p className="provenance-strip mt-2">
              Conditions from NASA PSI investigation records · hardware from the PSI hardware metadata registry ·
              fuels from typed graph edges (studies_fuel) · recomputed in-browser.
            </p>
          </section>


          {/* graph slice */}
          <section>
            <h2 className="mb-2 text-sm font-semibold">Shared evidence graph</h2>
            <MiniGraph
              centerIds={selected.map((i) => i.accession)}
              title="Typed evidence slice — one hop around the whole selection"
            />
          </section>

          {/* gap discovery */}
          <section>
            <h2 className="mb-2 text-sm font-semibold">Gap discovery</h2>
            <p className="mb-2.5 max-w-3xl text-xs leading-relaxed text-muted-foreground">
              Union of documented gaps referencing the selected investigations. Statuses distinguish absent (data
              does not exist) / not-indexed (exists but not in our corpus) / inaccessible (exists, we cannot
              access) / no-evidence-found (searched, nothing found).
            </p>
            {unionGaps.length === 0 ? (
              <div className="glass-panel rounded-xl p-6 text-center text-sm text-muted-foreground">
                No documented gaps reference this selection directly.
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {unionGaps.map((g) => (
                  <div key={g.id} className="glass-panel flex flex-col rounded-xl p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="min-w-0 text-sm font-medium leading-snug">{g.topic}</h4>
                      <span
                        className={cn(
                          "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px]",
                          gapStatusStyle(g.status),
                        )}
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
                        {g.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-relaxed text-foreground/80">{g.detail}</p>
                    <div className="mt-auto flex flex-wrap items-center gap-2 pt-2.5">
                      <span className="font-mono text-[10px] text-muted-foreground">{g.specRef}</span>
                      {g.related.map((r) =>
                        getInvestigation(r) ? (
                          <button
                            key={r}
                            onClick={() => openInvestigation(r)}
                            className="rounded-full border border-border/60 px-2 py-0.5 font-mono text-[10px] text-primary hover:border-primary/50"
                          >
                            {r}
                          </button>
                        ) : (
                          <span
                            key={r}
                            className="rounded-full border border-border/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground/60"
                          >
                            {r}
                          </span>
                        ),
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* cross-study external verification — brief §10.3: search external sources before concluding a gap exists */}
            <div className="mt-3">
              <p className="mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Verify these gaps against the external literature (NASA NTRS, live) · save to your gap shelf
              </p>
              <GapExplorer />
            </div>
          </section>
        </div>
      )}
    </div>
  );
}

/* light-panel cell helpers */
function miss() {
  return (
    <span title="missing value" className="text-muted-foreground/60">
      {MISSING}
    </span>
  );
}

function val(v: string | null) {
  return v ? <span>{v}</span> : miss();
}
