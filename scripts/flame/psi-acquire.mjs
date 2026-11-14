// ZERO FLARE — PSI deep acquisition v2 (Tasks 1-2). Node 24, native fetch.
//
// Security policy (enforced):
//  S1 URL allowlist — every request passes assertAllowedUrl(): https + host
//     must be psi.nasa.gov or images-api.nasa.gov; loopback/private/reserved
//     hosts rejected; no credentials sent.
//  S2 Path containment — every destination passes safeDest(): path.resolve +
//     relative() prefix check inside the allowed data roots; traversal raises.
//  S3 Remote-name validation — safeComponent() regex allowlist (no slashes,
//     no leading dot, no "..") before URL/path use.
//  S4 Error-page sniffing — downloads rejecting HTML/JSON error bodies.
// Acquisition policy: low rate, retries w/ backoff, sha256 dedup vs data/raw,
// NO bulk archive downloads — ZIP members listed via HTTP Range
// central-directory inspection; only small CSV/XLSX members retrieved via the
// per-file download endpoint when it supports them.

import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..", "..");
const RAW = path.join(ROOT, "data", "raw");
const ING = path.join(ROOT, "data", "ingest");
const STAGE = path.join(ROOT, "data", "acquisition", "staged");
for (const d of [RAW, ING, STAGE]) await fs.mkdir(d, { recursive: true });

const BASE = "https://psi.nasa.gov/geode-py/ws";
const IMAGES = "https://images-api.nasa.gov/search";
const ALLOWED_HOSTS = new Set(["psi.nasa.gov", "images-api.nasa.gov"]);
const UA = "ZERO-FLARE-Research/1.0 (NASA Space Apps 2026; contact: mission team)";
const SAFE_NAME = /^[A-Za-z0-9][A-Za-z0-9 ()_\-.&,]{0,180}$/;
const ACC_RE = /^PSI-\d+$/;
const NOW = new Date().toISOString();

function assertAllowedUrl(raw) {
  let u;
  try {
    u = new URL(raw);
  } catch {
    throw new Error(`invalid URL: ${raw.slice(0, 80)}`);
  }
  if (u.protocol !== "https:") throw new Error(`non-https blocked: ${raw.slice(0, 80)}`);
  const host = u.hostname.toLowerCase();
  if (!ALLOWED_HOSTS.has(host)) throw new Error(`non-allowlisted host: ${host}`);
  // reject loopback / private / reserved IPv4 forms and embedded credentials
  if (u.username || u.password) throw new Error("credentials in URL rejected");
  if (/^(localhost|127\.|0\.|10\.|192\.168\.|169\.254\.|172\.(1[6-9]|2\d|3[01])\.)/.test(host)) {
    throw new Error(`private/loopback host blocked: ${host}`);
  }
  return u.toString();
}

function safeDest(root, ...parts) {
  const dest = path.resolve(root, ...parts);
  const rel = path.relative(root, dest);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`path escapes allowed root: ${dest}`);
  }
  return dest;
}

function safeComponent(name) {
  if (!name || typeof name !== "string" || !SAFE_NAME.test(name) || name.includes("..")) {
    throw new Error(`unsafe remote file name rejected: ${JSON.stringify(String(name).slice(0, 80))}`);
  }
  return name.replace(/\//g, "_").replace(/ /g, "_");
}

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

async function fetchWithRetry(url, opts = {}, retries = 3) {
  let lastErr = null;
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(url, {
        ...opts,
        headers: { "User-Agent": UA, Accept: "*/*", ...(opts.headers ?? {}) },
        signal: AbortSignal.timeout(opts.timeoutMs ?? 45000),
        redirect: "follow",
      });
      return res;
    } catch (e) {
      lastErr = e;
      await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt));
    }
  }
  throw lastErr ?? new Error("fetch failed");
}

async function fetchJson(url) {
  const res = await fetchWithRetry(url, { headers: { Accept: "application/json" } });
  const text = await res.text();
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchBinary(url, dest, expectSizeGt = 60) {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetchWithRetry(url, { timeoutMs: 120000 });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      if (buf.length <= expectSizeGt) throw new Error(`too small (${buf.length} B)`);
      const head = buf.subarray(0, 200).toString("utf8").trimStart().toLowerCase();
      if (head.startsWith("<!doctype") || head.startsWith("<html") || head.startsWith('{"')) {
        throw new Error("error page sniffed");
      }
      await fs.writeFile(dest, buf);
      return { ok: true, bytes: buf.length, sha256: sha256(buf) };
    } catch (e) {
      await new Promise((r) => setTimeout(r, 1500 * 2 ** attempt));
      if (attempt === 2) return { ok: false, bytes: 0, sha256: null, error: String(e.message ?? e) };
    }
  }
}

// ---------------------------------------------------------------- discovery
const KEYWORDS = [
  "combustion", "flame", "flammability", "ignition", "extinction",
  "suppression", "smoke", "aerosol", "soot", "droplet combustion",
  "solid fuel", "oxygen concentration", "airflow", "ACME", "BASS",
  "SAFFIRE", "SAME", "FLEX", "CFI", "SoFIE", "FM2", "FLARE", "SPICE", "SLICE",
];

const discovered = new Map();
let combustionTotal = null;

for (const frm of [0, 100]) {
  const d = await fetchJson(assertAllowedUrl(`${BASE}/repo/search?term=&size=100&from=${frm}&ffield=Research%20Area&fvalue=Combustion%20Science`));
  if (!d) break;
  const hits = d?.hits?.hits ?? [];
  combustionTotal = d?.hits?.total ?? combustionTotal;
  for (const h of hits) {
    const s = h?._source ?? {};
    const acc = s.Accession;
    if (acc && ACC_RE.test(acc)) {
      if (!discovered.has(acc)) {
        discovered.set(acc, { title: s.Title ?? "", acronym: s.Acronym ?? "", researchArea: s["Research Area"] ?? "", via: ["research-area-filter"] });
      }
    }
  }
  if (hits.length < 100) break;
}

for (const kw of KEYWORDS) {
  const d = await fetchJson(assertAllowedUrl(`${BASE}/repo/search?term=${encodeURIComponent(kw)}&size=50`));
  for (const h of d?.hits?.hits ?? []) {
    const s = h?._source ?? {};
    const acc = s.Accession;
    if (acc && ACC_RE.test(acc)) {
      if (discovered.has(acc)) discovered.get(acc).via.push(`keyword:${kw}`);
      else discovered.set(acc, { title: s.Title ?? "", acronym: s.Acronym ?? "", researchArea: s["Research Area"] ?? "", via: [`keyword:${kw}`] });
    }
  }
  await new Promise((r) => setTimeout(r, 400));
}

console.log(`discovery: combustion total=${combustionTotal}, union discovered=${discovered.size}`);
const KNOWN_24 = new Set(["PSI-10", "PSI-20", "PSI-21", "PSI-22", "PSI-23", "PSI-25", "PSI-26", "PSI-39", "PSI-47", "PSI-60", "PSI-62", "PSI-68", "PSI-69", "PSI-98", "PSI-99", "PSI-100", "PSI-101", "PSI-102", "PSI-106", "PSI-107", "PSI-115", "PSI-117", "PSI-142", "PSI-159"]);
const newAccessions = [...discovered.keys()].filter((a) => !KNOWN_24.has(a)).sort();
console.log("new accessions:", newAccessions);

// ------------------------------------------------- existing raw inventory
const existing = new Map();
for (const f of (await fs.readdir(RAW)).filter((f) => f.endsWith(".csv"))) {
  existing.set(f, sha256(await fs.readFile(path.join(RAW, f))));
}

const manifest = {
  manifestVersion: "1.0",
  generatedAt: NOW,
  source: "NASA Physical Sciences Informatics — live geode-py endpoints",
  policy: "targeted acquisition; per-file downloads; ZIP range inspection; no bulk archive pulls; host allowlist + path containment enforced",
  discovery: { combustionTotal, unionDiscovered: discovered.size, keywords: KEYWORDS },
  investigations: [],
  images: [],
};

// ------------------------------------------------- ZIP range inspection
async function listZipRemote(url) {
  const head = await fetchWithRetry(url, { method: "HEAD", timeoutMs: 30000 });
  const size = Number(head.headers.get("content-length"));
  const accepts = (head.headers.get("accept-ranges") ?? "").includes("bytes");
  if (!size || !accepts) {
    return { members: null, note: `range requests not supported (size=${size}, accepts=${accepts}) — recorded inaccessible; no bulk download per policy` };
  }
  const tailStart = Math.max(0, size - 65536);
  const tailRes = await fetchWithRetry(url, { headers: { Range: `bytes=${tailStart}-${size - 1}` }, timeoutMs: 30000 });
  const tail = Buffer.from(await tailRes.arrayBuffer());
  const eocd = tail.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  if (eocd < 0) return { members: null, note: "EOCD not found in tail (zip64 or unexpected layout) — recorded inaccessible" };
  // EOCD: sig(4) disk(2) cdDisk(2) diskEntries(2) totalEntries(2) cdSize(4) cdOffset(4) commentLen(2)
  const totalEntries = tail.readUInt16LE(eocd + 10);
  const cdSize = tail.readUInt32LE(eocd + 12);
  const cdOffset = tail.readUInt32LE(eocd + 12 + 4);
  if (cdOffset >= size || cdSize > size) {
    return { members: null, note: "zip64 layout — central directory beyond 32-bit fields; recorded inaccessible" };
  }
  const cdRes = await fetchWithRetry(url, { headers: { Range: `bytes=${cdOffset}-${cdOffset + cdSize - 1}` }, timeoutMs: 60000 });
  const cd = Buffer.from(await cdRes.arrayBuffer());
  const members = [];
  let i = 0;
  while (i < cd.length - 46 && members.length < 400 && members.length < totalEntries + 4) {
    if (cd.readUInt32LE(i) !== 0x02014b50) { i++; continue; }
    const csize = cd.readUInt32LE(i + 20);
    const nlen = cd.readUInt16LE(i + 28);
    const elen = cd.readUInt16LE(i + 30);
    const clen = cd.readUInt16LE(i + 32);
    const name = cd.subarray(i + 46, i + 46 + nlen).toString("utf8").replace(/\0/g, "");
    members.push({ name, compressed: csize });
    i += 46 + nlen + elen + clen;
  }
  return { members, note: `${members.length} members listed via Range central-directory (archive ${size} bytes, not downloaded)` };
}

// ------------------------------------------------- per-investigation pass
for (const acc of [...discovered.keys()].sort()) {
  if (!ACC_RE.test(acc)) continue;
  const info = discovered.get(acc);
  const entry = { accession: acc, title: info.title, acronym: info.acronym, via: [...new Set(info.via)], tables: [], newFiles: [], zipInspections: [], images: [], limitations: [] };
  const meta = await fetchJson(assertAllowedUrl(`${BASE}/repo/investigations/${acc}`));
  if (!meta) {
    entry.limitations.push("metadata fetch failed");
    manifest.investigations.push(entry);
    continue;
  }
  entry.title = meta.title ?? info.title;
  entry.doi = meta.doi ?? null;
  entry.acronym = meta.investigationAcronym ?? info.acronym;
  const version = meta.version;
  const ets = meta.experimentalTable ?? [];

  for (const et of ets) {
    const fname = et?.file_name;
    const fver = et?.version ?? version;
    if (!fname) continue;
    let safe, dest;
    try {
      safe = safeComponent(fname);
      dest = safeDest(RAW, `${acc}_${safe}${path.extname(safe) ? "" : ".csv"}`);
    } catch (e) {
      entry.limitations.push(String(e.message ?? e));
      continue;
    }
    const baseName = path.basename(dest);
    const rec = { file_name: fname, version: fver, status: "existing" };
    if (existing.has(baseName)) {
      rec.status = "existing-same-name";
    } else {
      const url = assertAllowedUrl(`${BASE}/studies/${acc}/download?file=${encodeURIComponent(fname)}&version=${fver}`);
      const r = await fetchBinary(url, dest);
      rec.status = r.ok ? "downloaded" : `download-failed: ${r.error ?? ""}`;
      rec.bytes = r.bytes;
      rec.sha256 = r.sha256;
      if (r.ok) {
        existing.set(baseName, r.sha256);
        entry.newFiles.push(baseName);
      }
    }
    entry.tables.push(rec);
    await new Promise((r) => setTimeout(r, 400));
  }

  // ZIP members: range-inspect zips for CSV/XLSX members (no bulk download)
  const added = meta.added ?? [];
  const zipEntries = added.filter((a) => typeof a?.file_name === "string" && a.file_name.endsWith(".zip")).slice(0, 4);
  for (const [zn, zver] of zipEntries.map((a) => [a.file_name, a.version ?? version])) {
    let zname;
    try {
      zname = safeComponent(zn);
    } catch (e) {
      entry.limitations.push(String(e.message ?? e));
      continue;
    }
    const url = assertAllowedUrl(`${BASE}/studies/${acc}/download?file=${encodeURIComponent(zn)}&version=${zver}`);
    const { members, note } = await listZipRemote(url);
    const zrec = { zip: zn, note };
    if (members) {
      const csvs = members.map((m) => m.name).filter((n) => /\.(csv|xlsx)$/i.test(n));
      zrec.csvXlsxCount = csvs.length;
      zrec.csvXlsxMembers = csvs.slice(0, 20);
      let retrieved = 0;
      for (const cn of csvs.slice(0, 6)) {
        let dest;
        try {
          dest = safeDest(STAGE, `${acc}_${safeComponent(cn)}`);
        } catch {
          continue;
        }
        try {
          await fs.access(dest);
          retrieved++;
          continue;
        } catch {
          /* not staged yet */
        }
        const url2 = assertAllowedUrl(`${BASE}/studies/${acc}/download?file=${encodeURIComponent(cn)}&version=${zver}`);
        const r = await fetchBinary(url2, dest, 40);
        if (r.ok) {
          retrieved++;
          entry.newFiles.push(path.basename(dest));
        }
        await new Promise((r2) => setTimeout(r2, 400));
      }
      zrec.membersRetrieved = retrieved;
    } else {
      entry.limitations.push(note);
    }
    entry.zipInspections.push(zrec);
    await new Promise((r) => setTimeout(r, 400));
  }

  for (const img of (meta.images ?? []).slice(0, 4)) {
    if (img?.file_name) entry.images.push({ file_name: img.file_name, version: img.version ?? version });
  }

  manifest.investigations.push(entry);
  console.log(`${acc}: tables=${entry.tables.length} new=${entry.newFiles.length} zips=${entry.zipInspections.length} limits=${entry.limitations.length}`);
}

// ------------------------------------------------- NASA Images API
async function imagesApi(q, n = 6) {
  const d = await fetchJson(assertAllowedUrl(`${IMAGES}?q=${encodeURIComponent(q)}&media_type=image`));
  return (d?.collection?.items ?? []).slice(0, n).map((item) => {
    const data = item?.data?.[0] ?? {};
    const thumb = item?.links?.[0]?.href ?? null;
    return {
      nasa_id: data.nasa_id,
      title: data.title,
      center: data.center,
      date: data.date_created,
      thumb,
      description: (data.description ?? "").slice(0, 220),
    };
  });
}

for (const [key, q] of Object.entries({
  FLEX: "FLEX flame extinguishment droplet",
  BASS: "BASS burning suppression solids microgravity",
  SAFFIRE: "SAFFIRE spacecraft fire experiment",
  SAME: "SAME smoke aerosol measurement microgravity",
  ACME: "ACME combustion integrated rack microgravity",
  SPICE: "SPICE smoke point co-flow combustion",
  MDCA: "MDCA droplet apparatus",
  CIR: "combustion integrated rack ISS",
})) {
  manifest.images.push({ query: key, search: q, hits: await imagesApi(q) });
  await new Promise((r) => setTimeout(r, 500));
}

manifest.existingRawCount = existing.size;
const outPath = safeDest(ING, "acquisition_manifest.json");
await fs.writeFile(outPath, JSON.stringify(manifest, null, 1));
const newTotal = manifest.investigations.reduce((a, e) => a + e.newFiles.length, 0);
const zipCsvTotal = manifest.investigations.reduce((a, e) => a + e.zipInspections.reduce((b, z) => b + (z.csvXlsxCount ?? 0), 0), 0);
const imgTotal = manifest.images.reduce((a, b) => a + b.hits.length, 0);
console.log(`\nMANIFEST written: ${outPath}`);
console.log(`new files downloaded: ${newTotal} | zip csv/xlsx members found: ${zipCsvTotal} | image hits: ${imgTotal}`);
