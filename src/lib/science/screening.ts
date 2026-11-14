// FLAME EVIDENCE LAB — facility screening model (shared, deterministic).
// Used by the FacilityScreening panel AND the Fire Safety Assistant context
// so both sides compute identical scores from identical inputs.
// HONESTY: weights are EXPLICIT policy choices (shown in every breakdown);
// they are not calibrated to incident data. This is NOT a fire model.

import type { AtmosphereEnv } from "@/lib/data/catalog";
import type { FacilityCompartment } from "@/lib/app-store";

export interface MaterialEvidence {
  id: string;
  label: string;
  class: "tested-sustained" | "tested-fuel" | "smoke-source" | "no-evidence";
  evidence: string;
  weight: number; // explicit screening weight (policy number, shown in breakdown)
}

export const MATERIALS: MaterialEvidence[] = [
  { id: "pmma", label: "PMMA / acrylic", class: "tested-sustained", weight: 34, evidence: "Tested in BASS (PSI-26), BASS-II (PSI-25), SAFFIRE-II (PSI-99) — documented sustained burning and extinction limits in microgravity" },
  { id: "nomex", label: "Nomex fabric", class: "tested-sustained", weight: 26, evidence: "Tested in BASS (PSI-26), BASS-II (PSI-25), SAFFIRE-II (PSI-99)" },
  { id: "cotton", label: "Cotton fabric", class: "tested-sustained", weight: 30, evidence: "Tested in SAFFIRE-II (PSI-99) large-scale microgravity fire growth experiment" },
  { id: "insulation", label: "Wire insulation (Kapton/Teflon/silicone)", class: "smoke-source", weight: 22, evidence: "SAME (PSI-102)/SAME-R (PSI-101) documented these as overheating smoke/aerosol sources for detector-response studies — flammability itself was not the test focus" },
  { id: "methanol", label: "Methanol (liquid)", class: "tested-fuel", weight: 30, evidence: "FLEX droplet combustion tests (PSI-69)" },
  { id: "heptane", label: "Heptane (liquid)", class: "tested-fuel", weight: 32, evidence: "FLEX (PSI-69) / FLEX-2 (PSI-68) droplet tests, incl. cool-flame transitions" },
  { id: "gas-ethane", label: "Gaseous fuel: ethane/propane/butane", class: "tested-fuel", weight: 34, evidence: "CFI-G gaseous flammability map (PSI-159)" },
  { id: "gas-methane", label: "Gaseous fuel: methane/ethylene", class: "tested-fuel", weight: 30, evidence: "CLD-Flame (PSI-21), SPICE smoke-point tests (PSI-107)" },
  { id: "other", label: "Other / unspecified material", class: "no-evidence", weight: 20, evidence: "No microgravity evidence in the recovered corpus — flagged as an evidence gap, never assumed safe" },
];

export const VENTILATION = [
  { id: "forced", label: "Forced ventilation (active air handling)", note: "Smoke transport follows the ventilation flow — detectors belong in the return path (SAME finding)" },
  { id: "quiescent", label: "Quiescent / minimal airflow", note: "In microgravity there is no buoyant plume — smoke spreads radially from the source (documented in SAME/SAME-R)" },
  { id: "unknown", label: "Unknown", note: "Treated conservatively as quiescent" },
] as const;

// Deterministic screening — transparent arithmetic. Weights are EXPLICIT policy
// choices displayed in the breakdown; they are not calibrated to incident data.
export const SCREENING_WEIGHTS = {
  oxygen: 26, // pO2-driven: 0 below 21 kPa, scales to full at ≥ 32 kPa (habitat concept range)
  o2Fraction: 12, // O2 enrichment above 0.30 (documented habitat concept fraction)
  material: 34, // max material weight (from the evidence table above)
  ignition: 18, // per-ignition-source weight, saturating at 3 sources
  volume: 10, // small-volume penalty: full below 10 m³, zero above 60 m³
} as const;

export const DETECTION_CREDIT = { none: 0, local: 8, integrated: 14 } as const;

export interface ScreeningResult {
  volume: number;
  pO2: number;
  score: number;
  breakdown: { factor: string; points: number }[];
  noEvidenceMaterials: MaterialEvidence[];
}

export function screenCompartment(c: FacilityCompartment, env: AtmosphereEnv): ScreeningResult {
  const W = SCREENING_WEIGHTS;
  const volume = Math.max(0.5, c.areaM2 * c.heightM);
  const pO2 = env.pO2Kpa; // documented per-environment value (atmospheres.json)
  const o2FracFactor = env.o2Fraction > 0.3 ? W.o2Fraction * Math.min(1, (env.o2Fraction - 0.3) / 0.06) : 0;
  const oxygenFactor = pO2 <= 21 ? 0 : W.oxygen * Math.min(1, (pO2 - 21) / 11);
  const matWeights = c.materials.map((m) => MATERIALS.find((x) => x.id === m)).filter(Boolean) as MaterialEvidence[];
  const materialFactor = Math.min(W.material, Math.max(0, ...matWeights.map((m) => m.weight), 0));
  const ignitionFactor = W.ignition * Math.min(1, Math.max(0, c.ignitionSources) / 3);
  const volumeFactor = volume < 10 ? W.volume : volume > 60 ? 0 : W.volume * (1 - (volume - 10) / 50);
  const ventFactor = c.ventilation === "forced" ? 0 : 4; // quiescent/unknown: no forced removal of combustion products
  const raw = oxygenFactor + o2FracFactor + materialFactor + ignitionFactor + volumeFactor + ventFactor;
  const score = Math.round(Math.max(0, Math.min(100, raw - DETECTION_CREDIT[c.detection])));
  const noEvidenceMaterials = matWeights.filter((m) => m.class === "no-evidence");
  return {
    volume, pO2, score,
    breakdown: [
      { factor: `Oxygen partial pressure (${pO2.toFixed(1)} kPa — ${env.label})`, points: Math.round(oxygenFactor) },
      { factor: `O₂ fraction ${(env.o2Fraction * 100).toFixed(0)}% ${env.o2Fraction > 0.3 ? "(enriched above 30%)" : ""}`, points: Math.round(o2FracFactor) },
      { factor: `Highest documented material weight (${matWeights.length} material${matWeights.length === 1 ? "" : "s"} selected)`, points: Math.round(materialFactor) },
      { factor: `Ignition sources ×${Math.max(0, c.ignitionSources)}`, points: Math.round(ignitionFactor) },
      { factor: `Compartment volume ${volume.toFixed(0)} m³`, points: Math.round(volumeFactor) },
      { factor: `Ventilation: ${VENTILATION.find((v) => v.id === c.ventilation)?.label ?? c.ventilation}`, points: ventFactor },
      { factor: `Detection credit (${c.detection})`, points: -DETECTION_CREDIT[c.detection] },
    ],
    noEvidenceMaterials,
  };
}

export function scoreColor(score: number) {
  if (score >= 60) return { bg: "#7f1d1d", bg2: "#b91c1c", label: "high", text: "#fecaca" };
  if (score >= 35) return { bg: "#78350f", bg2: "#b45309", label: "elevated", text: "#fde68a" };
  if (score >= 15) return { bg: "#1e3a5f", bg2: "#5799d1", label: "moderate", text: "#bfdbfe" };
  return { bg: "#14532d", bg2: "#16a34a", label: "screened low", text: "#bbf7d0" };
}

/** Human label for a material id (assistant context + UI). */
export function materialLabel(id: string): string {
  return MATERIALS.find((m) => m.id === id)?.label ?? id;
}
