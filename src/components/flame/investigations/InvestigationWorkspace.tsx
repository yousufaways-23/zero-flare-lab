"use client";

/**
 * InvestigationWorkspace — M4 evidence workspace for a single NASA PSI
 * investigation. Sticky subnav + tabs: Overview · Data (embedded Data Studio
 * over recovered tables) · Equipment · Media (authentic NASA imagery) ·
 * Equations (registry context) · Graph (MiniGraph slice) · Gaps.
 *
 * Honesty contract: every chart and data block carries provenance
 * (file + sha256 prefix + source note); missing values render as em-dash,
 * never zero; raw rows and technical detail are collapsed by default.
 */

import { useMemo, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ScatterChart,
  Scatter,
} from "recharts";
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  Copy,
  Database,
  ExternalLink,
  FlaskConical,
  GitCompare,
  ImageOff,
  Info,
  Search,
  Sparkles,
} from "lucide-react";
import { ChartsTab } from "@/components/flame/investigations/ExperimentCharts";
import { useAppStore, type InvestigationTab, type PillarId } from "@/lib/app-store";
import { SaveItemButton } from "@/components/flame/shell/SaveItemButton";
import { SourceFiguresGallery } from "@/components/flame/investigations/SourceFiguresGallery";
import { VideoShelf } from "@/components/flame/shell/VideoShelf";
import { GapExplorer } from "@/components/flame/gaps/GapExplorer";
import {
  getEquipmentForInvestigation,
  getGapsForInvestigation,
  getInvestigation,
  getTablesForInvestigation,
  searchMediaLocal,
  type DataTable,
  type Equipment,
  type Gap,
  type Investigation,
  type MediaItem,
  type TableColumn,
} from "@/lib/data/catalog";
import { EQUATIONS, EQUATION_CATEGORIES, type Equation, type EquationCategory } from "@/lib/science/equations";
import { cn } from "@/lib/utils";
import { MiniGraph } from "./MiniGraph";
import { CorrelationHeatmap } from "./CorrelationHeatmap";
import { ConditionComparison } from "./ConditionComparison";

/* ------------------------------------------------------------------ */
/* local helpers (kept local by design — only the four M4/M5 files exist) */
/* ------------------------------------------------------------------ */

const MISSING = "—";

function MissingValue() {
  return (
    <span title="missing value" className="text-muted-foreground">
      {MISSING}
    </span>
  );
}

function fmtNum(v: number | undefined | null): string {
  if (v === undefined || v === null || Number.isNaN(v)) return MISSING;
  if (v === 0) return "0";
  const a = Math.abs(v);
  if (a >= 1000) return v.toLocaleString("en-US", { maximumFractionDigits: 0 });
  if (a >= 100) return v.toFixed(1);
  if (a >= 1) return v.toFixed(2);
  if (a >= 0.01) return v.toFixed(3);
  return v.toExponential(2);
}

function fmtInt(v: number | null | undefined): string {
  if (v === undefined || v === null || Number.isNaN(v)) return MISSING;
  return v.toLocaleString("en-US");
}

function fmtBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / (1024 * 1024)).toFixed(1)} MB`;
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

/**
 * Investigation-scoped gaps. Refines getGapsForInvestigation to exact matches
 * or accession-scoped ids (e.g. PSI-69_FLEX), so PSI-10 never inherits the
 * PSI-100 SAFFIRE-III gap from the shared data layer's startsWith match.
 */
function strictGapsFor(acc: string): Gap[] {
  return getGapsForInvestigation(acc).filter((g) =>
    g.related.some((r) => r === acc || r.startsWith(`${acc}_`)),
  );
}

function piName(pi: Record<string, unknown> | null): string | null {
  if (!pi) return null;
  const first = typeof pi["First Name"] === "string" ? (pi["First Name"] as string).trim() : "";
  const middle = typeof pi["Middle Initials"] === "string" ? (pi["Middle Initials"] as string).trim() : "";
  const last = typeof pi["Last Name"] === "string" ? (pi["Last Name"] as string).trim() : "";
  const name = [first, middle, last].filter(Boolean).join(" ");
  return name.length > 0 ? name : null;
}

/** Authentic-media query derived from the investigation's program (per M4 spec). */
function mediaQueryFor(inv: Investigation): string {
  const t = `${inv.title} ${inv.shortLabel}`.toLowerCase();
  if (t.includes("flame extinguishment")) return "FLEX droplet combustion";
  if (t.includes("advanced combustion") || t.includes("flame design")) return "ACME combustion microgravity";
  if (t.includes("spacecraft fire") || t.includes("saffire")) return "SAFFIRE spacecraft fire";
  if (t.includes("smoke") && t.includes("aerosol")) return "smoke aerosol measurement ISS";
  if (t.includes("dust and aerosol")) return "smoke aerosol measurement ISS";
  if (t.includes("burning and suppression") || t.includes("bass")) return "BASS burning suppression solids";
  if (t.includes("smoke point")) return "SPICE smoke point";
  if (t.includes("structure and liftoff")) return "ISS microgravity combustion";
  return "microgravity combustion";
}

/** Two registry categories mapped to this investigation's known physics. */
function equationCategoriesFor(inv: Investigation): EquationCategory[] {
  const t = `${inv.title} ${inv.shortLabel}`.toLowerCase();
  const droplet = t.includes("flame extinguishment") || t.includes("cool flames investigation");
  const gaseous =
    t.includes("flame design") ||
    t.includes("advanced combustion") ||
    t.includes("counterflow") ||
    t.includes("structure and liftoff");
  const spread =
    t.includes("spacecraft fire") ||
    t.includes("saffire") ||
    t.includes("burning and suppression") ||
    t.includes("bass") ||
    t.includes("flame spread");
  const aerosol = t.includes("smoke") || t.includes("aerosol") || t.includes("dust");
  if (droplet) return ["droplet-combustion-and-extinction", "gas-and-mixture-laws"];
  if (gaseous) return ["stoichiometry-and-equivalence", "gas-and-mixture-laws"];
  if (spread) return ["flame-spread-and-propagation", "ignition-and-pyrolysis"];
  if (aerosol) return ["aerosol-and-particle-science", "sensor-response-and-statistics"];
  return ["gas-and-mixture-laws", "heat-transfer"];
}

function pillarForCategory(cat: EquationCategory): PillarId {
  switch (cat) {
    case "droplet-combustion-and-extinction":
      return "suppression";
    case "stoichiometry-and-equivalence":
    case "gas-and-mixture-laws":
    case "ignition-and-pyrolysis":
      return "prevention";
    case "flame-spread-and-propagation":
    case "heat-transfer":
      return "prediction";
    case "aerosol-and-particle-science":
    case "sensor-response-and-statistics":
      return "detection";
    default:
      return "prevention";
  }
}

/** Provenance footer inside light research panels (readable variant of provenance-strip). */
function ChartProvenance({ table }: { table: DataTable }) {
  return (
    <div className="mt-2 border-l-2 border-[color:var(--emission)] pl-2 text-[10px] leading-relaxed text-muted-foreground">
      {table.file} · sha256:{table.sha256.slice(0, 12)} · recovered from NASA PSI
    </div>
  );
}

const TABS: { id: InvestigationTab; label: string }[] = [
  { id: "overview", label: "Overview" },
  { id: "data", label: "Data" },
  { id: "charts", label: "Charts" },
  { id: "equipment", label: "Equipment" },
  { id: "media", label: "Media" },
  { id: "equations", label: "Equations" },
  { id: "graph", label: "Graph" },
  { id: "gaps", label: "Gaps" },
];

/* ------------------------------------------------------------------ */
/* workspace shell                                                     */
/* ------------------------------------------------------------------ */

export function InvestigationWorkspace({ accession }: { accession: string }) {
  const tab = useAppStore((s) => s.investigationTab);
  const setInvestigationTab = useAppStore((s) => s.setInvestigationTab);
  const toggleCompare = useAppStore((s) => s.toggleCompare);
  const setCopilotOpen = useAppStore((s) => s.setCopilotOpen);
  const setCopilotContext = useAppStore((s) => s.setCopilotContext);
  const inv = useMemo(() => getInvestigation(accession), [accession]);

  if (!inv) {
    return (
      <div className="glass-panel rounded-xl p-8 text-center text-sm text-muted-foreground">
        Investigation <span className="font-mono text-primary">{accession}</span> was not found in the recovered
        corpus.
      </div>
    );
  }

  const backToAtlas = () => useAppStore.setState({ selectedInvestigation: null, selectedTableId: null });
  const askCopilot = () => {
    setCopilotContext(`Investigation ${inv.accession}: ${inv.title}`);
    setCopilotOpen(true);
  };

  return (
    <div className="min-w-0">
      {/* sticky subnav — offsets below the 56px MegaNav (94px with mobile nav row) */}
      <div className="sticky-subnav -mx-3 mb-4 top-[94px] md:top-14 sm:-mx-6">
        <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1.5 px-3 py-2 sm:px-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={backToAtlas}
            className="h-8 gap-1 px-2 text-xs text-muted-foreground hover:text-foreground"
            aria-label="Back to the investigation atlas"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Atlas</span>
          </Button>
          <span className="shrink-0 font-mono text-sm font-semibold text-primary">{inv.accession}</span>
          <span className="min-w-0 truncate text-sm font-semibold">{inv.shortLabel}</span>
          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            <SaveItemButton
              kind="investigation"
              label={`${inv.accession} · ${inv.shortLabel}`}
              detail={inv.title ?? undefined}
              url={`#investigation/${inv.accession}`}
              className="h-8"
            />
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-xs"
              onClick={() => toggleCompare(inv.accession)}
              title="Add this investigation to the cross-study comparison"
            >
              <GitCompare className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Compare</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 px-2.5 text-xs"
              onClick={askCopilot}
              title="Ask the Research Copilot about this investigation"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Ask Copilot</span>
            </Button>
          </div>
        </div>
        <div className="flex gap-1 overflow-x-auto px-3 pb-2 data-scroll sm:px-6" role="tablist" aria-label="Investigation sections">
          {TABS.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setInvestigationTab(t.id)}
              className={cn(
                "shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                tab === t.id
                  ? "border-primary/60 bg-primary/15 text-primary"
                  : "border-border/50 text-muted-foreground hover:text-foreground",
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {tab === "overview" && <OverviewTab inv={inv} />}
      {tab === "data" && <DataStudioTab inv={inv} />}
      {tab === "charts" && <ChartsTab accession={inv.accession} />}
      {tab === "equipment" && <EquipmentTab accession={inv.accession} />}
      {tab === "media" && <MediaTab inv={inv} />}
      {tab === "equations" && <EquationsTab inv={inv} />}
      {tab === "graph" && (
        <section className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">
            Evidence graph — <span className="font-mono text-primary">{inv.accession}</span> one-hop slice
          </h2>
          <MiniGraph centerIds={[inv.accession]} title={`Typed evidence slice centered on ${inv.shortLabel}`} />
        </section>
      )}
      {tab === "gaps" && <GapsTab inv={inv} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Overview tab                                                         */
/* ------------------------------------------------------------------ */

function OverviewTab({ inv }: { inv: Investigation }) {
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  const sections = [
    { id: "objectives", label: "Objectives", text: inv.objectives },
    { id: "approach", label: "Approach", text: inv.approach },
    { id: "hypothesis", label: "Hypothesis", text: inv.hypothesis },
    { id: "impacts", label: "Impacts", text: inv.impacts },
  ];

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      {/* NASA narrative */}
      <Accordion type="single" collapsible defaultValue="objectives" className="glass-panel rounded-xl px-4">
        {sections.map((s) => (
          <AccordionItem key={s.id} value={s.id}>
            <AccordionTrigger className="py-3 text-sm font-semibold">{s.label}</AccordionTrigger>
            <AccordionContent>
              {s.text ? (
                <p className="pb-2 text-sm leading-relaxed text-foreground/85">{s.text}</p>
              ) : (
                <p className="pb-2 text-sm text-muted-foreground">
                  Not recorded in PSI metadata. <MissingValue />
                </p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      <div className="flex min-w-0 flex-col gap-4">
        {/* record metadata */}
        <div className="glass-panel rounded-xl p-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Record metadata</h3>
          <dl className="mt-3 grid grid-cols-1 gap-x-5 gap-y-2.5 text-xs sm:grid-cols-2">
            <MetaItem label="Research area" value={inv.researchArea} />
            <MetaItem label="Sub-research" value={inv.subResearchArea} />
            <MetaItem label="Project type" value={inv.projectType} />
            <MetaItem label="Flight platform" value={inv.flightPlatform} />
            <MetaItem label="Monitoring center" value={inv.monitoringCenter} />
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Start – End</dt>
              <dd className="mt-0.5 font-mono text-foreground/90">
                {inv.startDate ?? MISSING} → {inv.endDate ?? MISSING}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Principal investigator(s)</dt>
              <dd className="mt-0.5 leading-snug text-foreground/90">{piName(inv.pi) ?? <MissingValue />}</dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">DOI</dt>
              <dd className="mt-0.5">
                {inv.doi ? (
                  <a
                    href={`https://doi.org/${inv.doi}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                  >
                    {inv.doi} <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <MissingValue />
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">PSI record</dt>
              <dd className="mt-0.5">
                {inv.sourceUrl ? (
                  <a
                    href={inv.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 break-all text-primary hover:underline"
                  >
                    psi.nasa.gov <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                ) : (
                  <MissingValue />
                )}
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Recovered evidence</dt>
              <dd className="mt-0.5 font-mono text-foreground/90">
                {inv.tableIds.length} tables · {fmtInt(inv.tableRows)} rows · {fmtInt(inv.tableColumns)} columns
              </dd>
            </div>
            <div>
              <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">Duplicate rows</dt>
              <dd className={cn("mt-0.5 font-mono", inv.duplicateRows > 0 ? "text-amber-300" : "text-foreground/90")}>
                {fmtInt(inv.duplicateRows)}
              </dd>
            </div>
          </dl>

          {inv.related.length > 0 && (
            <div className="mt-4 border-t border-border/40 pt-3">
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Related investigations</div>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {inv.related.map((r) => {
                  const exists = !!getInvestigation(r);
                  return exists ? (
                    <button
                      key={r}
                      onClick={() => openInvestigation(r)}
                      className="rounded-full border border-border/60 bg-accent/30 px-2.5 py-1 font-mono text-[11px] text-primary transition-colors hover:border-primary/50"
                    >
                      {r}
                    </button>
                  ) : (
                    <span
                      key={r}
                      title="not in the recovered corpus"
                      className="rounded-full border border-border/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground/60"
                    >
                      {r}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* integrity cases */}
        {inv.integrityCases.length > 0 && (
          <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4">
            <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-amber-300">
              <AlertTriangle className="h-3.5 w-3.5" /> Integrity cases
            </h3>
            <div className="mt-2.5 flex flex-col gap-2.5">
              {inv.integrityCases.map((c) => (
                <div key={c.case}>
                  <div className="font-mono text-[11px] text-amber-200">{c.case}</div>
                  <p className="mt-0.5 text-xs leading-relaxed text-foreground/80">{c.issue}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* keywords */}
        {inv.keywords.length > 0 && (
          <div className="glass-panel rounded-xl p-4">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Keywords</h3>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {inv.keywords.map((k) => (
                <span
                  key={k}
                  className="rounded-full border border-border/50 px-2 py-0.5 text-[11px] text-muted-foreground"
                >
                  {k}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function MetaItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 leading-snug text-foreground/90">{value ?? <MissingValue />}</dd>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Data tab — embedded Data Studio                                      */
/* ------------------------------------------------------------------ */

function DataStudioTab({ inv }: { inv: Investigation }) {
  const tables = useMemo(() => getTablesForInvestigation(inv.accession), [inv.accession]);
  const selectedTableId = useAppStore((s) => s.selectedTableId);
  const selectTable = useAppStore((s) => s.selectTable);
  const setView = useAppStore((s) => s.setView);

  if (tables.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6 text-center">
        <Database className="mx-auto h-6 w-6 text-muted-foreground" />
        <p className="mt-2 text-sm text-muted-foreground">
          No recovered data tables reference this investigation in this environment. Missing data stays missing —
          see Ingestion &amp; Sources for the recovery ledger.
        </p>
        <Button variant="outline" size="sm" className="mt-3" onClick={() => setView("data-sources")}>
          Open Data &amp; Sources
        </Button>
      </div>
    );
  }

  const active = tables.find((t) => t.id === selectedTableId) ?? tables[0];

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {tables.length > 1 && (
        <div className="glass-panel flex flex-wrap items-center gap-3 rounded-xl p-3">
          <span className="text-xs text-muted-foreground">Recovered table</span>
          <Select value={active.id} onValueChange={(v) => selectTable(v)}>
            <SelectTrigger size="sm" className="w-full font-mono text-xs sm:w-[380px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {tables.map((t) => (
                <SelectItem key={t.id} value={t.id} className="font-mono text-xs">
                  {t.label} — {t.file} ({fmtInt(t.rowCount)} rows)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <QualityStrip table={active} />
      <ColumnProfiles table={active} />
      <TableCharts key={active.id} table={active} />
      <ConditionComparison key={`cc-${active.id}`} table={active} />
      <CorrelationHeatmap initialTableId={active.id} />
      <RawRows table={active} />
    </div>
  );
}

function QualityStrip({ table }: { table: DataTable }) {
  const [copied, setCopied] = useState(false);
  const parseFailures = table.columns.reduce((a, c) => a + (c.parseFailures ?? 0), 0);

  const copySha = async () => {
    try {
      await navigator.clipboard.writeText(table.sha256);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* clipboard unavailable — sha256 remains visible for manual copy */
    }
  };

  return (
    <div className="glass-panel rounded-xl px-4 py-3">
      <div className="flex flex-wrap items-center gap-x-7 gap-y-3">
        <Stat label="Rows" value={fmtInt(table.rowCount)} />
        <Stat label="Columns" value={fmtInt(table.columnCount)} />
        <Stat label="Duplicate rows" value={fmtInt(table.duplicateRows)} warn={table.duplicateRows > 0} />
        <Stat label="Parse failures" value={fmtInt(parseFailures)} warn={parseFailures > 0} />
        <Stat label="File size" value={fmtBytes(table.bytes)} />
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground">SHA-256</div>
          <div className="mt-0.5 flex items-center gap-1.5">
            <code className="font-mono text-xs text-foreground/90">{table.sha256.slice(0, 12)}</code>
            <button
              onClick={copySha}
              className="rounded p-1 text-muted-foreground transition-colors hover:text-primary"
              aria-label="Copy full SHA-256 digest"
              title="Copy full SHA-256 digest"
            >
              {copied ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>
        <div className="ml-auto min-w-0">
          <div className="truncate font-mono text-[10px] text-muted-foreground" title={table.file}>
            {table.file}
          </div>
          <div className="text-[10px] text-muted-foreground">{table.source}</div>
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, warn }: { label: string; value: string; warn?: boolean }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-mono text-sm", warn ? "font-semibold text-amber-300" : "text-foreground/90")}>
        {value}
      </div>
    </div>
  );
}

function ColumnProfiles({ table }: { table: DataTable }) {
  return (
    <section>
      <h3 className="mb-2 text-sm font-semibold">Column profiles</h3>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {table.columns.map((c) => (
          <ColumnProfileCard key={c.index} col={c} />
        ))}
      </div>
    </section>
  );
}

function ColumnProfileCard({ col }: { col: TableColumn }) {
  return (
    <div className="research-panel flex flex-col rounded-lg p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="truncate text-xs font-semibold" title={col.name}>
            {col.name}
          </div>
          <div className="truncate font-mono text-[10px] text-muted-foreground" title={col.rawHeader}>
            col #{col.index + 1}
          </div>
        </div>
        <div className="flex shrink-0 flex-wrap justify-end gap-1">
          {col.unit && (
            <Badge variant="outline" className="px-1.5 py-0 text-[10px] font-mono">
              {col.unit}
            </Badge>
          )}
          <Badge
            variant="outline"
            className={cn(
              "px-1.5 py-0 text-[10px]",
              col.type === "numeric" ? "border-[#5799d1]/50 text-[#3d6ea0]" : "text-muted-foreground",
            )}
          >
            {col.type}
          </Badge>
        </div>
      </div>

      <div className="mt-2.5 flex items-center gap-2">
        <Progress value={Math.round(col.fillRate * 100)} className="h-1.5" aria-label={`Fill rate ${Math.round(col.fillRate * 100)}%`} />
        <span className="w-9 shrink-0 text-right font-mono text-[10px] text-muted-foreground">
          {Math.round(col.fillRate * 100)}%
        </span>
      </div>

      {col.type === "numeric" ? (
        <dl className="mt-2.5 grid grid-cols-2 gap-x-3 gap-y-1 font-mono text-[10px]">
          <div className="flex justify-between gap-1">
            <dt className="text-muted-foreground">min</dt>
            <dd>{fmtNum(col.min)}</dd>
          </div>
          <div className="flex justify-between gap-1">
            <dt className="text-muted-foreground">max</dt>
            <dd>{fmtNum(col.max)}</dd>
          </div>
          <div className="flex justify-between gap-1">
            <dt className="text-muted-foreground">mean</dt>
            <dd>{fmtNum(col.mean)}</dd>
          </div>
          <div className="flex justify-between gap-1">
            <dt className="text-muted-foreground">median</dt>
            <dd>{fmtNum(col.median)}</dd>
          </div>
        </dl>
      ) : (
        <div className="mt-2.5 flex flex-col gap-1">
          {(col.topValues ?? []).slice(0, 3).map((tv) => (
            <div key={tv.value} className="flex items-center justify-between gap-2 text-[10px]">
              <span className="truncate font-mono" title={tv.value}>
                {tv.value}
              </span>
              <span className="shrink-0 text-muted-foreground">×{fmtInt(tv.count)}</span>
            </div>
          ))}
          {(col.topValues ?? []).length === 0 && (
            <span className="text-[10px] text-muted-foreground">
              No top values recorded. <MissingValue />
            </span>
          )}
        </div>
      )}

      {(col.parseFailures ?? 0) > 0 && (
        <div className="mt-2 flex items-center gap-1 text-[10px] text-amber-600">
          <AlertTriangle className="h-3 w-3" />
          {fmtInt(col.parseFailures)} parse failures
        </div>
      )}
    </div>
  );
}

/** Charts for one table — keyed by table id so selections reset per table. */
function TableCharts({ table }: { table: DataTable }) {
  const numericCols = table.columns.filter((c) => c.type === "numeric");
  const histCols = numericCols.filter((c) => c.histogram);

  return (
    <section className="flex flex-col gap-4">
      <h3 className="text-sm font-semibold">Distributions &amp; relationships</h3>

      {histCols.length === 0 ? (
        <div className="glass-panel rounded-xl p-4 text-xs text-muted-foreground">
          No numeric columns with distribution profiles in this table
          {numericCols.length === 0 ? " (categorical-only table)" : ""} — histograms stay unrendered rather than
          guessed.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {histCols.slice(0, 2).map((c, i) => (
            <HistogramCard
              key={c.name}
              table={table}
              cols={histCols}
              initial={c.name}
              color={i === 0 ? "#be5f35" : "#5799d1"}
            />
          ))}
        </div>
      )}

      {numericCols.length >= 2 ? (
        <ScatterCard table={table} cols={numericCols} />
      ) : (
        <div className="glass-panel rounded-xl p-4 text-xs text-muted-foreground">
          Fewer than two numeric columns — no XY exploration possible for this table.
        </div>
      )}
    </section>
  );
}

function HistogramCard({
  table,
  cols,
  initial,
  color,
}: {
  table: DataTable;
  cols: TableColumn[];
  initial: string;
  color: string;
}) {
  const [name, setName] = useState(initial);
  const col = cols.find((c) => c.name === name) ?? cols[0];
  const bins = useMemo(() => {
    const h = col?.histogram;
    if (!h) return [];
    return h.binStart.map((s, i) => ({
      label: `${fmtNum(s)}–${fmtNum(h.binEnd[i])}`,
      count: h.counts[i],
    }));
  }, [col]);

  if (!col) return null;

  return (
    <div className="research-panel rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate text-xs font-semibold" title={col.name}>
            Distribution — {col.name}
          </h4>
          {col.unit && <div className="font-mono text-[10px] text-muted-foreground">unit: {col.unit}</div>}
        </div>
        <Select value={col.name} onValueChange={setName}>
          <SelectTrigger size="sm" className="w-full max-w-[220px] text-xs sm:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {cols.map((c) => (
              <SelectItem key={c.name} value={c.name} className="text-xs">
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="mt-3">
        <ResponsiveContainer width="100%" height={210}>
          <BarChart data={bins} margin={{ top: 6, right: 6, bottom: 0, left: -14 }}>
            <CartesianGrid stroke="#e2e6ee" strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              interval={bins.length > 14 ? 1 : 0}
              angle={-28}
              textAnchor="end"
              height={52}
              tick={{ fontSize: 9, fill: "#4a5568" }}
              stroke="#9aa4b2"
            />
            <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: "#4a5568" }} stroke="#9aa4b2" />
            <Tooltip
              contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid #e2e6ee" }}
              cursor={{ fill: "rgba(0,0,0,0.04)" }}
            />
            <Bar dataKey="count" name="rows" fill={color} radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <ChartProvenance table={table} />
    </div>
  );
}

function ScatterCard({ table, cols }: { table: DataTable; cols: TableColumn[] }) {
  const [xName, setXName] = useState(cols[0]?.name ?? "");
  const [yName, setYName] = useState(cols[1]?.name ?? "");
  const xc = cols.find((c) => c.name === xName) ?? cols[0];
  const yc = cols.find((c) => c.name === yName) ?? cols[1] ?? cols[0];

  const points = useMemo(() => {
    if (!xc || !yc) return [];
    const out: { x: number; y: number }[] = [];
    for (const r of table.rows) {
      const rx = r[xc.index];
      const ry = r[yc.index];
      if (rx === undefined || ry === undefined || rx.trim() === "" || ry.trim() === "") continue;
      const x = Number(rx);
      const y = Number(ry);
      if (Number.isFinite(x) && Number.isFinite(y)) out.push({ x, y });
    }
    return out;
  }, [table, xc, yc]);

  if (!xc || !yc) return null;

  return (
    <div className="research-panel rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-xs font-semibold">XY exploration — {xc.name} vs {yc.name}</h4>
        <div className="flex w-full flex-wrap gap-2 sm:w-auto">
          <Select value={xc.name} onValueChange={setXName}>
            <SelectTrigger size="sm" className="w-full max-w-[200px] text-xs sm:w-[170px]" aria-label="X axis column">
              <span className="text-muted-foreground">X:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cols.map((c) => (
                <SelectItem key={c.name} value={c.name} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={yc.name} onValueChange={setYName}>
            <SelectTrigger size="sm" className="w-full max-w-[200px] text-xs sm:w-[170px]" aria-label="Y axis column">
              <span className="text-muted-foreground">Y:</span>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {cols.map((c) => (
                <SelectItem key={c.name} value={c.name} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mt-3">
        <ResponsiveContainer width="100%" height={250}>
          <ScatterChart margin={{ top: 8, right: 10, bottom: 4, left: -10 }}>
            <CartesianGrid stroke="#e2e6ee" strokeDasharray="3 3" />
            <XAxis
              type="number"
              dataKey="x"
              name={xc.name}
              tick={{ fontSize: 10, fill: "#4a5568" }}
              stroke="#9aa4b2"
            />
            <YAxis
              type="number"
              dataKey="y"
              name={yc.name}
              tick={{ fontSize: 10, fill: "#4a5568" }}
              stroke="#9aa4b2"
            />
            <Tooltip
              cursor={{ strokeDasharray: "3 3" }}
              contentStyle={{ borderRadius: 8, fontSize: 11, border: "1px solid #e2e6ee" }}
            />
            <Scatter data={points} fill="#be5f35" fillOpacity={0.6} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-1 text-[10px] text-muted-foreground">
        {fmtInt(points.length)} of {fmtInt(table.rowCount)} rows have both columns parsing to numbers —
        non-numeric and empty cells are excluded, never zero-filled.
      </div>
      <ChartProvenance table={table} />
    </div>
  );
}

function RawRows({ table }: { table: DataTable }) {
  const [open, setOpen] = useState(false);
  const shown = table.rows.slice(0, 100);
  const shortHeader = (n: string) => (n.length > 14 ? `${n.slice(0, 13)}…` : n);

  return (
    <Collapsible open={open} onOpenChange={setOpen}>
      <div className="research-panel overflow-hidden rounded-xl">
        <CollapsibleTrigger asChild>
          <button className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm font-medium">
            <span>
              Raw rows ({fmtInt(table.rowCount)}
              {table.rowCount > 100 ? " — first 100 shown" : ""})
            </span>
            <ChevronDown className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")} />
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="max-h-96 overflow-auto data-scroll border-t border-border/40">
            <table className="w-full border-collapse font-mono text-xs">
              <thead>
                <tr>
                  {table.columns.map((c) => (
                    <th
                      key={c.index}
                      title={c.name}
                      className="sticky top-0 z-10 whitespace-nowrap border-b border-border/40 bg-[#0a1638] px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground"
                    >
                      {shortHeader(c.name)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {shown.map((row, ri) => (
                  <tr key={ri} className="border-b border-border/25 odd:bg-white/[0.03]">
                    {table.columns.map((c) => {
                      const v = row[c.index];
                      return (
                        <td key={c.index} className="max-w-[220px] truncate whitespace-nowrap px-2 py-1.5">
                          {v === undefined || v === null || v.trim() === "" ? <MissingValue /> : v}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

/* ------------------------------------------------------------------ */
/* Equipment tab                                                        */
/* ------------------------------------------------------------------ */

function EquipmentTab({ accession }: { accession: string }) {
  const setView = useAppStore((s) => s.setView);
  const equipment = useMemo(() => getEquipmentForInvestigation(accession), [accession]);

  if (equipment.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-6 text-center text-sm text-muted-foreground">
        No equipment records reference this investigation.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {equipment.map((eq) => (
        <EquipmentCard key={eq.id} eq={eq} onOpen3d={() => setView("lab3d")} />
      ))}
    </div>
  );
}

function EquipmentCard({ eq, onOpen3d }: { eq: Equipment; onOpen3d: () => void }) {
  return (
    <div className="glass-panel flex flex-col rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold leading-tight">{eq.name}</h4>
          <div className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">{eq.type}</div>
        </div>
        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] text-amber-300" title={eq.fidelityNote}>
          {eq.fidelity}
        </Badge>
      </div>
      <p className="mt-2.5 text-xs leading-relaxed text-foreground/80">{eq.description}</p>
      <p className="mt-2 text-[10px] leading-snug text-muted-foreground" title={eq.fidelityNote}>
        {eq.fidelityNote}
      </p>
      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <a
          href={eq.sourceLink}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-w-0 items-center gap-1 text-[11px] text-primary hover:underline"
          title={eq.sourceNote}
        >
          <ExternalLink className="h-3 w-3 shrink-0" />
          <span className="truncate">Source record</span>
        </a>
        <Button variant="outline" size="sm" className="h-7 shrink-0 px-2.5 text-xs" onClick={onOpen3d}>
          Open in 3D Lab
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Media tab — authentic NASA imagery                                   */
/* ------------------------------------------------------------------ */

function MediaTab({ inv }: { inv: Investigation }) {
  const setView = useAppStore((s) => s.setView);
  const [lightbox, setLightbox] = useState<MediaItem | null>(null);
  const query = mediaQueryFor(inv);
  const results = useMemo(() => searchMediaLocal(query, 12), [query]);
  const fallback = useMemo(() => searchMediaLocal("microgravity combustion", 12), []);
  const items = results.length > 0 ? results : fallback;

  return (
    <div className="flex flex-col gap-3">
      <div className="glass-panel rounded-xl p-4">
        <h3 className="text-sm font-semibold">Authentic NASA media</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Authentic NASA imagery via the NASA Images and Video Library (credit: NASA). The 2,393 historical
          research media binaries from earlier ingestion batches are not recovered in this environment —{" "}
          <button onClick={() => setView("data-sources")} className="text-primary hover:underline">
            see Data &amp; Sources
          </button>
          .
        </p>
        <div className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Search className="h-3 w-3" />
          Local index search: <span className="font-mono">“{results.length > 0 ? query : "microgravity combustion"}”</span>
          {" "}· {fmtInt(items.length)} authentic items
          {results.length === 0 && <span className="text-amber-300">(no local match for “{query}” — general set shown)</span>}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="glass-panel rounded-xl p-6 text-center text-sm text-muted-foreground">
          <ImageOff className="mx-auto h-6 w-6" />
          No media items available.
        </div>
      ) : (
        <div className="columns-2 gap-3 md:columns-3">
          {items.map((m) => (
            <figure
              key={m.nasa_id}
              className="research-panel mb-3 break-inside-avoid overflow-hidden rounded-lg"
            >
              <button
                className="block w-full cursor-zoom-in"
                onClick={() => setLightbox(m)}
                aria-label={`Open image: ${m.title}`}
              >
                <img
                  src={m.thumb}
                  alt={m.title}
                  loading="lazy"
                  className="w-full bg-white/5 object-cover transition-opacity hover:opacity-90"
                />
              </button>
              <figcaption className="p-2.5 text-left">
                <div className="line-clamp-1 text-xs font-medium" title={m.title}>
                  {m.title}
                </div>
                <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                  <span className="shrink-0">
                    {m.center} · {m.date_created?.slice(0, 10) ?? MISSING}
                  </span>
                  <span className="truncate font-mono">NASA · {m.nasa_id}</span>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      )}

      <Dialog open={!!lightbox} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-h-[90vh] max-w-3xl overflow-hidden border-border/60 bg-[color:var(--space-panel)] p-0">
          {lightbox && (
            <>
              <img
                src={lightbox.full}
                alt={lightbox.title}
                className="max-h-[62vh] w-full bg-black/40 object-contain"
              />
              <div className="max-h-[24vh] overflow-y-auto p-4">
                <DialogTitle className="text-left text-sm leading-snug">{lightbox.title}</DialogTitle>
                <DialogDescription className="mt-1.5 text-left text-xs leading-relaxed">
                  {lightbox.description || "No description recorded."}
                </DialogDescription>
                <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] text-muted-foreground">
                  <span className="font-mono">NASA · {lightbox.nasa_id}</span>
                  <span>{lightbox.center}</span>
                  <span>{lightbox.date_created?.slice(0, 10) ?? MISSING}</span>
                  <span className="provenance-strip">{lightbox.provenance}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* figures extracted from the original NASA source documents (§2) */}
      <SourceFiguresGallery accession={inv.accession} />

      {/* curated research videos (oEmbed-verified, honest source labels) */}
      <VideoShelf context="investigation" accession={inv.accession} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Equations tab — registry context                                     */
/* ------------------------------------------------------------------ */

function EquationsTab({ inv }: { inv: Investigation }) {
  const setScenarioPillar = useAppStore((s) => s.setScenarioPillar);
  const setView = useAppStore((s) => s.setView);
  const cats = equationCategoriesFor(inv);
  const catLabels = EQUATION_CATEGORIES.filter((c) => cats.includes(c.id));
  const eqs = EQUATIONS.filter((e) => cats.includes(e.category));

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="glass-panel rounded-xl p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <FlaskConical className="h-4 w-4 text-primary" /> Equation context — {inv.shortLabel}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Verified equations from the registry mapped to this investigation&apos;s physics:{" "}
          {catLabels.map((l) => l.label).join(" + ")}. {fmtInt(eqs.length)} equations shown — every card carries
          its source citation, and &quot;Use in Scenarios&quot; drops you into the matching fire-safety pillar with
          the calculators.
        </p>
      </div>

      {catLabels.map((cat) => {
        const list = eqs.filter((e) => e.category === cat.id);
        return (
          <section key={cat.id} className="min-w-0">
            <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {cat.label} <span className="font-mono normal-case text-muted-foreground/70">({list.length})</span>
            </h4>
            <div className="grid gap-3 md:grid-cols-2">
              {list.map((e) => (
                <EquationCard
                  key={e.id}
                  eq={e}
                  onUse={() => {
                    setScenarioPillar(pillarForCategory(e.category));
                    setView("scenarios");
                  }}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function EquationCard({ eq, onUse }: { eq: Equation; onUse: () => void }) {
  return (
    <div className="glass-panel flex flex-col rounded-lg p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 text-sm font-medium leading-snug">{eq.name}</div>
        <Badge variant="outline" className="shrink-0 px-1.5 py-0 text-[10px] text-primary">
          {eq.status}
        </Badge>
      </div>
      <code className="mt-1.5 break-words font-mono text-xs text-[color:var(--hotcore)]">{eq.statement}</code>
      <div className="mt-1.5 text-xs text-muted-foreground">
        Output: {eq.outputLabel} ({eq.outputUnit})
      </div>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{eq.summary}</p>
      <div className="mt-auto flex items-end justify-between gap-3 pt-2.5">
        <span className="provenance-strip min-w-0" title={eq.source}>
          {eq.source}
        </span>
        <Button
          variant="outline"
          size="sm"
          className="h-7 shrink-0 px-2.5 text-[11px]"
          onClick={onUse}
          title="Open the Scenarios view on the matching fire-safety pillar"
        >
          Use in Scenarios
        </Button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Gaps tab                                                             */
/* ------------------------------------------------------------------ */

function GapsTab({ inv }: { inv: Investigation }) {
  const setView = useAppStore((s) => s.setView);
  const gaps = useMemo(() => strictGapsFor(inv.accession), [inv.accession]);
  const hasContent = gaps.length > 0 || inv.integrityCases.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <div className="glass-panel rounded-xl p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Info className="h-4 w-4 text-primary" /> Documented gaps — {inv.accession}
        </h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Statuses distinguish absent (data does not exist) / not-indexed (exists but not in our corpus) /
          inaccessible (exists, we cannot access) / no-evidence-found (searched, nothing found).
        </p>
      </div>

      {!hasContent ? (
        <div className="glass-panel rounded-xl p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No investigation-specific gaps recorded; see the global gap registry.
          </p>
          <Button variant="outline" size="sm" className="mt-3" onClick={() => setView("data-sources")}>
            Open Data &amp; Sources
          </Button>
        </div>
      ) : (
        <>
          {gaps.length > 0 && (
            <div className="grid gap-3 md:grid-cols-2">
              {gaps.map((g) => (
                <GapCard key={g.id} gap={g} />
              ))}
            </div>
          )}

          {inv.integrityCases.length > 0 && (
            <section>
              <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Integrity cases — these are gap evidence
              </h4>
              <div className="grid gap-3 md:grid-cols-2">
                {inv.integrityCases.map((c) => (
                  <div key={c.case} className="rounded-xl border border-amber-500/35 bg-amber-500/10 p-4">
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-amber-300">
                      <AlertTriangle className="h-3.5 w-3.5" /> {c.case}
                    </div>
                    <p className="mt-1.5 text-xs leading-relaxed text-foreground/80">{c.issue}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}

      {/* External research verification + save shelf (brief §10: a local gap is not a field-wide gap) */}
      <section>
        <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          External research check — verify gaps against NASA NTRS (live)
        </h4>
        <GapExplorer scopedAccession={inv.accession} />
      </section>
    </div>
  );
}

function GapCard({ gap }: { gap: Gap }) {
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  return (
    <div className="glass-panel flex flex-col rounded-xl p-4">
      <div className="flex items-start justify-between gap-2">
        <h4 className="min-w-0 text-sm font-medium leading-snug">{gap.topic}</h4>
        <span
          className={cn(
            "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2 py-0.5 text-[10px]",
            gapStatusStyle(gap.status),
          )}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-current" aria-hidden="true" />
          {gap.status}
        </span>
      </div>
      <p className="mt-2 text-xs leading-relaxed text-foreground/80">{gap.detail}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2.5">
        <SaveItemButton kind="gap" label={gap.topic} detail={gap.detail} url="#investigations" />
        <span className="font-mono text-[10px] text-muted-foreground">{gap.specRef}</span>
        {gap.related.map((r) =>
          getInvestigation(r) ? (
            <button
              key={r}
              onClick={() => openInvestigation(r)}
              className="rounded-full border border-border/60 px-2 py-0.5 font-mono text-[10px] text-primary hover:border-primary/50"
            >
              {r}
            </button>
          ) : (
            <span key={r} className="rounded-full border border-border/40 px-2 py-0.5 font-mono text-[10px] text-muted-foreground/60">
              {r}
            </span>
          ),
        )}
      </div>
    </div>
  );
}
