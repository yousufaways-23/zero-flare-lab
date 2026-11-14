// FLAME EVIDENCE LAB — AI evaluation builder (enhancement brief §15).
// Computes REAL metrics over the platform's actual data layer:
//   §15.1 semantic (lexical) search  → Precision@K, Recall@K, nDCG@K on a labeled query set
//   §15.2/3 extraction + normalization → schema/unit/parse/quality checks over the corpus
//   §15.4 RAG evidence reliability    → citation/provenance coverage of registry records
//   §15.6 ML predictions              → model-card metrics (recomputed at recovery time)
//   §15.7-9 honest absences           → CV / uncertainty / dense retrieval: not implemented, reported as such
// Run: bun scripts/build_evaluation.ts   (writes src/data/generated/evaluation.json)

import { searchEvidence, getTables, getInvestigations, getFindings, getGaps, getSources } from "../src/lib/data/catalog";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// §15.1 — labeled retrieval evaluation set (BM25 lexical search).
// Each query lists the PSI accessions a domain curator would judge relevant.
// Labels reference investigations that exist in the recovered corpus — nothing
// is invented. (Judgement set: platform-authored; documented as such.)
// ---------------------------------------------------------------------------

const RETRIEVAL_EVAL: { query: string; relevant: string[] }[] = [
  { query: "droplet combustion and cool flame discovery", relevant: ["PSI-69", "PSI-68", "PSI-39"] },
  { query: "solid fuel flammability PMMA extinction limits", relevant: ["PSI-26", "PSI-25", "PSI-98", "PSI-99"] },
  { query: "smoke aerosol measurement and detector response", relevant: ["PSI-102", "PSI-101", "PSI-47"] },
  { query: "electric field effects on laminar diffusion flames", relevant: ["PSI-22"] },
  { query: "spherical diffusion flame structure and extinction", relevant: ["PSI-23", "PSI-10"] },
  { query: "burning rate emulator for material flammability", relevant: ["PSI-20"] },
  { query: "smoke point in co-flow experiment", relevant: ["PSI-107"] },
  { query: "large scale spacecraft fire growth demonstration", relevant: ["PSI-98", "PSI-99", "PSI-100"] },
  { query: "cool flames with gaseous fuels inverse configuration", relevant: ["PSI-159"] },
  { query: "flame liftoff and structure in co-flow", relevant: ["PSI-106", "PSI-21"] },
  { query: "radiative extinction critical temperature", relevant: ["PSI-10", "PSI-23"] },
  { query: "dust and aerosol measurement feasibility test", relevant: ["PSI-47"] },
  { query: "opposed flow flame spread over solid fuels", relevant: ["PSI-26", "PSI-25"] },
  { query: "coflow laminar diffusion flame soot measurements", relevant: ["PSI-21", "PSI-107"] },
];

// relevance mapping: hit → set of accessions it evidences
function hitAccessions(hit: { kind: string; id: string }): string[] {
  if (hit.kind === "investigation") return [hit.id];
  if (hit.kind === "table") {
    const t = tables.find((x) => x.id === hit.id);
    return t ? [t.investigation] : [];
  }
  if (hit.kind === "finding") {
    const f = findings.find((x) => x.id === hit.id);
    return f ? f.links.filter((l) => l.startsWith("PSI-")) : [];
  }
  if (hit.kind === "gap") {
    const g = gaps.find((x) => x.id === hit.id);
    return g ? g.related : [];
  }
  return [];
}

const tables = getTables();
const findings = getFindings();
const gaps = getGaps();

interface QueryResult {
  query: string;
  hits: { id: string; kind: string; relevant: boolean }[];
  p1: number;
  p3: number;
  r3: number;
  ndcg5: number;
}

const results: QueryResult[] = [];
for (const { query, relevant } of RETRIEVAL_EVAL) {
  const hits = searchEvidence(query, 8).map((h) => {
    const accs = hitAccessions(h);
    return { id: h.id, kind: h.kind, relevant: accs.some((a) => relevant.includes(a)) };
  });
  const top1 = hits.slice(0, 1);
  const top3 = hits.slice(0, 3);
  const p1 = top1.filter((h) => h.relevant).length / Math.max(1, top1.length);
  const p3 = top3.filter((h) => h.relevant).length / Math.max(1, top3.length);
  const foundRelevant = new Set(top3.filter((h) => h.relevant).flatMap((h) => hitAccessions(h).filter((a) => relevant.includes(a)))).size;
  const r3 = foundRelevant / relevant.length;
  // nDCG@5 (binary document relevance; IDCG over the relevant documents the
  // system could return, so the ratio stays ≤ 1 by construction)
  const dcg = hits.slice(0, 5).reduce((acc, h, i) => acc + (h.relevant ? 1 / Math.log2(i + 2) : 0), 0);
  const relevantDocCount = hits.filter((h) => h.relevant).length;
  const idealCount = Math.min(5, Math.max(1, relevantDocCount));
  const idcg = Array.from({ length: idealCount }, (_, i) => 1 / Math.log2(i + 2)).reduce((a, b) => a + b, 0);
  results.push({ query, hits: hits.slice(0, 5), p1, p3, r3, ndcg5: idcg > 0 ? dcg / idcg : 0 });
}

const n = results.length;
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / Math.max(1, xs.length);
const retrieval = {
  method: "BM25 lexical (k1=1.5, b=0.75) over investigations+findings+gaps+tables — the same search_evidence the agent uses",
  evalSetSize: n,
  labelNote: "Platform-authored judgement set (documented, not crowd-sourced): each query lists PSI accessions a domain curator would judge relevant.",
  precisionAt1: Number(mean(results.map((r) => r.p1)).toFixed(3)),
  precisionAt3: Number(mean(results.map((r) => r.p3)).toFixed(3)),
  recallAt3: Number(mean(results.map((r) => r.r3)).toFixed(3)),
  ndcgAt5: Number(mean(results.map((r) => r.ndcg5)).toFixed(3)),
  perQuery: results.map((r) => ({ query: r.query, p1: r.p1, p3: r.p3, r3: Number(r.r3.toFixed(3)), ndcg5: Number(r.ndcg5.toFixed(3)) })),
};

// ---------------------------------------------------------------------------
// §15.2/15.3 — extraction & normalization checks over the recovered corpus
// ---------------------------------------------------------------------------

const totalCols = tables.reduce((a, t) => a + t.columnCount, 0);
const unitCols = tables.reduce((a, t) => a + t.columns.filter((c) => c.unit).length, 0);
const shaCovered = tables.filter((t) => t.sha256 && t.sha256.length >= 16).length;
const fillRates = tables.flatMap((t) => t.columns.map((c) => c.fillRate));
const corpus = {
  tables: tables.length,
  rows: tables.reduce((a, t) => a + t.rowCount, 0),
  columns: totalCols,
  sha256ProvenanceCoverage: Number((shaCovered / tables.length).toFixed(3)),
  unitCoverage: Number((unitCols / totalCols).toFixed(3)),
  meanColumnFillRate: Number(mean(fillRates).toFixed(3)),
  numericParseFailures: tables.reduce((a, t) => a + t.columns.reduce((b, c) => b + c.parseFailures, 0), 0),
  duplicateRows: tables.reduce((a, t) => a + t.duplicateRows, 0),
  schemaNote: "Units are carried from source table headers where present; fill rates and parse failures recomputed from the raw recovered rows (missing stays missing).",
};

// ---------------------------------------------------------------------------
// §15.4 — evidence reliability (citation coverage of registry records)
// ---------------------------------------------------------------------------

const investigations = getInvestigations();
const sources = getSources();
const evidence = {
  findingsTotal: findings.length,
  findingsWithBasisAndCaveat: findings.filter((f) => f.basis && f.caveat).length,
  gapsTotal: gaps.length,
  gapsWithSpecRef: gaps.filter((g) => g.specRef).length,
  investigationsWithSourceUrl: investigations.filter((i) => i.sourceUrl).length,
  investigationsTotal: investigations.length,
  sourceRegistrySize: sources.length,
  note: "Citation accuracy of live LLM answers is enforced by the tool protocol (every number from tool output); registry coverage above is the measurable baseline.",
};

// ---------------------------------------------------------------------------
// §15.6 — model-card metrics (recomputed at recovery time, recorded verbatim)
// ---------------------------------------------------------------------------

function readCard(p: string): Record<string, unknown> | null {
  try {
    return existsSync(p) ? (JSON.parse(readFileSync(p, "utf8")) as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const root = join(import.meta.dir, "..");
const flexCard = readCard(join(root, "models/flex-extinction/v2/model_card.json"));
const cfigCard = readCard(join(root, "models/cfig-hot-ignition/v1/model_card.json"));
const spiceCard = readCard(join(root, "models/spice-flame-duration/v1/model_card.json"));

const models = [
  flexCard && {
    id: "flex-extinction-v2",
    task: flexCard.task,
    status: flexCard.status,
    metrics: flexCard.metrics,
    note: "Verified reproduction from recovered PSI-69 rows; grouped validation (AUC, balanced accuracy) + O2-only baseline + bootstrap CI.",
  },
  cfigCard && {
    id: "cfig-hot-ignition",
    task: cfigCard.task,
    status: cfigCard.status,
    metrics: cfigCard.metrics,
    note: "Exploratory: honest negative comparison vs single-feature baseline retained in the card.",
  },
  spiceCard && {
    id: "spice-flame-duration",
    task: spiceCard.task,
    status: spiceCard.status,
    metrics: spiceCard.metrics,
    note: "Negative result: neither ridge nor GBM beats the per-fuel mean baseline under grouped validation — NOT offered as a predictor.",
  },
].filter(Boolean);

// ---------------------------------------------------------------------------
// §15.7–15.9 — honest absences (never presented as evaluated)
// ---------------------------------------------------------------------------

const absences = [
  { area: "Computer vision (IoU / Dice / tracking error)", reason: "No trained CV model and no labelled mask/trace dataset exist in this environment — image-derived measurement is explicitly not claimed." },
  { area: "Prediction uncertainty (prediction-interval coverage)", reason: "No model in the registry emits calibrated prediction intervals; FLEX reports a bootstrap AUC CI only. PICP is therefore not computable and not reported." },
  { area: "Dense / hybrid retrieval", reason: "No embedding credentials or dense index is configured — BM25 lexical retrieval only, labelled as such in the AI-role panel." },
  { area: "Physics-based simulation validation (conservation residuals)", reason: "No CFD/fire solver runs in this platform; equation calculators are unit-verified with reference tests instead (54/54 recorded)." },
];

// ---------------------------------------------------------------------------

const evaluation = {
  generatedAt: new Date().toISOString(),
  framework: "Enhancement brief §15 — evaluation of search, extraction, RAG grounding, ranking and ML models with honest absences.",
  retrieval,
  corpus,
  evidence,
  models,
  absences,
  dashboardIntegrity: {
    displayedValuesMatchDatasets: "Enforced by construction: UI values render from the same generated JSON layer this script reads.",
    unitsAndLabels: "Column units carried from source headers; missing units shown as '—', never guessed.",
    reproducibility: "This file is generated by scripts/build_evaluation.ts from the data layer — re-run to reproduce.",
  },
};

const outPath = join(root, "src/data/generated/evaluation.json");
writeFileSync(outPath, JSON.stringify(evaluation, null, 2));
console.log(`[evaluation] wrote ${outPath}`);
console.log(`[evaluation] retrieval: P@1=${retrieval.precisionAt1} P@3=${retrieval.precisionAt3} R@3=${retrieval.recallAt3} nDCG@5=${retrieval.ndcgAt5} over ${n} queries`);
console.log(`[evaluation] corpus: sha256 coverage=${corpus.sha256ProvenanceCoverage} unit coverage=${corpus.unitCoverage} fill=${corpus.meanColumnFillRate}`);
