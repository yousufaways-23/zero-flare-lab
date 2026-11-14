"use client";

// ZERO FLARE — ServerBatchPanel (M2): real /api/ingest pipeline panel for
// Data & Sources. Batched upload → SHA-256 dedup → extraction → receipt.

import { useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Receipt, ShieldCheck, Upload, Loader2 } from "lucide-react";

interface ServerBatchSummary {
  batchId: string;
  fileCount: number;
  processed: number;
  duplicates: number;
  extracted: number;
  media: number;
  entities: number;
  equations: number;
  extractedSets: number;
  rowsInSets: number;
  pages: number;
}

export function ServerBatchPanel() {
  const [summary, setSummary] = useState<ServerBatchSummary | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [auditText, setAuditText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const sendFiles = async (list: FileList | File[]) => {
    setBusy(true);
    setError(null);
    try {
      const form = new FormData();
      for (const f of Array.from(list).slice(0, 10)) form.append("files", f);
      const res = await fetch("/api/ingest", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) {
        setError(`Batch rejected: ${data?.error ?? res.status}${data?.detail ? ` — ${data.detail}` : ""}`);
      } else {
        setSummary({
          batchId: data.batchId,
          fileCount: data.fileCount,
          processed: data.totals?.processed ?? 0,
          duplicates: data.totals?.duplicates ?? 0,
          extracted: data.totals?.extracted ?? 0,
          media: data.totals?.media ?? 0,
          entities: data.totals?.entities ?? 0,
          equations: data.totals?.equations ?? 0,
          extractedSets: data.totals?.tables ?? 0,
          rowsInSets: data.totals?.tableRows ?? 0,
          pages: data.totals?.pages ?? 0,
        });
      }
    } catch (e) {
      setError(`Upload failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const confirmAll = async () => {
    setBusy(true);
    try {
      const res = await fetch("/api/ingest", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "confirm-all-uploads" }) });
      if (res.ok) setConfirmed(true);
    } finally {
      setBusy(false);
    }
  };

  const runAudit = async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/ingest", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "run-global-audit" }) });
      const data = await res.json();
      setAuditText(res.ok ? "Global audit complete — receipt written to data/ingest/audit.json." : `Audit refused: ${data?.error ?? res.status} — confirm all uploads first.`);
    } finally {
      setBusy(false);
    }
  };

  return (
    <section aria-label="Server ingestion pipeline" className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-sm font-semibold">Server ingestion pipeline — batched, hashed, quarantined</h3>
        <p className="text-[11px] text-muted-foreground">
          raw-bytes-first persistence → SHA-256 dedup → magic-byte type detection → isolated extraction → receipts
        </p>
      </div>
      <div className="glass-panel rounded-lg p-3 text-[11px] leading-relaxed text-muted-foreground">
        Model impact of every batch: <span className="font-semibold text-foreground">NONE by design</span>. Ingestion
        registers and extracts only; training eligibility is assessed in the global audit after you explicitly confirm
        that all source files are uploaded (model-governance policy: models/MODEL_POLICY.md).
      </div>
      <div
        role="button"
        tabIndex={0}
        aria-label="Drop files for the server ingestion pipeline"
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed border-border/70 bg-accent/20 px-4 py-6 text-center transition-colors hover:border-primary/50"
      >
        {busy ? (
          <Loader2 className="h-5 w-5 animate-spin text-primary" aria-hidden />
        ) : (
          <Upload className="h-5 w-5 text-muted-foreground" aria-hidden />
        )}
        <p className="text-sm font-medium">Send files to the server pipeline (≤10 per batch, ≤300 MB each)</p>
        <p className="text-[11px] text-muted-foreground">CSV, XLSX, JSON, PDF, DOCX, PPTX, MD, TXT, HTML, XML, notebooks, images, video, nested archives</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          className="sr-only"
          onChange={(e) => {
            if (e.target.files?.length) void sendFiles(e.target.files);
          }}
        />
      </div>
      {error && (
        <div className="rounded-md border border-destructive/50 bg-destructive/10 p-3 text-xs text-red-400" role="alert">{error}</div>
      )}
      {summary && (
        <div className="research-panel rounded-lg p-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h4 className="flex items-center gap-1.5 text-sm font-semibold">
              <Receipt className="h-4 w-4" aria-hidden /> Batch receipt {summary.batchId}
            </h4>
            <Badge variant="outline" className="gap-1 text-[10px] text-emerald-600"><ShieldCheck className="h-3 w-3" aria-hidden /> model impact: none</Badge>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4 lg:grid-cols-6">
            {([
              ["files", summary.fileCount],
              ["processed", summary.processed],
              ["duplicates", summary.duplicates],
              ["extracted", summary.extracted],
              ["media", summary.media],
              ["entities", summary.entities],
              ["equations", summary.equations],
              ["data sets", summary.extractedSets],
              ["rows in sets", summary.rowsInSets],
              ["pages", summary.pages],
            ] as [string, number][]).map(([label, v]) => (
              <div key={label}>
                <p className="font-mono text-sm font-semibold">{v.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={confirmAll} disabled={busy || confirmed}>
          {confirmed ? "All uploads confirmed ✓" : "Confirm all uploads (unlocks audit)"}
        </Button>
        <Button variant="outline" size="sm" className="h-8 text-xs" onClick={runAudit} disabled={busy || !confirmed}>
          Run global audit (reconcile + eligibility pre-assessment)
        </Button>
      </div>
      {auditText && <p className="text-[11px] text-muted-foreground">{auditText}</p>}
    </section>
  );
}
