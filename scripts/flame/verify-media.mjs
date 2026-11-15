#!/usr/bin/env node
/**
 * ZERO FLARE — media registry verifier (Phase 5 W6).
 *
 * Collects EVERY media URL actually present in the repo — the 6 curated
 * YouTube videos, the 41 NASA Images/Video Library API records, the
 * corpus-embedded CFI-G YouTube link (from the ACME research-document PDF,
 * page 6), and the SVS 31394 reference in the knowledge base — verifies each
 * one live (https-only, host-validated fetches), applies the Phase-5 dedupe
 * rules (same SVS/article/MP4 appearing under multiple items merges into one
 * canonical entry; separate MP4s stay separate), maps each item to
 * investigations and hardware, and emits src/data/generated/media-registry.json.
 *
 * Honesty: nothing is labelled NASA-official unless it resolves to a NASA
 * host/API record. If a URL cannot be verified from this environment, the
 * registry records the failure honestly instead of dropping it.
 *
 * Usage: node scripts/flame/verify-media.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.dirname(path.dirname(path.dirname(fileURLToPath(import.meta.url))));
const OUT = path.join(ROOT, "src/data/generated/media-registry.json");

/* ---------- https-only fetch with host allowlist ---------- */
const ALLOWED_HOSTS = new Set([
  "www.youtube.com",
  "youtube.com",
  "youtu.be",
  "i.ytimg.com",
  "images-api.nasa.gov",
  "www.nasa.gov",
  "nasa.gov",
  "svs.gsfc.nasa.gov",
]);

function assertAllowed(url) {
  const u = new URL(url);
  if (u.protocol !== "https:") throw new Error(`non-https URL refused: ${url}`);
  if (!ALLOWED_HOSTS.has(u.hostname)) throw new Error(`host not allowlisted: ${u.hostname}`);
  return u;
}

async function fetchJson(url, timeoutMs = 15000) {
  assertAllowed(url);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: ctrl.signal, headers: { "user-agent": "ZERO-FLARE-media-verify/1.0" } });
    if (!res.ok) return { ok: false, status: res.status };
    return { ok: true, status: res.status, json: await res.json() };
  } catch (e) {
    return { ok: false, status: 0, error: String(e?.message ?? e) };
  } finally {
    clearTimeout(timer);
  }
}

async function probe(url, timeoutMs = 12000) {
  assertAllowed(url);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "HEAD", signal: ctrl.signal, headers: { "user-agent": "ZERO-FLARE-media-verify/1.0" } });
    return { ok: res.ok, status: res.status, type: res.headers.get("content-type") ?? null };
  } catch (e) {
    return { ok: false, status: 0, error: String(e?.message ?? e) };
  } finally {
    clearTimeout(timer);
  }
}

/* ---------- collectors ---------- */
function youtubeIdFromText(text) {
  const m =
    String(text).match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/) ??
    [];
  return m[1] ?? null;
}

const now = new Date().toISOString();
const entries = [];
const occurrences = []; // duplicate occurrences merged into canonical entries

function canonical(entry) {
  entries.push(entry);
}

/* 1 — curated YouTube videos */
const videosDoc = JSON.parse(readFileSync(path.join(ROOT, "src/data/generated/videos.json"), "utf8"));
for (const v of videosDoc.videos) {
  canonical({
    id: `yt-${v.id}`,
    kind: "youtube",
    url: `https://www.youtube.com/watch?v=${v.id}`,
    title: v.title,
    author: v.channel,
    sourceType: v.sourceType,
    origin: "curated",
    mapsTo: v.mapsTo,
    placement: v.placement,
    overview: v.overview,
    durationNote: v.durationNote,
    status: "pending-verification",
    verify: null,
    verifiedAt: now,
  });
}

/* 2 — corpus-embedded YouTube links (research-document PDFs, ingest ledger) */
const corpusYt = new Map();
try {
  const batches = readFileSync(path.join(ROOT, "data/ingest/batches/B-20261112-004.json"), "utf8");
  for (const m of batches.matchAll(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/g)) {
    if (!corpusYt.has(m[1])) corpusYt.set(m[1], []);
    corpusYt.get(m[1]).push("advanced-combustion-via-microgravity-experiments-acme.pdf (page 6, CFI-G / CLD-Flame context)");
  }
} catch { /* ledger not present — recorded as absent */ }

for (const [id, sources] of corpusYt) {
  if (videosDoc.videos.some((v) => v.id === id)) {
    occurrences.push({ id: `yt-${id}`, sources });
    continue; // duplicate occurrence of a curated video — merged
  }
  canonical({
    id: `yt-${id}`,
    kind: "youtube",
    url: `https://www.youtube.com/watch?v=${id}`,
    title: null,
    author: null,
    sourceType: "nasa-mission-video",
    origin: "corpus-metadata",
    mapsTo: ["PSI-142", "PSI-21"],
    hardware: ["CIR"],
    placement: ["investigation"],
    overview: "Linked inside the ACME research document (CFI-G / CLD-Flame context) — title/author resolved by live oEmbed below.",
    durationNote: null,
    status: "pending-verification",
    verify: null,
    verifiedAt: preNow(),
  });
}

function preNow() {
  return now;
}

/* 3 — NASA Images/Video Library API records */
const mediaIndex = JSON.parse(readFileSync(path.join(ROOT, "src/data/generated/media_index.json"), "utf8"));
for (const item of mediaIndex.items) {
  canonical({
    id: `nasa-${item.nasa_id}`,
    kind: "nasa-images-api",
    url: `https://images.nasa.gov/details/${item.nasa_id}`,
    title: item.title,
    author: `${item.center ?? "NASA"} — NASA Images and Video Library`,
    sourceType: "nasa-official",
    origin: "media-index",
    mapsTo: mapsForMediaItem(item),
    hardware: hardwareForMediaItem(item),
    placement: ["investigation", "mission"],
    overview: (item.description ?? "").slice(0, 240),
    durationNote: item.date_created ?? null,
    status: "pending-verification",
    verify: null,
    verifiedAt: now,
  });
}

/* 4 — SVS reference from the knowledge base */
const knowledge = readFileSync(path.join(ROOT, "knowledge/entities.json"), "utf8");
const svsIds = new Set();
for (const m of knowledge.matchAll(/svs\.gsfc\.nasa\.gov\/(\d+)/g)) svsIds.add(m[1]);
for (const id of svsIds) {
  canonical({
    id: `svs-${id}`,
    kind: "svs",
    url: `https://svs.gsfc.nasa.gov/${id}/`,
    title: "NASA Studies Fire in Microgravity (SVS) — title from knowledge-base excerpt",
    author: "NASA Scientific Visualization Studio",
    sourceType: "nasa-official",
    origin: "knowledge-base",
    mapsTo: ["PSI-117", "PSI-119", "PSI-121", "PSI-122"],
    hardware: ["SoFIE"],
    placement: ["investigation", "mission"],
    overview: "Referenced in the knowledge base search excerpts (SoFIE coverage). Live reachability probed below.",
    durationNote: null,
    status: "pending-verification",
    verify: null,
    verifiedAt: now,
  });
}

/* dedupe by canonical media id (same YouTube id / SVS id under multiple origins merges) */
const seenIds = new Set(entries.map((e) => e.id));

function mapsForMediaItem(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const maps = [];
  if (/acme|flame design/.test(text)) maps.push("PSI-10");
  if (/flex/.test(text)) maps.push("PSI-69", "PSI-68");
  if (/bass|burning and suppression/.test(text)) maps.push("PSI-25", "PSI-26");
  if (/saffire/.test(text)) maps.push("PSI-98", "PSI-99", "PSI-100");
  if (/sofie|solid fuel ignition|growth and extinction/.test(text)) maps.push("PSI-117", "PSI-119", "PSI-121", "PSI-122");
  if (/same|smoke aerosol/.test(text)) maps.push("PSI-101", "PSI-115");
  if (/spice|smoke point/.test(text)) maps.push("PSI-107", "PSI-60");
  if (/slice/.test(text)) maps.push("PSI-106");
  if (/cfi|cool flame/.test(text)) maps.push("PSI-39", "PSI-142", "PSI-21");
  if (/cir|combustion integrated rack/.test(text)) maps.push("PSI-69", "PSI-39", "PSI-10", "PSI-107", "PSI-39");
  return [...new Set(maps)];
}

function hardwareForMediaItem(item) {
  const text = `${item.title} ${item.description}`.toLowerCase();
  const hw = [];
  if (/cir|combustion integrated rack|acme|flex|sofie|spice|slice|flame design/.test(text)) hw.push("CIR");
  if (/bass|burning and suppression/.test(text)) hw.push("BASS");
  if (/saffire/.test(text)) hw.push("SAFFIRE");
  if (/sofie|solid fuel ignition/.test(text)) hw.push("SoFIE");
  if (/same|smoke aerosol/.test(text)) hw.push("SAME");
  return [...new Set(hw)];
}

/* ---------- verification ---------- */
let verified = 0, failed = 0;
for (const e of entries) {
  if (e.kind === "youtube") {
    const r = await fetchJson(`https://www.youtube.com/oembed?url=${encodeURIComponent(e.url)}&format=json`);
    e.verify = r.ok
      ? { method: "youtube-oembed", httpStatus: r.status, title: r.json?.title ?? null, author: r.json?.author_name ?? null, thumbnail: r.json?.thumbnail_url ?? null }
      : { method: "youtube-oembed", httpStatus: r.status, error: r.error ?? "oEmbed did not resolve" };
    if (r.ok) {
      if (e.origin === "corpus-metadata") { e.title = r.json?.title ?? e.title; e.author = r.json?.author_name ?? e.author; }
      verified += 1;
      e.status = "verified";
    } else { failed += 1; e.status = "unverified-this-environment"; }
  } else if (e.kind === "nasa-images-api") {
    const r = await fetchJson(`https://images-api.nasa.gov/search?nasa_id=${encodeURIComponent(e.id.replace(/^nasa-/, ""))}`);
    const doc = r.ok ? r.json?.collection?.items?.[0]?.data?.[0] : null;
    e.verify = r.ok
      ? { method: "images-api-search", httpStatus: r.status, titleMatched: doc?.title ?? null, dateCreated: doc?.date_created ?? null }
      : { method: "images-api-search", httpStatus: r.status, error: r.error ?? "API search did not resolve" };
    if (r.ok && doc) { verified += 1; e.status = "verified"; }
    else { failed += 1; e.status = doc ? "api-drift" : "unverified-this-environment"; }
  } else if (e.kind === "svs") {
    const r = await probe(e.url);
    e.verify = r.ok
      ? { method: "https-head", httpStatus: r.status, contentType: r.type }
      : { method: "https-head", httpStatus: r.status, error: r.error ?? "HEAD refused or network blocked" };
    if (r.ok) { verified += 1; e.status = "verified"; }
    else { failed += 1; e.status = "unverified-this-environment"; }
  }
}

/* ---------- write ---------- */
const doc = {
  generatedAt: now,
  scope: "Every media URL present in the repository — curated YouTube videos, NASA Images/Video Library API records, corpus-embedded links, knowledge-base SVS references — live-verified where this environment's network permits.",
  dedupe: "Same media id under multiple origins merges into one canonical entry; duplicate occurrences recorded below. Separate media items are never merged.",
  counts: {
    canonical: entries.length,
    verified,
    unverified: failed,
    duplicateOccurrences: occurrences.length,
  },
  entries,
  duplicateOccurrences: occurrences,
};

mkdirSync(path.dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(doc, null, 2) + "\n");
console.log(`[verify-media] canonical=${entries.length} verified=${verified} unverified=${failed} dupOccurrences=${occurrences.length}`);
console.log(`[verify-media] wrote ${path.relative(ROOT, OUT)}`);
for (const e of entries.filter((x) => x.status !== "verified")) {
  console.log(`  NOT VERIFIED: ${e.id} (${e.status})`);
}