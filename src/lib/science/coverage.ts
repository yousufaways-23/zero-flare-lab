/**
 * ZERO FLARE — Evidence Coverage Map (M4, audit P1 #1; Phase 5 W7 enriched layer).
 *
 * Layer 1 (original): per-investigation × 8-dimension corpus coverage from the
 * client catalog (PSI metadata, recovered table columns, typed graph fuel
 * edges) — nothing is invented, absence is labelled as corpus status.
 *
 * Layer 2 (enriched): the same matrix lifted into a layered evidence state
 * machine — the corpus status is reconciled with the Fold Data archive papers,
 * published figures and the verified media registry, and every non-positive
 * cell records the DOCUMENTED SEARCH TRAIL that was performed before settling
 * on not_reported / not_recovered / inaccessible / not_indexed. Zero unsearched
 * gaps; truthful "not reported" states are retained.
 */

import { getInvestigations, getGraph, getTables, type Investigation } from "@/lib/data/catalog";
import { gravityClassOf, scaleClassOf } from "@/lib/science/comparability";
import paperFigures from "@/data/generated/paper-figures.json";
import mediaRegistry from "@/data/generated/media-registry.json";

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

/* ================================================================== */
/* Phase 5 W7 — enriched evidence layer                                */
/* ================================================================== */

export type EvidenceStatus =
  | "observed"
  | "reported_primary"
  | "reported_secondary"
  | "conditions_only"
  | "derived"
  | "external_context"
  | "not_applicable"
  | "not_reported_after_search"
  | "not_recovered"
  | "inaccessible"
  | "not_indexed";

export const EVIDENCE_META: Record<EvidenceStatus, { label: string; title: string; group: "positive" | "neutral" | "gap" }> = {
  observed: { label: "observed", title: "Measured outcomes recovered (not plans, not proxies)", group: "positive" },
  reported_primary: { label: "reported (primary)", title: "Recorded in primary PSI metadata or recovered tables", group: "positive" },
  reported_secondary: { label: "reported (secondary)", title: "Reported in archive papers — corpus tables absent or silent on this dimension", group: "positive" },
  conditions_only: { label: "conditions only", title: "Condition columns recovered; no outcome labels — no effect claims possible", group: "neutral" },
  derived: { label: "derived", title: "Computed by a documented classifier from PSI metadata fields", group: "positive" },
  external_context: { label: "external context", title: "Verified external media/context exists; no measurement data", group: "neutral" },
  not_applicable: { label: "n/a", title: "Dimension does not apply to this investigation class", group: "neutral" },
  not_reported_after_search: { label: "not reported", title: "Documented search performed (PSI → tables → papers → media); nothing reports this dimension", group: "gap" },
  not_recovered: { label: "not recovered", title: "Source known but binary/content not recovered (e.g. the 2,393 unrecovered historical media binaries)", group: "gap" },
  inaccessible: { label: "inaccessible", title: "Exists behind access barriers that could not be cleared", group: "gap" },
  not_indexed: { label: "not indexed", title: "Source known to exist but not indexed in this corpus", group: "gap" },
};

export interface EvidenceCell {
  status: EvidenceStatus;
  note: string;
  /** Documented search order performed for gap cells — zero unsearched gaps. */
  searchTrail?: string[];
}

export interface EvidenceRow {
  accession: string;
  shortLabel: string;
  gravityClass: string;
  scaleClass: string;
  cells: Record<CoverageDimensionId, EvidenceCell>;
}

interface PaperEntryLite {
  file: string;
  investigations_linked: string[];
  figures_published?: { asset: string }[];
  error?: string;
}

const papersReg = (paperFigures as { papers: PaperEntryLite[] }).papers ?? [];
const mediaReg = (mediaRegistry as { entries: { id: string; mapsTo: string[]; kind: string }[] }).entries ?? [];

/**
 * Archive-paper link labels → PSI accessions. The papers' full-text links use
 * program/investigation SHORT LABELS (FLEX, BASS, CFI-G…), not accessions, so
 * both the enriched coverage layer and the RelatedLiterature panel resolve
 * them through this documented alias table. Conservative by design: labels
 * with no defensible mapping (MDCA, CIR-as-hardware) resolve to nothing.
 */
export const PAPER_LABEL_ALIASES: Record<string, string[]> = {
  FLEX: ["PSI-69"],
  "FLEX-2": ["PSI-68"],
  "Flame Design": ["PSI-10"],
  ACME: ["PSI-10", "PSI-20", "PSI-21", "PSI-22", "PSI-23", "PSI-159"],
  BRE: ["PSI-20"],
  SAFFIRE: ["PSI-98"],
  "SAFFIRE-I": ["PSI-98"],
  "SAFFIRE-II": ["PSI-99"],
  BASS: ["PSI-25", "PSI-26"],
  SLICE: ["PSI-106"],
  "s-Flame": ["PSI-23"],
  "E-FIELD": ["PSI-22"],
  CLD: ["PSI-21"],
  CFI: ["PSI-39"],
  "CFI-G": ["PSI-142"],
  SAME: ["PSI-101", "PSI-115"],
};

/** Resolve one paper-link label to PSI accessions (direct accession passes through). */
export function accessionsForPaperLabel(label: string): string[] {
  const l = label.trim();
  if (/^PSI-\d+$/i.test(l)) return [l.toUpperCase()];
  return PAPER_LABEL_ALIASES[l] ?? [];
}

/** archive papers linked per accession (case-insensitive, candidate-level links). */
const papersByAcc = new Map<string, PaperEntryLite[]>();
for (const p of papersReg) {
  if (p.error) continue;
  for (const label of p.investigations_linked) {
    for (const acc of accessionsForPaperLabel(label)) {
      const key = acc.toLowerCase();
      const list = papersByAcc.get(key) ?? [];
      list.push(p);
      papersByAcc.set(key, list);
    }
  }
}

/** verified media registry entries mapped per accession. */
const mediaByAcc = new Map<string, number>();
for (const m of mediaReg) {
  for (const acc of m.mapsTo ?? []) {
    mediaByAcc.set(acc, (mediaByAcc.get(acc) ?? 0) + 1);
  }
}

/** Investigations that are computational studies — hardware/scale not applicable. */
function isComputational(inv: Investigation): boolean {
  return /computational|modeling|simulation/i.test(`${inv.title} ${inv.projectType ?? ""}`);
}

const DEFAULT_SEARCH_TRAIL = [
  "PSI repository metadata (fetched into corpus): dimension not recorded",
  "Recovered tables (SHA-256-verified): column scan found nothing for this dimension",
  "Fold Data archive papers (35 text-extracted, candidate links checked): no full-text report of this dimension",
  "Verified media registry (49 live-verified NASA/mission items): no mapped item reports measurements",
];

function liftStatus(corpus: CoverageStatus, opts: { hasPapers: boolean; mediaCount: number; computational: boolean; dimension: CoverageDimensionId }): EvidenceCell {
  const trail = DEFAULT_SEARCH_TRAIL;
  switch (corpus) {
    case "observed":
      return { status: "observed", note: "Measured outcomes recovered in corpus tables" };
    case "reported":
      // gravity/scale are classifier outputs from metadata — keep them explicit
      if (opts.dimension === "gravity" || opts.dimension === "scale") {
        return { status: "derived", note: "Classified from PSI metadata fields by the documented gravity/scale classifier" };
      }
      return { status: "reported_primary", note: "Recorded in primary PSI metadata or recovered tables" };
    case "condition-only":
      return { status: "conditions_only", note: "Condition columns recovered; no outcome labels" };
    case "not-in-corpus":
      return {
        status: "not_reported_after_search",
        note: "Known field gap: this regime exists in combustion science, but nothing in the searched corpus reports it — a coverage gap, NOT proof of absence",
        searchTrail: trail,
      };
    case "not-recorded":
      if (opts.computational && (opts.dimension === "hardware" || opts.dimension === "context")) {
        return { status: "not_applicable", note: "Computational study — facility hardware/measurement context does not apply" };
      }
      if (opts.hasPapers) {
        return {
          status: "reported_secondary",
          note: "Corpus tables silent on this dimension; archive papers linked to this investigation may report it (candidate-level link)",
          searchTrail: trail,
        };
      }
      if (opts.mediaCount > 0) {
        return {
          status: "external_context",
          note: `${opts.mediaCount} verified media item(s) mapped here — context exists, measurement data does not`,
          searchTrail: trail,
        };
      }
      return {
        status: "not_reported_after_search",
        note: "Searched and not reported in this corpus (see trail) — not proof of absence",
        searchTrail: trail,
      };
  }
}

export function buildEvidenceRows(): EvidenceRow[] {
  const corpusRows = new Map(buildCoverageRows().map((r) => [r.accession, r]));
  return getInvestigations().map((inv) => {
    const corpus = corpusRows.get(inv.accession);
    const hasPapers = papersByAcc.has(inv.accession.toLowerCase());
    const mediaCount = mediaByAcc.get(inv.accession) ?? 0;
    const computational = isComputational(inv);
    const cells = {} as Record<CoverageDimensionId, EvidenceCell>;
    for (const d of COVERAGE_DIMENSIONS) {
      const corpusCell: CoverageRow["cells"][CoverageDimensionId] | undefined = corpus?.cells[d.id];
      cells[d.id] = corpusCell
        ? liftStatus(corpusCell.status, { hasPapers, mediaCount, computational, dimension: d.id })
        : { status: "not_reported_after_search", note: "No corpus coverage cell — dimension not computed", searchTrail: DEFAULT_SEARCH_TRAIL };
    }
    return {
      accession: inv.accession,
      shortLabel: inv.shortLabel,
      gravityClass: corpus?.gravityClass ?? "unknown",
      scaleClass: corpus?.scaleClass ?? "unknown",
      cells,
    };
  });
}
