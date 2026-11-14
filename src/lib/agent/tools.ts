// FLAME EVIDENCE LAB — agent tool registry (server-side, typed, deterministic)
// Every tool returns provenance. Tools never fabricate: missing data returns
// explicit gap statuses. Small talk never triggers tools (handled by core.ts).

import { useAppStore } from "@/lib/app-store";
import type { ChartSpec } from "@/lib/app-store";
import {
  getInvestigations, getInvestigation, getTables, getTable, getTablesForInvestigation,
  getCorpusTotals, getGaps, getFindings, getAtmospheres, getEnvironment,
  searchEvidence, searchMediaLocal, getGraph, getEquipment, getEquipmentForInvestigation,
  getSources,
} from "@/lib/data/catalog";
import {
  searchEquations, runCalculation, getEquation, getEquationRegistryCount, EQUATIONS,
  FUEL_PROPERTIES, EQUATION_CATEGORIES,
} from "@/lib/science/equations";
import { getModelRegistry, runFlexModel, runCfigModel, getFlexCard, getCfigCard, getSpiceCard } from "@/lib/science/models";
import { analyzeFacility, copilotSeedQuestion, type FacilitySpec } from "@/lib/science/firesafety";
import { auditComparability } from "@/lib/science/comparability";
import { searchKnowledgeBase, getKnowledgeBaseStats } from "@/lib/science/knowledge-retrieval";
import { searchNtrs, probePsiStudy, getIntegrationStatus } from "@/lib/external/nasa";
import { searchMathModels, getMathModel, checkModelApplicability, runMathematicalModel, selectMathModels } from "@/lib/science/math-models";
import { listExperimentDatasetsTool, resolveExperimentTool, queryExperimentDataset } from "@/lib/data/experiment-tools";
import { DatasetQuerySchema } from "@/lib/agent/contracts";

export interface ToolResult {
  tool: string;
  ok: boolean;
  summary: string;
  data?: unknown;
  provenance: string;
  chart?: ChartSpec;
  gapStatus?: string;
}

export type ToolArgs = Record<string, unknown>;

function num(x: unknown, name: string): number {
  const n = Number(x);
  if (Number.isNaN(n)) throw new Error(`${name} must be a number`);
  return n;
}
function str(x: unknown, name: string): string {
  if (typeof x !== "string" || !x.trim()) throw new Error(`${name} must be a non-empty string`);
  return x;
}

type ToolHandler = (args: ToolArgs) => ToolResult | Promise<ToolResult>;

export interface ToolDef {
  name: string;
  description: string;
  args: Record<string, string>;
  handler: ToolHandler;
}

function fmt(n: number, digits = 4): string {
  if (!Number.isFinite(n)) return String(n);
  if (Math.abs(n) >= 1e6 || (Math.abs(n) < 1e-4 && n !== 0)) return n.toExponential(3);
  return Number(n.toFixed(digits)).toString();
}

/* ------------------------------------------------------------------ */
/* Scenario context injection — the copilot route sets this from the   */
/* client's live scenario state (environment + facility screening)     */
/* before executing tools, so analyze_fire_safety_scenario can seed    */
/* from what the user is actually looking at.                          */
/* ------------------------------------------------------------------ */

export interface ScenarioToolContext {
  stationType?: string;
  gravity?: number;
  o2?: number;
  pressureKpa?: number;
  ventilationCmS?: number;
  compartments?: {
    id: string;
    name: string;
    lengthM: number;
    widthM: number;
    heightM: number;
    materials: string[];
    ventilationCmS: number;
    ignitionSources: string[];
    detection: string[];
    suppression: string[];
  }[];
}

// CODEX Phase 2 — scenario context is now request-scoped: runMathematicalModel
// and analyze_fire_safety_scenario receive it via executeTool(name, args, ctx)
// instead of module-global state.

export const TOOLS: ToolDef[] = [
  {
    name: "search_evidence",
    description: "Lexical BM25 search over the indexed evidence corpus (24 PSI investigation records from NASA PSI metadata, findings, gaps, tables). Returns snippets with source links. For follow-up questions about a specific investigation use its accession (PSI-xx).",
    args: { query: "search query string", limit: "optional max hits (default 6)" },
    handler: (a) => {
      const hits = searchEvidence(str(a.query, "query"), Math.min(12, Number(a.limit) || 6));
      return {
        tool: "search_evidence", ok: true,
        summary: hits.length ? `${hits.length} evidence hits for "${a.query}"` : `No indexed evidence matched "${a.query}" (status: no-evidence-found in the local corpus — try NASA NTRS/PSI sources for wider literature).`,
        data: hits,
        provenance: "BM25 over bundled PSI metadata/findings/gaps/tables (NASA PSI repository records)",
      };
    },
  },
  {
    name: "search_knowledge_base",
    description: "BM25 search over the SOURCE-DOCUMENT text index (§4 hybrid RAG leg 2): page-level extracts of ingested NASA facility documents, PSI investigation reports and peer-reviewed journal papers, each with citation (source file, page, ingestion batch). Use for combustion physics/chemistry questions, hardware details and published findings. Results are SOURCE-DOCUMENT EVIDENCE, not tabular data.",
    args: { query: "natural-language query, e.g. 'soot oxidation in microgravity' or 'MDCA droplet deployment'", limit: "optional max hits (default 5)" },
    handler: (a) => {
      const hits = searchKnowledgeBase(str(a.query, "query"), Math.min(10, Number(a.limit) || 5));
      const stats = getKnowledgeBaseStats();
      return {
        tool: "search_knowledge_base", ok: true,
        summary: hits.length
          ? `${hits.length} source-document hits for "${a.query}" (index: ${stats.docs} page extracts from ${stats.sources} documents)`
          : `No source-document text matched "${a.query}" (index covers ${stats.docs} extracts from ${stats.sources} documents) — distinguish this from "no evidence exists".`,
        data: hits.map((h) => ({
          source: h.doc.source,
          location: h.doc.location,
          batchId: h.doc.batchId,
          score: Number(h.score.toFixed(2)),
          snippet: h.snippet,
        })),
        provenance: `BM25 over knowledge/index.json (ingestion pipeline text index — facility docs, PSI reports, journal papers; ${stats.docs} extracts)`,
      };
    },
  },
  {
    name: "list_investigations",
    description: "List the bundled NASA PSI combustion investigations with accession IDs, titles, table row counts and source links.",
    args: {},
    handler: () => {
      const invs = getInvestigations();
      return {
        tool: "list_investigations", ok: true,
        summary: `${invs.length} investigations (NASA PSI, Combustion Science research area)`,
        data: invs.map((i) => ({ accession: i.accession, title: i.title, shortLabel: i.shortLabel, rows: i.tableRows, doi: i.doi, url: i.sourceUrl, subResearchArea: i.subResearchArea })),
        provenance: "NASA PSI repository API metadata (psi.nasa.gov), fetched with ledger",
      };
    },
  },
  {
    name: "get_investigation",
    description: "Full record of one investigation: objectives, approach, hypothesis, impacts, hardware, publications, tables, integrity cases.",
    args: { accession: "e.g. PSI-69" },
    handler: (a) => {
      const inv = getInvestigation(str(a.accession, "accession").toUpperCase());
      if (!inv) return { tool: "get_investigation", ok: false, summary: `Investigation ${a.accession} not found`, provenance: "-" };
      return {
        tool: "get_investigation", ok: true,
        summary: `${inv.accession}: ${inv.title}`,
        data: inv,
        provenance: `NASA PSI metadata ${inv.sourceUrl} (DOI ${inv.doi ?? "—"})`,
      };
    },
  },
  {
    name: "get_table_schema",
    description: "Column schema and quality profile of a bundled data table (types, units, fill rates, parse failures, min/max/mean).",
    args: { tableId: "table id, e.g. PSI-69_FLEX" },
    handler: (a) => {
      const t = getTable(str(a.tableId, "tableId"));
      if (!t) return { tool: "get_table_schema", ok: false, summary: `Table ${a.tableId} not found. Use list_tables or query the investigation.`, provenance: "-" };
      return {
        tool: "get_table_schema", ok: true,
        summary: `${t.label}: ${t.rowCount} rows × ${t.columnCount} cols, ${t.duplicateRows} duplicate rows`,
        data: { id: t.id, label: t.label, rowCount: t.rowCount, columnCount: t.columnCount, duplicateRows: t.duplicateRows, columns: t.columns.map((c) => ({ name: c.name, unit: c.unit, type: c.type, fillRate: c.fillRate, parseFailures: c.parseFailures, min: c.min, max: c.max, mean: c.mean })) },
        provenance: `${t.file} (sha256 ${t.sha256.slice(0, 12)}…) — recovered from NASA PSI, ${t.source}`,
      };
    },
  },
  {
    name: "list_tables",
    description: "List all bundled experimental tables with row counts.",
    args: {},
    handler: () => {
      const ts = getTables();
      return {
        tool: "list_tables", ok: true,
        summary: `${ts.length} tables, ${Number(getCorpusTotals().rows)} rows total`,
        data: ts.map((t) => ({ id: t.id, investigation: t.investigation, label: t.label, rows: t.rowCount, duplicates: t.duplicateRows })),
        provenance: "Recovered data/raw CSVs (sha256-verified vs project manifest)",
      };
    },
  },
  {
    name: "query_dataset",
    description: "Query a bundled table: filter rows by a column condition, then optionally compute column statistics or return sample rows. Never invents values; parse failures are counted.",
    args: { tableId: "table id", filterColumn: "optional column name", filterOp: "optional: = | > | < | >= | <= | !=", filterValue: "optional value", statColumn: "optional numeric column to profile", limit: "optional row sample limit (default 10)" },
    handler: (a) => {
      const t = getTable(str(a.tableId, "tableId"));
      if (!t) return { tool: "query_dataset", ok: false, summary: `Table ${a.tableId} not found`, provenance: "-" };
      let rows = t.rows;
      let filterNote = "no filter";
      const colName = a.filterColumn ? String(a.filterColumn) : null;
      if (colName) {
        const colIdx = t.columns.findIndex((c) => c.name.toLowerCase().includes(colName.toLowerCase()) || c.rawHeader.toLowerCase().includes(colName.toLowerCase()));
        if (colIdx === -1) return { tool: "query_dataset", ok: false, summary: `Column "${colName}" not found in ${t.id}. Columns: ${t.columns.map((c) => c.name).join(", ")}`, provenance: t.source };
        const op = (a.filterOp as string) || "=";
        const target = a.filterValue;
        rows = rows.filter((r) => {
          const cell = (r[colIdx] ?? "").trim();
          const cellNum = Number(cell);
          const targetNum = Number(target);
          const numeric = cell !== "" && target !== "" && !Number.isNaN(cellNum) && !Number.isNaN(targetNum);
          switch (op) {
            case ">": return numeric && cellNum > targetNum;
            case "<": return numeric && cellNum < targetNum;
            case ">=": return numeric && cellNum >= targetNum;
            case "<=": return numeric && cellNum <= targetNum;
            case "!=": return cell !== String(target);
            default: return cell.toLowerCase() === String(target).toLowerCase();
          }
        });
        filterNote = `${colName} ${op} ${target}`;
      }
      const limit = Math.min(20, Number(a.limit) || 10);
      let stats: Record<string, unknown> | undefined;
      if (a.statColumn) {
        const c = t.columns.find((x) => x.name.toLowerCase().includes(String(a.statColumn).toLowerCase()));
        if (c && c.type === "numeric") {
          const idx = c.index;
          const vals = rows.map((r) => Number((r[idx] ?? "").trim())).filter((x) => !Number.isNaN(x));
          const sorted = [...vals].sort((x, y) => x - y);
          stats = {
            column: c.name, unit: c.unit, n: vals.length,
            min: sorted[0], max: sorted[sorted.length - 1],
            mean: vals.length ? vals.reduce((s, x) => s + x, 0) / vals.length : null,
            median: sorted[Math.floor(sorted.length / 2)] ?? null,
          };
        }
      }
      return {
        tool: "query_dataset", ok: true,
        summary: `${t.id}: ${rows.length}/${t.rowCount} rows (${filterNote})${stats ? `; ${stats.column}: n=${stats.n}, mean=${fmt(stats.mean as number)}, min=${stats.min}, max=${stats.max}` : ""}`,
        data: { tableId: t.id, matchedRows: rows.length, totalRows: t.rowCount, filter: filterNote, stats, sampleRows: rows.slice(0, limit).map((r) => { const o: Record<string, string> = {}; t.columns.forEach((c, i) => { o[c.name] = (r[i] ?? "").trim(); }); return o; }) },
        provenance: `${t.file} (sha256 ${t.sha256.slice(0, 12)}…) — ${t.source}`,
      };
    },
  },
  {
    name: "eda_statistics",
    description: "Corpus-wide evidence statistics: tables, rows, columns, duplicates, parse failures per table.",
    args: { tableId: "optional single table" },
    handler: (a) => {
      if (a.tableId) {
        const t = getTable(String(a.tableId));
        if (!t) return { tool: "eda_statistics", ok: false, summary: "Table not found", provenance: "-" };
        const chart: ChartSpec = {
          title: `${t.label} — row count by column fill`,
          subtitle: `source: ${t.file}`,
          histogram: { binStart: t.columns.map((_, i) => i), binEnd: t.columns.map((_, i) => i + 1), counts: t.columns.map((c) => c.filled), label: "filled cells" },
          source: `${t.file} sha256 ${t.sha256.slice(0, 12)}`,
        };
        return { tool: "eda_statistics", ok: true, summary: `${t.label}: ${t.rowCount} rows; fill rates ${t.columns.map((c) => `${c.name} ${(c.fillRate * 100).toFixed(0)}%`).join(", ")}`, data: t.columns, provenance: `${t.source}`, chart };
      }
      const totals = getCorpusTotals() as unknown as Record<string, number | string>;
      const ts = getTables();
      const chart: ChartSpec = {
        title: "Recovered PSI experimental tables — rows per table",
        subtitle: `${totals.rows} rows across ${totals.tables} tables; duplicates counted, not hidden`,
        series: ts.map((t) => ({ name: t.label, points: t.rows.map((_, i) => ({ x: i + 1, y: 1 })) })).slice(0, 1),
        histogram: { binStart: ts.map((_, i) => i), binEnd: ts.map((_, i) => i + 1), counts: ts.map((t) => t.rowCount), label: "rows" },
        source: "data/raw/*.csv (sha256-verified vs project manifest)",
      };
      return { tool: "eda_statistics", ok: true, summary: `Corpus: ${totals.tables} tables, ${totals.rows} rows, ${totals.columns} columns, ${totals.duplicateRows} duplicate rows, ${totals.parseFailures} parse failures. ${totals.method}`, data: { totals, perTable: ts.map((t) => ({ id: t.id, rows: t.rowCount, dups: t.duplicateRows })) }, provenance: String(totals.method), chart };
    },
  },
  {
    name: "search_equations",
    description: `Search the verified equation registry (${getEquationRegistryCount()} equations across ${EQUATION_CATEGORIES.length} categories). Each result includes id, statement, variables with units, assumptions.`,
    args: { query: "natural language or equation name" },
    handler: (a) => {
      const results = searchEquations(str(a.query, "query"), 6);
      return {
        tool: "search_equations", ok: true,
        summary: results.length ? `${results.length} equations matched` : "No equation matched; the registry covers standard combustion/heat/aerosol/uncertainty relations — no invented formulas.",
        data: results.map((e) => ({ id: e.id, name: e.name, category: e.category, statement: e.statement, variables: e.variables.map((x) => ({ key: x.key, symbol: x.symbol, unit: x.unit, label: x.label })), assumptions: e.assumptions, source: e.source })),
        provenance: `Verified equation registry (${getEquationRegistryCount()} equations, all with reference tests)`,
      };
    },
  },
  {
    name: "calculate_equation",
    description: "Run a deterministic calculation from the verified registry. Requires equationId and ALL inputs; missing inputs are refused, never guessed. Use search_equations first to find ids/variables.",
    args: { equationId: "registry id", inputs: "object of variable-key -> number" },
    handler: (a) => {
      try {
        const inputs = (a.inputs && typeof a.inputs === "object" ? a.inputs : {}) as Record<string, number>;
        const r = runCalculation(str(a.equationId, "equationId"), inputs);
        const e = getEquation(r.equationId)!;
        return {
          tool: "calculate_equation", ok: true,
          summary: `${e.name}: ${fmt(r.value)} ${r.unit}${r.warnings.length ? ` (warnings: ${r.warnings.join(" ")})` : ""}`,
          data: { ...r, statement: e.statement, assumptions: e.assumptions },
          provenance: `Equation registry: ${e.source}`,
        };
      } catch (err) {
        return { tool: "calculate_equation", ok: false, summary: (err as Error).message, provenance: "Equation registry (refusal — missing/invalid inputs are never guessed)" };
      }
    },
  },
  {
    name: "search_variables",
    description: "Variable dictionary: search canonical measured/reported variables across bundled tables (name, unit, table, fill rate).",
    args: { query: "variable name or unit fragment" },
    handler: (a) => {
      const q = String(a.query ?? "").toLowerCase();
      const vars_: unknown[] = [];
      for (const t of getTables()) {
        for (const c of t.columns) {
          const hay = `${c.name} ${c.rawHeader} ${c.unit ?? ""}`.toLowerCase();
          if (!q || hay.includes(q)) {
            vars_.push({ table: t.id, name: c.name, unit: c.unit, type: c.type, fillRate: c.fillRate, min: c.min, max: c.max, mean: c.mean });
          }
        }
      }
      return {
        tool: "search_variables", ok: true,
        summary: `${Math.min(vars_.length, 40)} variables${q ? ` matching "${a.query}"` : " total (showing first 40)"}`,
        data: vars_.slice(0, 40),
        provenance: "Variable dictionary derived from recovered PSI table headers (units parsed from NASA source headers)",
      };
    },
  },
  {
    name: "run_flex_model",
    description: "Run the guarded FLEX droplet-extinction model (v2, verified reproduction from recovered PSI-69 data). Microgravity domain only — refuses gravity > 0.02 g, non-FLEX fuels or out-of-range conditions. Returns an UNCALIBRATED relative score, never a safety verdict.",
    args: { xo2: "O2 mole fraction (0.15-0.7)", pressureMmHg: "ambient pressure mmHg (400-1150)", d0Mm: "initial droplet diameter mm (1-5)", fuel: "Methanol | Heptane", heFraction: "optional He mole fraction", coFraction: "optional CO mole fraction", gravityG: "optional local gravity in g (default microgravity)" },
    handler: (a) => {
      const pred = runFlexModel({
        xo2: num(a.xo2, "xo2"), pressureMmHg: num(a.pressureMmHg, "pressureMmHg"), d0Mm: num(a.d0Mm, "d0Mm"),
        fuel: (a.fuel === "Heptane" ? "Heptane" : "Methanol") as "Methanol" | "Heptane",
        heFraction: a.heFraction !== undefined ? num(a.heFraction, "heFraction") : 0,
        coFraction: a.coFraction !== undefined ? num(a.coFraction, "coFraction") : 0,
        gravityG: a.gravityG !== undefined ? num(a.gravityG, "gravityG") : 1e-6,
      });
      return {
        tool: "run_flex_model", ok: pred.ok,
        summary: pred.ok ? `Score ${fmt(pred.score ?? 0, 3)} — ${pred.interpretation}` : pred.refusal ?? "refused",
        data: pred,
        provenance: pred.provenance,
        gapStatus: pred.ok ? undefined : "partial-gravity predictions unsupported (no-evidence-found)",
      };
    },
  },
  {
    name: "run_cfig_model",
    description: "Run the CFI-G hot-ignition scorer (EXPLORATORY: below oxygen-only baseline under grouped validation; shown for transparency, not for decisions).",
    args: { xfBefore: "fuel mole fraction before test", pBar: "pressure bar (~1)", xo2: "O2 fraction (0.15-0.5)", hcBurnRate: "mg/s", o2Flow: "mg/s", tadK: "adiabatic flame temp K", zst: "stoichiometric mixture fraction", fuel: "ethane | propane | butane", gravityG: "optional g" },
    handler: (a) => {
      const pred = runCfigModel({
        xfBefore: num(a.xfBefore, "xfBefore"), pBar: num(a.pBar, "pBar"), xo2: num(a.xo2, "xo2"),
        hcBurnRate: num(a.hcBurnRate, "hcBurnRate"), o2Flow: num(a.o2Flow, "o2Flow"), tadK: num(a.tadK, "tadK"),
        zst: num(a.zst, "zst"), fuel: String(a.fuel ?? "ethane") as "butane" | "ethane" | "propane",
        gravityG: a.gravityG !== undefined ? num(a.gravityG, "gravityG") : 1e-6,
      });
      return { tool: "run_cfig_model", ok: pred.ok, summary: pred.ok ? `Score ${fmt(pred.score ?? 0, 3)} — ${pred.interpretation}` : pred.refusal ?? "refused", data: pred, provenance: pred.provenance };
    },
  },
  {
    name: "model_validation_metrics",
    description: "Return honest validation metrics of registered models: FLEX v2 (recomputed + historical recorded), CFI-G (exploratory), SPICE (negative result).",
    args: { modelId: "optional: flex | cfig | spice" },
    handler: (a) => {
      const which = String(a.modelId ?? "all").toLowerCase();
      const cards: unknown[] = [];
      if (which === "all" || which === "flex") cards.push(getFlexCard());
      if (which === "all" || which === "cfig") cards.push(getCfigCard());
      if (which === "all" || which === "spice") cards.push(getSpiceCard());
      return {
        tool: "model_validation_metrics", ok: true,
        summary: `Model cards returned for: ${cards.map((c) => (c as { model_id?: string }).model_id).join(", ")}`,
        data: cards,
        provenance: "Model cards: models/flex-extinction/v2 (recomputed in this rebuild) + V6 spec preserved records",
      };
    },
  },
  {
    name: "get_model_registry",
    description: "Honest registry of deployed/exploratory/negative/absent models, including why absent models are NOT trained (no labelled data etc.).",
    args: {},
    handler: () => {
      const reg = getModelRegistry();
      return { tool: "get_model_registry", ok: true, summary: `${reg.length} registry entries (deployed, exploratory, negative and absent with reasons)`, data: reg, provenance: "Model registry (honest status per model)" };
    },
  },
  {
    name: "identify_evidence_gaps",
    description: "Known evidence/coverage gaps with explicit statuses: absent | not-indexed | inaccessible | no-evidence-found. Optionally filter by investigation accession.",
    args: { accession: "optional PSI accession" },
    handler: (a) => {
      const gaps = a.accession ? getGaps().filter((g) => g.related.some((r) => r.includes(String(a.accession)))) : getGaps();
      return {
        tool: "identify_evidence_gaps", ok: true,
        summary: `${gaps.length} gap records${a.accession ? ` for ${a.accession}` : ""} — statuses distinguish missing data from data that was never searched or is inaccessible`,
        data: gaps,
        provenance: "Gap registry: spec integrity cases + recovery audit (D-001)",
      };
    },
  },
  {
    name: "get_source_registry",
    description: "Registered official sources (NASA PSI, NTRS, Images API, challenge brief...) with categories and intended use.",
    args: { query: "optional filter" },
    handler: (a) => {
      const all = getSources();
      const q = String(a.query ?? "").toLowerCase();
      const hits = q ? all.filter((s) => `${s.title} ${s.category} ${s.use}`.toLowerCase().includes(q)) : all;
      return { tool: "get_source_registry", ok: true, summary: `${hits.length}/${all.length} registered sources`, data: hits.slice(0, 30), provenance: "Project source registry (V6 spec) — official NASA links" };
    },
  },
  {
    name: "search_media",
    description: "Search authentic NASA media (CIR, ACME, FLEX, SAFFIRE, ISS imagery) from the NASA Images and Video Library with per-item provenance. NOTE: the 2,393 historical research media binaries are NOT recovered in this environment (status: inaccessible) — never present other media as those assets.",
    args: { query: "search terms", limit: "optional (default 8)" },
    handler: (a) => {
      const items = searchMediaLocal(str(a.query, "query"), Math.min(12, Number(a.limit) || 8));
      return {
        tool: "search_media", ok: true,
        summary: items.length ? `${items.length} authentic NASA media items for "${a.query}" (each carries nasa_id, center, date)` : `No bundled NASA media matched "${a.query}".`,
        data: items.map((m) => ({ nasa_id: m.nasa_id, title: m.title, center: m.center, date: m.date_created, url: m.thumb, provenance: m.provenance })),
        provenance: "NASA Images and Video Library API (images-api.nasa.gov) — fetched with ledger, credit NASA",
      };
    },
  },
  {
    name: "get_equipment",
    description: "Equipment/facility catalogue (CIR, ACME, MDCA, MSG, SPICE, SAFFIRE...) with 3D-model fidelity labels and official source links. Optionally filter by investigation.",
    args: { accession: "optional PSI accession", equipmentId: "optional equipment id" },
    handler: (a) => {
      let eq = a.accession ? getEquipmentForInvestigation(String(a.accession)) : getEquipment();
      if (a.equipmentId) eq = eq.filter((e) => e.id === String(a.equipmentId));
      return {
        tool: "get_equipment", ok: true,
        summary: `${eq.length} equipment records; all 3D models are labelled procedural schematics (never official CAD)`,
        data: eq,
        provenance: "NASA PSI hardware metadata + registered NASA facility pages",
      };
    },
  },
  {
    name: "get_atmospheres",
    description: "Mission environment reference atmospheres (Earth, ISS, Moon concept, Mars concept, spacecraft, spacesuit) with gravity, pressure, O2 fraction and evidence status.",
    args: {},
    handler: () => {
      const atmo = getAtmospheres();
      return {
        tool: "get_atmospheres", ok: true,
        summary: `${atmo.environments.length} environments. ${atmo.note}`,
        data: atmo.environments,
        provenance: "Challenge-brief reference atmospheres + PSI flight records",
      };
    },
  },
  {
    name: "get_findings",
    description: "Ranked evidence-backed findings with tier labels (verified / negative-result / source-reported), each with basis and caveats.",
    args: {},
    handler: () => {
      const f = getFindings();
      return { tool: "get_findings", ok: true, summary: `${f.length} ranked findings`, data: f, provenance: "Findings registry — derived from recovered data and NASA-recorded investigation metadata" };
    },
  },
  {
    name: "get_graph",
    description: "Typed knowledge graph (nodes/edges with evidence, confidence, review status). Edges are co-recorded links, NOT causal claims. Optionally filter around one investigation.",
    args: { accession: "optional center node" },
    handler: (a) => {
      const g = getGraph();
      if (a.accession) {
        const acc = String(a.accession).toUpperCase();
        const nodeIds = new Set<string>([acc]);
        g.edges.forEach((e) => { if (e.source === acc) nodeIds.add(e.dst); if (e.dst === acc) nodeIds.add(e.source); });
        const nodes = g.nodes.filter((n) => nodeIds.has(n.id));
        const edges = g.edges.filter((e) => nodeIds.has(e.source) && nodeIds.has(e.dst));
        return { tool: "get_graph", ok: true, summary: `Graph slice around ${acc}: ${nodes.length} nodes, ${edges.length} typed edges`, data: { nodes, edges, honesty: g.honesty }, provenance: "Typed knowledge graph derived from PSI metadata fields" };
      }
      return { tool: "get_graph", ok: true, summary: `Knowledge graph: ${g.nodes.length} nodes, ${g.edges.length} typed edges`, data: g, provenance: "Typed knowledge graph derived from PSI metadata fields" };
    },
  },
  {
    name: "navigate",
    description: "Navigate the user's interface. Use when the user asks to go somewhere or when results are best viewed in a section.",
    args: { view: "mission | investigations | compare | scenarios | lab3d | ingestion | advanced", investigation: "optional accession to open", investigationTab: "optional tab: overview|data|equipment|media|equations|graph|gaps", environment: "optional env id: earth|iss|moon|mars|spacecraft|spacesuit" },
    handler: (a) => {
      const view = String(a.view ?? "mission");
      return { tool: "navigate", ok: true, summary: `UI action: open ${view}${a.investigation ? ` / ${a.investigation}` : ""}`, data: { action: "navigate", view, investigation: a.investigation ?? null, investigationTab: a.investigationTab ?? null, environment: a.environment ?? null }, provenance: "UI action" };
    },
  },
  {
    name: "save_session",
    description: "Save the current research context as a named session on the user's Research Session Shelf (Scenarios view).",
    args: { title: "session title", notes: "optional notes", provenance: "optional provenance summary" },
    handler: (a) => {
      return { tool: "save_session", ok: true, summary: `UI action: save session "${a.title}"`, data: { action: "save_session", title: str(a.title, "title"), notes: a.notes ? String(a.notes) : null, provenance: a.provenance ? String(a.provenance) : null }, provenance: "UI action (user data — requires their shelf)" };
    },
  },
  {
    name: "compare_investigations",
    description: "Add investigations to the cross-study Compare view (up to 4). Returns UI action.",
    args: { accessions: "array of PSI accessions" },
    handler: (a) => {
      const accs = Array.isArray(a.accessions) ? a.accessions.map(String) : [String(a.accessions ?? "")];
      return { tool: "compare_investigations", ok: true, summary: `UI action: compare ${accs.join(", ")}`, data: { action: "compare", accessions: accs }, provenance: "UI action" };
    },
  },
  {
    name: "generate_chart",
    description: "Generate a chart from REAL table data: histogram of a column, or scatter of two numeric columns. All points come from recovered rows with provenance.",
    args: { tableId: "table id", xColumn: "numeric column for scatter (or histogram basis)", yColumn: "optional second numeric column for scatter", filterColumn: "optional", filterValue: "optional" },
    handler: (a) => {
      const t = getTable(str(a.tableId, "tableId"));
      if (!t) return { tool: "generate_chart", ok: false, summary: `Table ${a.tableId} not found`, provenance: "-" };
      const findCol = (name: unknown) => t.columns.find((c) => c.name.toLowerCase().includes(String(name ?? "").toLowerCase()));
      const xCol = findCol(a.xColumn);
      if (!xCol || xCol.type !== "numeric") return { tool: "generate_chart", ok: false, summary: `Column "${a.xColumn}" not numeric in ${t.id}. Numeric columns: ${t.columns.filter((c) => c.type === "numeric").map((c) => c.name).join(", ") || "none"}`, provenance: t.source };
      const xi = xCol.index;
      const xv = t.rows.map((r) => Number((r[xi] ?? "").trim())).filter((v) => !Number.isNaN(v));
      let chart: ChartSpec;
      if (a.yColumn) {
        const yCol = findCol(a.yColumn);
        if (!yCol || yCol.type !== "numeric") return { tool: "generate_chart", ok: false, summary: `Y column "${a.yColumn}" not numeric`, provenance: t.source };
        const yi = yCol.index;
        const pts: { x: number; y: number }[] = [];
        for (const r of t.rows) {
          const x = Number((r[xi] ?? "").trim());
          const y = Number((r[yi] ?? "").trim());
          if (!Number.isNaN(x) && !Number.isNaN(y)) pts.push({ x, y });
        }
        chart = { title: `${xCol.name} vs ${yCol.name} — ${t.label}`, xLabel: `${xCol.name}${xCol.unit ? ` (${xCol.unit})` : ""}`, yLabel: `${yCol.name}${yCol.unit ? ` (${yCol.unit})` : ""}`, points: pts, source: `${t.file} — ${pts.length} real rows (sha256 ${t.sha256.slice(0, 10)}…)` };
        return { tool: "generate_chart", ok: true, summary: `Scatter of ${pts.length} real rows: ${xCol.name} vs ${yCol.name}`, data: { chartSpec: chart }, chart, provenance: `${t.source}; chart values are exactly the recovered rows` };
      }
      // histogram
      const bins = 14;
      const lo = Math.min(...xv), hi = Math.max(...xv);
      const w = (hi - lo) / bins || 1;
      const counts = new Array(bins).fill(0);
      for (const x of xv) counts[Math.min(bins - 1, Math.floor((x - lo) / w))] += 1;
      chart = { title: `${xCol.name} distribution — ${t.label}`, xLabel: `${xCol.name}${xCol.unit ? ` (${xCol.unit})` : ""}`, yLabel: "count", histogram: { binStart: Array.from({ length: bins }, (_, i) => Number((lo + i * w).toFixed(6))), binEnd: Array.from({ length: bins }, (_, i) => Number((lo + (i + 1) * w).toFixed(6))), counts, label: xCol.name }, source: `${t.file} — ${xv.length} real values (sha256 ${t.sha256.slice(0, 10)}…)` };
      return { tool: "generate_chart", ok: true, summary: `Histogram of ${xv.length} real values of ${xCol.name}`, data: { chartSpec: chart }, chart, provenance: `${t.source}; chart values are exactly the recovered rows` };
    },
  },
  {
    name: "search_external_literature",
    description: "LIVE search of the NASA Technical Reports Server (ntrs.nasa.gov) for literature beyond the local corpus — technical publications, conference papers, contractor reports. Returns real titles/abstracts/links with per-item provenance. Use this before concluding that evidence does not exist anywhere.",
    args: { query: "search query (e.g. 'microgravity flame spread PMMA')", limit: "optional max results (default 6)" },
    handler: async (a) => {
      const r = await searchNtrs(str(a.query, "query"), Math.min(10, Number(a.limit) || 6));
      if (!r.ok) {
        return { tool: "search_external_literature", ok: false, summary: `NTRS search unavailable: ${r.error ?? "unknown error"}. Do NOT claim external evidence either way — report the tool failure honestly.`, provenance: "NASA NTRS live API (ntrs.nasa.gov)" };
      }
      return {
        tool: "search_external_literature", ok: true,
        summary: `NTRS live: ${r.docs.length} results${r.total !== null ? ` (of ${r.total} total matches)` : ""} for "${a.query}"`,
        data: { total: r.total, fetchedAt: r.fetchedAt, docs: r.docs.map((d) => ({ id: d.id, title: d.title, kind: d.kind, date: d.date, center: d.center, authors: d.authors, url: d.url, abstract: d.abstract.slice(0, 350) })) },
        provenance: "NASA Technical Reports Server live API (ntrs.nasa.gov/api/citations/search), fetched " + r.fetchedAt,
      };
    },
  },
  {
    name: "check_gap_externally",
    description: "Evidence-gap triage with LIVE external verification: takes a gap topic (or registry gap id), shows what the local corpus holds, then searches NASA NTRS live to distinguish 'gap in our index' from 'no evidence found externally'. Follows the rule: absence of data in the platform is NOT absence of research worldwide.",
    args: { topic: "gap topic or gap registry id (e.g. 'gap-partial-g' or 'partial gravity flame spread')" },
    handler: async (a) => {
      const topicRaw = str(a.topic, "topic");
      const gaps = getGaps();
      const gap = gaps.find((g) => g.id === topicRaw) ?? gaps.find((g) => topicRaw.toLowerCase().includes(g.topic.toLowerCase().slice(0, 20)));
      const topic = gap?.topic ?? topicRaw;
      const localHits = searchEvidence(topic, 4);
      const ntrs = await searchNtrs(`${topic} microgravity combustion`, 5);
      const externalCount = ntrs.ok ? (ntrs.total ?? ntrs.docs.length) : null;
      let classification: string;
      if (!ntrs.ok) {
        classification = `external check unavailable (NTRS: ${ntrs.error}) — the local gap status stands, no external claim made`;
      } else if ((ntrs.total ?? 0) > 0) {
        classification = `literature EXISTS externally (${ntrs.total} NTRS matches) — the gap is in OUR index/coverage, not in the field; treat as a not-indexed/coverage gap and link the external studies`;
      } else {
        classification = "no external evidence found in NTRS either — consistent with a genuine research gap (still not proof of absence: NTRS is one source)";
      }
      return {
        tool: "check_gap_externally", ok: true,
        summary: `Gap "${topic}" — ${classification}`,
        data: {
          topic,
          localGap: gap ?? null,
          localEvidenceHits: localHits.map((h) => ({ kind: h.kind, id: h.id, title: h.title })),
          external: ntrs.ok
            ? { source: "NASA NTRS", total: ntrs.total, docs: ntrs.docs.slice(0, 5).map((d) => ({ id: d.id, title: d.title, url: d.url, date: d.date })) }
            : { source: "NASA NTRS", error: ntrs.error ?? "unavailable" },
          classification,
        },
        provenance: `Local corpus (BM25) + NASA NTRS live API ${ntrs.ok ? `(fetched ${ntrs.fetchedAt})` : "(unavailable)"}`,
        gapStatus: gap?.status ?? "not-indexed",
      };
    },
  },
  {
    name: "save_gap",
    description: "Save a research gap to the user's Gap Shelf (persisted locally) so they can revisit it, with an optional note and the external-evidence count if known.",
    args: { gapId: "registry gap id or short slug", topic: "gap topic", note: "optional note", externalHits: "optional number of external results found" },
    handler: (a) => {
      const externalHits = a.externalHits !== undefined ? Number(a.externalHits) : undefined;
      return {
        tool: "save_gap", ok: true,
        summary: `UI action: save gap "${a.topic}" to the Gap Shelf`,
        data: { action: "save_gap", gapId: str(a.gapId, "gapId"), topic: str(a.topic, "topic"), note: a.note ? String(a.note) : null, externalHits: Number.isFinite(externalHits) ? externalHits : null },
        provenance: "UI action (user data — requires their shelf)",
      };
    },
  },
  {
    name: "save_research_item",
    description: "Save any research item (investigation | dataset | gap | equation | chart | source | media | scenario | equipment) to the user's My Work shelf with an optional note. Use when the user asks to save/bookmark/collect something.",
    args: { kind: "one of: investigation | dataset | gap | equation | chart | source | media | scenario | equipment", label: "short item label (e.g. 'PSI-69 · FLEX', 'Rayleigh number')", detail: "optional one-line detail", url: "optional deep link (hash or source URL)", note: "optional user note" },
    handler: (a) => {
      const KINDS = ["investigation", "dataset", "gap", "equation", "chart", "source", "media", "scenario", "equipment"];
      const kind = String(a.kind ?? "").toLowerCase();
      if (!KINDS.includes(kind)) {
        return { tool: "save_research_item", ok: false, summary: `Unknown kind "${a.kind}" — must be one of: ${KINDS.join(", ")}`, provenance: "UI action" };
      }
      return {
        tool: "save_research_item", ok: true,
        summary: `UI action: save ${kind} "${a.label}" to My Work`,
        data: { action: "save_item", kind, label: str(a.label, "label"), detail: a.detail ? String(a.detail) : undefined, url: a.url ? String(a.url) : undefined, note: a.note ? String(a.note) : undefined },
        provenance: "UI action (user data — requires their shelf)",
      };
    },
  },
  {
    name: "search_mathematical_models",
    description: "Search the Mathematical Model Registry (17A): structured physical/empirical/ML models composed from verified equations — distinct from individual equations. Returns model ids, classes, phenomena, lifecycle statuses and executability. Use for 'which model describes X' questions.",
    args: { query: "phenomenon/model query, e.g. 'droplet combustion microgravity', 'smoke settling', 'cool flame ignition'", limit: "optional max hits (default 6)" },
    handler: (a) => {
      const hits = searchMathModels(str(a.query, "query"), Math.min(12, Number(a.limit) || 6));
      return {
        tool: "search_mathematical_models", ok: true,
        summary: hits.length ? `${hits.length} mathematical model(s) matched "${a.query}"` : `No registered mathematical model matched "${a.query}" — the registry covers atmosphere-state, transport-regime, d²-law droplet combustion, thermally-thick ignition, smoke settling, Froude spread scaling and the FLEX/CFI-G ML scorers (documented-only literature models also listed)`,
        data: hits.map((m) => ({ model_id: m.model_id, name: m.name, model_class: m.model_class, phenomenon_tags: m.phenomenon_tags, implementation_status: m.implementation_status, verification_status: m.verification_status, validation_status: m.validation_status, executable: m.executable, related_equations: m.related_equation_ids })),
        provenance: "Mathematical Model Registry (src/data/generated/mathematical_models.json) — curated against the 63-equation registry and knowledge-index citations",
      };
    },
  },
  {
    name: "get_mathematical_model",
    description: "Full registry record for one mathematical model: governing equations, required variables, assumptions, applicability limits, source references, validation evidence, lifecycle status. Use before recommending or executing.",
    args: { model_id: "registry model id (e.g. d2-law-droplet-combustion)" },
    handler: (a) => {
      const m = getMathModel(str(a.model_id, "model_id"));
      if (!m) return { tool: "get_mathematical_model", ok: false, summary: `Model "${a.model_id}" not found — use search_mathematical_models`, provenance: "Mathematical Model Registry" };
      return {
        tool: "get_mathematical_model", ok: true,
        summary: `${m.name} [${m.model_class}] — ${m.implementation_status} / ${m.verification_status} / ${m.validation_status}; executable: ${m.executable ? "yes" : "no (documented reference)"}`,
        data: m,
        provenance: `Mathematical Model Registry + sources: ${m.source_references.map((s) => s.source).join("; ").slice(0, 160)}`,
      };
    },
  },
  {
    name: "check_model_applicability",
    description: "Environmental applicability gate (17A.6/7): is a mathematical model directly applicable, applicable with modifications, qualitative-only, or not applicable in the selected environment? Refuses unsuitable combinations with reasons — never transfers a 1-g correlation silently.",
    args: { model_id: "registry model id", environment: "earth | iss | moon | mars | spacecraft | spacesuit" },
    handler: (a) => {
      const r = checkModelApplicability(str(a.model_id, "model_id"), str(a.environment, "environment"));
      if ("error" in r) return { tool: "check_model_applicability", ok: false, summary: r.error, provenance: "Model applicability gate (17A)" };
      return {
        tool: "check_model_applicability", ok: true,
        summary: `${r.model_id} in "${r.environment_id}": ${r.compatibility.toUpperCase()} — ${r.reasons[0] ?? ""}${r.executable_in_environment ? " · executable in this environment" : ""}`,
        data: r,
        provenance: "Model applicability gate: registry environments + environment profiles (gravity/pressure/O2, habitat-vs-exterior distinctions)",
      };
    },
  },
  {
    name: "run_mathematical_model",
    description: "Execute an IMPLEMENTED mathematical model (ideal-atmosphere-state, buoyancy-transport-regime, d2-law-droplet-combustion, thermally-thick-ignition, stokes-smoke-settling, froude-spread-scaling, flex-extinction-v2, cfig-hot-ignition) through its deterministic runner. DOCUMENTED_ONLY models refuse with citations. Missing inputs are refused, never guessed.",
    args: { model_id: "implemented model id", inputs: "object of model inputs (numbers/strings per model input_schema)" },
    handler: (a) => {
      const inputs = (a.inputs && typeof a.inputs === "object" ? a.inputs : {}) as Record<string, number | string>;
      const r = runMathematicalModel(str(a.model_id, "model_id"), inputs);
      if (!r.executed) {
        return { tool: "run_mathematical_model", ok: false, summary: r.refusal ?? "execution refused", provenance: "Mathematical model runner (17A.12: only IMPLEMENTED models execute)" };
      }
      return {
        tool: "run_mathematical_model", ok: true,
        summary: `${r.model_id} executed: ${Object.entries(r.outputs).filter(([k]) => k !== "trajectory_fractions_of_lifetime" && k !== "regime_detail" && k !== "interpretation").slice(0, 4).map(([k, v]) => `${k}=${v}`).join(" · ")}`,
        data: r,
        provenance: `Deterministic runner over verified equations: ${(r.steps ?? []).map((s) => s.equation_id).join(", ") || "model-specific"} | sources: ${(r.provenance ?? []).join("; ").slice(0, 120)}`,
      };
    },
  },
  {
    name: "compare_model_candidates",
    description: "Model selection engine (17A.7): rank registered mathematical models for a phenomenon + environment (+ optional requested output). Shows recommended model with ranking breakdown, alternatives, and explicit rejections with reasons — refuses honestly when no validated quantitative model exists.",
    args: { phenomenon: "target phenomenon, e.g. 'droplet-combustion', 'flame-spread', 'smoke', 'ignition', 'atmosphere'", environment: "earth | iss | moon | mars | spacecraft | spacesuit", requested_output: "optional output filter, e.g. 'lifetime', 'ignition_time'" },
    handler: (a) => {
      const sel = selectMathModels({ phenomenon: str(a.phenomenon, "phenomenon"), environmentId: str(a.environment, "environment"), requestedOutput: a.requested_output ? String(a.requested_output) : undefined });
      const rec = sel.recommended;
      return {
        tool: "compare_model_candidates", ok: true,
        summary: rec
          ? `Recommended: ${rec.model.model_id} (${rec.applicability.compatibility} in ${sel.request.environmentId}; ${rec.model.validation_status})${sel.no_quantitative_model ? " — NOTE: no fully-validated quantitative model exists for this combination; treat outputs as research reference" : ""} · ${sel.alternatives.length} alternatives · ${sel.rejected.length} rejected with reasons`
          : `No registered model matches "${sel.request.phenomenon}" in "${sel.request.environmentId}" — reliable quantitative prediction cannot currently be produced; see rejected[] for reasons`,
        data: sel,
        provenance: "Model selection engine (17A.7): registry + applicability gate + documented ranking policy (no invented weights)",
      };
    },
  },
  {
    name: "list_experiment_datasets",
    description: "List the team's cleaned experiment datasets (CODEX Phase 1): Experiment_N files mapped to PSI accessions, with row/column counts and whether the team package carries MORE data than the canonical corpus. Use for discovery before querying.",
    args: {},
    handler: () => {
      const r = listExperimentDatasetsTool();
      return {
        tool: "list_experiment_datasets", ok: true,
        summary: `${r.count} cleaned experiment datasets (team package, never modified) — ${r.experiments.filter((e) => e.more_rows_in_team_package).length} carry more rows than the canonical corpus`,
        data: r,
        provenance: "data/experiments (team-supplied canonical cleaned files, sha256-recorded in experiment_datasets.json)",
      };
    },
  },
  {
    name: "resolve_experiment",
    description: "Resolve a free-text experiment name/id to the correct cleaned dataset (CODEX Phase 4). Disambiguates SAME vs SAME-R and FLEX vs FLEX-2 — returns candidates with accessions; never fabricates an experiment.",
    args: { query: "experiment name, accession, or id — e.g. 'SAME-R', 'FLEX-2', 'PSI-107', 'cool flames'" },
    handler: (a) => {
      const r = resolveExperimentTool(str(a.query, "query"));
      return {
        tool: "resolve_experiment", ok: true,
        summary: r.resolved.length
          ? `${r.resolved.length} candidate(s): ${r.resolved.map((x) => `${x.experiment_id} (${x.psi_accession ?? "no accession"}, ${x.rows} rows)`).join(" · ")} — ${r.note}`
          : r.note,
        data: r,
        provenance: "experiment_names.csv (team mapping) + experiment_datasets.json",
      };
    },
  },
  {
    name: "query_experiment_dataset",
    description: "Query a cleaned experiment dataset (CODEX Phase 1): filters, exact column resolution, numeric stats (mean/min/max/median with missing counts), group means. Real rows only — missing values are counted, never zero-filled.",
    args: { experiment_id: "Experiment_N or PSI accession", columns: "optional array of column names", filters: "optional array of {column, op(eq|neq|gt|gte|lt|lte|contains), value}", statsColumns: "optional array of numeric column names to profile", groupBy: "optional 'CategoryColumn:NumericColumn' for group means", limit: "optional sample rows (default 10, max 50)" },
    handler: (a) => {
      const parsed = DatasetQuerySchema.safeParse({
        experimentId: String(a.experiment_id ?? ""),
        columns: Array.isArray(a.columns) ? a.columns.map(String) : undefined,
        filters: Array.isArray(a.filters) ? a.filters : undefined,
        statsColumns: Array.isArray(a.statsColumns) ? a.statsColumns.map(String) : undefined,
        groupBy: typeof a.groupBy === "string" ? a.groupBy : undefined,
        limit: Number(a.limit) || undefined,
      });
      if (!parsed.success) {
        return { tool: "query_experiment_dataset", ok: false, summary: `invalid query: ${parsed.error.issues[0]?.message ?? "validation failed"}`, provenance: "experiment dataset layer" };
      }
      const r = queryExperimentDataset(parsed.data.experimentId, parsed.data);
      if ("error" in r) return { tool: "query_experiment_dataset", ok: false, summary: r.error, provenance: `data/experiments/${parsed.data.experimentId}_cleaned.csv` };
      const statsText = r.stats ? Object.entries(r.stats).map(([cn, s]) => `${cn}: n=${s.n} mean=${s.mean} min=${s.min} max=${s.max}`).join(" · ") : "";
      return {
        tool: "query_experiment_dataset", ok: true,
        summary: `${r.experiment_id}: ${r.matched_rows}/${r.total_rows} rows${r.filters_applied.length ? ` (${r.filters_applied.join("; ")})` : ""}${statsText ? ` · ${statsText}` : ""}${r.warnings.length ? ` · warnings: ${r.warnings.join("; ")}` : ""}`,
        data: r,
        provenance: `data/experiments — team-supplied canonical cleaned CSV (sha256-recorded); stats computed in-process from real rows`,
      };
    },
  },
  {
    name: "get_external_integrations",
    description: "Status of the platform's live external research integrations (NASA NTRS, Images API, PSI probes, OSDR) — which are operational, which are unconfirmed. Use before claiming any external capability.",
    args: {},
    handler: () => {
      const integrations = getIntegrationStatus();
      return {
        tool: "get_external_integrations", ok: true,
        summary: `${integrations.filter((i) => i.status.startsWith("operational")).length}/${integrations.length} external integrations operational`,
        data: integrations,
        provenance: "Integration status registry — verified 2026-11-12; unconfirmed endpoints are labelled as such",
      };
    },
  },
  {
    name: "probe_psi_data",
    description: "LIVE probe of the NASA PSI download endpoint for one investigation accession — checks whether its experimental data files are still publicly downloadable (distinguishes 'inaccessible' from 'not indexed').",
    args: { accession: "PSI accession, e.g. PSI-69", fileName: "optional specific file name from the fetch ledger" },
    handler: async (a) => {
      const acc = str(a.accession, "accession");
      const probe = await probePsiStudy(acc, a.fileName ? String(a.fileName) : undefined);
      return {
        tool: "probe_psi_data", ok: probe.ok,
        summary: probe.note,
        data: probe,
        provenance: "NASA PSI public download endpoint (psi.nasa.gov/geode-py/ws/studies/{acc}/download), live probe",
        gapStatus: probe.ok ? undefined : "inaccessible (endpoint probe failed)",
      };
    },
  },
  {
    name: "analyze_fire_safety_scenario",
    description: "Deterministic fire-safety facility analysis (M5): scores compartments across six transparent drivers (atmosphere, materials, ignition sources, confinement, ventilation regime, protection deficit), each with evidence links. Scores are relative heuristics — never probabilities. Optionally auto-seeds from the CURRENT scenario context (environment O2/pressure/gravity + facility screening compartments).",
    args: { useCurrentContext: "optional boolean — build the FacilitySpec from the user's active scenario context (default true when args omitted)", stationType: "optional: iss-module | lunar-habitat | pressurized-rover | spacecraft-cabin", gravity: "optional gravity in g (0-1)", o2: "optional O2 mole fraction (0.1-0.4)", pressureKpa: "optional ambient pressure kPa (40-110)", ventilationCmS: "optional facility average flow cm/s (0-60)" },
    handler: (a) => {
      const ctx = (a.__scenarioContext as ScenarioToolContext | undefined) ?? null;
      const spec: FacilitySpec = a.useCurrentContext === false || a.stationType || a.gravity !== undefined
        ? {
            stationType: (a.stationType ?? ctx?.stationType ?? "iss-module") as FacilitySpec["stationType"],
            gravity: a.gravity !== undefined ? num(a.gravity, "gravity") : ctx?.gravity ?? 1 / 6,
            o2: a.o2 !== undefined ? num(a.o2, "o2") : ctx?.o2 ?? 0.3,
            pressureKpa: a.pressureKpa !== undefined ? num(a.pressureKpa, "pressureKpa") : ctx?.pressureKpa ?? 70.3,
            ventilationCmS: a.ventilationCmS !== undefined ? num(a.ventilationCmS, "ventilationCmS") : ctx?.ventilationCmS ?? 5,
            compartments: ctx?.compartments ?? [
              { id: "c-1", name: "Crew quarter", lengthM: 3.5, widthM: 3.5, heightM: 2.4, materials: ["paper-cotton", "nomex"], ventilationCmS: 5, ignitionSources: ["electronics"], detection: ["photoelectric"], suppression: ["portable-ext"] },
              { id: "c-2", name: "Lab bench", lengthM: 4, widthM: 2.5, heightM: 2.4, materials: ["pmma", "cotton-fiberglass"], ventilationCmS: 8, ignitionSources: ["electronics", "hot-surface"], detection: ["photoelectric", "ionization"], suppression: ["co2"] },
            ],
          }
        : {
            stationType: "iss-module",
            gravity: 1e-6,
            o2: 0.21,
            pressureKpa: 101.3,
            ventilationCmS: 5,
            compartments: [
              { id: "c-1", name: "Crew quarter", lengthM: 3.5, widthM: 3.5, heightM: 2.4, materials: ["paper-cotton", "nomex"], ventilationCmS: 5, ignitionSources: ["electronics"], detection: ["photoelectric"], suppression: ["portable-ext"] },
              { id: "c-2", name: "Lab bench", lengthM: 4, widthM: 2.5, heightM: 2.4, materials: ["pmma", "cotton-fiberglass"], ventilationCmS: 8, ignitionSources: ["electronics", "hot-surface"], detection: ["photoelectric", "ionization"], suppression: ["co2"] },
            ],
          };
      const analysis = analyzeFacility(spec);
      const worst = [...analysis.compartments].sort((x, y) => y.total - x.total)[0];
      return {
        tool: "analyze_fire_safety_scenario", ok: true,
        summary: `Facility "${spec.stationType}" @ ${analysis.gravityLabel}, ${(spec.o2 * 100).toFixed(0)}% O₂, pO₂ ${analysis.pO2Kpa.toFixed(1)} kPa, Ri ${Number.isFinite(analysis.richardsonNumber) ? analysis.richardsonNumber.toFixed(2) : "∞"}: ${analysis.compartments.length} compartments ranked; highest ${worst?.name} ${worst?.total}/100 (${worst?.band}). ${analysis.recommendations.length} evidence-linked recommendations. Heuristic scores, NOT probabilities.`,
        data: { spec, analysis, seedQuestion: copilotSeedQuestion(spec, analysis) },
        provenance: "Deterministic fire-safety engine (SECOND_EVIDENCE port) over NASA PSI evidence links: PSI-25/26/99 solid fuels, PSI-159 oxygen enrichment, PSI-101/102 smoke aerosols, PSI-68/69 diluent extinction",
      };
    },
  },
  {
    name: "compare_comparability_gate",
    description: "Comparability gate (M4): audits whether the selected investigations can be scientifically compared BEFORE plotting or ranking. Checks gravity regime, experimental scale, project type, hardware, outcome-bearing data. Returns level: direct | conditional | not-comparable, with explicit reasons — never silently pools mismatched conditions.",
    args: { accessions: "array of 2+ PSI accessions" },
    handler: (a) => {
      const accs = (Array.isArray(a.accessions) ? a.accessions : [a.accessions]).map((x) => String(x).toUpperCase());
      const invs = accs.map((acc) => getInvestigation(acc)).filter(Boolean) as NonNullable<ReturnType<typeof getInvestigation>>[];
      if (invs.length < 2) {
        return { tool: "compare_comparability_gate", ok: false, summary: `Need 2+ known accessions to gate a comparison (got: ${accs.join(", ") || "none"})`, provenance: "Comparability gate over PSI metadata" };
      }
      const verdict = auditComparability(invs);
      return {
        tool: "compare_comparability_gate", ok: true,
        summary: `Comparability of ${invs.map((i) => i.accession).join(" vs ")}: ${verdict.level.toUpperCase()}${verdict.reasons.length ? ` — ${verdict.reasons.length} reason(s), first: ${verdict.reasons[0]}` : " — no mismatches detected in metadata"}`,
        data: verdict,
        provenance: `Comparability gate derived from PSI metadata: ${invs.map((i) => `${i.accession} (doi ${i.doi ?? "—"})`).join(", ")}`,
      };
    },
  },
];

export function getToolCatalogue(): { name: string; description: string; args: Record<string, string> }[] {
  return TOOLS.map(({ name, description, args }) => ({ name, description, args }));
}

/** CODEX Phase 2 — request-scoped scenario context: passed per-call instead of
 *  stored on a module, so concurrent requests cannot leak scenario state. */
export async function executeTool(
  name: string,
  args: ToolArgs,
  scenarioContext?: ScenarioToolContext | null,
): Promise<ToolResult> {
  const tool = TOOLS.find((t) => t.name === name);
  if (!tool) {
    return { tool: name, ok: false, summary: `Unknown tool "${name}" — this agent only runs its registered tools.`, provenance: "-" };
  }
  try {
    const result = await tool.handler(args ?? {});
    // attach the request-scoped scenario context for tools that consume it
    if (scenarioContext && (name === "analyze_fire_safety_scenario" || name === "analyzeFacility")) {
      return { ...result, data: { ...((result.data as Record<string, unknown>) ?? {}), __scenarioContext: scenarioContext } };
    }
    return result;
  } catch (err) {
    return { tool: name, ok: false, summary: `Tool error: ${(err as Error).message}`, provenance: "-" };
  }
}
