/**
 * W3 — Fire-Safety Facility Analysis engine (ported from SECOND_EVIDENCE).
 *
 * A deterministic, fully documented scoring model for user-defined space
 * facilities (ISS module, lunar habitat, pressurized rover, spacecraft cabin).
 * Every score decomposes into visible drivers; every recommendation cites the
 * bundled NASA PSI evidence or is explicitly labelled heuristic.
 *
 * HONESTY CONTRACT
 *  - This is research decision-support for scenario exploration, NOT a
 *    certified fire-safety analysis (NASA-STD-6001 / NASA-STD-8719 documents
 *    the real qualification process).
 *  - Scores are relative heuristic rankings across the user's own
 *    compartments — they are not probabilities, not risk quantification, and
 *    not comparable to any agency risk index.
 *  - Partial-gravity behaviour is unmeasured (see the partial-gravity gap);
 *    scores in lunar/Martian gravity carry that uncertainty explicitly.
 */

import { oxygenPartialPressure, flowRegime, richardson, grashof } from "./physics";
import { gravityLabel } from "./scenario";

/* ------------------------------------------------------------------ types */

export type StationType = "iss-module" | "lunar-habitat" | "pressurized-rover" | "spacecraft-cabin";

export const STATION_TYPES: { id: StationType; label: string; note: string; defaultDims: [number, number, number] }[] = [
  { id: "iss-module", label: "ISS-class laboratory module", note: "Microgravity, ~10⁻⁶ g — the regime of most PSI evidence.", defaultDims: [4.6, 4.6, 2.5] },
  { id: "lunar-habitat", label: "Lunar surface habitat (planned)", note: "0.166 g partial gravity — NO combustion outcome data in PSI; bounds only.", defaultDims: [6, 5, 3] },
  { id: "pressurized-rover", label: "Pressurized rover cabin", note: "Small closed volume, elevated-O₂ atmosphere expected.", defaultDims: [3, 2.5, 2] },
  { id: "spacecraft-cabin", label: "Deep-space cabin", note: "Microgravity transit — Apollo/Orion-class closed volume.", defaultDims: [4, 4, 2.2] },
];

/** Materials the corpus actually carries evidence for, plus honest generic classes. */
export interface MaterialClass {
  id: string;
  label: string;
  /** 0–1 hazard weight — documented rationale, corpus-linked where possible */
  hazard: number;
  rationale: string;
  evidence: string[];
  inCorpus: boolean;
}

export const MATERIAL_CLASSES: MaterialClass[] = [
  { id: "pmma", label: "PMMA / acrylic panels", hazard: 0.62, rationale: "Thermoplastic — melts and flows while burning; well-characterized in BASS/SAFFIRE-class tests.", evidence: ["PSI-25", "PSI-26", "PSI-99"], inCorpus: true },
  { id: "cotton-fiberglass", label: "Cotton–fiberglass composite (SIBAL class)", hazard: 0.66, rationale: "Thin charring solid — the SAFFIRE sample class; large-scale spread observed in a vehicle-scale volume.", evidence: ["PSI-98", "PSI-99", "PSI-100"], inCorpus: true },
  { id: "nomex", label: "Nomex / aramid fabrics", hazard: 0.32, rationale: "Char-forming aromatic fiber — higher ignition resistance, but behavior at lunar atmospheres is not measured.", evidence: [], inCorpus: false },
  { id: "wiring", label: "Cable bundles / wiring insulation", hazard: 0.55, rationale: "Common ignition source class (overheating, arcing); insulation flammability at habitat atmospheres is a documented screening need.", evidence: ["PSI-20"], inCorpus: false },
  { id: "electronics", label: "Crew electronics / batteries", hazard: 0.58, rationale: "Battery thermal runaway is a distinct hazard mechanism — outside the PSI combustion corpus; flagged, not scored from evidence.", evidence: [], inCorpus: false },
  { id: "paper-cotton", label: "Paper / cotton soft goods", hazard: 0.6, rationale: "Cellulosics ignite readily; BASS-class thin-solid evidence applies directionally.", evidence: ["PSI-25", "PSI-26"], inCorpus: true },
  { id: "tank-metals", label: "Metal furnishings / tanks", hazard: 0.12, rationale: "Non-combustible structural class — negligible contribution in these scenarios.", evidence: [], inCorpus: false },
];

export const IGNITION_SOURCES: { id: string; label: string; weight: number; note: string }[] = [
  { id: "electronics", label: "Crew electronics (continuous operation)", weight: 0.7, note: "Always-powered equipment class." },
  { id: "wiring-fault", label: "Wiring / connector faults", weight: 0.75, note: "Insulation degradation, chafing — the classic slow-smoulder path." },
  { id: "battery", label: "Lithium battery packs", weight: 0.8, note: "Thermal-runaway energy source — distinct from combustion ignition; outside PSI scope." },
  { id: "hot-surface", label: "Hot surfaces / ovens / experiments", weight: 0.5, note: "Piloted-ignition analogue — TIG depends on material and contact." },
  { id: "friction", label: "EVA suit / tool friction", weight: 0.25, note: "Low-frequency operational class." },
];

export const DETECTION_TECH: { id: string; label: string; note: string; evidence: string[] }[] = [
  { id: "photoelectric", label: "Photoelectric smoke detectors", note: "Responds to scattered light — sensitivity depends on particle size distribution; spacecraft smoke is ~10× smaller than terrestrial (SAME/SAME-R finding).", evidence: ["PSI-101", "PSI-102"] },
  { id: "ionization", label: "Ionization smoke detectors", note: "Responds to combustion particles <0.3 µm class — matches the microgravity soot distribution more closely in principle.", evidence: ["PSI-101", "PSI-102"] },
  { id: "uv-ir", label: "UV / IR flame sensors", note: "Line-of-sight optical detection — placement geometry dominates; blind spots are the risk.", evidence: [] },
  { id: "gas", label: "CO / gas sensors", note: "Early overheat signature — slower but non-optical; complements smoke detection.", evidence: [] },
];

export const SUPPRESSION_TECH: { id: string; label: string; note: string; evidence: string[] }[] = [
  { id: "co2", label: "CO₂ suppression", note: "Diluent extinction measured in FLEX; total-flooding requires crew egress and atmosphere restoration.", evidence: ["PSI-69", "PSI-68"] },
  { id: "water-mist", label: "Fine water mist", note: "ISS hardware exists; terrestrial spin-off documented — microgravity droplet transport differs from ground sprays.", evidence: [] },
  { id: "hypoxic", label: "Atmosphere reduction (preventive)", note: "Lowering O₂ fraction is prevention, not suppression — the strongest lever the atmosphere design gives.", evidence: ["PSI-159", "PSI-20"] },
  { id: "portable-ext", label: "Portable extinguishers", note: "Crew-response dependent; agent transport in reduced buoyancy is the open question.", evidence: [] },
];

export interface Compartment {
  id: string;
  name: string;
  lengthM: number;
  widthM: number;
  heightM: number;
  materials: string[]; // MATERIAL_CLASSES ids
  ventilationCmS: number;
  ignitionSources: string[]; // IGNITION_SOURCES ids
  detection: string[]; // DETECTION_TECH ids
  suppression: string[]; // SUPPRESSION_TECH ids
}

export interface FacilitySpec {
  stationType: StationType;
  gravity: number;
  o2: number;
  pressureKpa: number;
  ventilationCmS: number; // facility average, compartments can override
  compartments: Compartment[];
}

/* --------------------------------------------------------------- analysis */

export interface CompartmentResult {
  id: string;
  name: string;
  volumeM3: number;
  /** 0–100 relative heuristic score */
  total: number;
  band: "lower" | "elevated" | "high";
  drivers: { label: string; score: number; max: number; detail: string }[];
  notes: string[];
}

export interface Recommendation {
  area: "prevention" | "detection" | "suppression" | "atmosphere" | "operations";
  text: string;
  evidence: string[];
  strength: "evidence-linked" | "heuristic";
}

export interface FacilityAnalysis {
  pO2Kpa: number;
  regimeLabel: string;
  richardsonNumber: number;
  grashofNumber: number;
  gravityLabel: string;
  partialGravityCaveat: boolean;
  lunarO2Caveat: boolean;
  compartments: CompartmentResult[];
  recommendations: Recommendation[];
  uncertainties: string[];
}

const BANDS: [number, FacilityAnalysis["compartments"][number]["band"]][] = [
  [55, "high"],
  [32, "elevated"],
  [0, "lower"],
];

export function analyzeFacility(f: FacilitySpec): FacilityAnalysis {
  const pO2 = oxygenPartialPressure(f.o2, f.pressureKpa);
  const regime = flowRegime(f.gravity, f.ventilationCmS);
  const ri = richardson(f.gravity, f.ventilationCmS);
  const gr = grashof(f.gravity);
  const gLabel = gravityLabel(f.gravity);
  const partialGravity = f.gravity >= 0.02 && f.gravity < 0.65;
  // Challenge-documented lunar atmosphere: ≥30% O₂ at ≤10.2 psi (≈70.3 kPa).
  const lunarAtmo = f.o2 >= 0.3;

  const results: CompartmentResult[] = f.compartments.map((c) => {
    const volume = c.lengthM * c.widthM * c.heightM;

    /* --- driver 1: atmosphere (0–26) -------------------------------------
       Driven by oxygen partial pressure (the physically-meaningful flammability
       variable) plus the O₂-fraction regime the challenge documents. */
    let atmo = 6; // baseline habitable atmosphere
    if (pO2 > 30) atmo += 12;
    if (pO2 > 21.5) atmo += 5;
    if (lunarAtmo) atmo += 3; // 30%+ fraction regime: >40% flammability increase (challenge-documented)
    atmo = Math.min(atmo, 26);
    const atmoDetail = `pO₂ ${pO2.toFixed(1)} kPa · ${(f.o2 * 100).toFixed(0)}% O₂ at ${f.pressureKpa.toFixed(0)} kPa${lunarAtmo ? " — lunar-regime enriched atmosphere" : ""}`;

    /* --- driver 2: materials (0–26) -------------------------------------- */
    const matClasses = c.materials.map((m) => MATERIAL_CLASSES.find((x) => x.id === m)).filter(Boolean) as MaterialClass[];
    const worst = matClasses.reduce((a, m) => Math.max(a, m.hazard), 0);
    const sum = matClasses.reduce((a, m) => a + m.hazard, 0);
    const material = Math.min(26, Math.round(10 * worst + 5 * Math.min(sum, 4)));
    const matDetail = matClasses.length
      ? matClasses.map((m) => m.label.split(" ")[0]).join(", ")
      : "none listed";

    /* --- driver 3: ignition sources (0–18) ------------------------------- */
    const ign = c.ignitionSources.map((i) => IGNITION_SOURCES.find((x) => x.id === i)).filter(Boolean) as typeof IGNITION_SOURCES;
    const ignition = Math.min(18, Math.round(ign.reduce((a, i) => a + i.weight * 9, 0)));
    const ignDetail = ign.length ? ign.map((i) => i.label.split(" ")[0].toLowerCase()).join(", ") : "none listed";

    /* --- driver 4: confinement & volume (0–12) ---------------------------
       Smaller closed volumes reach hazardous states faster; SAFFIRE showed
       large-volume behaviour differs qualitatively from duct-scale tests. */
    const confinement = volume < 10 ? 12 : volume < 25 ? 8 : volume < 60 ? 5 : 3;
    const confDetail = `${volume.toFixed(0)} m³ closed volume`;

    /* --- driver 5: ventilation regime (0–10) ----------------------------- */
    const localRi = richardson(f.gravity, c.ventilationCmS);
    let vent = 5; // moderate forced flow
    if (localRi > 1) vent = 3; // buoyancy (or its absence) dominates — quiescent
    if (c.ventilationCmS > 30) vent = 8; // strong flow feeds flames (BASS/SPICE duct evidence)
    if (f.gravity < 0.02 && c.ventilationCmS < 1) vent = 7; // stagnant microgravity: slow smoulder risk lingers
    const ventDetail = `${c.ventilationCmS.toFixed(0)} cm/s local flow · Ri ${localRi.toFixed(2)}`;

    /* --- driver 6: protection deficit (0–8) ------------------------------ */
    const detDeficit = c.detection.length === 0 ? 4 : c.detection.length === 1 ? 2 : 0;
    const supDeficit = c.suppression.length === 0 ? 4 : 1;
    const protection = Math.min(8, detDeficit + supDeficit);
    const protDetail = `${c.detection.length} detection · ${c.suppression.length} suppression layers`;

    const drivers: CompartmentResult["drivers"] = [
      { label: "Atmosphere", score: atmo, max: 26, detail: atmoDetail },
      { label: "Materials", score: material, max: 26, detail: matDetail },
      { label: "Ignition sources", score: ignition, max: 18, detail: ignDetail },
      { label: "Confinement", score: confinement, max: 12, detail: confDetail },
      { label: "Ventilation regime", score: vent, max: 10, detail: ventDetail },
      { label: "Protection deficit", score: protection, max: 8, detail: protDetail },
    ];

    const total = Math.min(100, drivers.reduce((a, d) => a + d.score, 0));
    const band = BANDS.find(([t]) => total >= t)![1];

    const notes: string[] = [];
    const notInCorpus = matClasses.filter((m) => !m.inCorpus);
    if (notInCorpus.length) {
      notes.push(`Material classes not covered by bundled PSI evidence: ${notInCorpus.map((m) => m.label).join(", ")} — scored from generic flammability reasoning, flagged as heuristic.`);
    }
    if (c.ignitionSources.includes("battery")) {
      notes.push("Battery thermal runaway is an energy-release mechanism outside the combustion corpus — this score does not model it; treat as a separate hazard analysis.");
    }
    if (partialGravity) {
      notes.push("Partial-gravity regime: no PSI combustion data exists here — all drivers inherit microgravity/1-g bounds with unquantified error.");
    }

    return { id: c.id, name: c.name, volumeM3: volume, total, band, drivers, notes };
  });

  /* --- recommendations (evidence-linked where possible) ------------------ */
  const recs: Recommendation[] = [];
  const worst = [...results].sort((a, b) => b.total - a.total)[0];

  if (lunarAtmo) {
    recs.push({
      area: "atmosphere",
      text: `The facility atmosphere (${(f.o2 * 100).toFixed(0)}% O₂) sits in the enriched regime expected for lunar bases. Challenge documentation puts flammability at >40% higher than Earth air in this regime. If mission constraints allow, evaluate the lowest O₂ fraction and the highest total pressure compatible with EVA protocol — flammability tracks pO₂ and fraction together.`,
      evidence: ["PSI-159", "PSI-20"],
      strength: "evidence-linked",
    });
  }
  if (pO2 > 21.5) {
    recs.push({
      area: "prevention",
      text: `At pO₂ ${pO2.toFixed(1)} kPa, material screening thresholds shift upward — re-screen every material class in this facility at the ACTUAL atmosphere, not at standard air. The corpus carries CFI-G evidence that oxygen enrichment changes ignition behaviour nonlinearly.`,
      evidence: ["PSI-159"],
      strength: "evidence-linked",
    });
  }
  if (worst) {
    recs.push({
      area: "prevention",
      text: `“${worst.name}” ranks highest (${worst.total}/100). Prioritize material substitution there first: prefer char-formers (Nomex-class) over thermoplastics (PMMA-class) and cellulosics where mass/volume budgets allow — charring materials resist spread, per BASS/SAFFIRE-class solid-fuel evidence.`,
      evidence: ["PSI-25", "PSI-26", "PSI-99"],
      strength: "evidence-linked",
    });
  }
  const noDetection = f.compartments.filter((c) => c.detection.length === 0);
  if (noDetection.length) {
    recs.push({
      area: "detection",
      text: `${noDetection.length} compartment(s) have no detection listed. SAME/SAME-R measured spacecraft smoke particles roughly an order of magnitude smaller than terrestrial smoke — detector technology choices must be validated against the microgravity aerosol distribution, not inherited from ground hardware. Consider mixed optical + gas sensing to cover overheat smoulder (slow, small particles) and flaming (faster).`,
      evidence: ["PSI-101", "PSI-102"],
      strength: "evidence-linked",
    });
  }
  const noSuppression = f.compartments.filter((c) => c.suppression.length === 0);
  if (noSuppression.length) {
    recs.push({
      area: "suppression",
      text: `${noSuppression.length} compartment(s) lack a suppression layer. FLEX dilution evidence supports CO₂-class total-flooding extinction physics, but crew egress and atmosphere restoration follow; fine-water-mist ISS hardware exists but microgravity droplet transport differs. No suppressant ranking is offered — tests are not condition-matched (see the suppressant gap).`,
      evidence: ["PSI-69", "PSI-68"],
      strength: "evidence-linked",
    });
  }
  if (f.ventilationCmS > 25) {
    recs.push({
      area: "operations",
      text: `Facility average flow ${f.ventilationCmS.toFixed(0)} cm/s is high: forced ventilation feeds flame spread in the flow direction (BASS/SPICE duct evidence) while also improving mixing for detectors. Zone high-flow paths away from continuous ignition sources, and design detector placement for the flow field, not just ceiling geometry.`,
      evidence: ["PSI-25", "PSI-107"],
      strength: "evidence-linked",
    });
  }
  recs.push({
    area: "operations",
    text: "Integrated strategy: prevention (atmosphere + material choices) is the primary control because detection response and suppression delivery are both slower in reduced buoyancy; detection should cover overheat signatures before flaming; suppression choices must pre-plan crew response and atmosphere restoration. Re-assess whenever the facility configuration, materials or atmosphere change.",
    evidence: ["PSI-99", "PSI-101", "PSI-69"],
    strength: "heuristic",
  });

  /* --- uncertainties ------------------------------------------------------ */
  const uncertainties = [
    "Scores are transparent heuristic weights (shown per driver), not quantified risk probabilities.",
    "Ignition-source likelihoods are generic operational classes — no flight-rate data backs them.",
  ];
  if (partialGravity) {
    uncertainties.push(
      `Gravity ${(f.gravity).toFixed(2)} g is partial gravity: no combustion outcome data exists in PSI for this regime (the field-wide partial-gravity gap). Microgravity and 1-g evidence only bound the answer.`,
    );
  }
  if (f.stationType === "lunar-habitat" || f.stationType === "pressurized-rover") {
    uncertainties.push("Habitat/rover geometries and material inventories are user-defined assumptions — nothing here reflects an actual Artemis design.");
  }
  uncertainties.push("This analysis is research decision-support for exploring evidence boundaries — it does not replace NASA-STD-class qualification, test programs, or flight-safety review.");

  return {
    pO2Kpa: pO2,
    regimeLabel: regime.label,
    richardsonNumber: ri,
    grashofNumber: gr,
    gravityLabel: gLabel,
    partialGravityCaveat: partialGravity,
    lunarO2Caveat: lunarAtmo,
    compartments: results,
    recommendations: recs,
    uncertainties,
  };
}

/** Seed question for CIR-1 with the scenario summary — the §8.2 assistant entry point. */
export function copilotSeedQuestion(f: FacilitySpec, a: FacilityAnalysis): string {
  const ranked = [...a.compartments].sort((x, y) => y.total - x.total).slice(0, 3)
    .map((c) => `${c.name} (${c.total}/100, ${c.band})`).join("; ");
  return `Analyse this fire-safety scenario: ${STATION_TYPES.find((s) => s.id === f.stationType)?.label}, ${a.gravityLabel}, ${(f.o2 * 100).toFixed(0)}% O₂ at ${f.pressureKpa.toFixed(0)} kPa (pO₂ ${a.pO2Kpa.toFixed(1)} kPa), ${f.compartments.length} compartments. Highest-ranked: ${ranked}. What does the PSI evidence say about the main risk drivers, and what would you check first?`;
}
