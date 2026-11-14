/**
 * Storage layers for batched ingestion + cumulative registries.
 *
 * Layout (exactly the layers requested by the ingestion contract):
 *   data/raw/batches/<batchId>/…        immutable uploaded bytes
 *   data/extracted/batches/<batchId>/…  per-file extraction JSON + plain text
 *   data/normalized/batches/<batchId>/… harmonized tabular snapshots
 *   data/curated/…                      post-audit curated content
 *   data/derived/…                      derived artifacts (post-audit)
 *   data/media/batches/<batchId>/…      figures, images, video frames
 *   data/ingest/registry.json           global file registry (hash → first seen)
 *   data/ingest/batches.json            batch index
 *   data/ingest/batches/<id>.json       full batch receipts
 *   data/ingest/cumulative.json         cumulative totals + user-confirmation gate
 *   knowledge/entities.json             cumulative entity registry (evidence-backed)
 *   knowledge/index.json                searchable text index for retrieval
 *   reports/…                           global audit reports
 *   models/MODEL_POLICY.md              versioning policy (never silent overwrite)
 *
 * Dual backend, selected by runtime:
 *   • Cloudflare edge → reads resolve first from the D1 kv_json overlay, then
 *     from the immutable corpus mirror published at /corpus/<relPath> (static
 *     assets). Writes are honestly refused: the edge release ships an
 *     immutable, SHA-256-verified corpus; uploading/re-ingesting requires the
 *     local or server deployment (the API surfaces this explicitly).
 *   • Node (dev/standalone) → the original filesystem behaviour, unchanged.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { getBindings, isEdgeRuntime } from "@/lib/server/bindings";
import type { BatchReceipt, CumulativeTotals } from "./types";

export const ROOT = process.cwd();

export const LAYERS = {
  raw: "data/raw/batches",
  extracted: "data/extracted/batches",
  normalized: "data/normalized/batches",
  curated: "data/curated",
  derived: "data/derived",
  media: "data/media/batches",
  ingest: "data/ingest",
   knowledge: "knowledge",
  reports: "reports",
} as const;

/** Raised when the edge runtime refuses a mutating storage operation. */
export class EdgeWriteError extends Error {
  constructor(relPath: string, reason = "edge release ships an immutable corpus") {
    super(`edge storage is read-only for "${relPath}": ${reason} — run ingestion on a local/server deployment`);
    this.name = "EdgeWriteError";
  }
}

/**
 * Resolve a repository-relative path against ROOT with an explicit containment
 * check — the resolved target must stay inside the storage root.
 */
function safeJoin(relPath: string): string {
  const abs = path.resolve(ROOT, relPath);
  if (abs !== ROOT && !abs.startsWith(ROOT + path.sep)) {
    throw new Error("storage path escapes the repository root");
  }
  return abs;
}

/** Receipt ids are app-generated; enforce a strict whitelist charset + length. */
function safeReceiptId(batchId: string): string | null {
  if (!/^[A-Za-z0-9_-]{1,64}$/.test(batchId)) return null;
  return batchId;
}

// ------------------------------------------------------------- edge readers

const corpusCache = new Map<string, string>(); // relPath → raw text (immutable baseline)

/**
 * Read an immutable-corpus text file on any runtime: edge → D1 kv_json overlay,
 * then the /corpus static-asset mirror; node → the repository file. Returns
 * null when the artifact is unavailable (callers apply honest fallbacks).
 */
export async function readCorpusText(relPath: string): Promise<string | null> {
  if (isEdgeRuntime()) return edgeReadText(relPath);
  try {
    return await fs.readFile(safeJoin(relPath), "utf8");
  } catch {
    return null;
  }
}

async function edgeReadText(relPath: string): Promise<string | null> {
  const b = getBindings();
  if (!b) return null;
  if (b.DB) {
    try {
      const row = await b.DB.prepare("SELECT value FROM kv_json WHERE path = ?").bind(relPath).first<{ value: string }>();
      if (row && typeof row.value === "string") return row.value;
    } catch {
      // table may not exist yet (migration pending) — fall through to assets
    }
  }
  if (corpusCache.has(relPath)) return corpusCache.get(relPath) ?? null;
  if (b.ASSETS) {
    try {
      const res = await b.ASSETS.fetch(`https://assets.local/corpus/${relPath}`);
      if (res.ok) {
        const text = await res.text();
        corpusCache.set(relPath, text);
        return text;
      }
    } catch {
      // asset missing — caller's fallback applies
    }
  }
  return null;
}

// ------------------------------------------------------------ generic JSON IO

export async function readJson<T>(relPath: string, fallback: T): Promise<T> {
  if (isEdgeRuntime()) {
    try {
      const text = await edgeReadText(relPath);
      if (text !== null) return JSON.parse(text) as T;
    } catch {
      // fall through to the honest fallback
    }
    return fallback;
  }
  try {
    return JSON.parse(await fs.readFile(safeJoin(relPath), "utf8")) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(relPath: string, data: unknown) {
  if (isEdgeRuntime()) {
    const json = JSON.stringify(data);
    const b = getBindings();
    if (!b?.DB) throw new EdgeWriteError(relPath, "no D1 binding available");
    if (json.length > 512 * 1024) throw new EdgeWriteError(relPath, "payload exceeds the edge persistence limit");
    await b.DB.prepare(
      "INSERT INTO kv_json (path, value, updated_at) VALUES (?, ?, datetime('now')) " +
        "ON CONFLICT(path) DO UPDATE SET value=excluded.value, updated_at=excluded.updated_at",
    )
      .bind(relPath, json)
      .run();
    return;
  }
  const abs = safeJoin(relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  const tmp = `${abs}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), "utf8");
  await fs.rename(tmp, abs); // atomic-ish swap; registry never left half-written
}

export async function writeText(relPath: string, text: string) {
  if (isEdgeRuntime()) throw new EdgeWriteError(relPath);
  const abs = safeJoin(relPath);
  await fs.mkdir(path.dirname(abs), { recursive: true });
  await fs.writeFile(abs, text, "utf8");
}

export async function fileExists(relPath: string) {
  if (isEdgeRuntime()) {
    return (await edgeReadText(relPath)) !== null;
  }
  try {
    await fs.access(safeJoin(relPath));
    return true;
  } catch {
    return false;
  }
}

export async function ensureLayers() {
  if (isEdgeRuntime()) return; // immutable corpus — layers are published, not created
  for (const layer of [
    "data/raw/batches",
    "data/extracted/batches",
    "data/normalized/batches",
    "data/curated",
    "data/derived",
    "data/media/batches",
    "data/ingest/batches",
    "knowledge",
    "models",
    "reports",
  ]) {
    await fs.mkdir(safeJoin(layer), { recursive: true });
  }
}

// ---------------------------------------------------------------------------
// Registry: sha256 → first-seen record. Drives duplicate detection.
// ---------------------------------------------------------------------------

export interface RegistryEntry {
  sha256: string;
  firstSeenBatch: string;
  firstSeenName: string;
  firstSeenAt: string;
  sizeBytes: number;
  kind: string;
}

export interface Registry {
  version: 1;
  entries: Record<string, RegistryEntry>;
}

export async function loadRegistry(): Promise<Registry> {
  return readJson<Registry>("data/ingest/registry.json", { version: 1, entries: {} });
}

export async function saveRegistry(r: Registry) {
  await writeJson("data/ingest/registry.json", r);
}

// ---------------------------------------------------------------------------
// Batch index + receipts.
// ---------------------------------------------------------------------------

export interface BatchIndexEntry {
  batchId: string;
  receivedAt: string;
  fileCount: number;
}

export async function loadBatchIndex(): Promise<BatchIndexEntry[]> {
  return readJson<BatchIndexEntry[]>("data/ingest/batches.json", []);
}

export async function saveBatchIndex(entries: BatchIndexEntry[]) {
  await writeJson("data/ingest/batches.json", entries);
}

export async function loadReceipt(batchId: string): Promise<BatchReceipt | null> {
  const safeId = safeReceiptId(batchId);
  if (!safeId) return null;
  return readJson<BatchReceipt | null>(path.join("data/ingest/batches", `${safeId}.json`), null);
}

export async function saveReceipt(receipt: BatchReceipt) {
  const safeId = safeReceiptId(receipt.batchId);
  if (!safeId) throw new Error("invalid batch id for receipt storage");
  await writeJson(path.join("data/ingest/batches", `${safeId}.json`), receipt);
}

// ---------------------------------------------------------------------------
// Cumulative totals.
// ---------------------------------------------------------------------------

export const EMPTY_CUMULATIVE: CumulativeTotals = {
  batches: 0,
  files: 0,
  uniqueFiles: 0,
  duplicateFiles: 0,
  documents: 0,
  pages: 0,
  chars: 0,
  tables: 0,
  tableRows: 0,
  equations: 0,
  figures: 0,
  mediaAssets: 0,
  entities: 0,
  errors: 0,
  userConfirmedAllUploads: false,
  lastBatchId: null,
  updatedAt: new Date(0).toISOString(),
};

export async function loadCumulative(): Promise<CumulativeTotals> {
  return readJson<CumulativeTotals>("data/ingest/cumulative.json", EMPTY_CUMULATIVE);
}

export async function saveCumulative(c: CumulativeTotals) {
  await writeJson("data/ingest/cumulative.json", c);
}

// ---------------------------------------------------------------------------
// Knowledge registry — entities with evidence-backed mentions.
// ---------------------------------------------------------------------------

export interface KnowledgeEntity {
  id: string;
  label: string;
  type: string;
  firstSeenBatch: string;
  mentions: {
    batchId: string;
    source: string;
    location: string;
    context: string;
  }[];
}

export interface KnowledgeBase {
  version: 1;
  entities: Record<string, KnowledgeEntity>;
}

export async function loadKnowledge(): Promise<KnowledgeBase> {
  return readJson<KnowledgeBase>("knowledge/entities.json", { version: 1, entities: {} });
}

export async function saveKnowledge(k: KnowledgeBase) {
  await writeJson("knowledge/entities.json", k);
}

// ---------------------------------------------------------------------------
// Searchable text index (feeds future BM25; records provenance per doc).
// ---------------------------------------------------------------------------

export interface IndexDoc {
  id: string;
  source: string;
  batchId: string;
  kind: string;
  location: string;
  text: string; // ≤ 4000 chars per doc
}

export interface TextIndex {
  version: 1;
  docs: IndexDoc[];
}

export async function loadTextIndex(): Promise<TextIndex> {
  return readJson<TextIndex>("knowledge/index.json", { version: 1, docs: [] });
}

export async function saveTextIndex(i: TextIndex) {
  await writeJson("knowledge/index.json", i);
}

export function nextBatchId(existing: { batchId: string }[]): string {
  const today = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const prefix = `B-${today}-`;
  const seq = existing.filter((b) => b.batchId.startsWith(prefix)).length + 1;
  return `${prefix}${String(seq).padStart(3, "0")}`;
}
