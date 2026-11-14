/**
 * Ingestion pipeline orchestrator.
 *
 * Guarantees:
 *  - Raw bytes are written to data/raw/batches/<batchId>/ BEFORE any parsing,
 *    so a parse failure never loses the uploaded file.
 *  - SHA-256 dedup against the global registry; duplicates are recorded, not
 *    discarded (the new copy is kept in the batch's raw folder).
 *  - Receipts, registry, cumulative totals and the knowledge base are persisted
 *    to real project files after every batch.
 *  - Model impact during ingestion is NONE by design. Training eligibility is
 *    assessed only in the global audit, which requires explicit user
 *    confirmation that all batches have been uploaded.
 */
import { promises as fs } from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import type {
  BatchReceipt,
  CumulativeTotals,
  FileKind,
  FileStatus,
  ProcessedFile,
  ScientificDomain,
} from "./types";
import {
  ensureLayers,
  loadRegistry,
  saveRegistry,
  loadBatchIndex,
  saveBatchIndex,
  loadCumulative,
  saveCumulative,
  loadKnowledge,
  saveKnowledge,
  loadTextIndex,
  saveTextIndex,
  loadReceipt,
  saveReceipt,
  nextBatchId,
  writeJson,
  writeText,
  type Registry,
  type BatchIndexEntry,
  type KnowledgeEntity,
} from "./storage";
import { kindFromMagic, guessDomain } from "./identify";
import { extractByKind, inspectArchive, type RawInput } from "./extract";
import { findEntities, extractEquations, extractPublicationMeta } from "./science";
import type { RegistryEntry } from "./storage";

const MODEL_IMPACT_STATEMENT =
  "No model was trained, retrained or modified by this batch. Ingestion only registers and extracts content. Dataset harmonization, ML eligibility assessment and any new model version require the global audit, which runs only after the user confirms all source files have been uploaded.";

const MAX_FILES_PER_BATCH = 10;
const MAX_FILE_BYTES = 300 * 1024 * 1024; // 300 MB per file

export interface UploadedFile {
  name: string;
  bytes: Buffer;
}

function sha256(buf: Buffer): string {
  return crypto.createHash("sha256").update(buf).digest("hex");
}

/**
 * Best-effort heap release between files. Parsing a large PDF leaves hundreds
 * of MB of transient buffers on the JS heap; JavaScriptCore (bun) does not
 * always return them to the OS promptly, which once exhausted the container
 * mid-batch (silent SIGKILL). Forcing a full GC per file keeps RSS bounded.
 */
function releaseHeap(): void {
  try {
    const bun = (globalThis as unknown as { Bun?: { gc?: (force?: boolean) => void } }).Bun;
    if (bun?.gc) {
      bun.gc(true);
      return;
    }
    (globalThis as unknown as { gc?: () => void }).gc?.();
  } catch {
    /* best effort only */
  }
}

async function vlmDescribe(absPath: string, mime: string): Promise<{ ok: boolean; text?: string; error?: string }> {
  try {
    const ZAI = (await import("z-ai-web-dev-sdk")).default;
    const zai = await ZAI.create();
    const b64 = (await fs.readFile(absPath)).toString("base64");
    // createVision is the multimodal endpoint; the plain chat endpoint
    // rejects image content. The platform SDK routes the model server-side;
    // the vision default declared by the SDK contract is used here.
    const completion = await zai.chat.completions.createVision({
      model: "glm-4.5v",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "You are assisting a fire-science research catalogue. Describe this image in 2-3 factual sentences: visible objects, apparatus, materials, flame or smoke if present, and image type (photograph/diagram/plot). If the image is a plot, name the axes you can read. Do not speculate beyond what is visible.",
            },
            { type: "image_url", image_url: { url: `data:${mime};base64,${b64}` } },
          ],
        },
      ],
      thinking: { type: "disabled" },
    });
    const text = completion?.choices?.[0]?.message?.content;
    return text ? { ok: true, text: text.slice(0, 700) } : { ok: false, error: "empty response" };
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }
}

/**
 * Process one file (top-level upload or archive child) end-to-end.
 *
 * Checkpoint/resume: the orchestrator passes a mutable `state` object that
 * accumulates every completed ProcessedFile record, the archive→children
 * order, the registry additions and the vision budget. The state is persisted
 * to data/ingest/batches/<batchId>.state.json after every depth ≤ 1 file, so
 * an interrupted run (process kill, container recycle) can be resumed by
 * re-invoking runBatch with the same uploads: completed files are reused from
 * the checkpoint instead of being re-parsed.
 */
interface BatchStateFile {
  version: 1;
  batchId: string;
  receivedAt: string; // frozen at the first pass of this batch
  uploads: { name: string; sha256: string; sizeBytes: number }[];
  uploadsDone: number[]; // indices of fully completed top-level uploads
  records: Record<string, ProcessedFile>; // completed records keyed by fileId
  childOrder: Record<string, string[]>; // archive fileId → ordered child fileIds
  registryAdds: Record<string, RegistryEntry>; // shas first registered by THIS batch
  visionUsed: number;
  updatedAt: string;
}

async function saveState(state: BatchStateFile): Promise<void> {
  state.updatedAt = new Date().toISOString();
  const rel = `data/ingest/batches/${state.batchId}.state.json`;
  const abs = path.join(process.cwd(), rel);
  const tmp = `${abs}.tmp`;
  await fs.mkdir(path.dirname(abs), { recursive: true });
  // Compact JSON (no indent): this is an internal checkpoint that is rewritten
  // after every file; receipts keep the human-readable pretty format.
  await fs.writeFile(tmp, JSON.stringify(state), "utf8");
  await fs.rename(tmp, abs); // atomic swap; a kill mid-save leaves the old state
}

async function findResumableState(
  uploadSigs: { name: string; sha256: string; sizeBytes: number }[],
): Promise<BatchStateFile | null> {
  try {
    const dir = path.join(process.cwd(), "data/ingest/batches");
    const names = await fs.readdir(dir);
    for (const n of names) {
      if (!n.endsWith(".state.json")) continue;
      try {
        const s = JSON.parse(await fs.readFile(path.join(dir, n), "utf8")) as BatchStateFile;
        if (
          Array.isArray(s.uploads) &&
          s.uploads.length === uploadSigs.length &&
          s.uploads.every((u, i) => u.name === uploadSigs[i].name && u.sha256 === uploadSigs[i].sha256)
        ) {
          return s;
        }
      } catch {
        /* corrupt state file — ignore, treat as absent */
      }
    }
  } catch {
    /* no batches directory yet */
  }
  return null;
}

async function processFile(
  input: RawInput,
  registry: Registry,
  batchId: string,
  visionBudget: { used: number },
  state: BatchStateFile,
): Promise<ProcessedFile> {
  const started = Date.now();
  const sha = sha256(input.bytes);
  const kind: FileKind = kindFromMagic(input.bytes.subarray(0, 8), input.name);

  // Raw preservation FIRST.
  const rawRel = `data/raw/batches/${batchId}/${input.fileId}-${input.name.replace(/[/\\]/g, "_")}`;
  await fs.mkdir(path.dirname(path.join(process.cwd(), rawRel)), { recursive: true });
  await fs.writeFile(path.join(process.cwd(), rawRel), input.bytes);

  const errors: string[] = [];
  const unresolved: string[] = [];

  // Duplicate detection against the global registry. Any prior sighting of the
  // same SHA-256 (earlier batch, the pre-U1 bundled corpus, or an earlier file
  // in this same batch) marks this copy as a duplicate; it is preserved in the
  // raw layer but not re-registered or re-extracted.
  const prior = registry.entries[sha];
  const isDuplicate = !!prior;

  let status: FileStatus;
  let tables: ProcessedFile["tables"] = [];
  let text: ProcessedFile["text"];
  let media: ProcessedFile["media"] = [];
  let entities: ProcessedFile["entities"] = [];
  let equations: ProcessedFile["equations"];
  let publication: ProcessedFile["publication"];
  let archiveEntries: ProcessedFile["archiveEntries"];
  let children: RawInput[] = [];
  let domain: ScientificDomain = "other";
  let extractedPath: string | undefined;
  let pageTextsFull: string[] = [];

  if (isDuplicate) {
    status = "duplicate";
  } else if (input.bytes.length > MAX_FILE_BYTES) {
    status = "unsupported";
    unresolved.push(`File exceeds the ${MAX_FILE_BYTES / 1024 / 1024} MB per-file limit; preserved without parsing.`);
  } else if (kind === "archive") {
    status = "registered";
    const inv = await inspectArchive(input);
    archiveEntries = inv.entries;
    children = inv.children;
    errors.push(...inv.errors);
    unresolved.push(...inv.unresolved);
    unresolved.push(
      `Archive inventoried: ${inv.entries.length} entries hashed${inv.children.length ? `; ${inv.children.length} supported entries extracted as child files below/alongside` : "; no supported entries to extract"}.`,
    );
  } else {
    const tmpAbs = path.join(process.cwd(), rawRel);
    const out = await extractByKind(input, kind, tmpAbs);
    errors.push(...out.errors);
    unresolved.push(...out.unresolved);
    tables = out.tables;
    text = out.text;
    media = out.media;
    pageTextsFull = out.pageTextsFull ?? [];

    const sample = (pageTextsFull.join("\n") + " " + input.name).slice(0, 20_000);
    domain = guessDomain(input.name, sample);

    if (pageTextsFull.some((t) => t && t.trim().length > 0)) {
      entities = findEntities(pageTextsFull, input.name);
      equations = extractEquations(pageTextsFull, input.name);
      publication = extractPublicationMeta(pageTextsFull, input.name);
      status = "extracted";
    } else if (errors.length) {
      status = "failed";
    } else if (kind === "unknown") {
      status = "unsupported";
    } else {
      status = "extracted"; // e.g. image registered with metadata text
    }

    // Vision interpretation for image media (labelled, best-effort, budgeted).
    for (const m of media) {
      if (visionBudget.used >= 6) {
        unresolved.push("Vision interpretation budget (6 images/batch) reached — remaining images registered without AI description.");
        break;
      }
      if (!/^(png|jpe?g|webp|gif|bmp)$/i.test(m.format ?? "")) continue;
      const abs = path.join(process.cwd(), m.path);
      const mime = `image/${m.format === "jpg" ? "jpeg" : m.format}`;
      const v = await vlmDescribe(abs, mime);
      visionBudget.used++;
      state.visionUsed = visionBudget.used;
      if (v.ok && v.text) m.aiInterpretation = v.text;
      else m.interpretationError = v.error ?? "vision unavailable";
    }
  }

  if (!isDuplicate) {
    const entry: RegistryEntry = {
      sha256: sha,
      firstSeenBatch: batchId,
      firstSeenName: input.name,
      firstSeenAt: new Date().toISOString(),
      sizeBytes: input.bytes.length,
      kind,
    };
    registry.entries[sha] = entry;
    state.registryAdds[sha] = entry;
  }

  const file: ProcessedFile = {
    id: input.fileId,
    name: input.name,
    sizeBytes: input.bytes.length,
    sha256: sha,
    kind,
    status,
    domain,
    duplicateOf: prior && isDuplicate ? { batchId: prior.firstSeenBatch, name: prior.firstSeenName, sha256: prior.sha256 } : undefined,
    text,
    tables,
    equations,
    entities,
    publication,
    media,
    archiveEntries,
    errors,
    unresolved,
    rawPath: rawRel,
    extractedPath,
    processingMs: Date.now() - started,
  };

  // Persist the extraction JSON.
  if (status !== "duplicate") {
    extractedPath = `data/extracted/batches/${batchId}/${input.fileId}.extract.json`;
    file.extractedPath = extractedPath;
    await writeJson(extractedPath, {
      file: file.name,
      batchId,
      sha256: sha,
      kind,
      status,
      domain,
      text: text ? { ...text, pageTexts: text.pageTexts?.slice(0, 200) } : undefined,
      tables,
      equations,
      entities,
      publication,
      media: media.map((m) => ({ ...m })),
      archiveEntries,
      errors,
      unresolved,
    });
  }

  // Recurse into supported archive children. Completed children from a prior
  // (interrupted) pass of this same batch are reused from the checkpoint —
  // they are NOT re-parsed. The child order is rebuilt deterministically here
  // so the final flat receipt list is identical whether or not the batch was
  // resumed.
  if (children.length) {
    const order: string[] = [];
    state.childOrder[input.fileId] = order;
    for (let i = 0; i < children.length; i++) {
      const child = children[i];
      child.fileId = `${input.fileId}-n${i + 1}`;
      order.push(child.fileId);
      if (state.records[child.fileId]) continue; // already completed earlier
      await processFile(child, registry, batchId, visionBudget, state);
    }
  }

  // The record is complete (extraction persisted, children handled above).
  state.records[input.fileId] = file;

  // Checkpoint cadence: after every top-level file (depth 0) and every direct
  // child of a top-level archive (depth 1). Deeper nesting completes inside a
  // depth-1 subtree, so it is covered by the next depth-1 save.
  if ((input.depth ?? 0) <= 1) await saveState(state);

  releaseHeap();
  return file;
}

function flattenFromState(state: BatchStateFile, topIds: string[]): ProcessedFile[] {
  const out: ProcessedFile[] = [];
  const walk = (id: string) => {
    const rec = state.records[id];
    if (rec) out.push(rec);
    for (const cid of state.childOrder[id] ?? []) walk(cid);
  };
  topIds.forEach(walk);
  return out;
}

// ---------------------------------------------------------------------------
// Batch orchestration
// ---------------------------------------------------------------------------

export async function runBatch(uploads: UploadedFile[]): Promise<BatchReceipt> {
  if (uploads.length === 0) throw new Error("No files in batch");
  if (uploads.length > MAX_FILES_PER_BATCH)
    throw new Error(`A batch accepts at most ${MAX_FILES_PER_BATCH} files (got ${uploads.length})`);

  await ensureLayers();
  const registry = await loadRegistry();
  const index = await loadBatchIndex();
  const cumulativeIn = await loadCumulative();
  const knowledge = await loadKnowledge();
  const textIndex = await loadTextIndex();

  // ---- Resume support --------------------------------------------------------
  // If a previous pass of this exact upload set was interrupted (process kill,
  // container recycle), its checkpoint is reused: completed files are not
  // re-parsed and the original receivedAt is preserved.
  const uploadSigs = uploads.map((u) => ({
    name: u.name.replace(/[/\\]/g, "_"),
    sha256: sha256(u.bytes),
    sizeBytes: u.bytes.length,
  }));
  const existingState = await findResumableState(uploadSigs);
  const batchId = existingState?.batchId ?? nextBatchId(index);
  const receivedAt = existingState?.receivedAt ?? new Date().toISOString();
  const state: BatchStateFile =
    existingState ?? {
      version: 1,
      batchId,
      receivedAt,
      uploads: uploadSigs,
      uploadsDone: [],
      records: {},
      childOrder: {},
      registryAdds: {},
      visionUsed: 0,
      updatedAt: receivedAt,
    };
  // Re-apply this batch's earlier registry additions so in-batch duplicate
  // detection behaves identically across resumed passes.
  for (const [sha, entry] of Object.entries(state.registryAdds)) {
    if (!registry.entries[sha]) registry.entries[sha] = entry;
  }
  const visionBudget = { used: state.visionUsed };

  for (let i = 0; i < uploads.length; i++) {
    if (state.uploadsDone.includes(i)) continue; // completed in a prior pass
    const u = uploads[i];
    await processFile(
      { name: u.name.replace(/[/\\]/g, "_"), bytes: u.bytes, batchId, fileId: `f${String(i + 1).padStart(3, "0")}` },
      registry,
      batchId,
      visionBudget,
      state,
    );
    state.uploadsDone.push(i);
    await saveState(state);
  }
  const files = flattenFromState(
    state,
    uploads.map((_, i) => `f${String(i + 1).padStart(3, "0")}`),
  );

  // ---- Knowledge base update ------------------------------------------------
  let newEntities = 0;
  for (const f of files) {
    for (const m of f.entities) {
      let ent: KnowledgeEntity | undefined = knowledge.entities[m.entityId];
      if (!ent) {
        ent = {
          id: m.entityId,
          label: m.entityLabel,
          type: m.entityType,
          firstSeenBatch: batchId,
          mentions: [],
        };
        knowledge.entities[m.entityId] = ent;
        newEntities++;
      }
      ent.mentions.push({ batchId, source: m.source, location: m.location, context: m.context });
    }
    // Searchable text index: one doc per extracted file (≤4k chars).
    if (f.status === "extracted" && f.text) {
      try {
        const wsRoot = path.resolve(process.cwd());
        const abs = path.resolve(process.cwd(), f.text.fullTextPath);
        if (abs !== wsRoot && !abs.startsWith(wsRoot + path.sep)) {
          throw new Error("extracted text path escapes the workspace root");
        }
        const t = (await fs.readFile(abs, "utf8")).slice(0, 4000);
        textIndex.docs.push({
          id: `${batchId}:${f.id}`,
          source: f.name,
          batchId,
          kind: f.kind,
          location: f.text.pages ? `pages: ${f.text.pages}` : "document",
          text: t,
        });
        if (textIndex.docs.length > 4000) textIndex.docs = textIndex.docs.slice(-4000);
      } catch {
        /* text file was optional */
      }
    }
  }

  // ---- Totals ---------------------------------------------------------------
  const totalFiles = files.length;
  const docs = files.filter((f) => f.status === "extracted" && f.text);
  const totals = {
    files: totalFiles,
    extracted: files.filter((f) => f.status === "extracted").length,
    duplicates: files.filter((f) => f.status === "duplicate").length,
    unsupported: files.filter((f) => f.status === "unsupported" || f.status === "failed").length + files.filter((f) => f.status === "registered" && f.kind !== "archive").length,
    failed: files.filter((f) => f.status === "failed").length,
    documents: docs.length,
    pages: docs.reduce((a, f) => a + (f.text?.pages ?? 0), 0),
    chars: docs.reduce((a, f) => a + (f.text?.chars ?? 0), 0),
    tables: files.reduce((a, f) => a + f.tables.length, 0),
    tableRows: files.reduce((a, f) => a + f.tables.reduce((b, t) => b + t.rowCount, 0), 0),
    equations: files.reduce((a, f) => a + (f.equations?.matchedKnown.length ?? 0) + (f.equations?.heuristicFormulas.length ?? 0), 0),
    figures: files.reduce((a, f) => a + f.media.length, 0),
    entities: files.reduce((a, f) => a + f.entities.length, 0),
    newEntities,
    mediaAssets: files.reduce((a, f) => a + f.media.filter((m) => !m.path.startsWith("caption:")).length, 0),
  };

  const uniqueFiles = files.filter((f) => f.status !== "duplicate").length;
  const dupFiles = files.filter((f) => f.status === "duplicate").length;
  const cumulative: CumulativeTotals = {
    batches: cumulativeIn.batches + 1,
    files: cumulativeIn.files + totalFiles,
    uniqueFiles: cumulativeIn.uniqueFiles + uniqueFiles,
    duplicateFiles: cumulativeIn.duplicateFiles + dupFiles,
    documents: cumulativeIn.documents + totals.documents,
    pages: cumulativeIn.pages + totals.pages,
    chars: cumulativeIn.chars + totals.chars,
    tables: cumulativeIn.tables + totals.tables,
    tableRows: cumulativeIn.tableRows + totals.tableRows,
    equations: cumulativeIn.equations + totals.equations,
    figures: cumulativeIn.figures + totals.figures,
    mediaAssets: cumulativeIn.mediaAssets + totals.mediaAssets,
    entities: Object.keys(knowledge.entities).length,
    errors: cumulativeIn.errors + files.reduce((a, f) => a + f.errors.length, 0),
    userConfirmedAllUploads: cumulativeIn.userConfirmedAllUploads,
    lastBatchId: batchId,
    updatedAt: new Date().toISOString(),
  };

  const unresolvedIssues = files.flatMap((f) =>
    f.unresolved.map((u) => `${f.name}: ${u}`),
  ).slice(0, 120);

  const receipt: BatchReceipt = {
    batchId,
    receivedAt,
    fileCount: uploads.length,
    files,
    totals,
    cumulative,
    unresolvedIssues,
    modelImpact: MODEL_IMPACT_STATEMENT,
  };

  // ---- Persist everything ----------------------------------------------------
  index.push({ batchId, receivedAt: receipt.receivedAt, fileCount: totalFiles });
  await saveRegistry(registry);
  await saveBatchIndex(index);
  await saveReceipt(receipt);
  await saveCumulative(cumulative);
  await saveKnowledge(knowledge);
  await saveTextIndex(textIndex);
  // The checkpoint has served its purpose; remove it so the completed batch
  // leaves no resumable state behind.
  await fs.rm(path.join(process.cwd(), `data/ingest/batches/${batchId}.state.json`), {
    force: true,
  });

  return receipt;
}

// ---------------------------------------------------------------------------
// Global audit — gated on explicit user confirmation.
// ---------------------------------------------------------------------------

export async function markUserConfirmed(): Promise<CumulativeTotals> {
  const c = await loadCumulative();
  c.userConfirmedAllUploads = true;
  c.updatedAt = new Date().toISOString();
  await saveCumulative(c);
  return c;
}

export async function runGlobalAudit(): Promise<{
  ok: boolean;
  reason?: string;
  reportPath?: string;
}> {
  const cumulative = await loadCumulative();
  if (!cumulative.userConfirmedAllUploads) {
    return {
      ok: false,
      reason:
        "The global audit is locked until the user explicitly confirms that all source files have been uploaded. This is by design: no harmonization or training decisions happen while batches may still arrive.",
    };
  }
  const index = await loadBatchIndex();
  const registry = await loadRegistry();
  const knowledge = await loadKnowledge();

  // Reconcile receipts against the index.
  const receipts: BatchReceipt[] = [];
  const missing: string[] = [];
  for (const b of index) {
    const r = await loadReceipt(b.batchId);
    if (r) receipts.push(r);
    else missing.push(b.batchId);
  }

  // Cross-batch duplicates by hash.
  const byHash = new Map<string, { batchId: string; name: string }[]>();
  for (const r of receipts) {
    for (const f of r.files) {
      const list = byHash.get(f.sha256) ?? [];
      list.push({ batchId: r.batchId, name: f.name });
      byHash.set(f.sha256, list);
    }
  }
  const crossBatchDuplicates = [...byHash.entries()]
    .filter(([, occ]) => new Set(occ.map((o) => o.batchId)).size > 1)
    .map(([sha256, occurrences]) => ({ sha256, occurrences }));

  // Dataset inventory from extracted tables.
  const datasetInventory = receipts.flatMap((r) =>
    r.files.flatMap((f) =>
      f.tables.map((t, ti) => ({
        id: `${r.batchId}:${f.id}:t${ti + 1}`,
        source: `${f.name} — ${t.name}`,
        rows: t.rowCount,
        columns: t.columns,
        qualityFlags: [
          ...(t.rowCount < 5 ? ["< 5 rows"] : []),
          ...(t.columns.length < 2 ? ["single column"] : []),
          ...(t.columns.some((c) => /unnamed|col_\d+/i.test(c)) ? ["placeholder column names — header mapping needed"] : []),
          "human review pending",
        ],
        harmonizationNotes:
          "Columns are as extracted; mapping to canonical variables (variable registry) is deferred to the curated layer and requires human review.",
      })),
    ),
  );

  // ML eligibility PRE-assessment (heuristic only; human review required).
  const mlEligibilityPreAssessment = datasetInventory.map((d) => {
    const blockers: string[] = [];
    const eligible: string[] = [];
    if (d.rows >= 30 && d.columns.length >= 3) eligible.push("exploratory descriptive analysis");
    if (d.rows >= 100 && d.columns.length >= 4) eligible.push("candidate regression/classification — pending label audit");
    if (d.rows < 30) blockers.push("too few rows for any supervised task");
    if (d.qualityFlags.includes("placeholder column names — header mapping needed"))
      blockers.push("columns not yet mapped to canonical variables");
    blockers.push("outcome/label semantics not yet audited (CFI-G rule: ambiguous labels are never forced into a negative class)");
    return {
      dataset: d.source,
      eligibleTasks: eligible.length ? eligible : ["descriptive registration only"],
      blockers: blockers.length ? blockers : ["none recorded"],
      humanReviewRequired: true as const,
    };
  });

  const nodes = Object.keys(knowledge.entities).length;
  const edges = Object.values(knowledge.entities).reduce((a, e) => a + e.mentions.length, 0);

  const ranAt = new Date().toISOString();
  const reportRel = `reports/GLOBAL_AUDIT_${ranAt.replace(/[:.]/g, "-")}.md`;
  const report = [
    `# FLAME EVIDENCE LAB — Global Source Audit`,
    ``,
    `**Ran at:** ${ranAt}`,
    `**Trigger:** explicit user confirmation that all source files have been uploaded.`,
    `**Scope:** batch manifest reconciliation, cross-source deduplication, dataset inventory, ML eligibility pre-assessment. Knowledge-graph counts.`,
    ``,
    `## 1. Batches reconciled (${receipts.length})`,
    ...(missing.length ? [`- ⚠ Missing receipts: ${missing.join(", ")}`] : []),
    ...receipts.map((r) => `- **${r.batchId}** — ${r.fileCount} uploaded / ${r.files.length} processed (incl. archive children): ${r.totals.extracted} extracted, ${r.totals.duplicates} duplicates, ${r.totals.unsupported} unsupported/failed; ${r.totals.documents} documents, ${r.totals.pages} pages, ${r.totals.tables} tables, ${r.totals.equations} equation matches, ${r.totals.figures} figures.`),
    ``,
    `## 2. Cross-batch duplicates (${crossBatchDuplicates.length})`,
    ...crossBatchDuplicates.slice(0, 50).map((d) => `- \`${d.sha256.slice(0, 12)}…\` → ${d.occurrences.map((o) => `${o.batchId}/${o.name}`).join(" · ")}`),
    ...(crossBatchDuplicates.length === 0 ? ["- none"] : []),
    ``,
    `## 3. Dataset inventory (${datasetInventory.length} tables)`,
    ...datasetInventory.slice(0, 80).map((d) => `- **${d.source}** — ${d.rows} rows × ${d.columns.length} cols. Flags: ${d.qualityFlags.join("; ")}`),
    ``,
    `## 4. ML eligibility pre-assessment`,
    `All assessments below are pre-assessments. No model has been trained. Every dataset requires human review before any training version is created; ambiguous labels are never forced into a negative class.`,
    ``,
    ...mlEligibilityPreAssessment.slice(0, 80).map((m) => `- **${m.dataset}** — eligible (pre): ${m.eligibleTasks.join("; ")}. Blockers: ${m.blockers.join("; ")}.`),
    ``,
    `## 5. Knowledge registry`,
    `- Entity types registered: ${nodes}`,
    `- Evidence-backed mentions (edges so far): ${edges}`,
    ``,
    `## 6. Deferred (by design)`,
    `- Variable/equation/media registry completion and schema harmonization happen in the curated layer with human review.`,
    `- Any new model version is created only through the reviewed training workflow; production models are never silently overwritten.`,
  ].join("\n");

  await writeText(reportRel, report);
  await writeJson("data/ingest/audit.json", {
    ranAt,
    triggeredBy: "user-confirmation",
    batchesReconciled: receipts.map((r) => r.batchId),
    crossBatchDuplicates,
    datasetInventory,
    mlEligibilityPreAssessment,
    knowledgeGraphNodes: nodes,
    knowledgeGraphEdges: edges,
    reportPath: reportRel,
  });

  return { ok: true, reportPath: reportRel };
}
