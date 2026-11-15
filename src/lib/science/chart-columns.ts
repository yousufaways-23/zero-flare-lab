/**
 * ZERO FLARE — curated per-investigation chart registry (Phase 5 W4).
 *
 * Chart column selection used to be purely fill-rate-driven, which surfaced
 * statistically complete but scientifically irrelevant columns (e.g. row
 * counters, binary flags). This registry states, per investigation, which
 * columns ARE the experiment: conditions (what was set), responses (what was
 * measured), the recorded test sequence and any parseable time axis.
 *
 * Honesty rules:
 *  - every entry is validated against the actual recovered table before use;
 *    a curated name that does not match is dropped (never guessed);
 *  - fill-rate ranking remains the fallback for investigations without a spec;
 *  - `status` distinguishes measured quantities from derived/computed ones;
 *  - interpretations are deliberately cautious and never causal.
 */

import type { DataTable } from "@/lib/data/catalog";

export interface ChartColumnSpec {
  /** Exact PSI column name (as recovered). */
  name: string;
  role: "condition" | "response";
  status: "measured" | "derived";
  /** Cautious one-liner shown in the chart footer. */
  interpretation?: string;
}

export interface AccessionChartSpec {
  /** Why these columns constitute the experiment. */
  note: string;
  columns: ChartColumnSpec[];
  /** Recorded test/sequence number — the honest x-axis for trend charts. */
  sequenceColumn?: string;
  /** Parseable recorded date/time column, if any. */
  timeColumn?: string;
  /** Preferred categorical columns for breakdown charts. */
  categorical?: string[];
}

const FLEX: AccessionChartSpec = {
  note: "Droplet combustion: initial droplet size and ambient atmosphere are the controlled conditions; extinction diameter, burning rate and burn time are the measured responses.",
  columns: [
    { name: "Droplet initial diameter", role: "condition", status: "measured", interpretation: "Set by the syringe pump; two fuel sizes dominate." },
    { name: "Ambient pressure", role: "condition", status: "measured", interpretation: "Cabin chamber pressure as recorded per test." },
    { name: "O initial ambient composition", role: "condition", status: "measured", interpretation: "Ambient oxygen mole fraction — the diluent sweep variable." },
    { name: "Visible flame extinction diameter", role: "response", status: "measured", interpretation: "Diameter at visible-flame extinction; radiative/cool-flame transitions continue below it." },
    { name: "Burning rate", role: "response", status: "measured", interpretation: "Droplet diameter regression rate; sensitive to ambient O2 and pressure." },
    { name: "Burn time", role: "response", status: "measured", interpretation: "Visible burn duration; end state (extinction/disruption/completion) matters — see Test end." },
  ],
  sequenceColumn: "FLEX Test #",
  timeColumn: "Test Date",
  categorical: ["Fuel", "Test end", "FLEX Identifier"],
};

const FLEX2: AccessionChartSpec = {
  note: "FLEX-2 (8 recovered tests): droplet size, oxygen fraction, pressure and flow were the controlled conditions.",
  columns: [
    { name: "Initial Droplet Diameter (mm)", role: "condition", status: "measured" },
    { name: "Oxygen Mole Fraction", role: "condition", status: "measured" },
    { name: "Ambient Pressure (atm)", role: "condition", status: "measured" },
    { name: "Flow Velocity (cm/s)", role: "condition", status: "measured" },
    { name: "Ambient Temperature (C)", role: "condition", status: "measured" },
  ],
  categorical: ["Sample (Fuel Type)", "Ambient Gas Mixture"],
};

const FLAME_DESIGN: AccessionChartSpec = {
  note: "Flame Design (PSI-10): ethylene/oxygen/nitrogen flows set the condition; adiabatic flame temperature and mixture fraction are computed responses.",
  columns: [
    { name: "XO2 (init)", role: "condition", status: "measured", interpretation: "Initial oxygen mole fraction." },
    { name: "Xfuel", role: "condition", status: "measured" },
    { name: "pmean (atm)", role: "condition", status: "measured" },
    { name: "Tad (K)", role: "response", status: "derived", interpretation: "Adiabatic flame temperature computed for the mixture — a model quantity, not a thermocouple reading." },
    { name: "mean Zst", role: "response", status: "derived" },
  ],
  sequenceColumn: "Test",
  categorical: ["Flame Type", "Fuel", "Day"],
};

const CFI_G_NORMAL: AccessionChartSpec = {
  note: "CFI-G normal-configuration: oxygen and pressure were swept; burn time and peak burner temperature are the measured responses.",
  columns: [
    { name: "XO2 before test", role: "condition", status: "measured" },
    { name: "approx p (bar)", role: "condition", status: "measured" },
    { name: "Xf", role: "condition", status: "measured" },
    { name: "burn time (sec)", role: "response", status: "measured", interpretation: "Reported burn duration; hot-ignition vs cool-flame endpoints differ — see Hot ignition." },
    { name: "Peak burner T (C )", role: "response", status: "measured" },
  ],
  sequenceColumn: "Test",
  categorical: ["Fuel", "Hot ignition", "Cool flame?"],
};

const CFI_G_INVERSE: AccessionChartSpec = {
  note: "CFI-G inverse-configuration: oxygen and pressure swept; HC burn rate and burner temperature are the measured responses.",
  columns: [
    { name: "XO2", role: "condition", status: "measured" },
    { name: "approx p (bar)", role: "condition", status: "measured" },
    { name: "HC burnrate (mg/s)", role: "response", status: "measured" },
    { name: "burn time (sec)", role: "response", status: "measured" },
    { name: "Peak burner Temp (C)", role: "response", status: "measured" },
  ],
  sequenceColumn: "Test",
  categorical: ["Flame Type", "Fuel", "Hot ignition"],
};

const SPICE: AccessionChartSpec = {
  note: "SPICE gaseous-flow experiments: nozzle size and fuel/air rates are the controlled conditions.",
  columns: [
    { name: "Nozzle (mm)", role: "condition", status: "measured" },
    { name: "Fuel Rate (mg/s)", role: "condition", status: "measured" },
    { name: "Air Rate (cm/s)", role: "condition", status: "measured" },
    { name: "Fuel Rate (sccm)", role: "condition", status: "measured" },
  ],
  sequenceColumn: "GMT date",
  categorical: ["Fuel", "GMT date"],
};

const BASS_II: AccessionChartSpec = {
  note: "BASS-II: initial oxygen and cabin gases were recorded per test; final O2/CO2/CO record the post-test atmosphere.",
  columns: [
    { name: "Calibrated  initial O2 % by vol", role: "condition", status: "measured", interpretation: "Column header carries a double space in the recovered table — matched exactly." },
    { name: "Calibrated final O2 % by vol", role: "response", status: "measured" },
    { name: "Initial CO (ppm)", role: "condition", status: "measured" },
    { name: "Final CO (ppm)", role: "response", status: "measured" },
    { name: "Total Frames Shot", role: "response", status: "measured" },
  ],
  sequenceColumn: "Test #",
  timeColumn: "Date",
  categorical: ["Fuel Sample Material", "Flow restrictor", "Fan display"],
};

const BASS: AccessionChartSpec = {
  note: "BASS (PSI-26) is a condition inventory: test numbers, dates and fuel sample materials — the recovered table carries no combustion outcome columns, so distribution and response charts are declined.",
  columns: [],
  sequenceColumn: "As Run Test #",
  timeColumn: "Date",
  categorical: ["Fuel Sample Material"],
};

const SAFFIRE_II: AccessionChartSpec = {
  note: "SAFFIRE-II (15 samples): oxygen percentage and flow were set per test; ignition and burn times are the measured responses. In the recovered table every value is a string with the unit embedded (\"9.2 s\", \"~ 21.5\") — no column types as numeric, so distribution and overlay charts are declined until a typed re-ingestion exists.",
  columns: [],
  sequenceColumn: "Sample Number",
  categorical: ["Material", "Flow Direction"],
};

const SAME_R: AccessionChartSpec = {
  note: "SAME-R: inlet velocity and aging schedule describe the smoke condition; Rt/R0 is the normalized response ratio.",
  columns: [
    { name: "Inlet velocity (cm/s)", role: "condition", status: "measured" },
    { name: "Rt/R0", role: "response", status: "measured", interpretation: "Normalized ratio; defined on the SAME source register." },
    { name: "Duration (sec)", role: "condition", status: "measured" },
    { name: "Net aging time (sec)", role: "condition", status: "measured" },
  ],
  sequenceColumn: "SAME Test #",
  categorical: ["Sample Type", "Description"],
};

const CFI: AccessionChartSpec = {
  note: "CFI (PSI-39): chamber pressure and gas fractions are the recorded conditions per test.",
  columns: [
    { name: "Pressure", role: "condition", status: "measured" },
    { name: "Oxygen", role: "condition", status: "measured" },
    { name: "Nitrogen", role: "condition", status: "measured" },
    { name: "Helium", role: "condition", status: "measured" },
  ],
  sequenceColumn: "Flex Number",
  timeColumn: "Test Date",
  categorical: ["Fuel", "Fiber", "CIR"],
};

const STDCE: AccessionChartSpec = {
  note: "STDCE-1: applied power and laser diameter describe the test condition; Results is a categorical endpoint.",
  columns: [
    { name: "Power (W)", role: "condition", status: "measured" },
    { name: "Laser Diameter (cm)", role: "condition", status: "measured" },
  ],
  sequenceColumn: "Run#",
  categorical: ["Configuration", "Heating Mode", "Free Surface Shape", "Results"],
};

/** The small log-style tables: categorical tests only (fuel bottles, ignition notes). */
const TEST_LOG: AccessionChartSpec = {
  note: "A test log rather than a measurement table: each row records a conducted test — categorical breakdown and completeness are the honest views.",
  columns: [],
  categorical: [],
};

export const CURATED_CHART_SPECS: Record<string, AccessionChartSpec> = {
  "PSI-69": FLEX,
  "PSI-68": FLEX2,
  "PSI-10": FLAME_DESIGN,
  "PSI-159": CFI_G_NORMAL,
  "PSI-107": SPICE,
  "PSI-25": BASS_II,
  "PSI-26": BASS,
  "PSI-99": SAFFIRE_II,
  "PSI-101": SAME_R,
  "PSI-39": CFI,
  "PSI-108": STDCE,
  "PSI-20": TEST_LOG,
  "PSI-21": TEST_LOG,
  "PSI-22": TEST_LOG,
  "PSI-23": TEST_LOG,
  "PSI-106": TEST_LOG,
  "PSI-142": TEST_LOG,
};

/** A resolved chart column: table position + profile + optional curated spec. */
export interface ChartCol {
  idx: number;
  name: string;
  fillRate: number;
  unit: string | null;
  spec?: ChartColumnSpec;
}

export interface ResolvedChartColumns {
  numCols: ChartCol[];
  catCols: ChartCol[];
  sequence: ChartCol | null;
  timeColumn: ChartCol | null;
  /** Registry note for the investigation, or null when fill-rate fallback is used. */
  specNote: string | null;
  /** True when a curated spec drove the selection (vs fill-rate fallback). */
  curated: boolean;
}

const MIN_FILL = 0.3;

/**
 * Resolve chart columns for a table: curated spec first (validated against the
 * real columns — unmatched names are dropped, never guessed), fill-rate
 * fallback otherwise.
 */
export function resolveChartColumns(table: DataTable, accession: string): ResolvedChartColumns {
  const spec = CURATED_CHART_SPECS[accession];
  const byName = new Map(table.columns.map((c, idx) => [c.name, { col: c, idx }]));

  const toChartCol = (idx: number, sp?: ChartColumnSpec): ChartCol => {
    const c = table.columns[idx];
    return { idx, name: c.name, fillRate: c.fillRate ?? 0, unit: c.unit ?? null, spec: sp };
  };

  let numCols: ChartCol[] = [];
  let catCols: ChartCol[] = [];
  let sequence: ChartCol | null = null;
  let timeColumn: ChartCol | null = null;

  if (spec) {
    // curated numeric columns — validated, deduped, fill-gated
    const seen = new Set<number>();
    for (const sp of spec.columns) {
      const hit = byName.get(sp.name);
      if (!hit || seen.has(hit.idx)) continue;
      const c = table.columns[hit.idx];
      if ((c.fillRate ?? 0) < MIN_FILL) continue;
      if (c.type !== "numeric") {
        // curated numeric spec pointing at a categorical column goes to catCols
        catCols.push(toChartCol(hit.idx, sp));
        seen.add(hit.idx);
        continue;
      }
      numCols.push(toChartCol(hit.idx, sp));
      seen.add(hit.idx);
    }
    for (const name of spec.categorical ?? []) {
      const hit = byName.get(name);
      if (!hit || seen.has(hit.idx)) continue;
      catCols.push(toChartCol(hit.idx));
      seen.add(hit.idx);
    }
    if (spec.sequenceColumn) {
      const hit = byName.get(spec.sequenceColumn);
      if (hit && table.columns[hit.idx].type === "numeric" && (table.columns[hit.idx].fillRate ?? 0) >= MIN_FILL) {
        sequence = toChartCol(hit.idx, { name: spec.sequenceColumn, role: "condition", status: "measured" });
      }
    }
    if (spec.timeColumn) {
      const hit = byName.get(spec.timeColumn);
      if (hit) timeColumn = toChartCol(hit.idx);
    }
    // fill-rate fallback appends anything analysis-ready the spec missed —
    // but ONLY for specs that declare real chart columns. Empty-column specs
    // (condition inventories / test logs) are deliberate statements: numeric
    // leak-ins like a misparsed GMT time-of-day column must not chart.
    if (spec.columns.length > 0) {
      for (const [name, hit] of byName) {
        if (seen.has(hit.idx)) continue;
        const c = table.columns[hit.idx];
        if ((c.fillRate ?? 0) < MIN_FILL) continue;
        if (c.type === "numeric") numCols.push(toChartCol(hit.idx));
        else {
          const uniq = new Set(table.rows.map((r) => (r[hit.idx] ?? "").trim()).filter(Boolean));
          if (uniq.size >= 2 && uniq.size <= Math.max(12, Math.floor(table.rows.length / 3))) catCols.push(toChartCol(hit.idx));
        }
      }
    }
    return { numCols, catCols, sequence, timeColumn, specNote: spec.note, curated: true };
  }

  // fill-rate fallback (pre-existing behavior, with unit metadata attached)
  numCols = table.columns
    .map((c, idx) => ({ idx, name: c.name, fillRate: c.fillRate ?? 0, unit: c.unit ?? null }))
    .filter((c) => c.fillRate >= MIN_FILL && table.columns[c.idx].type === "numeric");
  catCols = table.columns
    .map((c, idx) => ({ idx, name: c.name, fillRate: c.fillRate ?? 0, unit: c.unit ?? null }))
    .filter((c) => {
      if (c.fillRate < 0.4) return false;
      const uniq = new Set(table.rows.map((r) => (r[c.idx] ?? "").trim()).filter(Boolean));
      return uniq.size >= 2 && uniq.size <= Math.max(12, Math.floor(table.rows.length / 3));
    });
  return { numCols, catCols, sequence: null, timeColumn: null, specNote: null, curated: false };
}
