// FLAME EVIDENCE LAB — unified data access layer
// All records carry provenance. Missing data stays missing (never zero-filled).

import investigationsDoc from "@/data/generated/investigations.json";
import corpusDoc from "@/data/generated/corpus.json";
import graphDoc from "@/data/generated/graph.json";
import gapsDoc from "@/data/generated/gaps.json";
import findingsDoc from "@/data/generated/findings.json";
import atmospheresDoc from "@/data/generated/atmospheres.json";
import mediaDoc from "@/data/generated/media_index.json";
import sourcesDoc from "@/data/generated/sources.json";
import equipmentDoc from "@/data/generated/equipment.json";

export interface Investigation {
  accession: string;
  title: string;
  shortLabel: string;
  researchArea: string | null;
  subResearchArea: string | null;
  projectType: string | null;
  flightPlatform: string | null;
  doi: string | null;
  objectives: string | null;
  approach: string | null;
  hypothesis: string | null;
  impacts: string | null;
  keywords: string[];
  pi: Record<string, unknown> | null;
  monitoringCenter: string | null;
  startDate: string | null;
  endDate: string | null;
  hardware: Record<string, unknown> | null;
  publications: { titles: string; authors: string } | null;
  related: string[];
  sourceUrl: string | null;
  fetchedAt: string;
  tableIds: string[];
  tableRows: number;
  tableColumns: number;
  duplicateRows: number;
  integrityCases: { case: string; issue: string }[];
}

export interface TableColumn {
  index: number;
  name: string;
  rawHeader: string;
  unit: string | null;
  filled: number;
  fillRate: number;
  parseFailures: number;
  type: "numeric" | "categorical";
  min?: number;
  max?: number;
  mean?: number;
  median?: number;
  std?: number;
  histogram?: { binStart: number[]; binEnd: number[]; counts: number[] };
  topValues?: { value: string; count: number }[];
}

export interface DataTable {
  id: string;
  file: string;
  bytes: number;
  sha256: string;
  investigation: string;
  label: string;
  columns: TableColumn[];
  rowCount: number;
  columnCount: number;
  duplicateRows: number;
  rows: string[][];
  source: string;
}

const invDoc = investigationsDoc as { generatedAt: string; source: string; investigations: Investigation[] };
const corp = corpusDoc as unknown as { totals: CorpusTotals; tables: DataTable[] };

export function getInvestigations(): Investigation[] {
  return invDoc.investigations;
}

export function getInvestigation(accession: string): Investigation | undefined {
  return invDoc.investigations.find((i) => i.accession === accession);
}

export function getTables(): DataTable[] {
  return corp.tables;
}

export function getTable(id: string): DataTable | undefined {
  return corp.tables.find((t) => t.id === id);
}

export function getTablesForInvestigation(accession: string): DataTable[] {
  return corp.tables.filter((t) => t.investigation === accession);
}

export interface CorpusTotals {
  tables: number;
  rows: number;
  columns: number;
  parseFailures: number;
  duplicateRows: number;
  generatedAt: string;
  method: string;
}

export function getCorpusTotals(): CorpusTotals {
  return corp.totals;
}

export interface GraphNode {
  id: string;
  type: string;
  label: string;
  title?: string;
  doi?: string;
  url?: string;
  status?: string;
}

export interface GraphEdge {
  source: string;
  dst: string;
  type: string;
  evidence: string;
  confidence: string;
  reviewStatus: string;
}

export function getGraph(): { nodes: GraphNode[]; edges: GraphEdge[]; typeColors: Record<string, string>; honesty: string; edgeTypes: string[] } {
  return graphDoc as unknown as { nodes: GraphNode[]; edges: GraphEdge[]; typeColors: Record<string, string>; honesty: string; edgeTypes: string[] };
}

export interface Gap {
  id: string;
  topic: string;
  status: "absent" | "not-indexed" | "inaccessible" | "no-evidence-found";
  detail: string;
  related: string[];
  specRef: string;
}

export function getGaps(): Gap[] {
  return (gapsDoc as { gaps: Gap[] }).gaps;
}

export function getGapsForInvestigation(accession: string): Gap[] {
  return getGaps().filter((g) => g.related.some((r) => r === accession || r.startsWith(accession)));
}

export interface Finding {
  id: string;
  rank: number;
  tier: "verified" | "negative-result" | "source-reported";
  statement: string;
  basis: string;
  caveat: string;
  links: string[];
}

export function getFindings(): Finding[] {
  return (findingsDoc as { findings: Finding[] }).findings;
}

export interface AtmosphereEnv {
  id: string;
  label: string;
  gravityG: number;
  totalPressurePsi: number;
  totalPressureKpa: number;
  o2Fraction: number;
  diluents: string;
  pO2Kpa: number;
  kind: string;
  evidenceStatus: string;
}

export function getAtmospheres(): { note: string; environments: AtmosphereEnv[] } {
  return atmospheresDoc as unknown as { note: string; environments: AtmosphereEnv[] };
}

export function getEnvironment(id: string): AtmosphereEnv | undefined {
  return getAtmospheres().environments.find((e) => e.id === id);
}

export interface MediaItem {
  nasa_id: string;
  title: string;
  description: string;
  center: string;
  date_created: string;
  keywords: string[];
  thumb: string;
  full: string;
  api_query: string;
  provenance: string;
}

export function getMedia(): MediaItem[] {
  return (mediaDoc as { items: MediaItem[] }).items;
}

export interface SourceRecord {
  id: string;
  title: string;
  url: string;
  category: string;
  authority: string;
  use: string;
}

export function getSources(): SourceRecord[] {
  return (sourcesDoc as { sources: SourceRecord[] }).sources;
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  usedBy: string[];
  sourceLink: string;
  sourceNote: string;
  description: string;
  model3d: string | null;
  fidelity: string;
  fidelityNote: string;
}

export function getEquipment(): Equipment[] {
  return (equipmentDoc as { equipment: Equipment[] }).equipment;
}

export function getEquipmentForInvestigation(accession: string): Equipment[] {
  return getEquipment().filter((e) => e.usedBy.includes(accession));
}

// ---- BM25 evidence search over investigation metadata + findings + gaps ----
export interface SearchHit {
  kind: "investigation" | "finding" | "gap" | "table" | "equation-mention";
  id: string;
  title: string;
  snippet: string;
  url?: string;
  score: number;
}

interface Doc {
  kind: SearchHit["kind"];
  id: string;
  title: string;
  text: string;
  url?: string;
}

function buildDocs(): Doc[] {
  const docs: Doc[] = [];
  for (const inv of getInvestigations()) {
    docs.push({
      kind: "investigation", id: inv.accession, title: inv.title, url: inv.sourceUrl ?? undefined,
      text: [inv.title, inv.objectives, inv.approach, inv.hypothesis, inv.impacts, inv.keywords.join(" "), inv.shortLabel, inv.researchArea, inv.subResearchArea].filter(Boolean).join(" \n "),
    });
  }
  for (const f of getFindings()) {
    docs.push({ kind: "finding", id: f.id, title: f.statement.slice(0, 120), text: `${f.statement} ${f.basis} ${f.caveat}` });
  }
  for (const g of getGaps()) {
    docs.push({ kind: "gap", id: g.id, title: g.topic, text: `${g.topic} ${g.detail} ${g.specRef}` });
  }
  for (const t of getTables()) {
    docs.push({ kind: "table", id: t.id, title: t.label, text: `${t.label} ${t.investigation} ${t.columns.map((c) => c.name).join(" ")}` });
  }
  return docs;
}

const DOCS = buildDocs();

// tokenized BM25 (k1=1.5, b=0.75)
const tokenCache = new Map<string, string[]>();
function tokenize(text: string): string[] {
  const cached = tokenCache.get(text);
  if (cached) return cached;
  const toks = text.toLowerCase().split(/[^a-z0-9.+-]+/).filter((t) => t.length > 1);
  tokenCache.set(text, toks);
  return toks;
}

const docTokens = DOCS.map((d) => tokenize(`${d.title} ${d.text}`));
const avgDl = docTokens.reduce((a, t) => a + t.length, 0) / docTokens.length;
const df = new Map<string, number>();
for (const toks of docTokens) {
  for (const term of new Set(toks)) df.set(term, (df.get(term) ?? 0) + 1);
}

export function searchEvidence(query: string, limit = 8): SearchHit[] {
  const terms = tokenize(query);
  if (!terms.length) return [];
  const scores: { doc: Doc; score: number }[] = [];
  DOCS.forEach((doc, i) => {
    const toks = docTokens[i];
    const tf = new Map<string, number>();
    for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
    let score = 0;
    for (const term of terms) {
      const f = tf.get(term) ?? 0;
      if (!f) continue;
      const n = df.get(term) ?? 0;
      const idf = Math.log(1 + (DOCS.length - n + 0.5) / (n + 0.5));
      score += idf * ((f * 2.5) / (f + 1.5 * (0.25 + 0.75 * (toks.length / avgDl))));
    }
    if (score > 0) scores.push({ doc, score });
  });
  scores.sort((a, b) => b.score - a.score);
  return scores.slice(0, limit).map(({ doc, score }) => ({
    kind: doc.kind, id: doc.id, title: doc.title, score,
    snippet: doc.text.length > 260 ? doc.text.slice(0, 260) + "…" : doc.text,
    url: doc.url,
  }));
}

export function searchMediaLocal(query: string, limit = 12): MediaItem[] {
  const q = query.toLowerCase().trim();
  const items = getMedia();
  if (!q) return items.slice(0, limit);
  const terms = q.split(/\s+/);
  return items
    .map((m) => {
      const text = `${m.title} ${m.description} ${m.keywords.join(" ")} ${m.api_query}`.toLowerCase();
      let score = 0;
      for (const t of terms) if (text.includes(t)) score += 1;
      return { m, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.m);
}
