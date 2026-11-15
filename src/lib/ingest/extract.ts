/**
 * Per-format extraction engine.
 *
 * Every handler returns real counts from real parsing. When a parser is not
 * available for a format in this environment, the handler says so in
 * `unresolved` and the file is still preserved — no fake extraction.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import { execFile, execFileSync, spawn } from "node:child_process";
import { promisify } from "node:util";
import type {
  FileKind,
  MediaExtraction,
  TableExtraction,
  TextExtraction,
} from "./types";

const execFileP = promisify(execFile);

const MAX_PAGE_TEXT = 4000; // chars stored per page preview in the extraction JSON
const MAX_FULL_TEXT = 2_000_000; // chars persisted per document (guard only)
const MAX_ARCHIVE_DEPTH = 3; // nested archive opening cap (zip-in-zip-in-zip)

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

export interface RawInput {
  name: string;
  bytes: Buffer;
  batchId: string;
  fileId: string;
  /** Archive nesting depth (0 = top-level upload). Caps recursive opening. */
  depth?: number;
}

export interface ExtractOutput {
  kind: FileKind;
  text?: TextExtraction;
  tables: TableExtraction[];
  media: MediaExtraction[];
  archiveEntries?: { path: string; sizeBytes: number; sha256: string; registered: boolean }[];
  unresolved: string[];
  errors: string[];
  /** raw text pages for downstream science extraction (not all persisted) */
  pageTextsFull?: string[];
}

function makeTextExtraction(
  full: string,
  pages: { page: number; text: string }[] | null,
  headings: string[],
  fullTextPath: string,
  note?: string,
): TextExtraction {
  return {
    chars: full.length,
    pages: pages?.length,
    pageTexts: pages?.map((p) => ({
      page: p.page,
      chars: p.text.length,
      preview: p.text.slice(0, 220).replace(/\s+/g, " ").trim(),
    })),
    headings,
    fullTextPath,
    truncatedNote: note,
  };
}

function detectHeadings(text: string): string[] {
  const out: string[] = [];
  for (const line of text.split(/\r?\n/)) {
    const m = line.match(/^(#{1,4})\s+(.{3,90})$/); // markdown
    if (m) {
      out.push(m[2].replace(/[*_`]/g, "").trim());
      continue;
    }
    const allCaps = line.match(/^([A-Z][A-Z0-9 ,/&().'-]{4,70})$/); // SHOUTING headings
    if (allCaps && !out.includes(allCaps[1].trim())) out.push(allCaps[1].trim());
    if (out.length >= 40) break;
  }
  return out;
}

// ---------------------------------------------------------------------------
// CSV / TSV
// ---------------------------------------------------------------------------

export function parseDelimited(text: string, delimiter: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') {
          cur += '"';
          i++;
        } else inQuotes = false;
      } else cur += ch;
    } else if (ch === '"') {
      inQuotes = true;
    } else if (ch === delimiter) {
      row.push(cur);
      cur = "";
    } else if (ch === "\n") {
      row.push(cur);
      rows.push(row);
      row = [];
      cur = "";
    } else if (ch !== "\r") {
      cur += ch;
    }
  }
  if (cur.length > 0 || row.length > 0) {
    row.push(cur);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

function csvToTable(rows: string[][], name: string): TableExtraction {
  const [header = [], ...data] = rows;
  const columns = header.map((h, i) => h.trim() || `col_${i + 1}`);
  const sample = data.slice(0, 5).map((r) => {
    const obj: Record<string, string | number | null> = {};
    columns.forEach((c, i) => {
      const v = (r[i] ?? "").trim();
      obj[c] = v === "" ? null : Number.isFinite(Number(v)) && v !== "" ? Number(v) : v;
    });
    return obj;
  });
  return { name, columns, rowCount: data.length, sample, location: "line 1 (header)" };
}

// ---------------------------------------------------------------------------
// Text-based formats
// ---------------------------------------------------------------------------

async function extractPlain(
  input: RawInput,
  text: string,
  headings: string[],
  kind: FileKind = "txt",
): Promise<ExtractOutput> {
  const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-${path.basename(input.name, path.extname(input.name))}.txt`;
  const wsRoot = path.resolve(process.cwd());
  const fullTextAbs = path.resolve(process.cwd(), fullTextPath);
  if (fullTextAbs !== wsRoot && !fullTextAbs.startsWith(wsRoot + path.sep)) {
    throw new Error("extracted text path escapes the workspace root");
  }
  await fs.mkdir(path.dirname(fullTextAbs), { recursive: true });
  await fs.writeFile(fullTextAbs, text.slice(0, MAX_FULL_TEXT), "utf8");
  return {
    kind,
    text: makeTextExtraction(text, null, headings, fullTextPath),
    tables: [],
    media: [],
    unresolved: [],
    errors: [],
    pageTextsFull: [text],
  };
}

// ---------------------------------------------------------------------------
// HTML / XML
// ---------------------------------------------------------------------------

function stripTags(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<\/(p|div|h[1-6]|li|tr|table|section|article)>/gi, "\n")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n\s*\n+/g, "\n\n")
    .trim();
}

function htmlTables(html: string): TableExtraction[] {
  const tables: TableExtraction[] = [];
  const tableRe = /<table[\s\S]*?<\/table>/gi;
  let m: RegExpExecArray | null;
  let idx = 0;
  while ((m = tableRe.exec(html)) && idx < 20) {
    idx++;
    const rowRe = /<tr[\s\S]*?<\/tr>/gi;
    const rows: string[][] = [];
    let r: RegExpExecArray | null;
    while ((r = rowRe.exec(m[0]))) {
      const cells = [...r[0].matchAll(/<t[hd][^>]*>([\s\S]*?)<\/t[hd]>/gi)].map((c) =>
        stripTags(c[1]).trim(),
      );
      if (cells.length) rows.push(cells);
    }
    if (rows.length > 1) tables.push(csvToTable(rows, `html-table-${idx}`));
  }
  return tables;
}

// Data-URI images embedded in HTML documents (e.g. media-library catalogs).
// Decoded to the media layer; provenance is kept via the thumb wrapper title
// and adjacent caption text when present. No pixel content is claimed beyond
// sharp metadata — interpretation stays with the budgeted VLM step.
const MAX_HTML_DATAURI_IMAGES = 1200; // per HTML file

async function extractHtmlDataUriImages(
  input: RawInput,
  html: string,
): Promise<{ media: MediaExtraction[]; unresolved: string[]; errors: string[] }> {
  const media: MediaExtraction[] = [];
  const unresolved: string[] = [];
  const errors: string[] = [];
  const mediaDirRel = `data/media/batches/${input.batchId}`;
  const mediaDirAbs = path.join(process.cwd(), mediaDirRel);
  await fs.mkdir(mediaDirAbs, { recursive: true });
  const imgRe =
    /<img\b[^>]*?\bsrc\s*=\s*["']data:image\/(png|jpe?g|gif|webp);base64,([A-Za-z0-9+/=\s]+?)["'][^>]*>/gi;
  const totalDataUri = (html.match(/src\s*=\s*["']data:image\/[a-z]+;base64,/gi) ?? []).length;
  let sharpFn: ((b: Buffer) => Promise<{ width?: number; height?: number }>) | null = null;
  try {
    // Optional native dependency: absent on the edge release — wrapped import
    // via variable specifier keeps the build honest without a hard dependency.
    const sharpSpecifier = "sharp";
    const sharpMod = (await import(sharpSpecifier)).default as unknown as (
      b: Buffer,
    ) => { metadata: () => Promise<{ width?: number; height?: number }> };
    sharpFn = async (b: Buffer) => sharpMod(b).metadata();
  } catch {
    sharpFn = null;
  }
  let m: RegExpExecArray | null;
  let idx = 0;
  let written = 0;
  let skipped = 0;
  while ((m = imgRe.exec(html)) && written < MAX_HTML_DATAURI_IMAGES) {
    idx++;
    const fmtRaw = m[1].toLowerCase();
    const ext = fmtRaw === "png" ? "png" : fmtRaw === "gif" ? "gif" : fmtRaw === "webp" ? "webp" : "jpg";
    let bytes: Buffer;
    try {
      bytes = Buffer.from(m[2].replace(/\s+/g, ""), "base64");
    } catch {
      skipped++;
      continue;
    }
    if (bytes.length < 64) {
      skipped++; // degenerate placeholder pixel etc.
      continue;
    }
    // Provenance: nearest preceding title="…" on the wrapper (catalog thumb)
    const before = html.slice(Math.max(0, m.index - 600), m.index);
    const titleMatches = [...before.matchAll(/\btitle\s*=\s*["']([^"']{1,180})["']/gi)];
    const origin = titleMatches.length ? titleMatches[titleMatches.length - 1][1].trim() : "";
    // Caption: the div that follows the img inside the same thumb wrapper.
    const after = html.slice(m.index + m[0].length, m.index + m[0].length + 400);
    const capMatch = after.match(/class=["']caption["'][^>]*>([\s\S]{0,200}?)<\/div>/i);
    const caption = capMatch ? stripTags(capMatch[1]).replace(/\s+/g, " ").trim() : "";
    const pageFromCaption = caption.match(/\bp\.?\s*(\d{1,4})\b/i);
    const safeStem = (origin || `htmlimg-${idx}`)
      .replace(/\.[a-z0-9]+$/i, "")
      .replace(/[^A-Za-z0-9_.-]+/g, "_")
      .replace(/^_+|_+$/g, "")
      .slice(0, 120);
    const rel = `${mediaDirRel}/${input.fileId}-htmlembed-${String(written + 1).padStart(4, "0")}-${safeStem}.${ext}`;
    try {
      const wsRoot2 = path.resolve(process.cwd());
      const mediaAbs = path.resolve(process.cwd(), rel);
      if (mediaAbs !== wsRoot2 && !mediaAbs.startsWith(wsRoot2 + path.sep)) {
        throw new Error("media path escapes the workspace root");
      }
      await fs.writeFile(mediaAbs, bytes);
    } catch (e) {
      errors.push(`data-uri image #${idx}: write failed (${(e as Error).message})`);
      continue;
    }
    written++;
    const asset: MediaExtraction = {
      path: rel,
      kind: "document-image",
      sourceFile: input.name,
      format: ext,
    };
    if (origin) asset.originName = origin;
    if (caption) asset.captionNote = caption.slice(0, 180);
    if (pageFromCaption) asset.page = parseInt(pageFromCaption[1], 10);
    if (sharpFn) {
      try {
        const meta = await sharpFn(bytes);
        if (meta.width) asset.width = meta.width;
        if (meta.height) asset.height = meta.height;
      } catch {
        /* no dimension claims without a successful read */
      }
    }
    media.push(asset);
  }
  if (skipped > 0)
    unresolved.push(`${skipped} embedded data-uri image(s) were skipped (unparseable base64 or < 64 bytes).`);
  if (totalDataUri > written + skipped)
    unresolved.push(
      `HTML contained ${totalDataUri} data-uri images; ${written} extracted${skipped ? `, ${skipped} skipped` : ""} — the remainder were not extracted (extraction cap ${MAX_HTML_DATAURI_IMAGES}; the raw HTML is preserved in full).`,
    );
  if (media.length === 0 && totalDataUri > 0)
    unresolved.push(`${totalDataUri} data-uri image reference(s) present but none could be decoded to the media layer.`);
  if (!sharpFn) unresolved.push("sharp unavailable: embedded images registered without pixel dimensions.");
  return { media, unresolved, errors };
}

// ---------------------------------------------------------------------------
// PDF
// ---------------------------------------------------------------------------

/**
 * PDF extraction runs in a CRASH-ISOLATED CHILD PROCESS (scripts/flame/pdf-child.mjs):
 * real NASA archives include slide decks whose pages drive pdfjs into
 * unbounded loops or multi-GB decode spikes, which previously killed the whole
 * ingestion run (silent SIGKILL, twice reproduced). The child writes results
 * incrementally (text → tables → per-page images), so a timeout or memory kill
 * mid-way still hands the parent everything that completed. Nothing is faked:
 * if a stage did not finish, the unresolved register says exactly where it
 * stopped.
 */
const PDF_CHILD_TIMEOUT_MS = 150_000; // hard runtime cap per PDF
const PDF_CHILD_RSS_KILL_KB = 1_200_000; // kill child above 1.2 GB RSS (before the container OOM-killer can act)

// The PDF child runs under BUN when available (resolved once). Empirical
// finding on the real NASA corpus: pdfjs image decoding is substantially more
// robust under bun — under node, image-bearing pages of certain PDFs kill the
// worker silently (pending promise never settles, exit 0, stale progress
// marker; reproduced on SAMER_Final 0602 2014.pdf). All batch receipts in the
// ledger were produced under bun, so preferring bun also keeps recovery and
// UI uploads byte-consistent with the recorded provenance. Falls back to the
// current runtime when bun is not installed.
let pdfChildRuntime: string | null = null;
function resolvePdfChildRuntime(): string {
  if (pdfChildRuntime !== null) return pdfChildRuntime;
  try {
    const v = execFileSync("bun", ["--version"], {
      stdio: ["ignore", "pipe", "ignore"],
      timeout: 5_000,
    })
      .toString()
      .trim();
    pdfChildRuntime = /^\d+\./.test(v) ? "bun" : process.execPath;
  } catch {
    pdfChildRuntime = process.execPath; // bun not installed — run as the parent
  }
  return pdfChildRuntime;
}

function runPdfChild(args: string[]): Promise<{ killed: boolean; code: number | null; signal: string | null; stderr: string }> {
  return new Promise((resolve) => {
    const child = spawn(resolvePdfChildRuntime(), args, { stdio: ["ignore", "pipe", "pipe"] });
    let killed = false;
    let stderr = "";
    child.stderr?.on("data", (d: Buffer) => {
      stderr = (stderr + d.toString("utf8")).slice(-8192);
    });
    const finish = (code: number | null, signal: string | null) => {
      clearTimeout(timer);
      clearInterval(memWatch);
      resolve({ killed, code, signal, stderr });
    };
    const timer = setTimeout(() => {
      killed = true;
      child.kill("SIGKILL");
    }, PDF_CHILD_TIMEOUT_MS);
    // RSS watchdog: pathological pdfjs loops can allocate gigabytes within
    // seconds; killing the child directly keeps the container OOM-killer out
    // of the picture (it would take the whole batch process group with it).
    const memWatch = setInterval(() => {
      if (child.pid == null) return;
      fs.readFile(`/proc/${child.pid}/status`, "utf8")
        .then((status) => {
          const m = /VmRSS:\s+(\d+) kB/.exec(status);
          if (m && Number(m[1]) > PDF_CHILD_RSS_KILL_KB) {
            killed = true;
            child.kill("SIGKILL");
          }
        })
        .catch(() => undefined);
    }, 1000);
    child.on("error", (e: Error) => {
      stderr = `${stderr}\nspawn error: ${e.message}`.slice(-8192);
      finish(null, null);
    });
    child.on("close", finish);
  });
}

async function extractPdf(input: RawInput, tmpAbs: string): Promise<ExtractOutput> {
  const unresolved: string[] = [];
  const errors: string[] = [];
  const batchDirRel = `data/extracted/batches/${input.batchId}`;
  const batchDirAbs = path.join(process.cwd(), batchDirRel);
  const stem = path.basename(input.name, ".pdf");
  const textRel = `${batchDirRel}/${input.fileId}-${stem}.txt`;
  const textAbs = path.join(batchDirAbs, `${input.fileId}-${stem}.txt`);
  const metaAbs = path.join(batchDirAbs, `${input.fileId}-meta.json`);
  const manifestAbs = path.join(batchDirAbs, `${input.fileId}-media-manifest.jsonl`);
  const progressAbs = path.join(batchDirAbs, `${input.fileId}-progress.txt`);
  const doneAbs = path.join(batchDirAbs, `${input.fileId}-DONE`);
  const mediaDirRel = `data/media/batches/${input.batchId}`;
  const mediaDirAbs = path.join(process.cwd(), mediaDirRel);
  const childScript = path.join(process.cwd(), "scripts", "flame", "pdf-child.mjs");
  await fs.mkdir(batchDirAbs, { recursive: true });
  await fs.mkdir(mediaDirAbs, { recursive: true });
  for (const stale of [metaAbs, manifestAbs, progressAbs, doneAbs]) await fs.rm(stale, { force: true });

  let killNote: string | undefined;
  let childResult = await runPdfChild([
    childScript,
    tmpAbs,
    textAbs,
    metaAbs,
    manifestAbs,
    mediaDirAbs,
    progressAbs,
    doneAbs,
    input.fileId,
  ]);

  // Crash-recovery retry: a pathological page can kill the pdfjs image worker
  // WITHOUT a JS exception — the pending promise never settles, the event loop
  // empties and the child exits 0 leaving a stale progress marker (reproduced
  // on real NASA PDFs). The child writes images incrementally and supports a
  // skipThrough argument, so re-running it while skipping past the page named
  // in the marker recovers every remaining page. Bounded at 3 retries.
  const silentlyIncomplete = async () => {
    if (childResult.killed || childResult.signal || childResult.code !== 0) return false;
    try {
      await fs.access(doneAbs);
      return false; // completed all stages
    } catch {
      return true; // clean exit but stages missing
    }
  };
  for (let attempt = 0; attempt < 3 && (await silentlyIncomplete()); attempt++) {
    let stage = "";
    try {
      stage = (await fs.readFile(progressAbs, "utf8")).trim();
    } catch {
      /* no progress marker */
    }
    const m = /^images:(\d+)\//.exec(stage);
    if (!m) break; // silent exit happened outside the per-page image stage
    childResult = await runPdfChild([
      childScript,
      tmpAbs,
      textAbs,
      metaAbs,
      manifestAbs,
      mediaDirAbs,
      progressAbs,
      doneAbs,
      input.fileId,
      String(Number(m[1])),
    ]);
  }
  if (childResult.killed || childResult.signal === "SIGKILL" || childResult.signal === "SIGTERM") {
    let stage = "startup";
    try {
      stage = (await fs.readFile(progressAbs, "utf8")).trim() || "startup";
    } catch {
      /* child died before the first progress marker */
    }
    killNote = `PDF extraction child was terminated at stage "${stage}" (150 s runtime cap or 1.2 GB memory guard). Everything registered for this file below completed before termination; the remaining stages/pages of this PDF were NOT processed.`;
  } else if (childResult.code === 3) {
    let stage = "unknown";
    try {
      stage = (await fs.readFile(progressAbs, "utf8")).trim() || "unknown";
    } catch {
      /* no progress marker */
    }
    killNote = `PDF extraction child self-terminated on its 120 s stage guard at "${stage}" (pathological page content). Everything registered for this file below completed before the guard fired; the remaining stages/pages were NOT processed.`;
  } else if (childResult.code !== 0) {
    errors.push(`pdf child failed (exit ${childResult.code}): ${childResult.stderr.slice(-300)}`);
  }

  // ---- harvest whatever the child produced (incremental outputs) ----
  let full = "";
  let pageTexts: string[] = [];
  let totalPages = 0;
  let meta: { totalPages?: number; pageTexts?: string[]; tables?: { page: number; rows: string[][] }[] } | null = null;
  try {
    full = await fs.readFile(textAbs, "utf8");
  } catch {
    /* child died before the text stage */
  }
  try {
    meta = JSON.parse(await fs.readFile(metaAbs, "utf8")) as { totalPages?: number; pageTexts?: string[]; tables?: { page: number; rows: string[][] }[] };
    pageTexts = meta.pageTexts ?? [];
    totalPages = meta.totalPages ?? 0;
  } catch {
    /* child died before the tables stage */
  }

  const tables: TableExtraction[] = [];
  for (const t of meta?.tables ?? []) {
    const tt = csvToTable(t.rows, `pdf-table-p${t.page}-${tables.length + 1}`);
    tt.location = `page ${t.page} (ruled-table parser)`;
    tables.push(tt);
  }
  // Whitespace-alignment fallback when the ruled-table parser found nothing.
  if (tables.length === 0 && full.trim().length >= 50) {
    const lines = full.split(/\r?\n/).map((l) => l.trim());
    let run: string[][] = [];
    const flush = () => {
      if (run.length >= 3) {
        const t = csvToTable(run, `pdf-heuristic-table-${tables.length + 1}`);
        t.location = "text layer (whitespace heuristic)";
        tables.push(t);
      }
      run = [];
    };
    for (const line of lines) {
      const cells = line.split(/\s{2,}|\t/).map((c) => c.trim()).filter((c) => c !== "");
      if (cells.length >= 2 && line.length >= 12) run.push(cells);
      else flush();
      if (tables.length >= 10) break;
    }
    flush();
    if (tables.length) {
      unresolved.push(
        "No ruled tables detected; tables come from a whitespace-alignment heuristic over the text layer — verify columns against the source before use.",
      );
    }
  }

  // Media: real extracted figure bytes written by the child, one page at a time.
  const media: MediaExtraction[] = [];
  try {
    const manifestText = await fs.readFile(manifestAbs, "utf8");
    for (const line of manifestText.split("\n")) {
      if (!line.trim()) continue;
      const m = JSON.parse(line) as { file: string; page: number; width: number; height: number };
      media.push({
        path: `${mediaDirRel}/${m.file}`,
        kind: "extracted-figure",
        sourceFile: input.name,
        width: m.width,
        height: m.height,
        format: "png",
        page: m.page,
      });
    }
  } catch {
    /* child died before/inside the image stage */
  }

  // Figure-caption evidence from the text layer (kept even when images are
  // extracted, because captions carry provenance text).
  const figureCaptions = [...full.matchAll(/(?:Figure|Fig\.?|FIGURE)\s+(\d+[A-Za-z]?)[.:\-—]\s+([^\n]{5,140})/g)].slice(0, 60);
  for (const fc of figureCaptions) {
    media.push({
      path: `caption:Figure ${fc[1]} — ${fc[2].slice(0, 100).trim()}`,
      kind: "extracted-figure",
      sourceFile: input.name,
      format: "caption-only",
    });
  }

  if (killNote) unresolved.push(killNote);
  // Child can also exit cleanly while a pathological page silently dropped
  // pending work (observed on real NASA slide decks): DONE is then missing.
  let childDone = false;
  try {
    await fs.access(doneAbs);
    childDone = true;
  } catch {
    /* child did not reach the final stage */
  }
  if (!childDone && !killNote && errors.length === 0) {
    let stage = "unknown";
    try {
      stage = (await fs.readFile(progressAbs, "utf8")).trim() || "unknown";
    } catch {
      /* no progress marker */
    }
    unresolved.push(
      `PDF extraction child exited before completing all stages (last progress marker: "${stage}"). The registration below reflects only what completed — image extraction is partial and later pages of this PDF were not processed for images.`,
    );
  }
  if (full.trim().length < 50 && totalPages > 0) {
    unresolved.push(
      "PDF text layer is empty or near-empty — this is likely a scanned document. OCR is not available in this environment, so page text was NOT extracted and no claims are made about it.",
    );
  }

  const producedSomething = full.length > 0 || pageTexts.length > 0 || tables.length > 0 || media.length > 0;
  if (!producedSomething && errors.length === 0) {
    errors.push("pdf child produced no extractable content (see progress marker in the extraction layer)");
  }

  return {
    kind: "pdf",
    text: producedSomething
      ? makeTextExtraction(
          full,
          pageTexts.map((t, i) => ({ page: i + 1, text: t })),
          detectHeadings(full),
          textRel,
          full.trim().length < 50 ? "empty text layer" : undefined,
        )
      : undefined,
    tables,
    media,
    unresolved,
    errors,
    pageTextsFull: pageTexts,
  };
}

// ---------------------------------------------------------------------------
// DOCX (mammoth: text + HTML tables + embedded images)
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Legacy binary Office fallback (LibreOffice conversion, parsing aid only)
// ---------------------------------------------------------------------------

/**
 * Convert a legacy binary Office file (.doc/.ppt) to its OOXML counterpart
 * with headless LibreOffice. The ORIGINAL bytes stay untouched in the raw
 * layer; the conversion is a temporary parsing aid and its use is disclosed
 * in the file's unresolved register. Returns null when soffice is unavailable
 * or the conversion fails — the caller then reports an honest failure.
 */
async function sofficeConvertTo(input: RawInput, targetExt: "docx" | "pptx"): Promise<Buffer | null> {
  const tmpDir = path.join(process.cwd(), "data/extracted/batches", input.batchId, ".soffice-tmp");
  await fs.mkdir(tmpDir, { recursive: true });
  const rand = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
  const srcExt = path.extname(input.name) || `.${targetExt}`;
  const srcAbs = path.join(tmpDir, `${input.fileId}-${rand}${srcExt}`);
  const convertedAbs = path.join(tmpDir, `${input.fileId}-${rand}.${targetExt}`);
  await fs.writeFile(srcAbs, input.bytes);
  try {
    await execFileP(
      "soffice",
      [
        "--headless", "--nologo", "--norestore", "--nolockcheck",
        `-env:UserInstallation=file://${tmpDir}/profile-${rand}`,
        "--convert-to", targetExt,
        "--outdir", tmpDir,
        srcAbs,
      ],
      { timeout: 300_000, maxBuffer: 10 * 1024 * 1024 },
    );
    return await fs.readFile(convertedAbs);
  } catch {
    return null;
  } finally {
    await fs.rm(srcAbs, { force: true }).catch(() => {});
    await fs.rm(convertedAbs, { force: true }).catch(() => {});
    await fs.rm(path.join(tmpDir, `profile-${rand}`), { recursive: true, force: true }).catch(() => {});
  }
}

async function extractDocx(input: RawInput, _legacyConverted = false): Promise<ExtractOutput> {
  try {
    const mammoth = await import("mammoth");
    const media: MediaExtraction[] = [];
    const mediaDirRel = `data/media/batches/${input.batchId}`;
    await fs.mkdir(path.join(process.cwd(), mediaDirRel), { recursive: true });
    let imgIdx = 0;
    const result = await mammoth.convertToHtml(
      { buffer: input.bytes },
      {
        convertImage: mammoth.images.imgElement(async (image: { contentType: string; read: (fmt: string) => Promise<Buffer> }) => {
          const ext = (image.contentType.split("/")[1] || "bin").replace("jpeg", "jpg");
          imgIdx++;
          const rel = `${mediaDirRel}/${input.fileId}-img${String(imgIdx).padStart(2, "0")}.${ext}`;
          const buf: Buffer = await image.read("base64");
          await fs.writeFile(path.join(process.cwd(), rel), buf);
          media.push({
            path: rel,
            kind: "document-image",
            sourceFile: input.name,
            format: ext,
          });
          return { src: rel };
        }),
      },
    );
    const html = result.value;
    const text = stripTags(html);
    const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-${input.name.replace(/\.[^.]+$/, "")}.txt`;
    await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), fullTextPath), text.slice(0, MAX_FULL_TEXT), "utf8");
    const tables = htmlTables(html).map((t, i) => ({ ...t, name: `docx-table-${i + 1}` }));
    return {
      kind: "docx",
      text: makeTextExtraction(text, null, detectHeadings(text), fullTextPath),
      tables,
      media,
      unresolved: [],
      errors: [],
      pageTextsFull: [text],
    };
  } catch (e) {
    // Legacy binary .doc: mammoth only reads OOXML. Convert with LibreOffice
    // and retry once; the original binary stays in the raw layer.
    if (!_legacyConverted && /\.doc$/i.test(input.name)) {
      const conv = await sofficeConvertTo(input, "docx");
      if (conv) {
        const out = await extractDocx({ ...input, bytes: conv }, true);
        if (!out.errors.length) {
          out.unresolved.unshift(
            "Legacy binary .doc: converted to OOXML with headless LibreOffice for text extraction. The original binary is preserved unmodified in the raw layer; the conversion is a parsing aid only and no content claims are made beyond what the converted text contains.",
          );
          return out;
        }
      }
    }
    return {
      kind: "docx",
      tables: [],
      media: [],
      unresolved: [],
      errors: [`mammoth failed: ${(e as Error).message}`],
    };
  }
}

// ---------------------------------------------------------------------------
// PPTX (OOXML: slides + notes + media via adm-zip)
// ---------------------------------------------------------------------------

async function extractPptx(input: RawInput, _legacyConverted = false): Promise<ExtractOutput> {
  try {
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(input.bytes);
    const slideEntries = zip
      .getEntries()
      .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
      .sort((a, b) => {
        const na = Number(a.entryName.match(/slide(\d+)\.xml/)![1]);
        const nb = Number(b.entryName.match(/slide(\d+)\.xml/)![1]);
        return na - nb;
      });
    const notesEntries = zip
      .getEntries()
      .filter((e) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(e.entryName));
    const mediaEntries = zip.getEntries().filter((e) => /^ppt\/media\//.test(e.entryName));

    const xmlText = (xml: string) =>
      xml
        .replace(/<a:t>([\s\S]*?)<\/a:t>/g, "$1\n")
        .replace(/<[^>]+>/g, "")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\n{2,}/g, "\n")
        .trim();

    const slides = slideEntries.map((e, i) => ({ page: i + 1, text: xmlText(e.getData().toString("utf8")) }));
    const notes = notesEntries.map((e) => xmlText(e.getData().toString("utf8")));
    const full = slides.map((s) => `[Slide ${s.page}]\n${s.text}`).join("\n\n") +
      (notes.length ? `\n\n[Speaker notes]\n${notes.join("\n")}` : "");

    const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-${input.name.replace(/\.[^.]+$/, "")}.txt`;
    await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), fullTextPath), full.slice(0, MAX_FULL_TEXT), "utf8");

    const mediaDirRel = `data/media/batches/${input.batchId}`;
    await fs.mkdir(path.join(process.cwd(), mediaDirRel), { recursive: true });
    const media: MediaExtraction[] = [];
    let mIdx = 0;
    for (const me of mediaEntries.slice(0, 40)) {
      const ext = path.extname(me.entryName).replace(".", "") || "bin";
      if (!["png", "jpg", "jpeg", "gif", "bmp", "webp", "tif", "tiff", "svg"].includes(ext)) continue;
      mIdx++;
      const rel = `${mediaDirRel}/${input.fileId}-slide-media${String(mIdx).padStart(2, "0")}.${ext}`;
      await fs.writeFile(path.join(process.cwd(), rel), me.getData());
      media.push({ path: rel, kind: "extracted-figure", sourceFile: input.name, format: ext });
    }

    // Slide "tables": slides whose text contains ≥3 lines with ≥2 column splits
    const tables: TableExtraction[] = [];
    for (const s of slides) {
      const rows = s.text
        .split("\n")
        .map((l) => l.split(/\s{2,}|\t/).map((c) => c.trim()).filter(Boolean))
        .filter((cells) => cells.length >= 2);
      if (rows.length >= 3) tables.push(csvToTable(rows, `slide-${s.page}-text-table`));
      if (tables.length >= 10) break;
    }

    return {
      kind: "pptx",
      text: makeTextExtraction(full, slides, detectHeadings(full), fullTextPath),
      tables,
      media,
      unresolved: slides.length
        ? []
        : ["PPTX contained no slide XML entries — file may be corrupted or a different OOXML flavor."],
      errors: [],
      pageTextsFull: slides.map((s) => s.text),
    };
  } catch (e) {
    // Legacy binary .ppt: ADM-ZIP only reads OOXML containers. Convert with
    // LibreOffice and retry once; the original binary stays in the raw layer.
    if (!_legacyConverted && /\.ppt$/i.test(input.name)) {
      const conv = await sofficeConvertTo(input, "pptx");
      if (conv) {
        const out = await extractPptx({ ...input, bytes: conv }, true);
        if (!out.errors.length) {
          out.unresolved.unshift(
            "Legacy binary .ppt: converted to OOXML with headless LibreOffice for slide/notes extraction. The original binary is preserved unmodified in the raw layer; the conversion is a parsing aid only and no content claims are made beyond what the converted file contains.",
          );
          return out;
        }
      }
    }
    return {
      kind: "pptx",
      tables: [],
      media: [],
      unresolved: [],
      errors: [`pptx unzip failed: ${(e as Error).message}`],
    };
  }
}

// ---------------------------------------------------------------------------
// XLSX (SheetJS)
// ---------------------------------------------------------------------------

async function extractXlsx(input: RawInput): Promise<ExtractOutput> {
  try {
    const XLSX = await import("xlsx");
    // Memory guard: very large sheets (e.g. SAFFIRE MergeResult workbooks with
    // ~200k rows) are materialized only up to this row count; the TRUE row
    // count is derived from the sheet !ref range so totals stay honest, and
    // every truncation is recorded in `unresolved` (never silent).
    const MAX_MATERIALIZE_ROWS = 5000;
    const wb = XLSX.read(input.bytes, { type: "buffer" });
    const tables: TableExtraction[] = [];
    const truncations: string[] = [];
    for (const sheetName of wb.SheetNames.slice(0, 20)) {
      const ws = wb.Sheets[sheetName];
      const ref = String(ws["!ref"] ?? "");
      const m = ref.match(/^([A-Z]+\d+):([A-Z]+)(\d+)$/);
      let trueDataRows: number | null = null;
      let rangeOpt: { range?: string } = {};
      if (m) {
        trueDataRows = Math.max(0, parseInt(m[3], 10) - 1); // minus header row
        if (trueDataRows > MAX_MATERIALIZE_ROWS) {
          rangeOpt = { range: `${m[1]}:${m[2]}${MAX_MATERIALIZE_ROWS + 1}` };
        }
      }
      const arr = (XLSX.utils.sheet_to_json as (ws: unknown, opts?: Record<string, unknown>) => unknown[])(ws, {
        header: 1,
        blankrows: false,
        defval: null,
        ...rangeOpt,
      });
      if (arr.length < 2) continue;
      const rows = (arr as unknown[][]).map((r) => (r as unknown[]).map((c) => (c == null ? "" : String(c))));
      const t = csvToTable(rows, sheetName);
      if (trueDataRows != null && trueDataRows > MAX_MATERIALIZE_ROWS) {
        t.rowCount = trueDataRows;
        t.location = `sheet "${sheetName}" (rowCount from range ${ref}; first ${MAX_MATERIALIZE_ROWS} rows materialized)`;
        truncations.push(
          `Sheet "${sheetName}" declares ~${trueDataRows} data rows in ${ref}; only the first ${MAX_MATERIALIZE_ROWS} were materialized for column mapping and samples. The full sheet is preserved unmodified in the raw file.`,
        );
      } else {
        t.location = `sheet "${sheetName}"`;
      }
      tables.push(t);
    }
    const text = tables
      .map((t) => `# Sheet: ${t.name} (${t.rowCount} rows)\nColumns: ${t.columns.join(", ")}`)
      .join("\n\n");
    const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-${path.basename(input.name, path.extname(input.name))}.txt`;
    await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), fullTextPath), text, "utf8");
    return {
      kind: "xlsx",
      text: makeTextExtraction(text, null, tables.map((t) => `Sheet: ${t.name}`), fullTextPath),
      tables,
      media: [],
      unresolved: [
        ...(wb.SheetNames.length > 20 ? [`Workbook has ${wb.SheetNames.length} sheets; only the first 20 were extracted.`] : []),
        ...truncations,
      ],
      errors: [],
      pageTextsFull: [text],
    };
  } catch (e) {
    return {
      kind: "xlsx",
      tables: [],
      media: [],
      unresolved: [],
      errors: [`SheetJS failed: ${(e as Error).message}`],
    };
  }
}

// ---------------------------------------------------------------------------
// JSON / IPYNB
// ---------------------------------------------------------------------------

async function extractJson(input: RawInput): Promise<ExtractOutput> {
  try {
    const parsed = JSON.parse(input.bytes.toString("utf8"));
    const tables: TableExtraction[] = [];
    let text = "";
    if (Array.isArray(parsed) && parsed.length > 0 && typeof parsed[0] === "object" && parsed[0] !== null) {
      const columns = [...new Set(parsed.flatMap((o: object) => Object.keys(o)))].slice(0, 80);
      const rows = [columns, ...parsed.slice(0, 20000).map((o: Record<string, unknown>) => columns.map((c) => (o[c] == null ? "" : String(o[c]))))];
      const t = csvToTable(rows, "json-array");
      t.rowCount = parsed.length;
      t.sample = parsed.slice(0, 5).map((o: Record<string, unknown>) => {
        const obj: Record<string, string | number | null> = {};
        for (const c of columns.slice(0, 40)) {
          const v = o[c];
          obj[c] = typeof v === "number" ? v : v == null ? null : String(v).slice(0, 120);
        }
        return obj;
      });
      tables.push(t);
      text = `JSON array of ${parsed.length} objects. Columns: ${columns.join(", ")}`;
    } else {
      text = JSON.stringify(parsed, null, 1).slice(0, 100_000);
    }
    const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-${path.basename(input.name, ".json")}.txt`;
    await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), fullTextPath), text, "utf8");
    return {
      kind: "json",
      text: makeTextExtraction(text, null, [], fullTextPath),
      tables,
      media: [],
      unresolved: [],
      errors: [],
      pageTextsFull: [text],
    };
  } catch (e) {
    return {
      kind: "json",
      tables: [],
      media: [],
      unresolved: [],
      errors: [`JSON parse failed: ${(e as Error).message}`],
    };
  }
}

async function extractNotebook(input: RawInput): Promise<ExtractOutput> {
  try {
    const nb = JSON.parse(input.bytes.toString("utf8"));
    const cells = Array.isArray(nb.cells) ? nb.cells : [];
    const mdText: string[] = [];
    const codeText: string[] = [];
    let outChars = 0;
    for (const c of cells) {
      const src = Array.isArray(c.source) ? c.source.join("") : String(c.source ?? "");
      if (c.cell_type === "markdown") mdText.push(src);
      else if (c.cell_type === "code") codeText.push(src);
      if (Array.isArray(c.outputs)) {
        for (const o of c.outputs) {
          if (o.text) outChars += (Array.isArray(o.text) ? o.text.join("") : String(o.text)).length;
        }
      }
    }
    const full = [
      `# Jupyter notebook — ${cells.length} cells (${mdText.length} markdown, ${codeText.length} code)`,
      ...mdText,
      "\n[code cells]\n" + codeText.join("\n\n---\n"),
    ].join("\n\n");
    const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-${path.basename(input.name, ".ipynb")}.txt`;
    await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), fullTextPath), full.slice(0, MAX_FULL_TEXT), "utf8");
    return {
      kind: "notebook",
      text: makeTextExtraction(full, null, detectHeadings(mdText.join("\n")), fullTextPath),
      tables: [],
      media: [],
      unresolved: [`Notebook outputs total ${outChars} chars — outputs were counted, not re-executed. No computation claims are made from notebook cells.`],
      errors: [],
      pageTextsFull: mdText,
    };
  } catch (e) {
    return {
      kind: "notebook",
      tables: [],
      media: [],
      unresolved: [],
      errors: [`Notebook parse failed: ${(e as Error).message}`],
    };
  }
}

// ---------------------------------------------------------------------------
// Images (sharp metadata + honest registration)
// ---------------------------------------------------------------------------

async function extractImage(input: RawInput): Promise<ExtractOutput> {
  const mediaDirRel = `data/media/batches/${input.batchId}`;
  await fs.mkdir(path.join(process.cwd(), mediaDirRel), { recursive: true });
  const ext = path.extname(input.name).replace(".", "").toLowerCase() || "img";
  const rel = `${mediaDirRel}/${input.fileId}-image.${ext}`;
  await fs.writeFile(path.join(process.cwd(), rel), input.bytes);
  try {
    const sharpSpecifier2 = "sharp";
    const sharp = (await import(sharpSpecifier2)).default;
    const meta = await sharp(input.bytes).metadata();
    const text = `Image file ${input.name}: ${meta.format ?? ext}, ${meta.width}×${meta.height} px${meta.hasAlpha ? ", alpha channel" : ""}. Bytes preserved in raw layer; pixels were NOT analyzed by this registration step.`;
    const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-image.txt`;
    await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), fullTextPath), text, "utf8");
    return {
      kind: "image",
      text: makeTextExtraction(text, null, [], fullTextPath),
      tables: [],
      media: [{ path: rel, kind: "uploaded-image", sourceFile: input.name, width: meta.width, height: meta.height, format: meta.format ?? ext }],
      unresolved: [],
      errors: [],
    };
  } catch (e) {
    return {
      kind: "image",
      tables: [],
      media: [{ path: rel, kind: "uploaded-image", sourceFile: input.name, format: ext }],
      unresolved: [`sharp could not read metadata (${(e as Error).message}); bytes preserved, no pixel claims made.`],
      errors: [],
    };
  }
}

// ---------------------------------------------------------------------------
// Video (ffprobe metadata + up to 3 frames)
// ---------------------------------------------------------------------------

async function extractVideo(input: RawInput, tmpAbs: string): Promise<ExtractOutput> {
  const unresolved: string[] = [];
  try {
    const { stdout } = await execFileP("ffprobe", [
      "-v", "error",
      "-print_format", "json",
      "-show_format",
      "-show_streams",
      tmpAbs,
    ], { timeout: 30_000 });
    const probe = JSON.parse(stdout);
    const fmt = probe.format ?? {};
    const vStream = (probe.streams ?? []).find((s: { codec_type?: string }) => s.codec_type === "video");
    const metaText = [
      `Video file ${input.name}.`,
      `Container: ${fmt.format_name ?? "unknown"}; duration: ${fmt.duration ? Number(fmt.duration).toFixed(2) + " s" : "unknown"}.`,
      vStream ? `Video stream: ${vStream.codec_name}, ${vStream.width}×${vStream.height}, ${vStream.nb_frames ?? "?"} frames.` : "No video stream found.",
      `Metadata extracted with ffprobe. Frames below (if any) were sampled by ffmpeg; no temporal analysis was performed on the content.`,
    ].join("\n");
    const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-video.txt`;
    await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
    await fs.writeFile(path.join(process.cwd(), fullTextPath), metaText, "utf8");

    const media: MediaExtraction[] = [];
    const framesDirRel = `data/media/batches/${input.batchId}`;
    await fs.mkdir(path.join(process.cwd(), framesDirRel), { recursive: true });
    try {
      const dur = Number(fmt.duration ?? 0);
      const positions = dur > 0 ? [dur * 0.1, dur * 0.5, dur * 0.9] : [];
      let i = 0;
      for (const pos of positions.slice(0, 3)) {
        i++;
        const rel = `${framesDirRel}/${input.fileId}-frame${i}.jpg`;
        await execFileP("ffmpeg", [
          "-y", "-ss", String(pos.toFixed(2)), "-i", tmpAbs,
          "-frames:v", "1", "-q:v", "4",
          path.join(process.cwd(), rel),
        ], { timeout: 30_000 });
        media.push({ path: rel, kind: "video-frame", sourceFile: input.name, format: "jpg" });
      }
    } catch {
      unresolved.push("Frame extraction with ffmpeg failed for this file; metadata above remains valid.");
    }
    return {
      kind: "video",
      text: makeTextExtraction(metaText, null, [], fullTextPath),
      tables: [],
      media,
      unresolved,
      errors: [],
    };
  } catch (e) {
    return {
      kind: "video",
      tables: [],
      media: [],
      unresolved: [`ffprobe failed (${(e as Error).message}). Only the filename was inspected — no content claims are made.`],
      errors: [],
    };
  }
}

// ---------------------------------------------------------------------------
// Archive (zip): inventory + hash every entry; extract supported children.
// Children are returned as nested RawInputs for the pipeline to recurse.
// ---------------------------------------------------------------------------

export async function inspectArchive(
  input: RawInput,
): Promise<{
  entries: { path: string; sizeBytes: number; sha256: string; registered: boolean }[];
  children: RawInput[];
  unresolved: string[];
  errors: string[];
}> {
  try {
    const AdmZip = (await import("adm-zip")).default;
    const zip = new AdmZip(input.bytes);
    const crypto = await import("node:crypto");
    const depth = input.depth ?? 0;
    const canOpenNested = depth < MAX_ARCHIVE_DEPTH;
    const entries: { path: string; sizeBytes: number; sha256: string; registered: boolean }[] = [];
    const children: RawInput[] = [];
    let nestedZipCount = 0;
    for (const e of zip.getEntries()) {
      if (e.isDirectory) continue;
      const data = e.getData();
      const sha = crypto.createHash("sha256").update(data).digest("hex");
      const isZip = /\.zip$/i.test(e.entryName);
      if (isZip) nestedZipCount++;
      // Nested archives are only opened below the depth cap; legacy binary
      // office formats (doc/ppt/xls) are passed through so their parse result
      // (usually an honest `failed`) is reported instead of silently skipped.
      const supported = isZip
        ? canOpenNested
        : /\.(csv|tsv|xlsx|xlsm|xls|json|pdf|docx?|pptx?|txt|tex|bib|sty|cls|md|html?|xml|ipynb|png|jpe?g|jpe|gif|webp|bmp|tiff?|svg|mp4|mov|avi|mkv|webm|mjs|cjs|js|jsx|ts|tsx|css|scss|sh|py|yml|yaml|toml|prisma)$/i.test(e.entryName);
      // NOTE: .env and other credential-bearing files are deliberately NOT in
      // the extract list — they are inventoried and hashed only, so no secret
      // material is ever copied into the text-extraction layer.
      entries.push({ path: e.entryName, sizeBytes: data.length, sha256: sha, registered: supported });
      if (supported && children.length < 40) {
        children.push({
          name: e.entryName.split("/").pop() || e.entryName,
          bytes: data,
          batchId: input.batchId,
          fileId: `${input.fileId}-n${children.length + 1}`,
          depth: depth + 1,
        });
      }
    }
    return {
      entries,
      children,
      unresolved: [
        ...(children.length >= 40 ? ["Archive had more than 40 supported entries; the remainder were inventoried and hashed but not extracted in this batch pass."] : []),
        ...(nestedZipCount
          ? [
              canOpenNested
                ? `${nestedZipCount} nested archive(s) inside this archive were recursively opened and their supported entries extracted (depth cap ${MAX_ARCHIVE_DEPTH}).`
                : `${nestedZipCount} nested archive(s) sit at the depth cap (${MAX_ARCHIVE_DEPTH}); they were inventoried and hashed but not opened.`,
            ]
          : []),
      ],
      errors: [],
    };
  } catch (e) {
    return {
      entries: [],
      children: [],
      unresolved: [],
      errors: [`archive open failed: ${(e as Error).message}`],
    };
  }
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------

export async function extractByKind(
  input: RawInput,
  kind: FileKind,
  tmpAbs: string,
): Promise<ExtractOutput> {
  const utf8 = input.bytes.toString("utf8");
  switch (kind) {
    case "csv":
    case "tsv": {
      const rows = parseDelimited(utf8, kind === "csv" ? "," : "\t");
      const t = csvToTable(rows, path.basename(input.name, path.extname(input.name)));
      t.location = "line 1 (header)";
      const text = `Tabular file ${input.name}: ${t.rowCount} data rows × ${t.columns.length} columns.\nColumns: ${t.columns.join(", ")}`;
      const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-${path.basename(input.name, path.extname(input.name))}.txt`;
      await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
      await fs.writeFile(path.join(process.cwd(), fullTextPath), text, "utf8");
      return {
        kind,
        text: makeTextExtraction(text, null, [path.basename(input.name)], fullTextPath),
        tables: [t],
        media: [],
        unresolved: [],
        errors: [],
        pageTextsFull: [utf8.slice(0, 200_000)],
      };
    }
    case "xlsx":
      return extractXlsx(input);
    case "json":
      return extractJson(input);
    case "pdf":
      return extractPdf(input, tmpAbs);
    case "docx":
      return extractDocx(input);
    case "pptx":
      return extractPptx(input);
    case "markdown":
      return extractPlain(input, utf8, detectHeadings(utf8), "markdown");
    case "html": {
      const text = stripTags(utf8);
      const titleMatch = utf8.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
      const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-${path.basename(input.name, path.extname(input.name))}.txt`;
      await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
      await fs.writeFile(path.join(process.cwd(), fullTextPath), text.slice(0, MAX_FULL_TEXT), "utf8");
      const embedded = await extractHtmlDataUriImages(input, utf8);
      return {
        kind: "html",
        text: makeTextExtraction(text, null, titleMatch ? [stripTags(titleMatch[1])] : [], fullTextPath),
        tables: htmlTables(utf8),
        media: embedded.media,
        unresolved: embedded.unresolved,
        errors: embedded.errors,
        pageTextsFull: [text],
      };
    }
    case "xml": {
      const text = stripTags(utf8);
      const fullTextPath = `data/extracted/batches/${input.batchId}/${input.fileId}-${path.basename(input.name, path.extname(input.name))}.txt`;
      await fs.mkdir(path.dirname(path.join(process.cwd(), fullTextPath)), { recursive: true });
      await fs.writeFile(path.join(process.cwd(), fullTextPath), text.slice(0, MAX_FULL_TEXT), "utf8");
      return {
        kind: "xml",
        text: makeTextExtraction(text, null, [], fullTextPath),
        tables: [],
        media: [],
        unresolved: ["XML was flattened to text; element structure was not mapped to entities in this pass."],
        errors: [],
        pageTextsFull: [text],
      };
    }
    case "notebook":
      return extractNotebook(input);
    case "image":
      return extractImage(input);
    case "video":
      return extractVideo(input, tmpAbs);
    case "txt":
      return extractPlain(input, utf8, detectHeadings(utf8), "txt");
    default:
      return {
        kind,
        tables: [],
        media: [],
        unresolved: [
          "No parser for this format in the current stack. The file is preserved byte-for-byte in the raw layer and inventoried; no content claims are made.",
        ],
        errors: [],
      };
  }
}
