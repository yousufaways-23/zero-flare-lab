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
