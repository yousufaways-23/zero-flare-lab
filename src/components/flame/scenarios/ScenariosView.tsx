"use client";

// FLAME EVIDENCE LAB — Scenarios (M10): the unified fire-safety lifecycle.
// Prevention → Detection → Prediction → Suppression over ONE shared scenario
// context (environment), with the guarded model playground, the verified
// equation registry calculators and the saved Research Session Shelf.

import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Shield, Radar, Flame, Droplets, ArrowRight, Save, Trash2, RotateCcw, ChevronRight,
  TriangleAlert, Info, Sigma, Search, Play, Ban, Layers,
} from "lucide-react";
import { useAppStore, type PillarId, type EnvId, type ResearchSession } from "@/lib/app-store";
import { FacilityScreening } from "@/components/flame/scenarios/FacilityScreening";
import { FireSafetyAssistant } from "@/components/flame/scenarios/FireSafetyAssistant";
import { FacilityAnalysisPanel } from "@/components/flame/scenarios/FacilityAnalysisPanel";
import {
  getAtmospheres, getEnvironment, getInvestigations, getGaps, getTable, searchMediaLocal,
  type AtmosphereEnv, type Investigation, type Gap,
} from "@/lib/data/catalog";
import {
  getEquation, runCalculation, FUEL_PROPERTIES, getEquationRegistryCount,
  type Equation, type EquationVariable, type CalculationResult,
} from "@/lib/science/equations";
import {
  runFlexModel, runCfigModel, getFlexCard, getCfigCard, getSpiceCard,
  type FlexPrediction,
} from "@/lib/science/models";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Slider } from "@/components/ui/slider";
import { TeX } from "@/components/ui/tex";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// pillar metadata
// ---------------------------------------------------------------------------

const PILLARS: { id: PillarId; label: string; desc: string; icon: typeof Shield }[] = [
  { id: "prevention", label: "Prevention", desc: "Flammability, ignition & atmosphere — keep the fire from starting", icon: Shield },
  { id: "detection", label: "Detection", desc: "Smoke, aerosols & sensor response — see it early", icon: Radar },
  { id: "prediction", label: "Prediction", desc: "Guarded models — never scored out of domain", icon: Flame },
  { id: "suppression", label: "Suppression", desc: "Extinction, diluents & droplet physics — put it out", icon: Droplets },
];

const PREVENTION_EQ_IDS = ["p-o2-kpa", "stoich-o2-hydrocarbon", "equivalence-ratio", "le-chatelier-lfl", "critical-heat-flux", "ignition-time-thick", "thermal-inertia"];
const DETECTION_EQ_IDS = ["first-order-response", "stokes-settling", "cunningham-correction", "lognormal-mmd"];
const SUPPRESSION_EQ_IDS = ["spalding-b-number", "d2-law", "burning-rate-constant", "droplet-lifetime"];

const PREVENTION_PRIORITY = ["PSI-10", "PSI-159", "PSI-20"];
const DETECTION_PRIORITY = ["PSI-101", "PSI-102", "PSI-47", "PSI-107"];
const SUPPRESSION_PRIORITY = ["PSI-69", "PSI-39", "PSI-68", "PSI-159"];

const PSI_TO_MMHG = 51.7149323; // 760 mmHg / 14.6959 psi (standard atmosphere)
const G0_MS2 = 9.80665; // standard gravity, m/s^2 per g

// ---------------------------------------------------------------------------
// number helpers
// ---------------------------------------------------------------------------

function num(x: unknown, fallback: number | null = null): number | null {
  return typeof x === "number" && Number.isFinite(x) ? x : fallback;
}

function numArr(x: unknown): number[] {
  return Array.isArray(x) ? x.filter((v): v is number => typeof v === "number" && Number.isFinite(v)) : [];
}

function fmtNum(x: number | null | undefined): string {
  if (x === null || x === undefined || !Number.isFinite(x)) return "—";
  const ax = Math.abs(x);
  if (ax !== 0 && (ax >= 1e6 || ax < 1e-4)) return x.toExponential(3);
  if (ax >= 1000) return x.toLocaleString("en-US", { maximumFractionDigits: 1 });
  if (ax >= 1) return String(Number(x.toFixed(4)));
  return String(Number(x.toPrecision(4)));
}

function fmtGravity(g: number): string {
  if (g === 0) return "0 g";
  if (g >= 0.01) return `${g.toFixed(g < 1 ? 3 : 1)} g`;
  return `${g.toExponential(1)} g`;
}

function niceStep(span: number): number {
  if (!Number.isFinite(span) || span <= 0) return 1;
  return Math.max(Math.pow(10, Math.floor(Math.log10(span / 100))), 1e-6);
}

// ---------------------------------------------------------------------------
// environment → calculator prefill (variables matched by key)
// ---------------------------------------------------------------------------

function envCalculatorPrefill(env: AtmosphereEnv): Record<string, number> {
  return {
    o2: env.o2Fraction, // O2 mole fraction (p-o2-kpa and friends)
    psi: env.totalPressurePsi, // total pressure in psi
    g: env.gravityG * G0_MS2, // gravity term of Stokes settling, m/s^2
  };
}

// ---------------------------------------------------------------------------
// small presentational helpers
// ---------------------------------------------------------------------------

function KindBadge({ kind }: { kind: string }) {
  const cls =
    kind === "reference" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400"
    : kind === "flight-proven" ? "border-primary/40 bg-primary/10 text-primary"
    : "border-amber-500/40 bg-amber-500/10 text-amber-400";
  return <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium tracking-wide", cls)}>{kind}</span>;
}

function ModelStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    "verified-reproduction": "border-primary/50 bg-primary/10 text-primary",
    exploratory: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    "negative-result": "border-zinc-500/50 bg-zinc-500/10 text-zinc-400",
    absent: "border-border bg-muted/60 text-muted-foreground",
  };
  return (
    <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", map[status] ?? map.absent)}>
      {status === "absent" ? <span className="line-through decoration-border">{status}</span> : status}
    </span>
  );
}

function Provenance({ children }: { children: React.ReactNode }) {
  return <p className="provenance-strip mt-2">{children}</p>;
}

function oneLine(inv: Investigation): string {
  const src = inv.impacts ?? inv.objectives ?? inv.approach ?? "";
  return src.replace(/\s+/g, " ").trim().slice(0, 150);
}

// ---------------------------------------------------------------------------
// calculator card — slider + numeric input, two-way synced (spec M8)
// ---------------------------------------------------------------------------

interface FieldState { text: string; num: number | null }

function sliderRangeFor(v: EquationVariable, current: number | null): { min: number; max: number; step: number } {
  const hasMin = typeof v.min === "number";
  const hasMax = typeof v.max === "number";
  if (hasMin && hasMax && v.max! > v.min!) return { min: v.min!, max: v.max!, step: niceStep(v.max! - v.min!) };
  const ref =
    current !== null && Number.isFinite(current) && current !== 0 ? current
    : hasMin && v.min! > 0 ? v.min!
    : hasMax && v.max! > 0 ? v.max!
    : 1;
  let lo = hasMin ? v.min! : ref > 0 ? ref * 0.5 : ref * 2;
  let hi = hasMax ? v.max! : ref > 0 ? ref * 2 : ref * 0.5;
  if (!(hi > lo)) hi = lo + Math.abs(lo || 1);
  return { min: lo, max: hi, step: niceStep(hi - lo) };
}

function CalculatorCard({
  equationId,
  prefill,
  prefillNote,
}: {
  equationId: string;
  prefill?: Record<string, number>;
  prefillNote?: string;
}) {
  const eqn = getEquation(equationId);
  const [values, setValues] = useState<Record<string, FieldState>>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [assumptionsOpen, setAssumptionsOpen] = useState(false);
  const prefillKey = JSON.stringify(prefill ?? {});

  // seed / re-seed when the equation or the scenario-context prefill changes
  // (render-time state adjustment — the React-recommended pattern instead of effects)
  const [seedKey, setSeedKey] = useState(`${equationId}|${prefillKey}`);
  const needsReseed = seedKey !== `${equationId}|${prefillKey}`;
  if (needsReseed) {
    setSeedKey(`${equationId}|${prefillKey}`);
    if (eqn) {
      const pf = JSON.parse(prefillKey) as Record<string, number>;
      const next: Record<string, FieldState> = {};
      for (const v of eqn.variables) {
        const p = pf[v.key];
        if (typeof p === "number" && Number.isFinite(p)) next[v.key] = { text: String(p), num: p };
        else next[v.key] = { text: "", num: null };
      }
      setValues(next);
    }
    setResult(null);
    setError(null);
  }

  if (!eqn) {
    return (
      <div className="glass-panel rounded-lg p-4 text-sm text-muted-foreground">
        Equation <span className="font-mono">{equationId}</span> is not in the registry.
      </div>
    );
  }

  const setFromSlider = (key: string, n: number) => setValues((prev) => ({ ...prev, [key]: { text: String(n), num: n } }));
  const setFromText = (key: string, text: string) => {
    const parsed = text.trim() === "" ? null : Number(text);
    setValues((prev) => ({ ...prev, [key]: { text, num: parsed !== null && Number.isFinite(parsed) ? parsed : null } }));
  };

  const onCalculate = () => {
    const inputs: Record<string, number> = {};
    for (const v of eqn.variables) {
      const st = values[v.key];
      if (st && st.num !== null && Number.isFinite(st.num)) inputs[v.key] = st.num;
    }
    try {
      const r = runCalculation(eqn.id, inputs);
      setResult(r);
      setError(null);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const fillReference = () => {
    const t = eqn.tests[0];
    if (!t) return;
    setValues((prev) => {
      const next = { ...prev };
      const pf = JSON.parse(prefillKey) as Record<string, number>;
      for (const v of eqn.variables) {
        const refVal = t.inputs[v.key];
        if (typeof refVal === "number" && Number.isFinite(refVal)) next[v.key] = { text: String(refVal), num: refVal };
        const pfVal = pf[v.key];
        if (typeof pfVal === "number" && Number.isFinite(pfVal)) next[v.key] = { text: String(pfVal), num: pfVal };
      }
      return next;
    });
  };

  return (
    <div className="research-panel rounded-lg p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold leading-tight">{eqn.name}</h4>
          <TeX math={eqn.latex} className="mt-1 max-w-full overflow-x-auto text-xs text-[color:var(--research-foreground)]/90" ariaLabel={`${eqn.name}: ${eqn.statement}`} />
        </div>
        <Badge variant="outline" className="shrink-0 text-[10px]">{eqn.id}</Badge>
      </div>
      {prefillNote ? <p className="mt-2 text-[11px] text-muted-foreground">{prefillNote}</p> : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        {eqn.variables.map((v) => {
          const st = values[v.key] ?? { text: "", num: null };
          const range = sliderRangeFor(v, st.num);
          return (
            <div key={v.key} className="min-w-0">
              <label htmlFor={`calc-${eqn.id}-${v.key}`} className="flex flex-wrap items-baseline gap-x-1.5 text-[11px] font-medium">
                <span>{v.label}</span>
                <span className="font-mono text-[color:var(--research-foreground)]/70">{v.symbol}</span>
                <span className="text-muted-foreground">[{v.unit}]</span>
              </label>
              <div className="mt-1.5 flex items-center gap-2.5">
                <Slider
                  className="min-w-0 flex-1"
                  value={[st.num ?? range.min]}
                  min={range.min}
                  max={range.max}
                  step={range.step}
                  onValueChange={(vals) => setFromSlider(v.key, vals[0] ?? range.min)}
                  aria-label={`${eqn.name} — ${v.label}`}
                />
                <Input
                  id={`calc-${eqn.id}-${v.key}`}
                  type="text"
                  inputMode="decimal"
                  className="h-8 w-24 shrink-0 font-mono text-xs"
                  value={st.text}
                  placeholder="required"
                  onChange={(e) => setFromText(v.key, e.target.value)}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={onCalculate} className="h-8">
          <Sigma className="mr-1 h-3.5 w-3.5" /> Calculate
        </Button>
        {eqn.tests.length > 0 ? (
          <Button size="sm" variant="outline" onClick={fillReference} className="h-8">
            <Play className="mr-1 h-3.5 w-3.5" /> Fill reference-test values
          </Button>
        ) : null}
      </div>

      {error ? (
        <div className="mt-3 rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs leading-relaxed text-red-500" role="alert">
          {error}
        </div>
      ) : null}

      {result ? (
        <div className="mt-3 rounded-md border border-primary/30 bg-primary/5 p-3">
          <div className="flex flex-wrap items-baseline gap-2">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{result.label}</span>
            <span className="font-mono text-xl font-semibold text-[color:var(--hotcore)]">{fmtNum(result.value)}</span>
            <span className="font-mono text-xs text-muted-foreground">{result.unit}</span>
          </div>
          {result.warnings.length > 0 ? (
            <ul className="mt-2 space-y-1">
              {result.warnings.map((w, i) => (
                <li key={i} className="text-[11px] leading-snug text-amber-600">warning: {w}</li>
              ))}
            </ul>
          ) : null}
          <p className="mt-2 font-mono text-[10px] text-muted-foreground">
            inputs: {Object.entries(result.inputsEcho).map(([k, v]) => `${k}=${fmtNum(v)}`).join("  ")}
          </p>
        </div>
      ) : null}

      <div className="mt-3 border-t border-[color:var(--research-foreground)]/10 pt-2.5">
        <Collapsible open={assumptionsOpen} onOpenChange={setAssumptionsOpen}>
          <CollapsibleTrigger className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground hover:text-[color:var(--research-foreground)]">
            <ChevronRight className={cn("h-3 w-3 transition-transform", assumptionsOpen && "rotate-90")} aria-hidden />
            Assumptions ({eqn.assumptions.length})
          </CollapsibleTrigger>
          <CollapsibleContent>
            <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[11px] leading-snug text-muted-foreground">
              {eqn.assumptions.map((a, i) => <li key={i}>{a}</li>)}
            </ul>
          </CollapsibleContent>
        </Collapsible>
        <p className="mt-2 text-[10px] leading-snug text-muted-foreground">source: {eqn.source}</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// equation picker — ids resolved from the registry (never hand-written math)
// ---------------------------------------------------------------------------

function EquationPicker({
  ids,
  selectedId,
  onSelect,
  title,
}: {
  ids: string[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  title: string;
}) {
  const [q, setQ] = useState("");
  const equations = useMemo(
    () => ids.map((id) => getEquation(id)).filter((e): e is Equation => Boolean(e)),
    [ids],
  );
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return equations;
    return equations.filter((e) => `${e.name} ${e.statement} ${e.summary}`.toLowerCase().includes(query));
  }, [equations, q]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`Filter ${title.toLowerCase()}…`}
          aria-label={`Filter ${title}`}
          className="h-8 text-xs"
        />
      </div>
      <div className="max-h-72 overflow-y-auto data-scroll rounded-md border border-border/60">
        {filtered.length === 0 ? (
          <p className="p-3 text-xs text-muted-foreground">No equation matches this filter.</p>
        ) : (
          filtered.map((e) => (
            <button
              key={e.id}
              onClick={() => onSelect(e.id)}
              aria-pressed={selectedId === e.id}
              className={cn(
                "flex w-full flex-col items-start gap-0.5 border-b border-border/40 px-3 py-2 text-left transition-colors last:border-b-0",
                selectedId === e.id ? "bg-primary/15" : "hover:bg-accent/40",
              )}
            >
              <span className={cn("text-xs font-medium leading-tight", selectedId === e.id && "text-primary")}>{e.name}</span>
              <TeX math={e.latex} className="max-w-full overflow-x-auto text-[11px] text-muted-foreground" ariaLabel={`${e.name}: ${e.statement}`} />
              <span className="font-mono text-[10px] text-muted-foreground">
                → {e.outputLabel} [{e.outputUnit}]
              </span>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// investigation + gap cards
// ---------------------------------------------------------------------------

function InvCard({ inv }: { inv: Investigation }) {
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  return (
    <div className="glass-panel flex flex-col gap-2 rounded-lg p-3">
      <div className="flex items-baseline justify-between gap-2">
        <span className="font-mono text-xs font-semibold text-primary">{inv.accession}</span>
        <span className="text-[10px] text-muted-foreground">{inv.subResearchArea ?? inv.researchArea ?? ""}</span>
      </div>
      <p className="text-[13px] font-medium leading-tight">{inv.shortLabel}</p>
      <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground">{oneLine(inv) || inv.title}</p>
      <Button variant="outline" size="sm" className="h-7 w-fit text-[11px]" onClick={() => openInvestigation(inv.accession)}>
        Open evidence <ChevronRight className="h-3 w-3" aria-hidden />
      </Button>
    </div>
  );
}

function GapCard({ gap }: { gap: Gap }) {
  const color =
    gap.status === "absent" ? "border-red-500/40 bg-red-500/10 text-red-400"
    : gap.status === "inaccessible" ? "border-orange-500/40 bg-orange-500/10 text-orange-400"
    : gap.status === "not-indexed" ? "border-amber-500/40 bg-amber-500/10 text-amber-400"
    : "border-zinc-500/40 bg-zinc-500/10 text-zinc-400";
  return (
    <div className="glass-panel rounded-lg p-3">
      <div className="flex flex-wrap items-center gap-2">
        <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", color)}>{gap.status}</span>
        <span className="font-mono text-[10px] text-muted-foreground">{gap.id}</span>
      </div>
      <p className="mt-1.5 text-xs font-medium leading-snug">{gap.topic}</p>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{gap.detail}</p>
      {gap.related.length > 0 ? (
        <p className="mt-1.5 font-mono text-[10px] text-muted-foreground">related: {gap.related.join(", ")}</p>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// separation of AI roles (honest capability register)
// ---------------------------------------------------------------------------

function AiRolePanel() {
  const eqCount = getEquationRegistryCount();
  const flexCard = getFlexCard();
  const flexAuc = num((flexCard.metrics as Record<string, unknown>).groupedAucMean);
  const roles: { role: string; status: string; statusKind: "ok" | "warn" | "neg" | "off"; line: string }[] = [
    { role: "LLM (copilot)", status: "orchestration only", statusKind: "warn",
      line: "Answers, navigation and tool calls. Never a measurement instrument — no number an LLM emits is treated as data." },
    { role: "Retrieval", status: "BM25 lexical", statusKind: "ok",
      line: "Evidence search over investigation metadata, findings, gaps and tables. Dense embeddings are not configured in this build." },
    { role: "Deterministic engine", status: `verified · ${eqCount} equations`, statusKind: "ok",
      line: "Every calculator result is recomputed client-side from the reference-tested equation registry." },
    { role: "Domain ML", status: "mixed — guarded", statusKind: "warn",
      line: `FLEX extinction verified reproduction (grouped AUC ${flexAuc !== null ? flexAuc.toFixed(3) : "—"}), CFI-G exploratory (below O2-only baseline), SPICE preserved negative result.` },
    { role: "Computer vision", status: "absent", statusKind: "off",
      line: "No labelled flame masks exist in the recovered public assets — CV models are not trained and not claimed." },
    { role: "Simulation", status: "absent", statusKind: "off",
      line: "No validated solver configuration is registered; sparse flat CSVs are insufficient and no synthetic rows are injected." },
  ];
  const kindCls = {
    ok: "border-primary/40 bg-primary/10 text-primary",
    warn: "border-amber-500/40 bg-amber-500/10 text-amber-400",
    neg: "border-zinc-500/40 bg-zinc-500/10 text-zinc-400",
    off: "border-border bg-muted/60 text-muted-foreground",
  };
  return (
    <section aria-label="Separation of AI roles" className="glass-panel rounded-lg p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <Layers className="h-4 w-4 text-primary" aria-hidden /> Separation of AI roles
      </h3>
      <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
        Each capability is labelled honestly. The LLM orchestrates; it never measures.
      </p>
      <ul className="mt-3 space-y-2">
        {roles.map((r) => (
          <li key={r.role} className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span className={cn("rounded border px-1.5 py-0.5 text-[10px] font-medium", kindCls[r.statusKind])}>{r.status}</span>
            <span className="text-xs font-medium">{r.role}</span>
            <span className="w-full text-[11px] leading-snug text-muted-foreground">{r.line}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

// ---------------------------------------------------------------------------
// pillar: PREVENTION
// ---------------------------------------------------------------------------

function PreventionPanel({ env }: { env: AtmosphereEnv }) {
  const [eqId, setEqId] = useState<string | null>("p-o2-kpa");
  const prefill = useMemo(() => envCalculatorPrefill(env), [env]);

  const invs = useMemo(() => {
    const relevant = getInvestigations().filter(
      (i) => PREVENTION_PRIORITY.includes(i.accession) || /fire safety|flammability/i.test(i.subResearchArea ?? ""),
    );
    return relevant.sort((a, b) => {
      const pa = PREVENTION_PRIORITY.indexOf(a.accession);
      const pb = PREVENTION_PRIORITY.indexOf(b.accession);
      return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
    });
  }, []);

  const gaps = useMemo(() => getGaps().filter((g) => /partial|flammab|ignition/i.test(g.topic)), []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section aria-label="Prevention calculators" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Prevention calculators — atmosphere, flammability, ignition</h3>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Sourced from the verified equation registry. Fields matching the shared scenario context (O2 fraction, total
          pressure) are prefilled from <span className="font-medium text-foreground/90">{env.label}</span> and follow the
          environment selector.
        </p>
        <EquationPicker ids={PREVENTION_EQ_IDS} selectedId={eqId} onSelect={setEqId} title="prevention equations" />
        {eqId ? (
          <CalculatorCard
            equationId={eqId}
            prefill={prefill}
            prefillNote="Inputs left empty on purpose: the engine refuses to guess — press Calculate to see the honest refusal, or fill values."
          />
        ) : null}
      </section>

      <section aria-label="Prevention evidence" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Prevention evidence — flammability, ignition, atmosphere</h3>
        <p className="text-[11px] leading-snug text-muted-foreground">
          {invs.length} NASA PSI investigations mapped to prevention (spacecraft fire-safety sub-areas plus the
          gaseous-fuel flammability programs). Derived from investigation metadata, never hand-picked.
        </p>
        <div className="grid max-h-96 gap-2 overflow-y-auto data-scroll pr-1 sm:grid-cols-2">
          {invs.map((inv) => <InvCard key={inv.accession} inv={inv} />)}
        </div>
        <Separator className="bg-border/60" />
        <h4 className="flex items-center gap-1.5 text-xs font-semibold">
          <TriangleAlert className="h-3.5 w-3.5 text-amber-400" aria-hidden /> Honest gaps — prevention
        </h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {gaps.length > 0 ? gaps.map((g) => <GapCard key={g.id} gap={g} />) : (
            <p className="text-[11px] text-muted-foreground">No gap record matches this pillar filter.</p>
          )}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// pillar: DETECTION
// ---------------------------------------------------------------------------

function DetectionPanel({ env }: { env: AtmosphereEnv }) {
  const [eqId, setEqId] = useState<string | null>("stokes-settling");
  const prefill = useMemo(() => envCalculatorPrefill(env), [env]);

  const invs = useMemo(() => {
    const relevant = getInvestigations().filter(
      (i) =>
        DETECTION_PRIORITY.includes(i.accession) ||
        /smoke|aerosol/i.test(i.subResearchArea ?? ""),
    );
    return relevant.sort((a, b) => {
      const pa = DETECTION_PRIORITY.indexOf(a.accession);
      const pb = DETECTION_PRIORITY.indexOf(b.accession);
      return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
    });
  }, []);

  const media = useMemo(() => searchMediaLocal("smoke detector ISS", 8), []);
  const indexedGaps = useMemo(() => getGaps().filter((g) => /sensor|smoke|detector/i.test(g.topic)), []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section aria-label="Detection calculators" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Sensor &amp; aerosol response calculators</h3>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Smoke behaviour depends on gravity: the Stokes settling term is prefilled with{" "}
          <span className="font-mono text-foreground/90">{fmtGravity(env.gravityG)}</span> from{" "}
          <span className="font-medium text-foreground/90">{env.label}</span> — in microgravity settling vanishes and
          transport is ventilation-dominated.
        </p>
        <EquationPicker ids={DETECTION_EQ_IDS} selectedId={eqId} onSelect={setEqId} title="detection equations" />
        {eqId ? (
          <CalculatorCard
            equationId={eqId}
            prefill={prefill}
            prefillNote="g is linked to the selected environment. Reference-test values are one click away; missing inputs are refused, never guessed."
          />
        ) : null}
      </section>

      <section aria-label="Detection evidence" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Detection evidence — smoke, aerosols, sensors</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {invs.map((inv) => <InvCard key={inv.accession} inv={inv} />)}
        </div>

        <Separator className="bg-border/60" />
        <h4 className="text-xs font-semibold">Authentic media — SAME hardware on ISS</h4>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Local search over the 41 verified NASA Images records (credit NASA). No historical batch media is displayed.
        </p>
        <div className="flex gap-2 overflow-x-auto data-scroll pb-1" role="list" aria-label="Smoke detection media">
          {media.map((m) => (
            <figure key={m.nasa_id} className="w-40 shrink-0" role="listitem">
              <img
                src={m.thumb}
                alt={m.title}
                loading="lazy"
                className="h-24 w-40 rounded-md border border-border/60 object-cover"
              />
              <figcaption className="mt-1 line-clamp-2 text-[10px] leading-snug text-muted-foreground">
                {m.title} · <span className="font-mono">{m.nasa_id}</span> · credit NASA
              </figcaption>
            </figure>
          ))}
        </div>

        <Separator className="bg-border/60" />
        <h4 className="flex items-center gap-1.5 text-xs font-semibold">
          <TriangleAlert className="h-3.5 w-3.5 text-amber-400" aria-hidden /> Honest gap — detector response
        </h4>
        <div className="glass-panel rounded-lg p-3">
          <span className="rounded border border-amber-500/40 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">
            not recorded in bundled tables
          </span>
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
            Detector-response thresholds (alarm set-points, obscuration limits) are not recorded in the bundled PSI
            tables. This is shown as an honest local observation — no indexed gap record matches
            sensor/smoke/detector yet.
          </p>
          {indexedGaps.map((g) => <div key={g.id} className="mt-2"><GapCard gap={g} /></div>)}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// pillar: PREDICTION — the guarded model playground
// ---------------------------------------------------------------------------

interface NumField { text: string; num: number | null }
const field = (n: number | null): NumField => (n === null ? { text: "", num: null } : { text: String(n), num: n });
function toNum(text: string): number | null {
  if (text.trim() === "") return null;
  const n = Number(text);
  return Number.isFinite(n) ? n : null;
}

function ModelSliderField({
  label, symbol, unit, value, min, max, step, onNum, onText,
}: {
  label: string; symbol: string; unit: string; value: NumField;
  min: number; max: number; step: number;
  onNum: (n: number) => void; onText: (t: string) => void;
}) {
  const id = `mf-${label.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
  return (
    <div className="min-w-0">
      <label htmlFor={id} className="flex flex-wrap items-baseline gap-x-1.5 text-[11px] font-medium">
        <span>{label}</span>
        <span className="font-mono text-muted-foreground">{symbol}</span>
        <span className="text-muted-foreground">[{unit}]</span>
        <span className="ml-auto font-mono text-[10px] text-muted-foreground">{min}–{max}</span>
      </label>
      <div className="mt-1.5 flex items-center gap-2.5">
        <Slider
          className="min-w-0 flex-1"
          value={[value.num ?? min]}
          min={min}
          max={max}
          step={step}
          onValueChange={(vals) => onNum(vals[0] ?? min)}
          aria-label={`${label} (${symbol})`}
        />
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          className="h-8 w-24 shrink-0 font-mono text-xs"
          value={value.text}
          onChange={(e) => onText(e.target.value)}
        />
      </div>
    </div>
  );
}

function ModelResultPanel({ result }: { result: FlexPrediction | null }) {
  if (!result) {
    return (
      <div className="glass-panel rounded-lg p-4 text-xs text-muted-foreground" role="status">
        Awaiting inputs — I will not guess values.
      </div>
    );
  }
  if (!result.ok) {
    return (
      <Alert variant="destructive" role="alert">
        <TriangleAlert aria-hidden />
        <AlertTitle>Domain guard — prediction refused</AlertTitle>
        <AlertDescription>
          <p className="leading-relaxed">{result.refusal}</p>
          <ul className="mt-2 list-disc space-y-0.5 pl-4">
            {result.applicability.violations.map((v, i) => <li key={i} className="font-mono text-[11px]">{v}</li>)}
          </ul>
          <Provenance>{result.provenance}</Provenance>
        </AlertDescription>
      </Alert>
    );
  }
  const score = result.score ?? 0;
  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{result.ok ? "relative extinction score (uncalibrated)" : ""}</p>
          <p className="font-mono text-4xl font-bold leading-none text-[color:var(--hotcore)]">{score.toFixed(3)}</p>
        </div>
        <ScoreGauge score={score} />
      </div>
      <div className="mt-3" aria-live="polite">
        <p className="text-xs leading-relaxed text-foreground/90">{result.interpretation}</p>
      </div>
      <Provenance>{result.provenance}</Provenance>
    </div>
  );
}

function ScoreGauge({ score }: { score: number }) {
  const pct = Math.round(Math.min(1, Math.max(0, score)) * 100);
  return (
    <div className="w-40" role="img" aria-label={`score gauge at ${pct}%`}>
      <div className="h-2.5 overflow-hidden rounded-full bg-muted" aria-hidden>
        <div className="h-full rounded-full bg-gradient-to-r from-[#be5f35] to-[#fcdaa7]" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-right font-mono text-[10px] text-muted-foreground">{pct}%</p>
    </div>
  );
}

function FlexPlayground({ env }: { env: AtmosphereEnv }) {
  const [xo2, setXo2] = useState<NumField>(() => field(env.o2Fraction));
  const [pMmHg, setPMmHg] = useState<NumField>(() => field(env.totalPressurePsi * PSI_TO_MMHG));
  const [d0, setD0] = useState<NumField>(() => field(3));
  const [fuel, setFuel] = useState<"Methanol" | "Heptane">("Methanol");
  const [he, setHe] = useState<NumField>(() => field(null));
  const [co, setCo] = useState<NumField>(() => field(null));

  // environment drives the shared scenario context (render-time adjustment)
  const [envSeed, setEnvSeed] = useState(env.id);
  if (envSeed !== env.id) {
    setEnvSeed(env.id);
    setXo2(field(env.o2Fraction));
    setPMmHg(field(env.totalPressurePsi * PSI_TO_MMHG));
  }

  const result = useMemo<FlexPrediction | null>(() => {
    if (xo2.num === null || pMmHg.num === null || d0.num === null) return null;
    return runFlexModel({
      xo2: xo2.num,
      pressureMmHg: pMmHg.num,
      d0Mm: d0.num,
      fuel,
      heFraction: he.num ?? undefined,
      coFraction: co.num ?? undefined,
      gravityG: env.gravityG,
    });
  }, [xo2, pMmHg, d0, fuel, he, co, env.gravityG]);

  return (
    <div className="glass-panel flex flex-col gap-4 rounded-lg p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold">FLEX droplet extinction — verified reproduction</h4>
          <p className="text-[11px] text-muted-foreground">
            IRLS logistic on 262 recovered FLEX microgravity tests; in-browser scoring, no server round-trip.
          </p>
        </div>
        <span className="rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">
          verified-reproduction
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-border/60 bg-accent/20 px-3 py-2">
        <Info className="h-3.5 w-3.5 shrink-0 text-[color:var(--emission)]" aria-hidden />
        <p className="text-[11px] leading-snug text-muted-foreground">
          Gravity comes from the shared scenario context:{" "}
          <span className="font-mono text-foreground/90">{fmtGravity(env.gravityG)}</span> ({env.label}). Selecting
          Earth, Moon or Mars makes the guard refuse — microgravity ISS data are not a validated basis there.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <ModelSliderField label="O2 mole fraction" symbol="x_O2" unit="—" value={xo2} min={0.15} max={0.7} step={0.005}
          onNum={(n) => setXo2(field(n))} onText={(t) => setXo2({ text: t, num: toNum(t) })} />
        <ModelSliderField label="Ambient pressure" symbol="P" unit="mmHg" value={pMmHg} min={400} max={1150} step={5}
          onNum={(n) => setPMmHg(field(n))} onText={(t) => setPMmHg({ text: t, num: toNum(t) })} />
        <ModelSliderField label="Initial droplet diameter" symbol="d_0" unit="mm" value={d0} min={1} max={5} step={0.05}
          onNum={(n) => setD0(field(n))} onText={(t) => setD0({ text: t, num: toNum(t) })} />
        <div>
          <label htmlFor="flex-fuel" className="text-[11px] font-medium">Fuel</label>
          <Select value={fuel} onValueChange={(v) => setFuel(v === "Heptane" ? "Heptane" : "Methanol")}>
            <SelectTrigger id="flex-fuel" size="sm" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Methanol">Methanol (liquid)</SelectItem>
              <SelectItem value="Heptane">n-Heptane (liquid)</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <label htmlFor="flex-he" className="flex flex-wrap items-baseline gap-x-1.5 text-[11px] font-medium">
            He ambient fraction <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input id="flex-he" type="text" inputMode="decimal" placeholder="absent → 0" className="mt-1.5 h-8 font-mono text-xs"
            value={he.text} onChange={(e) => setHe({ text: e.target.value, num: toNum(e.target.value) })} />
        </div>
        <div>
          <label htmlFor="flex-co" className="flex flex-wrap items-baseline gap-x-1.5 text-[11px] font-medium">
            CO ambient fraction <span className="text-muted-foreground">(optional)</span>
          </label>
          <Input id="flex-co" type="text" inputMode="decimal" placeholder="absent → 0" className="mt-1.5 h-8 font-mono text-xs"
            value={co.text} onChange={(e) => setCo({ text: e.target.value, num: toNum(e.target.value) })} />
        </div>
      </div>

      <ModelResultPanel result={result} />
    </div>
  );
}

function CfigPlayground({ env }: { env: AtmosphereEnv }) {
  const [xfBefore, setXfBefore] = useState<NumField>(() => field(null));
  const [pBar, setPBar] = useState<NumField>(() => field(1.0));
  const [xo2, setXo2] = useState<NumField>(() => field(env.o2Fraction));
  const [hcBurnRate, setHcBurnRate] = useState<NumField>(() => field(null));
  const [o2Flow, setO2Flow] = useState<NumField>(() => field(null));
  const [tadK, setTadK] = useState<NumField>(() => field(null));
  const [zst, setZst] = useState<NumField>(() => field(null));
  const [fuel, setFuel] = useState<"ethane" | "propane" | "butane">("ethane");

  // environment prefill (render-time adjustment)
  const [envSeed, setEnvSeed] = useState(env.id);
  if (envSeed !== env.id) {
    setEnvSeed(env.id);
    setXo2(field(env.o2Fraction));
  }

  const cfigCard = getCfigCard();
  const cfigM = cfigCard.metrics as Record<string, unknown>;
  const exploratoryNote = `Exploratory warning: this model performs below the oxygen-only baseline (AUC ${num(cfigM.calibratedLogisticAuc, 0)?.toFixed(3)} vs ${num(cfigM.oxygenOnlyAuc, 0)?.toFixed(3)}) — retained for transparency. Do not use for decisions.`;

  const fields: { label: string; symbol: string; unit: string; st: NumField; set: (f: NumField) => void; id: string }[] = [
    { label: "Fuel fraction before test", symbol: "Xf_before", unit: "—", st: xfBefore, set: setXfBefore, id: "cfig-xf" },
    { label: "Pressure", symbol: "p_bar", unit: "bar", st: pBar, set: setPBar, id: "cfig-p" },
    { label: "O2 mole fraction", symbol: "X_O2", unit: "—", st: xo2, set: setXo2, id: "cfig-o2" },
    { label: "HC burn rate", symbol: "HC_burn_rate", unit: "mg/s", st: hcBurnRate, set: setHcBurnRate, id: "cfig-hc" },
    { label: "O2 flow", symbol: "O2_flow", unit: "mg/s", st: o2Flow, set: setO2Flow, id: "cfig-o2flow" },
    { label: "Adiabatic flame temp", symbol: "Tad", unit: "K", st: tadK, set: setTadK, id: "cfig-tad" },
    { label: "Stoich. mixture fraction", symbol: "Zst", unit: "—", st: zst, set: setZst, id: "cfig-zst" },
  ];

  const missing = fields.filter((f) => f.st.num === null);
  const result = useMemo<FlexPrediction | null>(() => {
    if (missing.length > 0) return null;
    return runCfigModel({
      xfBefore: xfBefore.num!, pBar: pBar.num!, xo2: xo2.num!, hcBurnRate: hcBurnRate.num!,
      o2Flow: o2Flow.num!, tadK: tadK.num!, zst: zst.num!, fuel, gravityG: env.gravityG,
    });
  }, [xfBefore, pBar, xo2, hcBurnRate, o2Flow, tadK, zst, fuel, env.gravityG]);

  return (
    <div className="glass-panel flex flex-col gap-4 rounded-lg p-4">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h4 className="text-sm font-semibold">CFI-G hot ignition — exploratory</h4>
          <p className="text-[11px] text-muted-foreground">
            Spec-preserved logistic coefficients validated on the recovered PSI-159 inverse table (146 rows / 131 positives, exact match).
          </p>
        </div>
        <span className="rounded border border-amber-500/50 bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-medium text-amber-400">exploratory</span>
      </div>

      <div className="flex flex-wrap items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
        <TriangleAlert className="h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
        <p className="text-[11px] leading-snug text-amber-300/90">{exploratoryNote}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {fields.map((f) => (
          <div key={f.id} className="min-w-0">
            <label htmlFor={f.id} className="flex flex-wrap items-baseline gap-x-1.5 text-[11px] font-medium">
              <span>{f.label}</span>
              <span className="font-mono text-muted-foreground">{f.symbol}</span>
              <span className="text-muted-foreground">[{f.unit}]</span>
            </label>
            <Input
              id={f.id}
              type="text"
              inputMode="decimal"
              className="mt-1.5 h-8 font-mono text-xs"
              placeholder="required"
              value={f.st.text}
              onChange={(e) => f.set({ text: e.target.value, num: toNum(e.target.value) })}
            />
          </div>
        ))}
        <div>
          <label htmlFor="cfig-fuel" className="text-[11px] font-medium">Fuel</label>
          <Select value={fuel} onValueChange={(v) => setFuel(v === "propane" ? "propane" : v === "butane" ? "butane" : "ethane")}>
            <SelectTrigger id="cfig-fuel" size="sm" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ethane">ethane</SelectItem>
              <SelectItem value="propane">propane</SelectItem>
              <SelectItem value="butane">butane</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {missing.length > 0 ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs leading-relaxed text-red-400" role="alert">
          Missing required input: {missing.map((m) => m.symbol).join(", ")} — I will not guess values.
          {" "}Fill every field (p_bar defaults to 1.0; X_O2 follows the selected environment).
        </div>
      ) : (
        <ModelResultPanel result={result} />
      )}
    </div>
  );
}

function ModelComparisonStrip() {
  const flexCard = getFlexCard();
  const fm = flexCard.metrics as Record<string, unknown>;
  const hist = (flexCard as unknown as { historical_recorded?: Record<string, unknown> }).historical_recorded;
  const spice = getSpiceCard();
  const sm = spice.metrics as Record<string, unknown>;

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <div className="research-panel rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold">FLEX v2 — reproduction vs recorded history</h4>
          <span className="rounded border border-primary/40 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium text-primary">verified</span>
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-xs sm:grid-cols-3">
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">grouped AUC (this rebuild)</dt>
            <dd className="font-mono text-base font-semibold text-[color:var(--research-foreground)]">{num(fm.groupedAucMean)?.toFixed(3) ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">folds (GroupKFold-4)</dt>
            <dd className="font-mono text-xs">{numArr(fm.groupedAucFolds).map((v) => v.toFixed(3)).join(" / ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">group bootstrap CI</dt>
            <dd className="font-mono text-xs">{numArr(fm.groupBootstrapAucCi).map((v) => v.toFixed(3)).join(" – ") || "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">historical recorded (prior build)</dt>
            <dd className="font-mono text-xs">{hist ? `${num(hist.groupedAuc)?.toFixed(3) ?? "—"} [${numArr(hist.groupedAucCi).map((v) => v.toFixed(3)).join(", ")}]` : "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">balanced accuracy</dt>
            <dd className="font-mono text-xs">{num(fm.balancedAccuracyMean)?.toFixed(3) ?? "—"}</dd>
          </div>
          <div>
            <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">O2-only baseline AUC</dt>
            <dd className="font-mono text-xs">{num(fm.oxygenOnlyBaselineAuc)?.toFixed(3) ?? "—"}</dd>
          </div>
        </dl>
        <Provenance>{flexCard.data.source}</Provenance>
      </div>

      <div className="research-panel rounded-lg p-4">
        <div className="flex flex-wrap items-center gap-2">
          <h4 className="text-sm font-semibold">SPICE flame duration — negative result</h4>
          <span className="rounded border border-zinc-500/50 bg-zinc-500/10 px-1.5 py-0.5 text-[10px] font-medium text-zinc-500">negative-result</span>
          <Ban className="h-3.5 w-3.5 text-zinc-500" aria-hidden />
        </div>
        <p className="mt-2 text-xs leading-relaxed">
          No predictor offered — R² is negative under date-grouped validation:
          ridge <span className="font-mono">{num(sm.ridgeR2)?.toFixed(3)}</span>, GBM{" "}
          <span className="font-mono">{num(sm.gbmR2)?.toFixed(3)}</span> vs fuel-mean baseline RMSE(log){" "}
          <span className="font-mono">{num(sm.baselineFuelMeanRmseLog)?.toFixed(4)}</span>. The result is preserved, not hidden.
        </p>
        <Provenance>{spice.data.source}</Provenance>
      </div>
    </div>
  );
}

function PredictionPanel({ env }: { env: AtmosphereEnv }) {
  return (
    <div className="flex flex-col gap-4">
      <section aria-label="Model playground" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Model playground — guarded scorers</h3>
        <p className="text-[11px] leading-snug text-muted-foreground">
          Both scorers run live in your browser. Every input outside the verified training domain is refused with the
          reason — a refusal is a result, not an error. No model is a flight-qualified safety device.
        </p>
        <FlexPlayground env={env} />
        <CfigPlayground env={env} />
      </section>
      <section aria-label="Model card comparison" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Model cards — comparison strip</h3>
        <ModelComparisonStrip />
      </section>
      <AiRolePanel />
    </div>
  );
}

// ---------------------------------------------------------------------------
// pillar: SUPPRESSION
// ---------------------------------------------------------------------------

function SuppressionPanel({ env }: { env: AtmosphereEnv }) {
  const [eqId, setEqId] = useState<string | null>("spalding-b-number");
  const [fuelId, setFuelId] = useState<string>("heptane");

  const flexTable = getTable("PSI-69_FLEX");
  const diluentColumns = useMemo(
    () => (flexTable ? flexTable.columns.filter((c) => /initial ambient composition/i.test(c.name)) : []),
    [flexTable],
  );

  // fuel-property prefill (sourced table; changing fuel only prefills inputs)
  const fuel = FUEL_PROPERTIES.find((f) => f.id === fuelId);
  const prefill = useMemo(() => {
    const pf: Record<string, number> = {};
    if (fuel) {
      if (eqId === "spalding-b-number") {
        pf.dhc = fuel.lhvKJPerKg * 1000; // J/kg
        pf.lv = fuel.hvapKJPerKg * 1000; // J/kg
        pf.nuO2 = fuel.stoichO2PerKgFuel; // kg O2 / kg fuel
      }
    }
    if (eqId === "d2-law" || eqId === "droplet-lifetime" || eqId === "burning-rate-constant") {
      pf.d0 = 3.0; // FLEX planning droplet diameter range midpoint (1–5 mm domain)
    }
    return pf;
  }, [fuel, eqId]);

  // ambient O2 mass fraction from the shared context, via the registry
  const yo2Mass = useMemo(() => {
    try {
      return runCalculation("mass-fraction-from-mole", { xi: env.o2Fraction, mi: 32, mj: 28.01 }).value;
    } catch {
      return null;
    }
  }, [env.o2Fraction]);

  const prefillWithO2 = useMemo(() => {
    if (eqId !== "spalding-b-number" || yo2Mass === null) return prefill;
    return { ...prefill, yo2: yo2Mass };
  }, [prefill, eqId, yo2Mass]);

  const invs = useMemo(() => {
    const relevant = getInvestigations().filter(
      (i) => SUPPRESSION_PRIORITY.includes(i.accession) || /extin|cool flame/i.test(`${i.title} ${i.subResearchArea ?? ""}`),
    );
    return relevant.sort((a, b) => {
      const pa = SUPPRESSION_PRIORITY.indexOf(a.accession);
      const pb = SUPPRESSION_PRIORITY.indexOf(b.accession);
      return (pa === -1 ? 99 : pa) - (pb === -1 ? 99 : pb);
    });
  }, []);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <section aria-label="Suppression calculators" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Droplet &amp; extinction calculators</h3>
        <div className="glass-panel rounded-lg p-3">
          <label htmlFor="fuel-select" className="text-[11px] font-medium">Fuel context (sourced properties)</label>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <Select value={fuelId} onValueChange={setFuelId}>
              <SelectTrigger id="fuel-select" size="sm" className="w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FUEL_PROPERTIES.map((f) => (
                  <SelectItem key={f.id} value={f.id}>{f.name} ({f.formula})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          {fuel ? (
            <p className="mt-2 font-mono text-[10px] leading-relaxed text-muted-foreground">
              LHV {fuel.lhvKJPerKg.toLocaleString()} kJ/kg · L_vap {fuel.hvapKJPerKg} kJ/kg · stoich O2 {fuel.stoichO2PerKgFuel} kg/kg · T_boil {fuel.tBoilK} K · {fuel.source}
            </p>
          ) : null}
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
            Changing fuel only prefills inputs (ΔH_c, L_v, ν_O2) — it never alters recovered data.
            {yo2Mass !== null ? <> Ambient O2 mass fraction prefill: <span className="font-mono">{yo2Mass.toFixed(3)}</span> (computed from {env.label} via the registry).</> : null}
          </p>
        </div>
        <EquationPicker ids={SUPPRESSION_EQ_IDS} selectedId={eqId} onSelect={setEqId} title="suppression equations" />
        {eqId ? (
          <CalculatorCard
            equationId={eqId}
            prefill={prefillWithO2}
            prefillNote="Thermochemical inputs prefilled from the sourced fuel-property table and the shared scenario context; every value stays editable."
          />
        ) : null}
        <div className="flex items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/5 px-3 py-2">
          <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-400" aria-hidden />
          <p className="text-[11px] leading-snug text-amber-300/90">
            Suppressants are not ranked: tests are confounded and unmatched (different fuels, geometries, flows and
            objectives across investigations). No ranking is computed or implied.
          </p>
        </div>
      </section>

      <section aria-label="Suppression evidence" className="flex flex-col gap-3">
        <h3 className="text-sm font-semibold">Suppression evidence — extinction &amp; cool-flame science</h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {invs.map((inv) => <InvCard key={inv.accession} inv={inv} />)}
        </div>

        <Separator className="bg-border/60" />
        <h4 className="text-xs font-semibold">Diluent context — FLEX ambient columns (PSI-69)</h4>
        {diluentColumns.length > 0 ? (
          <div className="research-panel rounded-lg p-3">
            <div className="flex flex-wrap gap-1.5">
              {diluentColumns.map((c) => (
                <span key={c.index} className="rounded border border-[color:var(--research-foreground)]/15 bg-[color:var(--research-muted)] px-1.5 py-0.5 font-mono text-[10px]">
                  {c.name} · {c.unit ?? "—"} · fill {(c.fillRate * 100).toFixed(0)}%
                </span>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
              FLEX swept helium- and carbon-monoxide-diluted ambients per test; these are the recorded per-test columns
              (mole fraction). Missing CO/He values stay missing — they are excluded from model features when unknown
              (gap gap-flex-co-he).
            </p>
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground">PSI-69_FLEX table not loaded.</p>
        )}

        <Separator className="bg-border/60" />
        <h4 className="text-xs font-semibold">Honest gaps — suppression-adjacent</h4>
        <div className="grid gap-2 sm:grid-cols-2">
          {getGaps()
            .filter((g) => /FLEX|cool|extin/i.test(g.topic))
            .map((g) => <GapCard key={g.id} gap={g} />)}
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// lifecycle navigator + shared context bar
// ---------------------------------------------------------------------------

function LifecycleNav({ pillar }: { pillar: PillarId }) {
  const setScenarioPillar = useAppStore((s) => s.setScenarioPillar);
  return (
    <nav
      aria-label="Fire-safety lifecycle pillars"
      className="sticky-subnav sticky top-[5.875rem]! md:top-14! -mx-3 px-3 sm:-mx-6 sm:px-6"
    >
      <div className="mx-auto flex max-w-[1600px] items-center gap-1 overflow-x-auto py-2 data-scroll" role="tablist">
        {PILLARS.map((p, i) => {
          const Icon = p.icon;
          const active = pillar === p.id;
          return (
            <Fragment key={p.id}>
              {i > 0 ? <ArrowRight className="hidden h-3.5 w-3.5 shrink-0 text-muted-foreground/50 md:block" aria-hidden /> : null}
              <button
                role="tab"
                aria-selected={active}
                onClick={() => setScenarioPillar(p.id)}
                className={cn(
                  "flex min-w-0 shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-left transition-colors",
                  active
                    ? "border-primary/60 bg-primary/15 text-primary"
                    : "border-transparent text-muted-foreground hover:border-border/60 hover:bg-accent/30 hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" aria-hidden />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold leading-tight">{p.label}</span>
                  <span className="hidden text-[10px] leading-tight text-muted-foreground lg:block">{p.desc}</span>
                </span>
              </button>
            </Fragment>
          );
        })}
      </div>
    </nav>
  );
}

function ContextBar({ env, pillar }: { env: AtmosphereEnv; pillar: PillarId }) {
  const setEnvironment = useAppStore((s) => s.setEnvironment);
  const saveSession = useAppStore((s) => s.saveSession);
  const environmentLabel = useAppStore((s) => s.environmentLabel);
  const atmospheres = getAtmospheres();

  const pO2 = useMemo(() => {
    try {
      return runCalculation("p-o2-kpa", { o2: env.o2Fraction, psi: env.totalPressurePsi });
    } catch {
      return null;
    }
  }, [env]);

  const pillarLabel = PILLARS.find((p) => p.id === pillar)?.label ?? pillar;

  const onSave = () => {
    saveSession({
      title: `${environmentLabel} · ${pillarLabel}`,
      environment: env.id as EnvId,
      provenance: "scenario context",
      notes: `Shared scenario context — ${env.label}: gravity ${fmtGravity(env.gravityG)}, P ${env.totalPressureKpa} kPa / ${env.totalPressurePsi} psi, x_O2 ${env.o2Fraction}, pO2 ${pO2 ? fmtNum(pO2.value) : "—"} kPa, diluents ${env.diluents}. Pillar: ${pillarLabel}.`,
    });
  };

  const chips: { label: string; value: string }[] = [
    { label: "gravity", value: fmtGravity(env.gravityG) },
    { label: "total pressure", value: `${env.totalPressureKpa} kPa / ${env.totalPressurePsi} psi` },
    { label: "O2 fraction", value: `${env.o2Fraction}` },
    { label: "pO2 (registry)", value: pO2 ? `${fmtNum(pO2.value)} kPa` : "—" },
    { label: "diluents", value: env.diluents },
  ];

  return (
    <section aria-label="Shared scenario context" className="glass-panel rounded-lg p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 lg:w-72">
          <label htmlFor="env-select" className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            Scenario environment
          </label>
          <Select value={env.id} onValueChange={(v) => {
            const target = atmospheres.environments.find((e) => e.id === v);
            if (target) setEnvironment(target.id as EnvId, target.label);
          }}>
            <SelectTrigger id="env-select" size="sm" className="mt-1.5 w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {atmospheres.environments.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  <span className="flex items-center gap-2">
                    <span>{e.label}</span>
                    <KindBadge kind={e.kind} />
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="mt-1.5 flex items-center gap-2">
            <KindBadge kind={env.kind} />
          </div>
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">{env.evidenceStatus}</p>
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Live readout</p>
          <dl className="mt-1.5 grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
            {chips.map((c) => (
              <div key={c.label} className="rounded-md border border-border/50 bg-accent/20 px-2.5 py-1.5 min-w-0" suppressHydrationWarning>
                <dt className="text-[10px] uppercase tracking-wide text-muted-foreground">{c.label}</dt>
                <dd className="mt-0.5 truncate font-mono text-xs font-semibold text-foreground/95" title={c.value} suppressHydrationWarning>
                  {c.value}
                </dd>
              </div>
            ))}
          </dl>
          <p className="provenance-strip mt-3">
            {atmospheres.note} · pO2 recomputed via registry equation p-o2-kpa. Concept atmospheres carry no validated
            partial-gravity combustion data.
          </p>
        </div>

        <div className="shrink-0">
          <Button size="sm" onClick={onSave} className="h-8">
            <Save className="mr-1.5 h-3.5 w-3.5" /> Save as session
          </Button>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// research session shelf
// ---------------------------------------------------------------------------

function SessionShelf() {
  const sessions = useAppStore((s) => s.sessions);
  const deleteSession = useAppStore((s) => s.deleteSession);
  const setEnvironment = useAppStore((s) => s.setEnvironment);
  const setView = useAppStore((s) => s.setView);
  const openInvestigation = useAppStore((s) => s.openInvestigation);

  const restore = (s: ResearchSession) => {
    if (s.environment) {
      const env = getEnvironment(s.environment);
      setEnvironment(s.environment, env?.label ?? s.environment);
    }
    if (s.investigation) openInvestigation(s.investigation);
    else setView("scenarios");
  };

  return (
    <section aria-label="Research session shelf" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">Research session shelf</h3>
        <p className="text-[11px] text-muted-foreground">
          Saved scenario contexts and workspace snapshots (stored locally in this browser; replaces the old standalone
          Workspace / Reports pages per IA consolidation).
        </p>
      </div>
      {sessions.length === 0 ? (
        <div className="glass-panel rounded-lg p-6 text-center">
          <p className="text-sm text-muted-foreground">
            No research sessions saved yet. Set an environment and pillar above, then press{" "}
            <span className="font-medium text-foreground/90">Save as session</span>.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {sessions.map((s) => (
            <article key={s.id} className="glass-panel flex flex-col gap-2 rounded-lg p-3">
              <div className="flex items-start justify-between gap-2">
                <h4 className="text-[13px] font-semibold leading-tight">{s.title}</h4>
                <span className="shrink-0 font-mono text-[10px] text-muted-foreground">
                  {new Date(s.createdAt).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" })}
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {s.environment ? <Badge variant="outline" className="text-[10px]">{s.environment}</Badge> : null}
                {s.investigation ? <Badge variant="outline" className="font-mono text-[10px]">{s.investigation}</Badge> : null}
                {s.provenance ? <Badge variant="secondary" className="text-[10px]">{s.provenance}</Badge> : null}
              </div>
              {s.notes ? <p className="line-clamp-3 text-[11px] leading-snug text-muted-foreground">{s.notes}</p> : null}
              <div className="mt-auto flex items-center gap-2 pt-1">
                <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => restore(s)}>
                  <RotateCcw className="mr-1 h-3 w-3" aria-hidden /> Restore
                </Button>
                <Button variant="ghost" size="sm" className="h-7 text-[11px] text-destructive hover:text-destructive" onClick={() => deleteSession(s.id)}>
                  <Trash2 className="mr-1 h-3 w-3" aria-hidden /> Delete
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// main view
// ---------------------------------------------------------------------------

export function ScenariosView() {
  const environment = useAppStore((s) => s.environment);
  const pillar = useAppStore((s) => s.scenarioPillar);
  const [mounted, setMounted] = useState(false);
  // §8 — seed prompt channel from FacilityScreening to the Fire Safety Assistant
  const [assistantSeed, setAssistantSeed] = useState<{ text: string; nonce: number } | null>(null);

  useEffect(() => {
    const t = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(t);
  }, []);

  const env = getEnvironment(environment) ?? getAtmospheres().environments[1];

  return (
    <div className="flex flex-col gap-4 pb-24">
      <header className="flex flex-col gap-1">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          <span className="ember-gradient-text">Scenarios</span> — the fire-safety lifecycle
        </h1>
        <p className="max-w-3xl text-xs leading-relaxed text-muted-foreground">
          One shared scenario context (environment, gravity, atmosphere) drives Prevention → Detection → Prediction →
          Suppression. Calculators come from the verified equation registry; models refuse out-of-domain inputs; every
          session can be saved to the shelf below.
        </p>
      </header>

      <LifecycleNav pillar={pillar} />

      {mounted ? (
        <>
          <ContextBar env={env} pillar={pillar} />
          <FacilityScreening env={env} onAskAssistant={(text) => setAssistantSeed({ text, nonce: Date.now() })} />
          <FacilityAnalysisPanel />
          <FireSafetyAssistant env={env} seedPrompt={assistantSeed} />
          <div role="tabpanel" aria-label={`${PILLARS.find((p) => p.id === pillar)?.label ?? pillar} panel`}>
            {pillar === "prevention" && <PreventionPanel env={env} />}
            {pillar === "detection" && <DetectionPanel env={env} />}
            {pillar === "prediction" && <PredictionPanel env={env} />}
            {pillar === "suppression" && <SuppressionPanel env={env} />}
          </div>
          <Separator className="bg-border/60" />
          <SessionShelf />
        </>
      ) : (
        <div className="glass-panel flex items-center justify-center rounded-lg p-12">
          <p className="flex items-center gap-2 text-sm text-muted-foreground" aria-live="polite">
            <span className="h-2 w-2 animate-pulse rounded-full bg-primary" aria-hidden /> Restoring saved scenario context…
          </p>
        </div>
      )}
    </div>
  );
}
