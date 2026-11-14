/**
 * Batched source ingestion — type contracts.
 *
 * Honesty contract for the whole module:
 *  - Every count in a receipt is produced by real extraction code that ran on
 *    the actual bytes of the uploaded file. Nothing is estimated.
 *  - A file whose format we cannot parse is preserved in the raw layer and
 *    reported as `unsupported` or `failed` — never silently dropped, never
 *    counted as if it had been read.
 *  - Vision descriptions of images are labelled `ai_interpretation`; they are
 *    not confirmed facts.
 *  - Ingestion NEVER retrains or mutates production models. Training decisions
 *    wait for the explicit global audit that only runs after the user confirms
 *    all batches have been uploaded.
 */

export type FileKind =
  | "csv"
  | "tsv"
  | "xlsx"
  | "json"
  | "pdf"
  | "docx"
  | "pptx"
  | "txt"
  | "markdown"
  | "html"
  | "xml"
  | "notebook"
  | "image"
  | "video"
  | "archive"
  | "unsupported"
  | "unknown";

export type FileStatus =
  | "registered" // raw preserved; no structured extraction applicable/possible
  | "extracted" // structured extraction succeeded (text and/or tables)
  | "duplicate" // byte-identical to an earlier file (by SHA-256)
  | "unsupported" // format recognized but no parser in this environment
  | "failed"; // parser threw — error recorded honestly

export type ScientificDomain =
  | "combustion"
  | "fire-safety"
  | "aerosol-smoke"
  | "materials"
  | "fluid-physics"
  | "data"
  | "documentation"
  | "other";

export interface TableExtraction {
  name: string; // sheet name / table index / csv file stem
  columns: string[];
  rowCount: number;
  sample: Record<string, string | number | null>[]; // first ≤5 rows
  location: string; // page / sheet / line provenance
}

export interface EntityMention {
  entityId: string;
  entityLabel: string;
  entityType: EntityType;
  source: string; // file name
  location: string; // page/sheet/line
  context: string; // evidence snippet (≤160 chars)
  evidence: "dictionary-match"; // how this was established
}

export type EntityType =
  | "investigation"
  | "facility"
  | "apparatus"
  | "sensor"
  | "material"
  | "fuel"
  | "suppressant"
  | "equation"
  | "mission-environment"
  | "standard";

export interface EquationExtraction {
  matchedKnown: { id: string; name: string; where: string }[];
  heuristicFormulas: { formula: string; where: string }[]; // symbol = expression patterns
  doiLike: string[];
}

export interface PublicationMetadata {
  title?: string;
  titleConfidence: "high" | "medium";
  doi?: string;
  years: number[];
  authorPattern?: string;
  authorConfidence: "low" | "medium";
  referencesCount?: number;
  note: string; // what was actually looked for and found/not found
}

export interface MediaExtraction {
  path: string; // relative path under data/media or data/raw (served via /api/ingest/media)
  kind: "extracted-figure" | "uploaded-image" | "video-frame" | "document-image";
  sourceFile: string;
  width?: number;
  height?: number;
  format?: string;
  page?: number; // 1-based page number for figures extracted from paginated documents
  originName?: string; // original asset name when embedded media carries one (e.g. catalog thumb title)
  captionNote?: string; // caption text found adjacent to embedded media
  aiInterpretation?: string; // VLM description, explicitly labelled as interpretation
  interpretationError?: string;
}

export interface TextExtraction {
  chars: number;
  pages?: number;
  pageTexts?: { page: number; chars: number; preview: string }[];
  headings: string[];
  fullTextPath: string; // persisted plain text under data/extracted
  truncatedNote?: string; // e.g. scanned PDF with empty text layer
}

export interface ProcessedFile {
  id: string; // stable per batch: f001...
  name: string;
  sizeBytes: number;
  sha256: string;
  kind: FileKind;
  status: FileStatus;
  domain: ScientificDomain;
  duplicateOf?: { batchId: string; name: string; sha256: string };
  text?: TextExtraction;
  tables: TableExtraction[];
  equations?: EquationExtraction;
  entities: EntityMention[];
  publication?: PublicationMetadata;
  media: MediaExtraction[];
  archiveEntries?: { path: string; sizeBytes: number; sha256: string; registered: boolean }[];
  errors: string[];
  unresolved: string[]; // honest register of what could not be determined
  rawPath: string; // data/raw/batches/<batchId>/<name>
  extractedPath?: string; // data/extracted/batches/<batchId>/<stem>.extract.json
  processingMs: number;
}

export interface BatchReceipt {
  batchId: string; // B-YYYYMMDD-NNN
  receivedAt: string;
  fileCount: number;
  files: ProcessedFile[];
  totals: {
    files: number;
    extracted: number;
    duplicates: number;
    unsupported: number;
    failed: number;
    documents: number; // files with a text layer
    pages: number;
    chars: number;
    tables: number;
    tableRows: number;
    equations: number; // known matches + heuristic formulas
    figures: number; // media entries incl. video frames
    entities: number; // all mentions found in this batch
    newEntities: number; // entity ids not seen before this batch
    mediaAssets: number;
  };
  cumulative: CumulativeTotals;
  unresolvedIssues: string[];
  modelImpact: string; // always the deferred-training statement until audit
}

export interface CumulativeTotals {
  batches: number;
  files: number;
  uniqueFiles: number;
  duplicateFiles: number;
  documents: number;
  pages: number;
  chars: number;
  tables: number;
  tableRows: number;
  equations: number;
  figures: number;
  mediaAssets: number;
  entities: number;
  errors: number;
  userConfirmedAllUploads: boolean;
  lastBatchId: string | null;
  updatedAt: string;
}

export interface AuditReport {
  ranAt: string;
  triggeredBy: "user-confirmation";
  batchesReconciled: string[];
  crossBatchDuplicates: { sha256: string; occurrences: { batchId: string; name: string }[] }[];
  datasetInventory: {
    id: string;
    source: string;
    rows: number;
    columns: string[];
    qualityFlags: string[];
    harmonizationNotes: string;
  }[];
  mlEligibilityPreAssessment: {
    dataset: string;
    eligibleTasks: string[];
    blockers: string[];
    humanReviewRequired: true;
  }[];
  knowledgeGraphNodes: number;
  knowledgeGraphEdges: number;
  reportPath: string;
}
