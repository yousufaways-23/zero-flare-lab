/**
 * ZERO FLARE — Evidence Coverage Map (M4, audit P1 #1).
 *
 * Computes, for every investigation in the canonical corpus, what evidence
 * exists across the audit's coverage dimensions: gravity regime, oxygen,
 * pressure, fuel/material, experimental scale, hardware, outcome data and
 * measurement context. Every cell is derived from the client catalog
 * (PSI metadata, recovered table columns, typed graph fuel edges) — nothing
 * is invented, and absence is labelled as corpus status, never as
 * "does not exist in science".
 */

import { getInvestigations, getGraph, getTables, type Investigation } from "@/lib/data/catalog";
import { gravityClassOf, scaleClassOf } from "@/lib/science/comparability";

export type CoverageStatus =
  | "observed" // outcome-bearing records exist for this dimension
  | "reported" // metadata/conditions recorded in PSI
  | "condition-only" // tables carry condition columns but no outcome labels
  | "not-in-corpus" // known field gap: regime exists in science, no data here
  | "not-recorded"; // nothing recoverable in metadata/tables

export const COVERAGE_META: Record<CoverageStatus, { label: string; title: string }> = {
  observed: { label: "observed", title: "Outcome-bearing records exist (measured results, not plans)" },
  reported: { label: "reported", title: "Recorded in PSI metadata or recovered tables (conditions/parameters)" },
  "condition-only": { label: "conditions only", title: "Tables carry this condition column, but no outcome labels — no effect claims possible" },
  "not-in-corpus": { label: "not in corpus", title: "This regime exists in the field but no data is indexed here — a corpus gap, NOT proof of absence" },
  "not-recorded": { label: "not recorded", title: "Nothing recoverable in metadata or tables for this dimension" },
};

export const COVERAGE_DIMENSIONS = [
  { id: "gravity", label: "Gravity" },
  { id: "oxygen", label: "O₂" },
  { id: "pressure", label: "Pressure" },
  { id: "fuel", label: "Fuel / material" },
  { id: "scale", label: "Scale" },
  { id: "hardware", label: "Hardware" },
  { id: "outcome", label: "Outcome" },
  { id: "context", label: "Measurement context" },
] as const;

export type CoverageDimensionId = (typeof COVERAGE_DIMENSIONS)[number]["id"];

export interface CoverageRow {
  accession: string;
  shortLabel: string;
  gravityClass: string;
  scaleClass: string;
  cells: Record<CoverageDimensionId, { status: CoverageStatus; note: string }>;
}

/** Tables whose outcome columns make them outcome-bearing (documented in the corpus build + model cards). */
const OUTCOME_TABLE_IDS = new Set([
  "PSI-69_FLEX",
  "PSI-159_CFI-G_Inverse",
  "PSI-159_CFI-G_Normal",
  "PSI-99_SAFFIRE-II",
]);

function hasColumnFor(inv: Investigation, pattern: RegExp): boolean {
  return getTables()
    .filter((t) => t.investigation === inv.accession)
    .some((t) => t.columns.some((c) => pattern.test(`${c.name} ${c.rawHeader}`)));
}

export function buildCoverageRows(): CoverageRow[] {
  const graph = getGraph();
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]));
  const fuelsByInv = new Map<string, string[]>();
  for (const e of graph.edges) {
    if (e.type !== "studies_fuel") continue;
    const label = nodeById.get(e.dst)?.label ?? e.dst;
    const list = fuelsByInv.get(e.source) ?? [];
    if (!list.includes(label)) list.push(label);
    fuelsByInv.set(e.source, list);
  }

  return getInvestigations().map((inv) => {
    const gravityClass = gravityClassOf(inv);
    const scaleClass = scaleClassOf(inv);
    const hasOutcome = inv.tableIds.some((t) => OUTCOME_TABLE_IDS.has(t));
    const fuels = fuelsByInv.get(inv.accession) ?? [];

    const o2Measured = hasColumnFor(inv, /o2|oxygen|oxidizer/i);
    const pMeasured = hasColumnFor(inv, /press|psi|kpa|mmhg/i);

    const gravityCell: CoverageRow["cells"]["gravity"] = (() => {
      if (gravityClass === "microgravity") return { status: "observed", note: "Flight/drop-platform microgravity records (PSI metadata)" };
      if (gravityClass === "ground-simulation") return { status: "reported", note: "Ground investigation — bounds or simulates flight conditions" };
      if (gravityClass === "partial-gravity") return { status: "reported", note: "Partial-gravity references in metadata; no outcome data in corpus" };
      return { status: "not-recorded", note: "Gravity regime not resolvable from metadata" };
    })();

    const oxygenCell: CoverageRow["cells"]["oxygen"] = hasOutcome && o2Measured
      ? { status: "observed", note: "O₂ condition columns + outcome labels in recovered tables" }
      : o2Measured
        ? { status: "condition-only", note: "O₂ columns recovered, but no outcome labels — conditions only" }
        : hasOutcome
          ? { status: "reported", note: "Outcome data exists; O₂ not an explicit table column" }
          : { status: "not-recorded", note: "No O₂ columns and no outcome data in recovered tables" };

    const pressureCell: CoverageRow["cells"]["pressure"] = hasOutcome && pMeasured
      ? { status: "observed", note: "Pressure columns + outcome labels in recovered tables" }
      : pMeasured
        ? { status: "condition-only", note: "Pressure columns recovered, conditions only" }
        : { status: "not-recorded", note: "No pressure columns in recovered tables" };

    const fuelCell: CoverageRow["cells"]["fuel"] = fuels.length
      ? { status: "reported", note: `Typed graph fuel links: ${fuels.slice(0, 3).join(", ")}` }
      : { status: "not-recorded", note: "No fuel/material edge in the typed graph" };

    const scaleCell: CoverageRow["cells"]["scale"] = (() => {
      if (scaleClass === "droplet") return { status: "reported", note: "Droplet-scale experiment (PSI metadata)" };
      if (scaleClass === "vehicle-scale") return { status: "reported", note: "Vehicle-scale flight experiment (SAFFIRE class)" };
      if (scaleClass === "chamber") return { status: "reported", note: "Facility chamber scale (CIR/MSG class)" };
      if (scaleClass === "bench") return { status: "reported", note: "Bench burner/duct scale" };
      return { status: "not-recorded", note: "Scale class not resolvable from metadata" };
    })();

    const hardwareCell: CoverageRow["cells"]["hardware"] =
      inv.hardware && Object.keys(inv.hardware as Record<string, unknown>).length
        ? { status: "reported", note: "Hardware recorded in PSI metadata" }
        : { status: "not-recorded", note: "No hardware record in metadata" };

    const outcomeCell: CoverageRow["cells"]["outcome"] = hasOutcome
      ? { status: "observed", note: "Outcome-bearing table(s) recovered (see Model Studio cards)" }
      : inv.tableRows > 0
        ? { status: "condition-only", note: "Recovered tables are condition inventories — no effect claims possible" }
        : { status: "not-recorded", note: "No recovered tables for this investigation" };

    const contextCell: CoverageRow["cells"]["context"] = (() => {
      const fp = (inv.flightPlatform ?? "").toLowerCase();
      if (/iss|international space/.test(fp)) return { status: "reported", note: "ISS flight platform — on-orbit facility measurements" };
      if (/ground|not applicable/.test(fp) || /ground/i.test(inv.projectType ?? "")) return { status: "reported", note: "Ground facility — terrestrial reference conditions" };
      if (/parabolic|sounding|drop/.test(fp)) return { status: "reported", note: "Reduced-gravity platform references" };
      return { status: "not-recorded", note: "Measurement context not recorded" };
    })();

    return {
      accession: inv.accession,
      shortLabel: inv.shortLabel,
      gravityClass,
      scaleClass,
      cells: {
        gravity: gravityCell,
        oxygen: oxygenCell,
        pressure: pressureCell,
        fuel: fuelCell,
        scale: scaleCell,
        hardware: hardwareCell,
        outcome: outcomeCell,
        context: contextCell,
      },
    };
  });
}
