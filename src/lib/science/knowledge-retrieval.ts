/**
 * ZERO FLARE — knowledge-base retrieval (§4 hybrid RAG leg 2).
 *
 * Lexical BM25-style retrieval over the ingestion pipeline's text index
 * (knowledge/index.json): page-level extracts of the NASA facility documents,
 * PSI investigation reports and peer-reviewed journal papers ingested with
 * full provenance (source file, batch, page). This complements the corpus
 * BM25 (search_evidence over PSI metadata/findings/gaps/tables).
 *
 * Every result is labelled SOURCE-DOCUMENT EVIDENCE (extracted text) with its
 * citation — never treated as ingested-tabular data, and AI interpretations
 * are not involved.
 */

import indexDoc from "@/../knowledge/index.json";

export interface KnowledgeDoc {
  id: string;
  source: string;
  batchId: string;
  kind: string;
  location: string;
  text: string;
}

export interface KnowledgeHit {
  doc: KnowledgeDoc;
  score: number;
  snippet: string;
}

interface IndexShape {
  version?: number;
  docs?: KnowledgeDoc[];
}

const INDEX = (indexDoc as IndexShape).docs ?? [];

// --- BM25 (k1 = 1.4, b = 0.72) over the indexed document chunks ---

const STOP = new Set(["the", "a", "an", "of", "and", "or", "to", "in", "on", "for", "with", "is", "are", "was", "were", "be", "been", "at", "by", "from", "as", "that", "this", "it", "its", "into", "than", "then"]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 1 && !STOP.has(t))
    .map((t) => (t.endsWith("s") && t.length > 3 ? t.slice(0, -1) : t));
}

interface Posting {
  df: number;
  postings: Map<number, number>; // docIndex -> tf
}
let cache: {
  df: Map<string, Posting>;
  docTokens: Map<number, Map<string, number>>;
  docLen: number[];
  avgLen: number;
} | null = null;

function buildIndex() {
  if (cache) return cache;
  const df = new Map<string, Posting>();
  const docTokens = new Map<number, Map<string, number>>();
  const docLen: number[] = [];
  let totalLen = 0;
  INDEX.forEach((doc, i) => {
    const toks = tokenize(`${doc.source} ${doc.text}`);
    docLen.push(toks.length);
    totalLen += toks.length;
    const tf = new Map<string, number>();
    for (const t of toks) {
      tf.set(t, (tf.get(t) ?? 0) + 1);
    }
    docTokens.set(i, tf);
    for (const t of tf.keys()) {
      const p = df.get(t) ?? { df: 0, postings: new Map<number, number>() };
      p.df += 1;
      p.postings.set(i, tf.get(t) ?? 0);
      df.set(t, p);
    }
  });
  cache = {
    df,
    docTokens,
    docLen,
    avgLen: INDEX.length ? totalLen / INDEX.length : 0,
  };
  return cache;
}

const N_DOCS = INDEX.length;
const K1 = 1.4;
const B = 0.72;

export function searchKnowledgeBase(query: string, limit = 6): KnowledgeHit[] {
  if (!query.trim() || N_DOCS === 0) return [];
  const idx = buildIndex();
  const qTokens = tokenize(query);
  if (qTokens.length === 0) return [];

  const scores = new Map<number, number>();
  for (const t of new Set(qTokens)) {
    const p = idx.df.get(t);
    if (!p) continue;
    const idf = Math.log(1 + (N_DOCS - p.df + 0.5) / (p.df + 0.5));
    for (const [docIdx, tf] of p.postings) {
      const len = idx.docLen[docIdx] || 1;
      const norm = tf * (K1 + 1) / (tf + K1 * (1 - B + B * (len / (idx.avgLen || 1))));
      scores.set(docIdx, (scores.get(docIdx) ?? 0) + idf * norm);
    }
  }

  const ranked = [...scores.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit * 2);

  const hits: KnowledgeHit[] = [];
  for (const [docIdx, score] of ranked) {
    const doc = INDEX[docIdx];
    // build a snippet centred on the first query-term occurrence
    const lower = doc.text.toLowerCase();
    let at = -1;
    for (const t of qTokens) {
      at = lower.indexOf(t);
      if (at >= 0) break;
    }
    const start = Math.max(0, (at < 0 ? 0 : at) - 140);
    const snippet = `${start > 0 ? "…" : ""}${doc.text.slice(start, start + 340).trim()}${start + 340 < doc.text.length ? "…" : ""}`;
    hits.push({ doc, score, snippet });
    if (hits.length >= limit) break;
  }
  return hits;
}

export function getKnowledgeBaseStats(): { docs: number; sources: number } {
  const sources = new Set(INDEX.map((d) => d.source));
  return { docs: INDEX.length, sources: sources.size };
}
