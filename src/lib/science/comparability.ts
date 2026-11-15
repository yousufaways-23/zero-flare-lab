/**
 * ZERO FLARE — Comparability Gate (M4).
 *
 * Audits whether two or more NASA PSI investigations can be scientifically
 * compared before any cross-study chart or ranking is rendered. Derived ONLY
 * from investigation metadata (projectType, flightPlatform, hardware,
 * keywords, table structure) — no judgement baked in without support.
 *
 * The gate outputs a verdict with explicit reasons: "comparable-with-caveats"
 * is not "comparable"; "not-comparable" states exactly what differs.
 */

import type { Investigation } from "@/lib/data/catalog";

export type GravityClass = "microgravity" | "partial-gravity" | "normal-gravity" | "ground-simulation" | "unknown";
export type ScaleClass = "droplet" | "bench" | "chamber" | "vehicle-scale" | "unknown";

export interface ComparabilityDimension {
  dimension: string;
  values: { accession: string; value: string }[];
  verdict: "match" | "mismatch" | "unknown";
  note?: string;
}

export interface ComparabilityVerdict {
  comparable: boolean;
  level: "direct" | "conditional" | "not-comparable";
  reasons: string[];
  dimensions: ComparabilityDimension[];
  requirements: string[];
}

export function gravityClassOf(inv: Investigation): GravityClass {
  const hay = `${inv.projectType} ${inv.flightPlatform} ${inv.title} ${inv.keywords?.join(" ") ?? ""}`.toLowerCase();
  if (/parabolic|reduced gravity|partial.?g|lunar|martian|mars/.test(hay)) return "partial-gravity";
  if (/ground/.test(inv.projectType?.toLowerCase() ?? "")) return "ground-simulation";
  if (/iss|station|international space|drop tower|sounding rocket|micrograv/.test(hay)) return "microgravity";
  if (/spacecraft|vehicle/.test(hay)) return "microgravity";
  return "unknown";
}

export function scaleClassOf(inv: Investigation): ScaleClass {
  const hay = `${inv.title} ${inv.shortLabel} ${inv.keywords?.join(" ") ?? ""}`.toLowerCase();
  if (/droplet/.test(hay)) return "droplet";
  if (/saffire|vehicle|large.?scale/.test(hay)) return "vehicle-scale";
  if (/bass|msg|glovebox|chamber|cir|combustion integrated/.test(hay)) return "chamber";
  if (/counterflow|coflow|burner|jet|duct/.test(hay)) return "bench";
  return "unknown";
}

function dimension(
  name: string,
  values: { accession: string; value: string }[],
  strict: boolean,
  note?: string,
): ComparabilityDimension {
  const distinct = new Set(values.map((v) => v.value));
  const unknownHeavy = values.every((v) => v.value === "unknown" || v.value === "Not Applicable" || v.value === "");
  let verdict: "match" | "mismatch" | "unknown" = "unknown";
  if (!unknownHeavy) {
    verdict = distinct.size === 1 ? "match" : "mismatch";
  }
  return { dimension: name, values, verdict: strict && verdict === "unknown" ? "unknown" : verdict, note };
}

/**
 * Audit the comparability of the selected investigations.
 * Strict dimensions block direct comparison; advisory ones produce caveats.
 */
export function auditComparability(invs: Investigation[]): ComparabilityVerdict {
  const reasons: string[] = [];
  const requirements: string[] = [];
  const dims: ComparabilityDimension[] = [];

  // 1 — gravity regime (strict)
  const grav = invs.map((i) => ({ accession: i.accession, value: gravityClassOf(i) }));
  dims.push(dimension("Gravity regime", grav, true, "microgravity ≠ partial-gravity ≠ 1-g: evidence does not transfer silently"));
  const gravDistinct = new Set(grav.map((g) => g.value));
  if (gravDistinct.size > 1) {
    reasons.push(
      `Gravity regimes differ (${grav.map((g) => `${g.accession}: ${g.value}`).join(", ")}) — microgravity results must not be presented as partial-gravity or 1-g evidence, and vice versa.`,
    );
  } else if (gravDistinct.has("unknown")) {
    reasons.push("Gravity regime could not be resolved from metadata for at least one investigation — treat any pooled comparison as conditional.");
  }

  // 2 — experimental scale (strict)
  const scale = invs.map((i) => ({ accession: i.accession, value: scaleClassOf(i) }));
  dims.push(dimension("Experimental scale", scale, true, "droplet / bench / chamber / vehicle-scale behave differently (SAFFIRE vs BASS-class)"));
  const scaleDistinct = new Set(scale.map((s) => s.value));
  if (scaleDistinct.size > 1) {
    reasons.push(`Experimental scales differ (${scale.map((s) => `${s.accession}: ${s.value}`).join(", ")}) — spread/extinction scaling does not transfer directly across scale classes.`);
  }

  // 3 — project type (advisory)
  const proj = invs.map((i) => ({ accession: i.accession, value: i.projectType ?? "unknown" }));
  dims.push(dimension("Project type", proj, false, "flight vs ground investigation"));
  if (new Set(proj.map((p) => p.value)).size > 1) {
    reasons.push("Project types differ (flight vs ground) — ground results bound or simulate flight conditions but are not equivalent measurements.");
  }

  // 4 — research area (advisory)
  const subs = invs.map((i) => ({ accession: i.accession, value: i.subResearchArea ?? "unknown" }));
  dims.push(dimension("Sub-research area", subs, false));
  if (new Set(subs.map((s) => s.value)).size > 1) {
    reasons.push("Different sub-research areas — outcome definitions and variables likely differ.");
  }

  // 5 — hardware / facility (advisory)
  const hw = invs.map((i) => {
    const names = i.hardware && typeof i.hardware === "object"
      ? Object.keys(i.hardware as Record<string, unknown>).slice(0, 2).join("; ")
      : "";
    return { accession: i.accession, value: names || "not recorded" };
  });
  dims.push(dimension("Hardware / facility", hw, false));
  const hwBases = new Set(hw.map((h) => h.value.split(/[;,]/)[0]?.trim().toLowerCase()));
  if (hwBases.size > 1 && invs.length > 1) {
    reasons.push("Different hardware/facility — instrument differences confound direct numeric comparison.");
  }

  // 6 — outcome-bearing data (strict)
  const outcome = invs.map((i) => {
    const inv = i as Investigation & { hasOutcomeData?: boolean };
    return { accession: i.accession, value: inv.hasOutcomeData ? "outcome-bearing" : "condition-inventory" };
  });
  dims.push(dimension("Outcome data", outcome, true, "condition inventories cannot support effect claims"));
  const outcomeUnknown = outcome.every((o) => o.value === "condition-inventory");
  if (outcomeUnknown) {
    reasons.push("None of the selected investigations carries outcome-bearing tables in the recovered corpus — descriptive comparison only; no effect/ranking claims.");
  } else if (outcome.some((o) => o.value === "condition-inventory")) {
    reasons.push("At least one investigation has only condition-inventory tables — exclude it from outcome-level claims.");
  }

  // verdict
  const blocking = reasons.filter((r) => /Gravity regimes differ|Experimental scales differ|outcome-bearing|None of the selected/.test(r));
  let level: ComparabilityVerdict["level"];
  if (blocking.length === 0 && reasons.length === 0) level = "direct";
  else if (blocking.length === 0) level = "conditional";
  else level = "not-comparable";

  const comparable = level !== "not-comparable";
  if (level === "conditional") {
    requirements.push("State the caveats next to any cross-study chart (already enforced by this gate).");
  }
  if (level === "not-comparable") {
    requirements.push("To make the comparison defensible: identify data at matched gravity, matched scale, and with outcome definitions in both studies — or restrict the comparison to metadata-level differences.");
  }

  return { comparable, level, reasons, dimensions: dims, requirements };
}

// ---------------------------------------------------------------------------
// Test-level comparability (research doc §6)
//
// Investigation-level screening alone cannot justify a scientific comparison
// between two records. This function compares TWO TEST ROWS field-by-field
// across the dimensions that matter, with four explicit outcomes.
// "Unknown" is NEVER treated as a match; tolerances apply only where the
// caller supplies a scientific or instrument-based justification.
// ---------------------------------------------------------------------------

export type TestLevelVerdict =
  | "directly_comparable"
  | "conditionally_comparable"
  | "insufficient_metadata"
  | "not_comparable";

export interface TestRowInput {
  testId: string;
  investigation: string;
  gravityG?: number | null;
  pressureKpa?: number | null;
  o2Fraction?: number | null;
  o2Basis?: "mole" | "volume" | "mass" | null;
  fuelOrMaterial?: string | null;
  phase?: "gas" | "liquid" | "solid" | null;
  airflowCmS?: number | null;
  outcomeDefinition?: string | null;
}

export interface TestDimensionResult {
  dimension: string;
  a: string;
  b: string;
  verdict: "match" | "mismatch" | "unknown";
  note?: string;
}

export interface TestLevelResult {
  verdict: TestLevelVerdict;
  a: { testId: string; investigation: string };
  b: { testId: string; investigation: string };
  dimensions: TestDimensionResult[];
  blockers: string[];
  requirements: string[];
}

function fmtVal(v: unknown, unit: string): string {
  return v === null || v === undefined ? "not recorded" : `${v} ${unit}`.trim();
}

function dimNumeric(
  name: string, a: number | null | undefined, b: number | null | undefined,
  unit: string, tolFrac: number | null, tolBasis: string | null,
  mismatchImpact: string,
): TestDimensionResult {
  if (a === null || a === undefined || b === null || b === undefined || !Number.isFinite(a) || !Number.isFinite(b)) {
    return { dimension: name, a: fmtVal(a, unit), b: fmtVal(b, unit), verdict: "unknown", note: "missing value on at least one side — cannot confirm or exclude a mismatch" };
  }
  const tol = tolFrac !== null ? Math.abs(a) * tolFrac : 0;
  const match = Math.abs(a - b) <= tol;
  return {
    dimension: name, a: fmtVal(a, unit), b: fmtVal(b, unit),
    verdict: match ? "match" : "mismatch",
    note: match
      ? (tolFrac !== null ? `within tolerance ${Math.round(tolFrac * 100)}% — ${tolBasis}` : undefined)
      : mismatchImpact,
  };
}

function dimCategorical(name: string, a: string | null | undefined, b: string | null | undefined, mismatchImpact: string): TestDimensionResult {
  const va = (a || "").trim() || null;
  const vb = (b || "").trim() || null;
  if (!va || !vb) return { dimension: name, a: va ?? "not recorded", b: vb ?? "not recorded", verdict: "unknown", note: "missing on at least one side" };
  const same = va.toLowerCase() === vb.toLowerCase();
  return { dimension: name, a: va, b: vb, verdict: same ? "match" : "mismatch", ...(same ? {} : { note: mismatchImpact }) };
}

export function compareTestsAtTestLevel(
  a: TestRowInput,
  b: TestRowInput,
  tolerances: { gravityTolFrac?: number | null; pressureTolFrac?: number | null; o2TolFrac?: number | null; airflowTolFrac?: number | null } = {},
): TestLevelResult {
  const dimensions: TestDimensionResult[] = [];
  const blockers: string[] = [];
  const requirements: string[] = [];

  // Gravity — buoyancy drives the physics; tolerance only with an
  // instrument-based basis supplied by the caller (e.g. parabola quality).
  const g = dimNumeric("Gravity (g)", a.gravityG, b.gravityG, "g", tolerances.gravityTolFrac ?? null,
    tolerances.gravityTolFrac ? "caller-supplied instrument tolerance" : "",
    "Gravity regimes differ — buoyant transport differs, so absolute outcomes are not directly transferable.");
  dimensions.push(g);
  if (g.verdict === "mismatch") blockers.push("Gravity regimes differ");
  if (g.verdict === "unknown") requirements.push("Record gravity for both tests (or restrict the claim to non-gravity-dependent observations).");

  // Total ABSOLUTE pressure (gauge vs absolute must be resolved upstream)
  const pr = dimNumeric("Total absolute pressure (kPa)", a.pressureKpa, b.pressureKpa, "kPa", tolerances.pressureTolFrac ?? null,
    tolerances.pressureTolFrac ? "caller-supplied instrument tolerance" : "",
    "Total pressure differs — gas density, diffusion and pO2 all shift; do not pool.");
  dimensions.push(pr);
  if (pr.verdict === "mismatch") blockers.push("Total pressure differs");

  // O2 fraction — basis-aware: mole vs volume vs mass are NOT interchangeable.
  let o2: TestDimensionResult;
  if (a.o2Fraction === null || a.o2Fraction === undefined || b.o2Fraction === null || b.o2Fraction === undefined) {
    o2 = { dimension: "O2 fraction", a: fmtVal(a.o2Fraction, ""), b: fmtVal(b.o2Fraction, ""), verdict: "unknown", note: "missing — pO2 cannot be computed on both sides" };
  } else if ((a.o2Basis || "mole") !== (b.o2Basis || "mole")) {
    o2 = { dimension: "O2 fraction", a: `${a.o2Fraction} (${a.o2Basis ?? "mole"})`, b: `${b.o2Fraction} (${b.o2Basis ?? "mole"})`, verdict: "unknown", note: "bases differ (mole/volume/mass) — not comparable without a documented conversion" };
  } else {
    o2 = dimNumeric("O2 fraction", a.o2Fraction, b.o2Fraction, "", tolerances.o2TolFrac ?? null,
      tolerances.o2TolFrac ? "caller-supplied instrument tolerance" : "",
      "O2 fraction differs — flammability limits shift with oxidizer concentration.");
  }
  dimensions.push(o2);
  if (o2.verdict === "mismatch") blockers.push("O2 fraction differs");
  if (o2.verdict === "unknown") requirements.push("Record O2 fraction AND its basis for both tests.");

  // Fuel / material identity and phase
  const fuel = dimCategorical("Fuel / material", a.fuelOrMaterial, b.fuelOrMaterial, "Different fuel/material identity — combustion behaviour is material-specific.");
  dimensions.push(fuel);
  if (fuel.verdict === "mismatch") blockers.push("Fuel/material differs");
  const phase = dimCategorical("Phase", a.phase, b.phase, "Phase differs (gas/liquid/solid) — a different combustion regime entirely.");
  dimensions.push(phase);
  if (phase.verdict === "mismatch") blockers.push("Fuel/material phase differs");

  // Forced airflow
  const air = dimNumeric("Forced airflow (cm/s)", a.airflowCmS, b.airflowCmS, "cm/s", tolerances.airflowTolFrac ?? null,
    tolerances.airflowTolFrac ? "caller-supplied instrument tolerance" : "",
    "Airflow differs — the transport regime may differ even at matched gravity.");
  dimensions.push(air);
  if (air.verdict === "mismatch") blockers.push("Forced airflow differs");
  if (air.verdict === "unknown") requirements.push("Record forced-airflow velocity for both tests (transport regime cannot be compared without it).");

  // Outcome definition — different endpoints must never be pooled
  const oc = dimCategorical("Outcome definition", a.outcomeDefinition, b.outcomeDefinition, "Different endpoint definitions — the outcomes measure different things and must never be pooled as one target.");
  dimensions.push(oc);
  if (oc.verdict === "mismatch") { blockers.push("Outcome definitions differ"); requirements.push("Compare against a shared endpoint, or present the two outcomes side-by-side without pooling."); }

  // verdict assembly — unknown is never a match
  const hasUnknown = dimensions.some((d) => d.verdict === "unknown");
  const verdict: TestLevelVerdict =
    blockers.length > 0 ? "not_comparable"
      : hasUnknown ? "insufficient_metadata"
        : dimensions.every((d) => d.verdict === "match") ? "directly_comparable"
          : "conditionally_comparable";

  if (verdict === "directly_comparable") {
    requirements.push("All compared dimensions match within stated tolerances — cite this result alongside any pooled statistic.");
  } else if (verdict === "conditionally_comparable") {
    requirements.push("Present side-by-side WITHOUT pooling; state the differing dimensions next to the comparison.");
  } else if (verdict === "insufficient_metadata") {
    requirements.push("Fill the unknown dimensions before treating the comparison as scientific evidence.");
  }
  return { verdict, a: { testId: a.testId, investigation: a.investigation }, b: { testId: b.testId, investigation: b.investigation }, dimensions, blockers, requirements };
}
