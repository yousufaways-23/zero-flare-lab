"use client";

// ZERO FLARE — MathematicalModelsPanel (17A.15): the Mathematical Model
// Registry in Research Tools. Distinguishes equations (registry) from
// mathematical models (structured compositions); shows lifecycle statuses,
// governing equations, applicability per environment, validation evidence;
// includes an applicability gate + selection demo driven by the same engine
// CIR-1 uses (runMathematicalModel executes only IMPLEMENTED models).

import { useMemo, useState } from "react";
import { useAppStore, type AdvancedPanel } from "@/lib/app-store";
import {
  allMathModels, checkModelApplicability, runMathematicalModel, selectMathModels,
  type MathModel, type Compatibility, type ModelSelection,
} from "@/lib/science/math-models";
import { getEquation } from "@/lib/science/equations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Sigma, ShieldCheck, ShieldAlert, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const LIFECYCLE_STYLE: Record<string, string> = {
  IMPLEMENTED: "border-emerald-500/50 bg-emerald-500/10 text-emerald-600",
  DOCUMENTED_ONLY: "border-dashed border-muted-foreground/50 text-muted-foreground",
};
const COMPAT_STYLE: Record<Compatibility, string> = {
  direct: "border-emerald-500/50 bg-emerald-500/10 text-emerald-700",
  modified: "border-[#5799d1]/45 bg-[#5799d1]/15 text-[#9ccae9]",
  qualitative: "border-amber-500/45 bg-amber-500/10 text-amber-700",
  "not-applicable": "border-destructive/40 bg-destructive/10 text-red-400",
};

const ENV_IDS = ["earth", "iss", "moon", "mars", "spacecraft", "spacesuit"] as const;
const PHENOMENA = ["droplet-combustion", "flame-spread", "ignition", "smoke", "atmosphere", "buoyancy", "suppression", "cool-flames"] as const;

export function MathematicalModelsPanel() {
  const models = useMemo(() => allMathModels(), []);
  const [envId, setEnvId] = useState<string>("iss");
  const [phenomenon, setPhenomenon] = useState<string>("droplet-combustion");
  const [d0, setD0] = useState("3");
  const [k, setK] = useState("0.8");
  const [runResult, setRunResult] = useState<string | null>(null);

  const selection: ModelSelection = useMemo(
    () => selectMathModels({ phenomenon, environmentId: envId }),
    [phenomenon, envId],
  );

  const appRows = useMemo(
    () =>
      models.map((m) => ({
        model: m,
        app: checkModelApplicability(m.model_id, envId),
      })),
    [models, envId],
  );

  const runD2 = () => {
    const r = runMathematicalModel("d2-law-droplet-combustion", { d0Mm: Number(d0), kMm2S: Number(k) });
    setRunResult(r.executed ? `lifetime = ${r.outputs.lifetime_s} s (constant-K idealisation; PARTIALLY_VALIDATED — MAE ~8-10 s per-test on FLEX)` : `refused: ${r.refusal}`);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* registry */}
      <Accordion type="single" collapsible className="research-panel rounded-lg px-4">
        {models.map((m: MathModel) => (
          <AccordionItem key={m.model_id} value={m.model_id}>
            <AccordionTrigger className="text-left">
              <span className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-[11px] text-primary">{m.model_id}</span>
                <span className="text-xs font-medium">{m.name}</span>
                <Badge variant="outline" className={cn("text-[9px]", LIFECYCLE_STYLE[m.implementation_status] ?? "")}>{m.implementation_status}</Badge>
                <Badge variant="outline" className="text-[9px]">{m.model_class}</Badge>
                {m.executable ? (
                  <Badge variant="outline" className="gap-1 text-[9px] text-emerald-600"><ShieldCheck className="h-2.5 w-2.5" aria-hidden /> executable</Badge>
                ) : (
                  <Badge variant="outline" className="gap-1 text-[9px] text-muted-foreground"><ShieldAlert className="h-2.5 w-2.5" aria-hidden /> reference only</Badge>
                )}
              </span>
            </AccordionTrigger>
            <AccordionContent className="space-y-2 pb-3">
              <p className="text-[11px] leading-snug text-muted-foreground">{m.description}</p>
              <div className="grid gap-x-6 gap-y-1 text-[10px] sm:grid-cols-2">
                <p><span className="text-muted-foreground">phenomena:</span> {m.phenomenon_tags.join(", ")}</p>
                <p><span className="text-muted-foreground">solution:</span> {m.solution_method}</p>
                <p><span className="text-muted-foreground">verification:</span> {m.verification_status}</p>
                <p><span className="text-muted-foreground">validation:</span> {m.validation_status}</p>
              </div>
              <div className="rounded border border-border/50 bg-black/10 p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Governing equations</p>
                <ul className="mt-1 space-y-0.5">
                  {(m.governing_equations ?? []).map((g, i) => (
                    <li key={i} className="font-mono text-[10px] text-foreground/85">{g}</li>
                  ))}
                </ul>
                <p className="mt-1.5 text-[10px] text-muted-foreground">
                  registry equations:{" "}
                  {(m.related_equation_ids ?? []).map((id) => {
                    const eq = getEquation(id);
                    return (
                      <button key={id} onClick={() => useAppStore.getState().openAdvanced("equations")} className="mr-1 font-mono text-primary hover:underline" title={eq ? `${eq.name} — open in Equation Registry` : id}>
                        {id}
                      </button>
                    );
                  })}
                </p>
              </div>
              <div className="rounded border border-border/50 bg-black/10 p-2">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Applicability per environment</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {ENV_IDS.map((e) => {
                    const compat = m.environments[e] as Compatibility | undefined;
                    return (
                      <span key={e} className={cn("rounded border px-1.5 py-0.5 text-[9px]", COMPAT_STYLE[compat ?? "not-applicable"])}>
                        {e}: {compat ?? "not-applicable"}
                      </span>
                    );
                  })}
                </div>
              </div>
              {(m.limitations ?? []).length > 0 && (
                <ul className="list-disc space-y-0.5 pl-4 text-[10px] text-muted-foreground">
                  {(m.limitations ?? []).map((l, i) => <li key={i}>{l}</li>)}
                </ul>
              )}
              <p className="provenance-strip">sources: {(m.source_references ?? []).map((s) => s.source).join(" · ")}</p>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>

      {/* applicability gate + selection demo */}
      <section aria-label="Model applicability and selection" className="research-panel rounded-lg p-4">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Sigma className="h-4 w-4 text-primary" aria-hidden />
          Model selection — applicability gate + documented ranking
        </h3>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Select value={phenomenon} onValueChange={setPhenomenon}>
            <SelectTrigger size="sm" className="w-[200px] text-xs" aria-label="Target phenomenon">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PHENOMENA.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={envId} onValueChange={setEnvId}>
            <SelectTrigger size="sm" className="w-[170px] text-xs" aria-label="Environment">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENV_IDS.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="mt-3 space-y-1.5">
          {selection.recommended ? (
            <div className="rounded border border-emerald-500/40 bg-emerald-500/10 p-2.5">
              <p className="text-xs font-semibold text-emerald-700">
                Recommended: {selection.recommended.model.model_id} — {selection.recommended.applicability.compatibility} in {envId}
              </p>
              <ul className="mt-1 space-y-0.5 text-[10px] text-muted-foreground">
                {Object.entries(selection.recommended.ranking_breakdown).map(([kk, v]) => <li key={kk}>{kk}: {v}</li>)}
              </ul>
              {selection.no_quantitative_model && <p className="mt-1 text-[10px] italic text-amber-600">No fully-validated quantitative model for this combination — treat outputs as research reference.</p>}
            </div>
          ) : (
            <div className="rounded border border-destructive/40 bg-destructive/10 p-2.5 text-xs text-red-400">
              No registered model matches this phenomenon/environment — reliable quantitative prediction cannot currently be produced. {selection.rejected.length} candidate(s) rejected (reasons below).
            </div>
          )}
          {selection.alternatives.map((a) => (
            <div key={a.model.model_id} className="rounded border border-border/50 bg-black/10 p-2 text-[10px]">
              <span className="font-mono text-primary">{a.model.model_id}</span> — {a.applicability.compatibility} · {a.model.validation_status}
            </div>
          ))}
          {selection.rejected.map((r) => (
            <div key={r.model.model_id} className="text-[10px] text-muted-foreground">
              <span className="font-mono">{r.model.model_id}</span>: rejected — {r.reason}
            </div>
          ))}
        </div>
        <p className="provenance-strip mt-3">{selection.policy}</p>
      </section>

      {/* executable runner demo (d²-law) */}
      <section aria-label="Model runner demonstration" className="research-panel rounded-lg p-4">
        <h3 className="text-sm font-semibold">Runner demonstration — d²-law droplet combustion (PARTIALLY_VALIDATED)</h3>
        <p className="mt-1 text-[11px] text-muted-foreground">
          d(t) = √(d0² − K·t) · t_life = d0²/K — executed through the same runner CIR-1 uses. Validation evidence (PSI-69, n=259): constant-K idealisation holds as first-order trajectory but fails per-test quantitative prediction (MAE 7.9-10.3 s).
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <Input value={d0} onChange={(e) => setD0(e.target.value)} className="h-8 w-28 font-mono text-xs" aria-label="Initial diameter d0 (mm)" />
          <span className="text-xs text-muted-foreground">d0 [mm]</span>
          <Input value={k} onChange={(e) => setK(e.target.value)} className="h-8 w-28 font-mono text-xs" aria-label="Burning rate K (mm²/s)" />
          <span className="text-xs text-muted-foreground">K [mm²/s]</span>
          <Button size="sm" variant="outline" className="h-8 text-xs" onClick={runD2}>Run model</Button>
        </div>
        {runResult && <p className="mt-2 rounded border border-border/50 bg-black/10 p-2 font-mono text-[11px]" role="status">{runResult}</p>}
        <p className="provenance-strip mt-2">Only IMPLEMENTED models execute; DOCUMENTED_ONLY models return their governing equations and citations with an explicit refusal.</p>
      </section>
    </div>
  );
}
