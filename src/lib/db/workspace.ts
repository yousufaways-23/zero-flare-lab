// ZERO FLARE — durable research-workspace persistence (M10 / ADR-014).
//
// Dual-backend persistence, selected automatically by runtime:
//   • Cloudflare Workers (OpenNext) → Cloudflare D1 (SQLite at the edge) —
//     every write is a real durable INSERT, every query parameterized (all
//     user values go through .bind()); tables mirror the Prisma schema.
//   • Node (`next dev` / standalone) → append-only JSONL files under
//     data/workspace/ with atomic-rename writes and an in-process write
//     queue (the original M10 design, preserved in behaviour).
//
// Scientific corpora stay file-based with SHA-256 provenance and are
// deliberately NOT duplicated here. localStorage (zustand persist) remains
// the offline mirror; the server store is the durable copy the brief
// requires — on the edge it is now a real database instead of an ephemeral
// container disk.
import { closeSync, existsSync, mkdirSync, openSync, readdirSync, readFileSync, renameSync, writeSync, fsyncSync } from "node:fs";
import path from "node:path";
import { getBindings, type D1Database } from "@/lib/server/bindings";

// ---------------------------------------------------------------- helpers

function d1(): D1Database | null {
  return getBindings()?.DB ?? null;
}

/** Which backend is active — surfaced by /api/selftest for transparency. */
export function persistenceBackend(): "d1" | "jsonl" {
  return d1() ? "d1" : "jsonl";
}

// ---------------------------------------------------------------- saved items

export interface WorkspaceSavedItem {
  id: string;
  kind: string;
  label: string;
  detail?: string | null;
  url?: string | null;
  note?: string | null;
  savedAt: string;
}

interface SavedItemRow {
  id: string;
  kind: string;
  label: string;
  detail: string | null;
  url: string | null;
  note: string | null;
  saved_at: string;
}

function rowToItem(r: SavedItemRow): WorkspaceSavedItem {
  return {
    id: r.id,
    kind: r.kind,
    label: r.label,
    detail: r.detail,
    url: r.url,
    note: r.note,
    savedAt: r.saved_at,
  };
}

export async function upsertSavedItem(item: WorkspaceSavedItem): Promise<void> {
  const db = d1();
  if (db) {
    await db
      .prepare(
        "INSERT INTO saved_items (id, kind, label, detail, url, note, saved_at) VALUES (?, ?, ?, ?, ?, ?, ?) " +
          "ON CONFLICT(id) DO UPDATE SET kind=excluded.kind, label=excluded.label, detail=excluded.detail, " +
          "url=excluded.url, note=excluded.note, saved_at=excluded.saved_at",
      )
      .bind(item.id, item.kind, item.label, item.detail ?? null, item.url ?? null, item.note ?? null, item.savedAt)
      .run();
    return;
  }
  // --- JSONL fallback (Node) ---
  const file = collectionFile("saved_items");
  const rows = readCollection<WorkspaceSavedItem>(file).filter((r) => r.id !== item.id);
  rows.push(item);
  await rewriteCollection(file, rows);
}

export async function deleteSavedItem(id: string): Promise<boolean> {
  const db = d1();
  if (db) {
    const res = await db.prepare("DELETE FROM saved_items WHERE id = ?").bind(id).run();
    const meta = res.meta as { changes?: number } | undefined;
    return (meta?.changes ?? 0) > 0;
  }
  const file = collectionFile("saved_items");
  const rows = readCollection<WorkspaceSavedItem>(file);
  const before = rows.length;
  const next = rows.filter((r) => r.id !== id);
  await rewriteCollection(file, next);
  return next.length < before;
}

export async function listSavedItems(limit: number): Promise<WorkspaceSavedItem[]> {
  const db = d1();
  if (db) {
    const res = await db
      .prepare("SELECT id, kind, label, detail, url, note, saved_at FROM saved_items ORDER BY saved_at DESC LIMIT ?")
      .bind(limit)
      .all<SavedItemRow>();
    return (res.results ?? []).map(rowToItem);
  }
  return readCollection<WorkspaceSavedItem>(collectionFile("saved_items"))
    .sort((a, b) => (a.savedAt < b.savedAt ? 1 : -1))
    .slice(0, limit);
}

// ------------------------------------------------------------- conversations

export interface WorkspaceMessage {
  sessionId: string;
  role: "user" | "assistant";
  content: string;
  mode?: string | null;
  toolTrace?: string | null;
  createdAt: string;
}

interface MessageRow {
  id: number;
  session_id: string;
  role: string;
  content: string;
  mode: string | null;
  tool_trace: string | null;
  created_at: string;
}

function rowToMessage(r: MessageRow): WorkspaceMessage {
  return {
    sessionId: r.session_id,
    role: r.role === "user" ? "user" : "assistant",
    content: r.content,
    mode: r.mode,
    toolTrace: r.tool_trace,
    createdAt: r.created_at,
  };
}

export async function appendMessage(m: WorkspaceMessage): Promise<void> {
  const db = d1();
  if (db) {
    await db
      .prepare("INSERT INTO messages (session_id, role, content, mode, tool_trace, created_at) VALUES (?, ?, ?, ?, ?, ?)")
      .bind(m.sessionId, m.role, m.content, m.mode ?? null, m.toolTrace ?? null, m.createdAt)
      .run();
    return;
  }
  // --- JSONL fallback (Node) — session ids are app-generated (it-<base36>),
  // but validate defensively before they may touch a filename.
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(m.sessionId)) {
    throw new Error("invalid session id");
  }
  await appendLine(path.join(BASE_DIR, "conversations", `${m.sessionId}.jsonl`), m);
}

export async function listMessages(sessionId: string, limit: number): Promise<WorkspaceMessage[]> {
  const db = d1();
  if (db) {
    const res = await db
      .prepare("SELECT id, session_id, role, content, mode, tool_trace, created_at FROM messages WHERE session_id = ? ORDER BY id DESC LIMIT ?")
      .bind(sessionId, limit)
      .all<MessageRow>();
    return ((res.results ?? []) as MessageRow[]).slice().reverse().map(rowToMessage);
  }
  // --- JSONL fallback (Node) ---
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(sessionId)) {
    throw new Error("invalid session id");
  }
  return readCollection<WorkspaceMessage>(path.join(BASE_DIR, "conversations", `${sessionId}.jsonl`)).slice(-limit);
}

export async function listSessions(limit: number): Promise<{ sessionId: string; lastAt: string; turns: number }[]> {
  const db = d1();
  if (db) {
    const res = await db
      .prepare("SELECT session_id, COUNT(*) AS turns, MAX(created_at) AS last_at FROM messages GROUP BY session_id ORDER BY MAX(created_at) DESC LIMIT ?")
      .bind(limit)
      .all<{ session_id: string; turns: number; last_at: string }>();
    return (res.results ?? []).map((r) => ({
      sessionId: r.session_id,
      lastAt: r.last_at,
      turns: r.turns,
    }));
  }
  // --- JSONL fallback (Node) ---
  const convDir = path.join(BASE_DIR, "conversations");
  if (!existsSync(convDir)) return [];
  const out: { sessionId: string; lastAt: string; turns: number }[] = [];
  for (const f of readdirSync(convDir)) {
    if (!f.endsWith(".jsonl")) continue;
    const msgs = readCollection<WorkspaceMessage>(path.join(convDir, f));
    if (msgs.length === 0) continue;
    out.push({
      sessionId: f.replace(/\.jsonl$/, ""),
      lastAt: msgs[msgs.length - 1].createdAt,
      turns: msgs.length,
    });
  }
  return out.sort((a, b) => (a.lastAt < b.lastAt ? 1 : -1)).slice(0, limit);
}

// --------------------------------------------------------- scenario snapshots

export interface WorkspaceScenarioSnapshot {
  id: string;
  name: string;
  facilityJson: string;
  resultJson?: string | null;
  createdAt: string;
}

interface ScenarioRow {
  id: string;
  name: string;
  facility_json: string;
  result_json: string | null;
  created_at: string;
}

export async function upsertScenarioSnapshot(s: WorkspaceScenarioSnapshot): Promise<void> {
  const db = d1();
  if (db) {
    await db
      .prepare(
        "INSERT INTO scenario_snapshots (id, name, facility_json, result_json, created_at) VALUES (?, ?, ?, ?, ?) " +
          "ON CONFLICT(id) DO UPDATE SET name=excluded.name, facility_json=excluded.facility_json, " +
          "result_json=excluded.result_json, created_at=excluded.created_at",
      )
      .bind(s.id, s.name, s.facilityJson, s.resultJson ?? null, s.createdAt)
      .run();
    return;
  }
  const file = collectionFile("scenario_snapshots");
  const rows = readCollection<WorkspaceScenarioSnapshot>(file).filter((r) => r.id !== s.id);
  rows.push(s);
  await rewriteCollection(file, rows);
}

export async function listScenarioSnapshots(limit: number): Promise<WorkspaceScenarioSnapshot[]> {
  const db = d1();
  if (db) {
    const res = await db
      .prepare("SELECT id, name, facility_json, result_json, created_at FROM scenario_snapshots ORDER BY created_at DESC LIMIT ?")
      .bind(limit)
      .all<ScenarioRow>();
    return (res.results ?? []).map((r) => ({
      id: r.id,
      name: r.name,
      facilityJson: r.facility_json,
      resultJson: r.result_json,
      createdAt: r.created_at,
    }));
  }
  return readCollection<WorkspaceScenarioSnapshot>(collectionFile("scenario_snapshots"))
    .sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1))
    .slice(0, limit);
}

/** Deterministic round-trip used by /api/selftest (persistence gate). */
export async function selfTestRoundTrip(): Promise<{ pass: boolean; detail: string }> {
  const id = `selftest-${Date.now().toString(36)}`;
  try {
    await upsertSavedItem({ id, kind: "dataset", label: `selftest probe (${persistenceBackend()})`, savedAt: new Date().toISOString() });
    const listed = (await listSavedItems(50)).some((x) => x.id === id);
    const deleted = await deleteSavedItem(id);
    const gone = !(await listSavedItems(500)).some((x) => x.id === id);
    return { pass: listed && deleted && gone, detail: `insert/list/delete round-trip via ${persistenceBackend()}: ${listed}/${deleted}/${gone}` };
  } catch (err) {
    return { pass: false, detail: `persistence round-trip failed: ${(err as Error).message}` };
  }
}

// ------------------------------------------------------- JSONL fs backend
// (Node-only fallback; never touched on the edge — no node:fs there.)

const BASE_DIR = path.join(process.cwd(), "data", "workspace");

function collectionFile(name: string): string {
  return path.join(BASE_DIR, `${name}.jsonl`);
}

// Serialize writes within the single server process (no cross-process lock needed).
let writeChain: Promise<void> = Promise.resolve();
function enqueueWrite(fn: () => void): Promise<void> {
  const next = writeChain.then(() => {
    try {
      fn();
    } finally {
      /* errors surface via the promise chain below */
    }
  });
  writeChain = next.catch(() => undefined);
  return next;
}

/** Append one JSON line with fsync (append-only = crash-safe). */
function appendLine(file: string, obj: unknown): Promise<void> {
  return enqueueWrite(() => {
    mkdirSync(path.dirname(file), { recursive: true });
    const line = JSON.stringify(obj) + "\n";
    const fd = openSync(file, "a");
    try {
      writeSync(fd, line);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
  });
}

/** Atomic full-collection rewrite: tmp file + rename (upserts/deletes). */
function rewriteCollection(file: string, rows: unknown[]): Promise<void> {
  return enqueueWrite(() => {
    mkdirSync(path.dirname(file), { recursive: true });
    const tmp = `${file}.tmp`;
    const body = rows.map((r) => JSON.stringify(r)).join("\n") + (rows.length ? "\n" : "");
    const fd = openSync(tmp, "w");
    try {
      writeSync(fd, body);
      fsyncSync(fd);
    } finally {
      closeSync(fd);
    }
    renameSync(tmp, file);
  });
}

function readCollection<T>(file: string): T[] {
  if (!existsSync(file)) return [];
  const text = readFileSync(file, "utf8");
  const rows: T[] = [];
  for (const line of text.split("\n")) {
    if (!line.trim()) continue;
    try {
      rows.push(JSON.parse(line) as T);
    } catch {
      // skip corrupted trailing line (crash tail) — honest best-effort read
    }
  }
  return rows;
}
