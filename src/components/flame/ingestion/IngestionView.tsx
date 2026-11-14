"use client";

// FLAME EVIDENCE LAB — Ingestion & Sources: the evidence supply chain.
// Recovery ledger (verified), recorded historical batches (honest status),
// client-side upload validation with batch receipts, source registry and the
// verified NASA media catalogue. Nothing absent is displayed as present.

import { useMemo, useRef, useState } from "react";
import {
  Database, Upload, TriangleAlert, CheckCircle2, ExternalLink, Search, Receipt,
  Files, ShieldCheck, ChevronDown, FileText, Loader2,
} from "lucide-react";
import {
  getCorpusTotals, getTables, getSources, getMedia,
  type DataTable, type SourceRecord,
} from "@/lib/data/catalog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { ServerBatchPanel } from "@/components/flame/ingestion/ServerBatchPanel";

// ---------------------------------------------------------------------------
// recorded reconciliation facts (fixed historical ledger, M0 report)
// ---------------------------------------------------------------------------

// The 3 tables recovered beyond the 19-file project manifest (recorded in the
// fetch ledger data/ingest/psi_fetch_ledger.json and the M0 reconciliation).
const ADDITIONAL_TABLE_IDS = new Set([
  "PSI-142_PSI-142_Experimental_table_Data_Summary_Table",
  "PSI-47_PSI-47_Experimental_table_DAFT",
  "PSI-98_PSI-98_Experimental_table_SAFFIRE-1",
]);

interface HistoricalBatch { id: string; files: number; note: string }

const HISTORICAL_BATCHES: HistoricalBatch[] = [
  { id: "B-20261109-001", files: 110, note: "initial repository ingest (recorded)" },
  { id: "B-20261109-002", files: 148, note: "second upload batch (recorded)" },
  { id: "B-20261109-003", files: 140, note: "third upload batch (recorded)" },
  { id: "B-20261109-004", files: 42, note: "final upload batch (recorded)" },
];

const HISTORICAL_CUMULATIVE: { label: string; value: string }[] = [
  { label: "files", value: "440" },
  { label: "documents", value: "317" },
  { label: "pages", value: "9,086" },
  { label: "tables", value: "635" },
  { label: "equation candidates", value: "1,220" },
  { label: "figures", value: "3,573" },
  { label: "media assets", value: "2,393" },
  { label: "entities", value: "109" },
];

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

function fmtBytes(b: number): string {
  if (b >= 1e6) return `${(b / 1e6).toFixed(2)} MB`;
  if (b >= 1e3) return `${(b / 1e3).toFixed(1)} kB`;
  return `${b} B`;
}

// ---------------------------------------------------------------------------
// client-side upload validation (no server persistence in this environment)
// ---------------------------------------------------------------------------

interface ColumnProfile {
  name: string;
  type: "numeric" | "categorical";
  fillRate: number;
  parseFailures: number;
}

interface UploadReceipt {
  name: string;
  bytes: number;
  sha256: string | null;
  delimiter: string;
  rowCount: number; // data rows (header excluded)
  columnCount: number;
  duplicateRows: number;
  parseFailures: number;
  columns: ColumnProfile[];
}

function readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(reader.error ?? new Error("FileReader failed"));
    reader.readAsArrayBuffer(file);
  });
}

async function sha256Hex(buf: ArrayBuffer): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function parseDelimited(name: string, text: string, bytes: number, sha256: string | null): UploadReceipt {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const firstLine = lines[0] ?? "";
  const tabs = (firstLine.match(/\t/g) ?? []).length;
  const commas = (firstLine.match(/,/g) ?? []).length;
  const delimiter = tabs > commas ? "\\t (tab)" : ", (comma)";
  const delimChar = tabs > commas ? "\t" : ",";

  const rows = lines.map((l) => l.split(delimChar).map((c) => c.trim()));
  const header = rows[0] ?? [];
  const dataRows = rows.slice(1);

  const columns: ColumnProfile[] = header.map((colName, i) => {
    const cells = dataRows.map((r) => r[i] ?? "");
    const nonEmpty = cells.filter((c) => c.length > 0);
    const numericOk = nonEmpty.filter((c) => Number.isFinite(Number(c)));
    const isNumeric = nonEmpty.length > 0 && numericOk.length / nonEmpty.length >= 0.8;
    return {
      name: colName || `(column ${i + 1})`,
      type: isNumeric ? "numeric" : "categorical",
      fillRate: dataRows.length > 0 ? nonEmpty.length / dataRows.length : 0,
      parseFailures: isNumeric ? nonEmpty.length - numericOk.length : 0,
    };
  });

  const seen = new Set<string>();
  let duplicateRows = 0;
  for (const r of dataRows) {
    const key = JSON.stringify(r);
    if (seen.has(key)) duplicateRows += 1;
    else seen.add(key);
  }

  return {
    name,
    bytes,
    sha256,
    delimiter,
    rowCount: dataRows.length,
    columnCount: header.length,
    duplicateRows,
    parseFailures: columns.reduce((a, c) => a + c.parseFailures, 0),
    columns,
  };
}

export function UploadPanel() {
  const [receipts, setReceipts] = useState<UploadReceipt[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (list: FileList | File[]) => {
    const files = Array.from(list).filter((f) => /\.(csv|tsv)$/i.test(f.name) || /text\/(csv|tab-separated-values)/.test(f.type));
    if (files.length === 0) {
      setError("Only .csv / .tsv files are accepted in this preview.");
      return;
    }
    setError(null);
    setBusy(true);
    const next: UploadReceipt[] = [];
    for (const file of files) {
      try {
        const buf = await readFileArrayBuffer(file);
        let sha: string | null = null;
        try {
          sha = await sha256Hex(buf);
        } catch {
          sha = null; // non-secure context (no crypto.subtle) — recorded honestly
        }
        const text = new TextDecoder().decode(buf);
        next.push(parseDelimited(file.name, text, file.size, sha));
      } catch (e) {
        setError(`Could not read ${file.name}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
    if (next.length > 0) setReceipts((prev) => [...next.reverse(), ...prev]);
    setBusy(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  const totalBytes = receipts.reduce((a, r) => a + r.bytes, 0);

  return (
    <section aria-label="Upload and validate" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">Upload &amp; validate — client-side preview</h3>
        <p className="text-[11px] text-muted-foreground">
          client-side validation preview — files are not persisted server-side in this environment
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        aria-label="Drop CSV or TSV files here, or press Enter to browse"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer?.files?.length) void handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
          dragOver ? "border-primary bg-primary/10" : "border-border/70 bg-accent/20 hover:border-primary/50",
        )}
      >
        {busy ? (
          <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
        ) : (
          <Upload className="h-6 w-6 text-muted-foreground" aria-hidden />
        )}
        <p className="text-sm font-medium">
          {busy ? "Reading and hashing files…" : "Drop .csv / .tsv files here — or click to browse"}
        </p>
        <p className="max-w-md text-[11px] leading-snug text-muted-foreground">
          Files are read in your browser only (FileReader). We compute rows, columns, per-column fill rate, inferred
          types (numeric if ≥80% of non-empty cells parse as numbers), duplicate rows and SHA-256 via
          crypto.subtle — the same profile the recovered corpus carries.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".csv,.tsv,text/csv,text/tab-separated-values"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) void handleFiles(e.target.files);
          }}
        />
      </div>

      {error ? (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-red-400" role="alert">
          {error}
        </div>
      ) : null}

      {receipts.length > 0 ? (
        <div className="research-panel rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold">
              <Receipt className="h-4 w-4" aria-hidden /> Batch receipt
            </h4>
            <p className="font-mono text-xs">
              {receipts.length} file{receipts.length === 1 ? "" : "s"} · {fmtBytes(totalBytes)} total
            </p>
            <Button variant="outline" size="sm" className="h-7 text-[11px]" onClick={() => setReceipts([])}>
              Clear batch
            </Button>
          </div>
          <div className="mt-3 flex max-h-96 flex-col gap-3 overflow-y-auto data-scroll pr-1">
            {receipts.map((r, idx) => (
              <article key={`${r.name}-${idx}`} className="rounded-md border border-[color:var(--research-foreground)]/15 bg-[color:var(--research-muted)] p-3">
                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                  <p className="flex min-w-0 items-center gap-1.5 text-[13px] font-semibold">
                    <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    <span className="truncate">{r.name}</span>
                  </p>
                  <p className="font-mono text-[11px] text-muted-foreground">{fmtBytes(r.bytes)}</p>
                </div>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px]">
                  <span>sha256: <span className="font-semibold">{r.sha256 ? r.sha256.slice(0, 12) : "unavailable (non-secure context)"}</span></span>
                  <span>{r.rowCount} rows × {r.columnCount} cols</span>
                  <span>delimiter: {r.delimiter}</span>
                  <span>duplicates: {r.duplicateRows}</span>
                  <span>parse failures: {r.parseFailures}</span>
                </div>
                {r.columns.length > 0 ? (
                  <div className="mt-2 max-h-44 overflow-y-auto data-scroll">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="h-7 text-[10px]">column</TableHead>
                          <TableHead className="h-7 text-[10px]">type</TableHead>
                          <TableHead className="h-7 text-[10px]">fill</TableHead>
                          <TableHead className="h-7 text-[10px]">parse failures</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {r.columns.map((c, i) => (
                          <TableRow key={i}>
                            <TableCell className="py-1 text-[11px] font-medium">{c.name}</TableCell>
                            <TableCell className="py-1">
                              <Badge variant="outline" className="text-[10px]">{c.type}</Badge>
                            </TableCell>
                            <TableCell className="py-1 font-mono text-[11px]">{(c.fillRate * 100).toFixed(0)}%</TableCell>
                            <TableCell className="py-1 font-mono text-[11px]">{c.parseFailures}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// source registry (grouped, searchable)
// ---------------------------------------------------------------------------

export function SourceRegistry() {
  const sources = useMemo(() => getSources(), []);
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return sources;
    return sources.filter((s) =>
      `${s.title} ${s.url} ${s.category} ${s.authority} ${s.use}`.toLowerCase().includes(query),
    );
  }, [sources, q]);

  const grouped = useMemo(() => {
    const map = new Map<string, SourceRecord[]>();
    for (const s of filtered) {
      const list = map.get(s.category) ?? [];
      list.push(s);
      map.set(s.category, list);
    }
    return Array.from(map.entries());
  }, [filtered]);

  return (
    <section aria-label="Source registry" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">Source registry — {sources.length} registered sources</h3>
        <p className="text-[11px] text-muted-foreground">
          External fetching follows SSRF/allowlist policy; NTRS/Images API connectors are registered sources.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <Search className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter sources by title, category, authority or use…"
          aria-label="Filter source registry"
          className="h-8 text-xs"
        />
      </div>
      <div className="grid max-h-[420px] gap-3 overflow-y-auto data-scroll pr-1 lg:grid-cols-2">
        {grouped.length === 0 ? (
          <p className="text-xs text-muted-foreground">No source matches this filter.</p>
        ) : (
          grouped.map(([category, items]) => (
            <div key={category} className="glass-panel rounded-lg p-3">
              <h4 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-[color:var(--emission)]" aria-hidden />
                {category.replace(/_/g, " ")}
                <span className="font-mono text-[10px] normal-case">({items.length})</span>
              </h4>
              <ul className="mt-2 space-y-2">
                {items.map((s) => (
                  <li key={s.id}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-start gap-1 text-xs font-medium leading-snug hover:text-primary hover:underline"
                    >
                      <span className="min-w-0">{s.title}</span>
                      <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" aria-hidden />
                    </a>
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] leading-snug text-muted-foreground">
                      <Badge variant="outline" className="text-[10px]">{s.authority}</Badge>
                      {s.use}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// media catalogue (verified NASA Images API records only)
// ---------------------------------------------------------------------------

export function MediaCatalogue() {
  const media = useMemo(() => getMedia(), []);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? media : media.slice(0, 8);

  return (
    <section aria-label="Media catalogue" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">Media catalogue — {media.length} verified records</h3>
        <p className="text-[11px] text-muted-foreground">
          Provenance: NASA Images and Video Library (images.nasa.gov), credit NASA. Only verified-available media is
          displayed — the 2,393 historical batch binaries are not (see the honesty note above).
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {visible.map((m) => (
          <figure key={m.nasa_id} className="glass-panel overflow-hidden rounded-lg">
            <img
              src={m.thumb}
              alt={m.title}
              loading="lazy"
              className="h-32 w-full object-cover"
            />
            <figcaption className="p-2.5">
              <p className="line-clamp-2 text-[11px] font-medium leading-snug">{m.title}</p>
              <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                {m.nasa_id} · {m.center} · credit NASA
              </p>
            </figcaption>
          </figure>
        ))}
      </div>
      {media.length > 8 ? (
        <Button variant="outline" size="sm" className="h-8 w-fit text-xs" onClick={() => setShowAll((v) => !v)} aria-expanded={showAll}>
          {showAll ? "Show compact view" : `Show all ${media.length} records`}
          <ChevronDown className={cn("ml-1 h-3.5 w-3.5 transition-transform", showAll && "rotate-180")} aria-hidden />
        </Button>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// main view
// ---------------------------------------------------------------------------

export function IngestionView() {
  const totals = useMemo(() => getCorpusTotals(), []);
  const tables = useMemo(() => getTables(), []);
  const manifestCount = tables.filter((t) => !ADDITIONAL_TABLE_IDS.has(t.id)).length;
  const ledgerCount = tables.length - manifestCount;

  const totalStrip: { label: string; value: string }[] = [
    { label: "tables", value: String(totals.tables ?? tables.length) },
    { label: "rows", value: (totals.rows ?? 0).toLocaleString() },
    { label: "columns", value: String(totals.columns ?? 0) },
    { label: "duplicate rows", value: String(totals.duplicateRows ?? 0) },
    { label: "parse failures", value: (totals.parseFailures ?? 0).toLocaleString() },
  ];

  return (
    <div className="flex flex-col gap-6 pb-24">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          <span className="ember-gradient-text">Data &amp; Sources</span> — evidence supply chain
        </h1>
        <div className="glass-panel flex flex-wrap items-center gap-x-5 gap-y-2 rounded-lg px-4 py-3">
          <Database className="h-4 w-4 text-primary" aria-hidden />
          {totalStrip.map((s) => (
            <div key={s.label} className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
              <p className="font-mono text-sm font-semibold">{s.value}</p>
            </div>
          ))}
          <p className="ml-auto max-w-md text-[10px] leading-snug text-muted-foreground">
            method: {String(totals.method ?? "—")} · generated {String(totals.generatedAt ?? "—")}
          </p>
        </div>
      </header>

      {/* ---- recovery ledger (current, verified) ---- */}
      <section aria-label="Recovery ledger" className="flex flex-col gap-3">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">Recovery ledger — verified data assets</h3>
          <p className="max-w-2xl text-[11px] leading-snug text-muted-foreground">
            Recovered directly from the NASA PSI public download endpoint; 19/19 tables SHA-256-identical to the project
            manifest{ledgerCount > 0 ? ` (+${ledgerCount} additional tables recorded in the fetch ledger)` : ""}.
          </p>
        </div>
        <div className="research-panel max-h-[420px] overflow-auto rounded-lg data-scroll">
          <Table>
            <TableHeader className="sticky top-0 z-10 bg-[color:var(--research)]">
              <TableRow>
                <TableHead className="text-[10px]">file</TableHead>
                <TableHead className="text-[10px]">investigation</TableHead>
                <TableHead className="text-[10px] text-right">rows</TableHead>
                <TableHead className="text-[10px] text-right">cols</TableHead>
                <TableHead className="text-[10px] text-right">duplicates</TableHead>
                <TableHead className="text-[10px] text-right">bytes</TableHead>
                <TableHead className="text-[10px]">sha256</TableHead>
                <TableHead className="text-[10px]">verification</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tables.map((t: DataTable) => (
                <TableRow key={t.id}>
                  <TableCell className="max-w-[260px] truncate py-1.5 font-mono text-[11px]" title={t.file}>
                    {t.file}
                  </TableCell>
                  <TableCell className="py-1.5 font-mono text-[11px] text-primary">{t.investigation}</TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-[11px]">{t.rowCount}</TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-[11px]">{t.columnCount}</TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-[11px]">{t.duplicateRows}</TableCell>
                  <TableCell className="py-1.5 text-right font-mono text-[11px]">{fmtBytes(t.bytes)}</TableCell>
                  <TableCell className="py-1.5 font-mono text-[11px] text-muted-foreground" title={t.sha256}>
                    {t.sha256.slice(0, 12)}
                  </TableCell>
                  <TableCell className="py-1.5">
                    {ADDITIONAL_TABLE_IDS.has(t.id) ? (
                      <Badge variant="outline" className="text-[10px] text-[color:var(--emission)]">+ fetch ledger</Badge>
                    ) : (
                      <Badge variant="outline" className="gap-1 text-[10px] text-emerald-600">
                        <CheckCircle2 className="h-3 w-3" aria-hidden /> manifest 19/19
                      </Badge>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <p className="provenance-strip">
          Hashes recomputed at build time from data/raw (sha256-verified against the project manifest). Missing values
          in these tables stay missing — they are never zero-filled.
        </p>
      </section>

      <Separator className="bg-border/60" />

      {/* ---- historical batches: RECORDED LEDGER, clearly labelled ---- */}
      <section aria-label="Historical ingestion batches" className="grid gap-4 lg:grid-cols-[1fr_1fr]">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-sm font-semibold">Historical ingestion batches — recorded ledger (prior repository)</h3>
          </div>
          <p className="text-[11px] leading-snug text-muted-foreground">
            These numbers are the recorded historical ingestion ledger of the prior repository build. They describe
            past uploads — they are NOT the current filesystem state of this environment.
          </p>
          <div className="research-panel overflow-hidden rounded-lg">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[10px]">batch</TableHead>
                  <TableHead className="text-[10px] text-right">files</TableHead>
                  <TableHead className="text-[10px]">note</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {HISTORICAL_BATCHES.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="py-1.5 font-mono text-[11px]">{b.id}</TableCell>
                    <TableCell className="py-1.5 text-right font-mono text-[11px]">{b.files}</TableCell>
                    <TableCell className="py-1.5 text-[11px] text-muted-foreground">{b.note}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <div className="glass-panel rounded-lg p-3">
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">recorded cumulative totals (prior repository)</p>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
              {HISTORICAL_CUMULATIVE.map((c) => (
                <div key={c.label} className="min-w-0">
                  <p className="truncate font-mono text-sm font-semibold" title={c.label}>{c.value}</p>
                  <p className="truncate text-[10px] text-muted-foreground">{c.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <Alert variant="destructive" className="h-fit" role="alert">
          <TriangleAlert aria-hidden />
          <AlertTitle>Critical honesty note — historical media are NOT present</AlertTitle>
          <AlertDescription>
            <p className="leading-relaxed">
              The 2,393 media binaries from these historical batches are NOT present in this environment (source
              archives unavailable). Status: <span className="font-semibold">inaccessible</span>. This platform
              displays only verified-available media (NASA Images API).
            </p>
            <p className="mt-2 font-mono text-[11px]">gap reference: gap-media-batch</p>
          </AlertDescription>
        </Alert>
      </section>

      <Separator className="bg-border/60" />

      <ServerBatchPanel />

      <Separator className="bg-border/60" />

      <UploadPanel />

      <Separator className="bg-border/60" />

      <SourceRegistry />

      <Separator className="bg-border/60" />

      <MediaCatalogue />

      <p className="provenance-strip flex items-start gap-2">
        <Files className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
        Every table above is re-verified by SHA-256 against the project manifest or the fetch ledger. If an asset
        cannot be verified, it is not displayed. This is the platform&apos;s honesty contract.
      </p>
    </div>
  );
}
