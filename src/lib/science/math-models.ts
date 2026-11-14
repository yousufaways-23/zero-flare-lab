// ZERO FLARE — Mathematical Model Registry layer (17A).
//
// TYPES + LOADER + RUNNERS + APPLICABILITY GATE + SELECTION ENGINE.
//
// Distinctions enforced here (17A.2):
//  - equations (registry, 63, reference-tested) ≠ mathematical models (this file:
//    structured compositions of equations + assumptions + conditions)
//  - only models with implementation_status === "IMPLEMENTED" and executable === true
//    can run; DOCUMENTED_ONLY models return their citations and refuse execution
//  - environment compatibility: direct | modified | qualitative | not-applicable
//
// Runners compose the verified equation registry via runCalculation — no new
// physics is invented here.

import registryJson from "@/data/generated/mathematical_models.json";
import atmospheresJson from "@/data/generated/atmospheres.json";
import { runCalculation, getEquation } from "@/lib/science/equations";
import { runFlexModel, runCfigModel } from "@/lib/science/models";
import { flowRegime, grashof, rayleigh, richardson, froude, buoyantVelocityCm } from "@/lib/science/physics";

export interface MathModel {
  model_id: string;
  name: string;
  model_class: string;
  phenomenon: string[];
  intended_applications: string[];
  description: string;
  physical_principles: string[];
  governing_equations: string[];
  related_equation_ids: string[];
  required_variables: string[];
  input_schema: Record<string, string> | null;
  output_variables: string[];
  units: Record<string, string> | null;
  assumptions: string[];
  environmental_domain: Record<string, unknown> | null;
  applicability_limits: Record<string, unknown> | null;
  solution_method: string;
  source_references: { source: string; type: string; location?: string; snippet?: string }[];
  experimental_validation: Record<string, unknown> | null;
  calibration_information: Record<string, unknown> | null;
  uncertainty_information: Record<string, unknown> | null;
  computational_requirements: Record<string, unknown> | null;
  implementation_status: string;
  verification_status: string;
  validation_status: string;
  limitations: string[];
  model_version: string;
  environments: Record<string, string>;
  phenomenon_tags: string[];
  executable: boolean;
  kb_citations?: { source: string; location?: string; batchId?: string; snippet?: string }[];
  existing_card?: string;
  validation_evidence_file?: string;
}

const REGISTRY_DOC = registryJson as unknown as {
  registry_version: string;
  models: MathModel[];
  stats: Record<string, number>;
  environment_profiles: { id: string; label: string; gravityG: number; o2Fraction: number; habitat_vs_exterior: string | null }[];
  ranking_policy: string;
};

export interface EnvironmentProfile {
  id: string;
  label: string;
  gravityG: number;
  o2Fraction: number;
  totalPressureKpa: number | null;
  habitat_vs_exterior: string | null;
}

export const ENVIRONMENT_PROFILES: EnvironmentProfile[] = atmospheresJson.environments.map((e: { id: string; label: string; gravityG: number; o2Fraction: number; totalPressureKpa?: number }) => {
  const prof = REGISTRY_DOC.environment_profiles.find((p) => p.id === e.id);
  return {
    id: e.id,
    label: e.label,
    gravityG: e.gravityG,
    o2Fraction: e.o2Fraction,
    totalPressureKpa: e.totalPressureKpa ?? null,
    habitat_vs_exterior: prof?.habitat_vs_exterior ?? null,
  };
});

export const getMathModel = (id: string): MathModel | undefined => REGISTRY_DOC.models.find((m) => m.model_id === id);
export const allMathModels = (): MathModel[] => REGISTRY_DOC.models;
export const mathRegistryStats = () => REGISTRY_DOC.stats;

export function searchMathModels(query: string, limit = 6): MathModel[] {
  const q = query.toLowerCase();
  const scored = REGISTRY_DOC.models
    .map((m) => {
      const hay = `${m.name} ${m.description} ${m.phenomenon.join(" ")} ${m.phenomenon_tags.join(" ")} ${m.model_class} ${m.related_equation_ids.join(" ")}`.toLowerCase();
      let score = 0;
      for (const t of q.split(/\s+/).filter((w) => w.length > 2)) if (hay.includes(t)) score += 1;
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score);
  return scored.slice(0, limit).map((x) => x.m);
}

/* ------------------------------------------------------------------ */
/* Applicability gate (17A.6-G / 17A.7-B)                              */
/* ------------------------------------------------------------------ */

export type Compatibility = "direct" | "modified" | "qualitative" | "not-applicable";

export interface ApplicabilityResult {
  model_id: string;
  environment_id: string;
  compatibility: Compatibility;
  reasons: string[];
  executable_in_environment: boolean;
}

export function checkModelApplicability(modelId: string, environmentId: string): ApplicabilityResult | { error: string } {
  const m = getMathModel(modelId);
  const env = ENVIRONMENT_PROFILES.find((e) => e.id === environmentId);
  if (!m) return { error: `unknown model "${modelId}" — search_mathematical_models lists ids` };
  if (!env) return { error: `unknown environment "${environmentId}" — use: ${ENVIRONMENT_PROFILES.map((e) => e.id).join(", ")}` };
  const compat = (m.environments[environmentId] ?? "not-applicable") as Compatibility;
  const reasons: string[] = [];
  const grav = env.gravityG;
  if (grav <= 0.02) reasons.push(`environment gravity ${env.gravityG.toExponential(1)} g ≈ microgravity`);
  else if (grav < 0.65) reasons.push(`partial gravity ${env.gravityG} g — no combustion outcome data exists in PSI for this regime (field-wide gap)`);
  else reasons.push(`terrestrial gravity ${env.gravityG} g`);
  if (m.model_id === "d2-law-droplet-combustion") {
    if (env.gravityG <= 0.02) reasons.push("spherical symmetry assumption holds (FLEX/CFI regime)");
    else reasons.push("buoyant distortion of the droplet flame violates the spherical-symmetry assumption — qualitative use only");
  }
  if (m.model_id === "thermally-thick-ignition") {
    reasons.push("preheat conduction is gravity-independent (transfers directly as qualitative formulation); the subsequent flame-spread stage is gravity-dependent and NOT modelled here");
  }
  if (m.model_id === "flex-extinction-v2" && env.gravityG > 0.02) {
    reasons.push("training data are ISS microgravity FLEX tests; the model refuses gravity > 0.02 g (partial-gravity droplet data does not exist — field-wide gap)");
  }
  if (m.model_id === "buoyancy-transport-regime") {
    reasons.push("scaling uses the local gravity explicitly, so every gravity regime is its subject (diffusion-limited ↔ buoyancy-dominated)");
  }
  if (env.habitat_vs_exterior) reasons.push(env.habitat_vs_exterior);
  return {
    model_id: modelId,
    environment_id: environmentId,
    compatibility: compat,
    reasons,
    executable_in_environment: m.executable && compat === "direct",
  };
}

/* ------------------------------------------------------------------ */
/* Runners — only IMPLEMENTED + executable models (17A.12)             */
/* ------------------------------------------------------------------ */

export interface ModelRunResult {
  model_id: string;
  executed: boolean;
  refusal?: string;
  outputs: Record<string, number | string | string[] | number[] | null>;
  steps: { equation_id: string; label: string; inputs: Record<string, number>; value: number; unit: string }[];
  assumptions: string[];
  limitations: string[];
  provenance: string[];
}

const step = (eqId: string, inputs: Record<string, number>) => {
  const r = runCalculation(eqId, inputs);
  const eq = getEquation(eqId);
  return { equation_id: eqId, label: eq?.name ?? eqId, inputs, value: r.value, unit: r.unit, warnings: r.warnings };
};

type NumInputs = Record<string, number | string | undefined>;
const numOf = (v: number | string | undefined): number | undefined => {
  if (typeof v === "number") return Number.isFinite(v) ? v : undefined;
  if (typeof v === "string" && v.trim() !== "") { const x = Number(v); return Number.isFinite(x) ? x : undefined; }
  return undefined;
};

export function runMathematicalModel(modelId: string, inputs: NumInputs): ModelRunResult {
  const m = getMathModel(modelId);
  const base: ModelRunResult = { model_id: modelId, executed: false, outputs: {}, steps: [], assumptions: m?.assumptions ?? [], limitations: m?.limitations ?? [], provenance: [] };
  if (!m) return { ...base, refusal: `unknown model "${modelId}"` };
  if (!m.executable || m.implementation_status !== "IMPLEMENTED") {
    return { ...base, refusal: `model "${m.name}" is ${m.implementation_status} — it is a research reference with citations, not an executable implementation. Governing equations: ${(m.governing_equations ?? []).join("; ")}` };
  }

  const missing = (keys: string[]) => keys.filter((k) => !(typeof inputs[k] === "number" && Number.isFinite(inputs[k])));
  const provenance = m.source_references?.map((s) => s.source) ?? [];

  try {
    switch (modelId) {
      case "ideal-atmosphere-state": {
        const miss = missing(["o2", "pressureKpa"]);
        if (miss.length) return { ...base, refusal: `missing required inputs: ${miss.join(", ")} — provide them explicitly; values are never guessed` };
        // p-o2-kpa expects psi; convert kPa → psi explicitly for the registry call
        const pO2psi = step("p-o2-kpa", { o2: numOf(inputs.o2) ?? 0, psi: +((numOf(inputs.pressureKpa) ?? 0) * 0.145038).toFixed(6) });
        const dens = step("gas-density", { p: (numOf(inputs.pressureKpa) ?? 0) * 1000, mw: 28.96, t: numOf(inputs.temperatureK) ?? 293.15 });
        const mw = step("mean-molecular-weight", { x1: numOf(inputs.o2) ?? 0, m1: 32.0, x2: 1 - (numOf(inputs.o2) ?? 0), m2: 28.01 });
        return {
          ...base,
          executed: true,
          outputs: { oxygen_partial_pressure_kpa: +((numOf(inputs.o2) ?? 0) * (numOf(inputs.pressureKpa) ?? 0)).toFixed(3), density_kg_m3: +dens.value.toFixed(4), mean_molecular_weight_g_mol: +mw.value.toFixed(2), pO2_registry_check_kpa: +pO2psi.value.toFixed(3) },
          steps: [pO2psi, dens, mw],
          provenance,
        };
      }
      case "buoyancy-transport-regime": {
        const g = numOf(inputs.g) ?? 1;
        const vent = numOf(inputs.ventilationCmS) ?? 5;
        const regime = flowRegime(g, vent);
        const gr = step("grashof-number", { g, beta: 1 / 300, dt: numOf(inputs.dT) ?? 2000, l: numOf(inputs.lengthM) ?? 0.01, nu: 1.6e-5 });
        const ra = step("rayleigh-number", { g, beta: 1 / 300, dt: numOf(inputs.dT) ?? 2000, l: numOf(inputs.lengthM) ?? 0.01, nu: 1.6e-5 });
        const ri = step("richardson-number", { g, beta: 1 / 300, dt: numOf(inputs.dT) ?? 2000, l: numOf(inputs.lengthM) ?? 0.01, u: vent / 100 });
        const fr = step("froude-number", { u: vent / 100, g, l: numOf(inputs.lengthM) ?? 0.01 });
        return {
          ...base,
          executed: true,
          outputs: { flow_regime: regime.id, regime_label: regime.label, buoyant_velocity_cm_s: +buoyantVelocityCm(g).toFixed(3), richardson_number: ri.value, grashof_number: gr.value, rayleigh_number: ra.value, froude_number: fr.value, regime_detail: regime.detail },
          steps: [gr, ra, ri, fr],
          provenance,
        };
      }
      case "d2-law-droplet-combustion": {
        const miss = missing(["d0Mm", "kMm2S"]);
        if (miss.length) return { ...base, refusal: `missing required inputs: ${miss.join(", ")} — the recovered FLEX table carries K as 'Burning rate; mm^2/s' per test` };
        const d0 = numOf(inputs.d0Mm) ?? 0;
        const k = numOf(inputs.kMm2S) ?? 0;
        const tLife = step("droplet-lifetime", { d0, k });
        const trajectory = [0, 0.25, 0.5, 0.75, 1].map((f) => +(d0 * Math.sqrt(Math.max(0, 1 - f))).toFixed(3));
        const outputs: Record<string, number | string | number[] | null> = { lifetime_s: +tLife.value.toFixed(3), d_ext_optional: inputs.dExtMm ?? null, trajectory_fractions_of_lifetime: trajectory, burn_rate_note: "K input used directly (recovered 'Burning rate' column, mm^2/s)" };
        const dLaw = step("d2-law", { d0, k, t: +(tLife.value * 0.5).toFixed(4) });
        return { ...base, executed: true, outputs, steps: [tLife, dLaw], provenance, assumptions: [...base.assumptions, "trajectory shown at fractions of lifetime (constant-K idealisation)"] };
      }
      case "thermally-thick-ignition": {
        const miss = missing(["krhoc", "tIgC", "tInfC", "qflux"]);
        if (miss.length) return { ...base, refusal: `missing required inputs: ${miss.join(", ")} (thermal inertia, ignition/ambient temperature, incident flux)` };
        const tIg = step("ignition-time-thick", { krhoc: numOf(inputs.krhoc) ?? 0, tig: numOf(inputs.tIgC) ?? 0, tinf: numOf(inputs.tInfC) ?? 0, qflux: numOf(inputs.qflux) ?? 0 });
        const qc = step("critical-heat-flux", { h: 10, tig: (numOf(inputs.tIgC) ?? 0) + 273.15, tinf: (numOf(inputs.tInfC) ?? 0) + 273.15, e: 0.9 });
        const ti = step("thermal-inertia", { k: numOf(inputs.krhoc) ?? 0.2, rho: 1190, c: 1420 });
        return {
          ...base,
          executed: true,
          outputs: { ignition_time_s: +tIg.value.toFixed(3), critical_flux_w_m2: +qc.value.toFixed(1), thermal_inertia_note: `input k*rho*c used directly; k=0.2/rho=1190/c=1420 shown as a PMMA-like example: ${ti.value.toFixed(0)}` },
          steps: [tIg, qc],
          provenance,
          limitations: [...base.limitations, "gravity-independent preheat only — flame heat-feedback stage not modelled"],
        };
      }
      case "stokes-smoke-settling": {
        const dp = numOf(inputs.dp) ?? 1e-6;
        const g = numOf(inputs.g) ?? 1;
        const mu = numOf(inputs.mu) ?? 1.8e-5;
        const TK = numOf(inputs.TK) ?? 293.15;
        const vs = step("stokes-settling", { rhop: numOf(inputs.rhoP) ?? 1000, dp, g, mu });
        const cc = step("cunningham-correction", { kn: 0.066e-6 / Math.max(dp, 1e-9) });
        const bd = step("brownian-diffusivity", { t: TK, mu, dp });
        return {
          ...base,
          executed: true,
          outputs: { settling_velocity_m_s: g <= 0.02 ? 0 : +vs.value.toFixed(6), settling_note: g <= 0.02 ? "microgravity: gravitational settling vanishes; Brownian diffusion + ventilation dominate" : "1-g settling", brownian_diffusivity_m2_s: +bd.value.toPrecision(3), regime_note: dp < 1e-6 ? "sub-micron: Brownian diffusion dominates transport" : "super-micron: settling/drag scaling applies in 1-g" },
          steps: [vs, bd],
          provenance,
        };
      }
      case "froude-spread-scaling": {
        const miss = missing(["u", "g", "lengthM"]);
        if (miss.length) return { ...base, refusal: `missing required inputs: ${miss.join(", ")}` };
        const fr = step("froude-number", { u: numOf(inputs.u) ?? 0, g: numOf(inputs.g) ?? 0, l: numOf(inputs.lengthM) ?? 0.01 });
        const vstar = step("froude-spread-scaling", { u: numOf(inputs.u) ?? 0, g: numOf(inputs.g) ?? 0, l: numOf(inputs.lengthM) ?? 0.01 });
        return {
          ...base,
          executed: true,
          outputs: { froude_number: +fr.value.toFixed(4), dimensionless_spread_V_star: +vstar.value.toFixed(4), note: "qualitative scaling — quantitative rates need fuel-specific constants (not included)" },
          steps: [fr, vstar],
          provenance,
        };
      }
      case "flex-extinction-v2": {
        const miss = ["xo2", "pressureMmHg", "d0Mm", "fuel"].filter((k) => inputs[k] === undefined && !(k === "fuel" && typeof inputs.fuel === "string"));
        if (miss.length) return { ...base, refusal: `missing required inputs: ${miss.join(", ")}` };
        const pred = runFlexModel({
          xo2: numOf(inputs.xo2) ?? 0,
          pressureMmHg: numOf(inputs.pressureMmHg) ?? 0,
          d0Mm: numOf(inputs.d0Mm) ?? 0,
          fuel: inputs.fuel === "Heptane" ? "Heptane" : "Methanol",
          heFraction: numOf(inputs.heFraction) ?? 0,
          coFraction: numOf(inputs.coFraction) ?? 0,
          gravityG: numOf(inputs.gravityG) ?? 1e-6,
        });
        if (!pred.ok) return { ...base, refusal: pred.refusal ?? "outside applicability domain" };
        return {
          ...base,
          executed: true,
          outputs: { extinction_relative_score: +(pred.score ?? 0).toFixed(3), interpretation: pred.interpretation ?? "", calibrated: "NO — relative score only" },
          provenance: [pred.provenance],
        };
      }
      case "cfig-hot-ignition": {
        const miss = ["xfBefore", "pBar", "xo2", "hcBurnRate", "o2Flow", "tadK", "zst"].filter((k) => inputs[k] === undefined);
        if (miss.length) return { ...base, refusal: `missing required inputs: ${miss.join(", ")}` };
        const pred = runCfigModel({
          xfBefore: numOf(inputs.xfBefore) ?? 0,
          pBar: numOf(inputs.pBar) ?? 0,
          xo2: numOf(inputs.xo2) ?? 0,
          hcBurnRate: numOf(inputs.hcBurnRate) ?? 0,
          o2Flow: numOf(inputs.o2Flow) ?? 0,
          tadK: numOf(inputs.tadK) ?? 0,
          zst: numOf(inputs.zst) ?? 0,
          fuel: (typeof inputs.fuel === "string" ? (inputs.fuel as unknown as "ethane" | "propane" | "butane") : "ethane"),
          gravityG: numOf(inputs.gravityG) ?? 1e-6,
        });
        if (!pred.ok) return { ...base, refusal: pred.refusal ?? "outside applicability domain" };
        return {
          ...base,
          executed: true,
          outputs: { hot_ignition_relative_score: +(pred.score ?? 0).toFixed(3), interpretation: pred.interpretation ?? "" },
          provenance: [pred.provenance],
        };
      }
      default:
        return { ...base, refusal: `no runner implemented for "${modelId}"` };
    }
  } catch (e) {
    return { ...base, refusal: `execution error: ${(e as Error).message}` };
  }
}

/* ------------------------------------------------------------------ */
/* Selection engine (17A.7)                                            */
/* ------------------------------------------------------------------ */

export interface ModelSelectionRequest {
  phenomenon: string;
  environmentId: string;
  requestedOutput?: string;
}

export interface ModelSelection {
  request: ModelSelectionRequest;
  recommended: { model: MathModel; applicability: ApplicabilityResult; ranking_breakdown: Record<string, string> } | null;
  alternatives: { model: MathModel; applicability: ApplicabilityResult; ranking_breakdown: Record<string, string> }[];
  rejected: { model: MathModel; reason: string }[];
  no_quantitative_model: boolean;
  policy: string;
}

const VALIDATION_TIER = (m: MathModel): number => {
  const v = m.validation_status ?? "";
  if (v.startsWith("EXPERIMENTALLY_VALIDATED")) return 4;
  if (v.startsWith("PARTIALLY_VALIDATED")) return 3;
  if (v.startsWith("validated_against_reference_tests")) return 3;
  if ((m.verification_status ?? "").startsWith("CODE_VERIFIED")) return 2;
  if (v.startsWith("documented_in_sources")) return 1;
  return 0;
};

export function selectMathModels(req: ModelSelectionRequest): ModelSelection {
  const rejected: { model: MathModel; reason: string }[] = [];
  const candidates: { model: MathModel; applicability: ApplicabilityResult; ranking_breakdown: Record<string, string> }[] = [];

  const pheno = req.phenomenon.toLowerCase();
  for (const m of REGISTRY_DOC.models) {
    const tags = [...(m.phenomenon_tags ?? []), ...(m.phenomenon ?? [])].map((x) => x.toLowerCase());
    const matchesPheno = tags.some((t) => pheno.includes(t) || t.includes(pheno.split(" ")[0]));
    if (!matchesPheno) {
      rejected.push({ model: m, reason: `phenomenon mismatch — model covers [${m.phenomenon_tags.join(", ")}]` });
      continue;
    }
    const app = checkModelApplicability(m.model_id, req.environmentId);
    if ("error" in app) {
      rejected.push({ model: m, reason: app.error });
      continue;
    }
    if (app.compatibility === "not-applicable") {
      rejected.push({ model: m, reason: `not applicable in "${req.environmentId}" — ${app.reasons[0] ?? ""}` });
      continue;
    }
    const want = req.requestedOutput?.toLowerCase();
    if (want && !(m.output_variables ?? []).some((o) => o.toLowerCase().includes(want))) {
      rejected.push({ model: m, reason: `requested output "${req.requestedOutput}" not among model outputs [${(m.output_variables ?? []).join(", ")}]` });
      continue;
    }
    const ranking_breakdown: Record<string, string> = {
      environment_compatibility: app.compatibility,
      validation_tier: `${VALIDATION_TIER(m)}/4 (${m.validation_status})`,
      executable: m.executable ? "yes (IMPLEMENTED)" : `no (${m.implementation_status})`,
      output_match: want ? `includes "${req.requestedOutput}"` : "matches phenomenon",
      phenomenon_tags: m.phenomenon_tags.join(", "),
    };
    candidates.push({ model: m, applicability: app, ranking_breakdown });
  }

  // documented policy order: direct > modified > qualitative; executable+validated first
  const compatRank = { direct: 0, modified: 1, qualitative: 2 } as Record<string, number>;
  candidates.sort((a, b) => {
    const ca = compatRank[a.applicability.compatibility] ?? 3;
    const cb = compatRank[b.applicability.compatibility] ?? 3;
    if (ca !== cb) return ca - cb;
    const va = VALIDATION_TIER(a.model);
    const vb = VALIDATION_TIER(b.model);
    if (va !== vb) return vb - va;
    return a.model.executable === b.model.executable ? 0 : a.model.executable ? -1 : 1;
  });

  const recommended = candidates[0] ?? null;
  const noQuant = !candidates.some((c) => c.applicability.compatibility === "direct" && c.model.executable);
  return {
    request: req,
    recommended,
    alternatives: candidates.slice(1, 4),
    rejected: rejected.slice(0, 6),
    no_quantitative_model: noQuant,
    policy: REGISTRY_DOC.ranking_policy,
  };
}
