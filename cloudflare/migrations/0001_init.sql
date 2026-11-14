-- ZERO FLARE — FLAME EVIDENCE LAB · Cloudflare D1 schema (0001 init)
-- Durable research-workspace persistence on the edge. Collections mirror the
-- documented Prisma schema (prisma/schema.prisma) 1:1; the scientific corpora
-- remain immutable build artifacts and are NOT duplicated here.

CREATE TABLE IF NOT EXISTS saved_items (
  id        TEXT PRIMARY KEY,
  kind      TEXT NOT NULL,
  label     TEXT NOT NULL,
  detail    TEXT,
  url       TEXT,
  note      TEXT,
  saved_at  TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS messages (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id  TEXT NOT NULL,
  role        TEXT NOT NULL,
  content     TEXT NOT NULL,
  mode        TEXT,
  tool_trace  TEXT,
  created_at  TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_messages_session ON messages(session_id, id);

CREATE TABLE IF NOT EXISTS scenario_snapshots (
  id            TEXT PRIMARY KEY,
  name          TEXT NOT NULL,
  facility_json TEXT NOT NULL,
  result_json   TEXT,
  created_at    TEXT NOT NULL
);

-- Generic JSON document overlay (edge ingest metadata etc.). Reads fall back
-- to the immutable corpus mirror served from static assets (/corpus/...).
CREATE TABLE IF NOT EXISTS kv_json (
  path       TEXT PRIMARY KEY,
  value      TEXT NOT NULL,
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
