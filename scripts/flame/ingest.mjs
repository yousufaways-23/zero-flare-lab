#!/usr/bin/env node
/**
 * FLAME EVIDENCE LAB — reproducible ingestion pipeline (v2).
 *
 * Reads the immutable raw NASA PSI CSV layer in data/raw/, computes per-file
 * SHA-256 provenance, parses nothing beyond what is printed, and writes:
 *
 *   src/data/generated/corpus.json     experiment metadata + column stats + provenance
 *   src/data/generated/tables/*.json   full row data for lazy loading
 *
 * Honesty rules carried over from the original pipeline and preserved:
 *   - Nothing is imputed; cells stay as NASA published them.
 *   - Numeric summaries only count cells that parse unambiguously.
 *   - Parse failures are counted in the quality ledger, never hidden.
 *   - Test-plan tables are flagged `plan`, outcome tables `outcome`.
 */
import { readFileSync, writeFileSync, mkdirSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join, dirname, basename } from "node:path";
import { fileURLToPath } from "node:url";
import { decodeBytes, parseCSV, cleanHeader, toNumber, median, quantile } from "../../src/lib/science/csv.js";

const here = dirname(fileURLToPath(import.meta.url));
const ROOT = join(here, "..", "..");
const RAW = join(ROOT, "data", "raw");
const OUT = join(ROOT, "src", "data", "generated");
const OUT_TABLES = join(OUT, "tables");

const PSI_URL = (id) => `https://psi.nasa.gov/physci/repo/data/investigations/${id}`;
const NASA = "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/";

/** Curated metadata — objective/findingUse paraphrased from the cited NASA pages. */
const META = {
  "PSI-69_FLEX.csv": { id: "PSI-69", short: "FLEX", name: "Flame Extinguishment Experiment", subArea: "Droplets", platform: "ISS", facility: "CIR · Multi-user Droplet Combustion Apparatus (MDCA)", gravity: "microgravity", objective: "Quantify how inert-gas suppressants extinguish droplet flames in microgravity and obtain the most conservative limiting-oxygen estimate for steady combustion.", findingUse: "The only bundled table with a per-test outcome label, so it carries the app's quantitative model.", sources: [NASA, PSI_URL("PSI-69")] },
  "PSI-68_FLEX-2.csv": { id: "PSI-68", short: "FLEX-2", name: "Flame Extinguishment Experiment — 2", subArea: "Droplets", platform: "ISS", facility: "CIR · Multi-user Droplet Combustion Apparatus (MDCA)", gravity: "microgravity", objective: "Extend droplet extinction and burning-rate measurements across fuels, diluents (N2 and He) and pressures, including soot and disruption behaviour.", findingUse: "Defines the tested condition matrix; the bundled table is a plan, not per-test results.", sources: [NASA, PSI_URL("PSI-68")] },
  "PSI-39_CFI.csv": { id: "PSI-39", short: "CFI", name: "Cool Flames Investigation", subArea: "Droplets", platform: "ISS", facility: "CIR · Multi-user Droplet Combustion Apparatus (MDCA)", gravity: "microgravity", objective: "Observe low-temperature 'cool' droplet flames that burn without a hot ignition stage, and map the conditions under which they persist.", findingUse: "Shows a low-temperature burning mode absent from 1-g screening tests.", sources: [NASA, PSI_URL("PSI-39")] },
  "PSI-159_CFI-G_Inverse.csv": { id: "PSI-159", short: "ACME CFI-G", name: "Cool Flames Investigation with Gases (inverse flames)", subArea: "Gaseous — non-premixed", platform: "ISS", facility: "CIR / ACME chamber insert", gravity: "microgravity", objective: "Produce quasi-steady spherical cool flames on porous burners in gaseous mixtures, separating cool-flame chemistry from droplet evaporation.", findingUse: "Per-test cool-flame and hot-ignition flags make this the second labelled table in the corpus.", sources: [NASA, PSI_URL("PSI-159")] },
  "PSI-159_CFI-G_Normal.csv": { id: "PSI-159", short: "ACME CFI-G", name: "Cool Flames Investigation with Gases (normal flames)", subArea: "Gaseous — non-premixed", platform: "ISS", facility: "CIR / ACME chamber insert", gravity: "microgravity", objective: "Produce quasi-steady spherical cool flames on porous burners in gaseous mixtures, separating cool-flame chemistry from droplet evaporation.", findingUse: "Per-test cool-flame and hot-ignition flags make this the second labelled table in the corpus.", sources: [NASA, PSI_URL("PSI-159")] },
  "PSI-10_FlameDesign_Inverse.csv": { id: "PSI-10", short: "ACME Flame Design", name: "Advanced Combustion via Microgravity Experiments — Flame Design (inverse)", subArea: "Gaseous — non-premixed", platform: "ISS", facility: "CIR / ACME chamber insert", gravity: "microgravity", objective: "Control soot production and radiative heat loss in laminar diffusion flames by diluting the oxidiser stream, forming 'inverse' flames.", findingUse: "Records oxygen-diluted conditions with computed adiabatic flame temperatures.", sources: [NASA, PSI_URL("PSI-10")] },
  "PSI-10_FlameDesign_Normal.csv": { id: "PSI-10", short: "ACME Flame Design", name: "Advanced Combustion via Microgravity Experiments — Flame Design (normal)", subArea: "Gaseous — non-premixed", platform: "ISS", facility: "CIR / ACME chamber insert", gravity: "microgravity", objective: "Control soot production and radiative heat loss in laminar diffusion flames by diluting the fuel stream with inert gas.", findingUse: "Records fuel-diluted conditions, several with ramped flow programmes.", sources: [NASA, PSI_URL("PSI-10")] },
  "PSI-20_ACME-BRE.csv": { id: "PSI-20", short: "ACME BRE", name: "Burning Rate Emulator", subArea: "Solid fuels", platform: "ISS", facility: "CIR / ACME chamber insert", gravity: "microgravity", objective: "Reproduce the burning rate of a condensed fuel using a gaseous fuel fed through a porous burner, so material flammability can be studied without burning the material itself.", findingUse: "Establishes that a porous burner can emulate a burning surface in microgravity.", sources: [NASA, PSI_URL("PSI-20")] },
  "PSI-21_CLD-Flame.csv": { id: "PSI-21", short: "ACME CLD Flame", name: "Coflow Laminar Diffusion Flame", subArea: "Gaseous — non-premixed", platform: "ISS", facility: "CIR / ACME chamber insert", gravity: "microgravity", objective: "Study stability, liftoff and detachment of coflow laminar diffusion flames at the two extremes of heavily diluted and heavily sooting operation.", findingUse: "Documents the fuel/air flow envelope in which a coflow flame stays attached.", sources: [NASA, PSI_URL("PSI-21")] },
  "PSI-22_E-FIELD-Flames.csv": { id: "PSI-22", short: "ACME E-FIELD", name: "Electric-Field Effects on Laminar Diffusion Flames", subArea: "Gaseous — non-premixed", platform: "ISS", facility: "CIR / ACME chamber insert", gravity: "microgravity", objective: "Use electric fields to manipulate ionic transport in flames, substituting for the buoyant flow that gravity normally provides.", findingUse: "Shows an active control route for flames where buoyancy is unavailable.", sources: [NASA, PSI_URL("PSI-22")] },
  "PSI-23_s-Flame.csv": { id: "PSI-23", short: "ACME s-Flame", name: "Structure and Response of Spherical Diffusion Flames", subArea: "Gaseous — non-premixed", platform: "ISS", facility: "CIR / ACME chamber insert", gravity: "microgravity", objective: "Measure the structure and extinction response of spherical diffusion flames, a geometry that removes edge and wake effects.", findingUse: "Provides a clean extinction-limited flame geometry for model comparison.", sources: [NASA, PSI_URL("PSI-23")] },
  "PSI-25_BASS-II.csv": { id: "PSI-25", short: "BASS-II", name: "Burning and Suppression of Solids — II", subArea: "Solid fuels", platform: "ISS", facility: "Microgravity Science Glovebox (MSG) · SPICE flow duct", gravity: "microgravity", objective: "Examine burning and extinction of solid fuel samples across materials and low-speed flow, including the effect of suppressants.", findingUse: "The closest bundled analogue to a spacecraft material fire; records ambient gas composition per test.", sources: [NASA, PSI_URL("PSI-25")] },
  "PSI-26_BASS.csv": { id: "PSI-26", short: "BASS", name: "Burning and Suppression of Solids", subArea: "Solid fuels", platform: "ISS", facility: "Microgravity Science Glovebox (MSG) · SPICE flow duct", gravity: "microgravity", objective: "Examine burning and extinction characteristics of a wide variety of fuel samples in microgravity.", findingUse: "Establishes the solid-fuel test inventory later extended by BASS-II.", sources: [NASA, PSI_URL("PSI-26")] },
  "PSI-99_SAFFIRE-II.csv": { id: "PSI-99", short: "SAFFIRE-II", name: "Spacecraft Fire Experiment — II", subArea: "Spacecraft fire safety", platform: "Cygnus (post-berth)", facility: "Cygnus cargo vehicle", gravity: "microgravity", objective: "Burn large samples in a cargo vehicle and compare microgravity burn length against material screening done at 1 g.", findingUse: "Carries the corpus's only direct 1-g vs microgravity sample comparison, but with just 15 material rows.", sources: [PSI_URL("PSI-99")] },
  "PSI-100_SAFFIRE-III.csv": { id: "PSI-100", short: "SAFFIRE-III", name: "Spacecraft Fire Experiment — III", subArea: "Spacecraft fire safety", platform: "Cygnus (post-berth)", facility: "Cygnus cargo vehicle", gravity: "microgravity", objective: "Repeat the large-scale SIBAL fabric burn with concurrent and opposed flow to isolate flow-direction effects.", findingUse: "The bundled experimental table lists two sample rows only; imaging workbooks hold the measurements. Row count is not test count.", sources: [PSI_URL("PSI-100")] },
  "PSI-101_SAME-R.csv": { id: "PSI-101", short: "SAME-R", name: "Smoke Aerosol Measurement Experiment — Reflight", subArea: "Spacecraft fire safety", platform: "ISS", facility: "Microgravity Science Glovebox", gravity: "microgravity", objective: "Measure the size distribution of smoke particles produced by overheated spacecraft materials in microgravity.", findingUse: "Informs whether terrestrial smoke detectors transfer to spacecraft.", sources: [NASA, PSI_URL("PSI-101")] },
  "PSI-102_SAME.csv": { id: "PSI-102", short: "SAME", name: "Smoke Aerosol Measurement Experiment", subArea: "Spacecraft fire safety", platform: "ISS", facility: "Microgravity Science Glovebox", gravity: "microgravity", objective: "Compare smoke from different materials in microgravity, since hydrocarbon fuels produce soot while plastics produce recondensed droplets.", findingUse: "Supports detector design, not flame behaviour; kept separate from combustion findings.", sources: [NASA, PSI_URL("PSI-102")] },
  "PSI-106_SLICE.csv": { id: "PSI-106", short: "SLICE", name: "Structure and Liftoff in Combustion Experiment", subArea: "Gaseous — non-premixed", platform: "ISS", facility: "Microgravity Science Glovebox (MSG) · SPICE flow duct", gravity: "microgravity", objective: "Study coflow laminar diffusion flames where accurate numerical modelling is available, focusing on structure and liftoff.", findingUse: "The bundled table holds only test dates and fuel types — a coverage gap the interface states plainly.", sources: [NASA, PSI_URL("PSI-106")] },
  "PSI-107_SPICE.csv": { id: "PSI-107", short: "SPICE", name: "Smoke Point in Co-flow Experiment", subArea: "Gaseous — non-premixed", platform: "ISS", facility: "Microgravity Science Glovebox (MSG) · flow duct built for SPICE", gravity: "microgravity", objective: "Measure the smoke-point fuel flow rate of coflow jet diffusion flames, extending studies of flame stability and soot onset.", findingUse: "The corpus's largest gaseous test inventory: fuel flow and air velocity per run.", sources: [NASA, PSI_URL("PSI-107")] },
};

const OUTCOME_HINTS = [/outcome/i, /test end/i, /cool flame/i, /hot ignition/i, /burn length/i, /spread/i, /extinct/i, /burn time/i];

function summariseColumn(values) {
  const text = values.map((v) => (v ?? "").trim());
  const nonEmpty = text.filter((v) => v !== "");
  const nums = nonEmpty.map(toNumber).filter((v) => v != null);
  const numeric = nums.length >= Math.max(3, nonEmpty.length * 0.6);
  const out = { filled: nonEmpty.length, blanks: text.length - nonEmpty.length };
  if (numeric) {
    out.kind = "numeric";
    out.n = nums.length;
    out.min = Math.round(Math.min(...nums) * 1000) / 1000;
    out.max = Math.round(Math.max(...nums) * 1000) / 1000;
    out.median = Math.round(median(nums) * 1000) / 1000;
    out.p05 = Math.round(quantile(nums, 0.05) * 1000) / 1000;
    out.p95 = Math.round(quantile(nums, 0.95) * 1000) / 1000;
    out.parseFailures = nonEmpty.length - nums.length;
  } else {
    out.kind = "text";
    const counts = new Map();
    for (const v of nonEmpty) counts.set(v, (counts.get(v) ?? 0) + 1);
    out.unique = counts.size;
    out.top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 6).map(([value, count]) => ({ value: value.slice(0, 48), count }));
  }
  return out;
}

function buildTable(file, bytes) {
  const sha256 = createHash("sha256").update(bytes).digest("hex");
  const text = decodeBytes(bytes);
  const raw = parseCSV(text);
  const columns = raw[0].map(cleanHeader);
  const body = raw.slice(1).filter((r) => r.some((c) => c.trim() !== ""));
  const rows = body.map((r) => {
    const out = [];
    for (let i = 0; i < columns.length; i++) out.push((r[i] ?? "").trim());
    return out;
  });
  const colStats = columns.map((name, i) => ({ index: i, name, ...summariseColumn(rows.map((r) => r[i])) }));
  const seen = new Set();
  let duplicates = 0;
  for (const r of rows) {
    const key = r.join("\u0001");
    if (seen.has(key)) duplicates++;
    else seen.add(key);
  }
  const meta = META[file] ?? { id: basename(file).split("_")[0], short: basename(file).replace(/\.csv$/, ""), name: basename(file).replace(/\.csv$/, ""), subArea: "unclassified", platform: "unknown", facility: "unknown", gravity: "unknown", objective: "", findingUse: "", sources: [] };
  const hasOutcome = columns.some((c) => OUTCOME_HINTS.some((re) => re.test(c)));
  return { meta, file, sha256, bytes: bytes.length, columns, colStats, rowCount: rows.length, duplicates, hasOutcome, rows };
}

function main() {
  mkdirSync(OUT_TABLES, { recursive: true });
  const files = readdirSync(RAW).filter((f) => f.endsWith(".csv")).sort();
  const experiments = [];
  const tableSummaries = [];
  for (const file of files) {
    const bytes = readFileSync(join(RAW, file));
    const t = buildTable(file, bytes);
    writeFileSync(join(OUT_TABLES, file.replace(/\.csv$/, ".json")), JSON.stringify({ file, columns: t.columns, rows: t.rows }));
    tableSummaries.push({
      file, psiId: t.meta.id, short: t.meta.short, sha256: t.sha256, bytes: t.bytes,
      columns: t.columns, colStats: t.colStats, rowCount: t.rowCount, duplicates: t.duplicates,
      hasOutcome: t.hasOutcome, dataPath: `tables/${file.replace(/\.csv$/, ".json")}`,
    });
    const existing = experiments.find((e) => e.id === t.meta.id);
    const record = existing ?? { ...t.meta, tables: [], rowCount: 0, hasOutcome: false };
    record.tables.push({
      file, sha256: t.sha256,
      label: (t.meta.short === "ACME Flame Design" || t.meta.short === "ACME CFI-G"
        ? t.meta.name.split("(").pop()?.replace(")", "").trim() : null) ?? t.meta.short,
      rows: t.rowCount, hasOutcome: t.hasOutcome,
      dataPath: `tables/${file.replace(/\.csv$/, ".json")}`, colStats: t.colStats,
    });
    record.rowCount += t.rowCount;
    record.hasOutcome = record.hasOutcome || t.hasOutcome;
    if (!existing) experiments.push(record);
  }
  for (const e of experiments) {
    const materials = new Set();
    for (const t of e.tables) {
      for (const c of t.colStats) {
        if (c.kind === "text" && /fuel|material|sample|PI/i.test(c.name)) {
          for (const top of c.top ?? []) {
            if (top.value && !/^(none|n\/a|no|yes)$/i.test(top.value)) materials.add(top.value);
          }
        }
      }
    }
    e.materials = [...materials].slice(0, 8);
  }
  experiments.sort((a, b) => a.id.localeCompare(b.id));
  const totalRows = experiments.reduce((s, e) => s + e.rowCount, 0);
  const outcomeTables = tableSummaries.filter((t) => t.hasOutcome);
  const corpus = {
    pipeline: "flame-evidence-lab/ingest",
    pipelineVersion: 2,
    generatedAt: new Date().toISOString(),
    rawLayer: "data/raw (immutable; SHA-256 recorded per file)",
    totals: {
      investigations: experiments.length, tables: tableSummaries.length, rows: totalRows,
      outcomeTables: outcomeTables.length,
      columns: tableSummaries.reduce((s, t) => s + t.columns.length, 0),
      parseFailures: tableSummaries.reduce((s, t) => s + t.colStats.reduce((a, c) => a + (c.parseFailures ?? 0), 0), 0),
      duplicateRows: tableSummaries.reduce((s, t) => s + t.duplicates, 0),
    },
    experiments,
    tables: tableSummaries,
    gaps: [
      { id: "PSI-98", name: "SAFFIRE-I", note: "Listed by PSI as a related spacecraft-fire-safety investigation; no experimental table is present in the bundled dataset." },
      { id: "PSI-47", name: "STDCE-2 (fluid physics)", note: "Appears in the challenge's PSI link set but is a fluid-physics investigation, not combustion. Excluded from combustion findings by design." },
      { id: "DAFT / DAFT-2", name: "Dust and Aerosol Measurement Feasibility Test", note: "Named in the challenge statement as a related investigation: one of the SAME smoke-detection instruments was used instead to detect dust. Not in this bundle." },
      { id: "LUCI", name: "Lunar-g Combustion Investigation", note: "Named in the challenge statement as a forthcoming source of partial-gravity data, alongside FM². No partial-gravity combustion data exists in PSI today." },
    ],
  };
  mkdirSync(OUT, { recursive: true });
  writeFileSync(join(OUT, "corpus.json"), JSON.stringify(corpus, null, 2));
  console.log(`investigations ${corpus.totals.investigations}`);
  console.log(`tables         ${corpus.totals.tables}`);
  console.log(`rows           ${corpus.totals.rows}`);
  console.log(`outcome tables ${corpus.totals.outcomeTables}`);
  console.log(`parse failures ${corpus.totals.parseFailures}`);
  console.log(`duplicate rows ${corpus.totals.duplicateRows}`);
}

main();
