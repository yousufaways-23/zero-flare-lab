"use client";

// ZERO FLARE — SourceFiguresGallery: figures extracted from the original
// NASA source documents by the ingestion pipeline, mapped to the current
// investigation and served with provenance captions (source document, page,
// ingestion batch). Serve path is the traversal-proof /api/ingest/media.

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { FileImage, Loader2 } from "lucide-react";

interface SourceMediaItem {
  path: string;
  sourceFile: string;
  batchId: string;
  page: number | null;
  kind: string;
  width: number | null;
  height: number | null;
  accessions: string[];
  facility: string | null;
  interpretation: string | null;
}

interface GalleryLoaded {
  accession: string;
  items: SourceMediaItem[];
  total: number;
  error: string | null;
}

export function SourceFiguresGallery({ accession }: { accession: string }) {
  const [loaded, setLoaded] = useState<GalleryLoaded | null>(null);
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/source-media?accession=${encodeURIComponent(accession)}&limit=60`)
      .then((r) => r.json())
      .then((d: { items?: SourceMediaItem[]; total?: number; note?: string }) => {
        if (cancelled) return;
        setLoaded({ accession, items: d.items ?? [], total: d.total ?? 0, error: null });
      })
      .catch(
        (e: Error) =>
          !cancelled && setLoaded({ accession, items: [], total: 0, error: e.message }),
      );
    return () => {
      cancelled = true;
    };
  }, [accession]);

  // derived: a result carrying a previous accession renders as loading, which
  // replaces the old synchronous reset-on-accession-change (compiler-clean)
  const current = loaded !== null && loaded.accession === accession ? loaded : null;
  const error = current?.error ?? null;
  const items = error === null && current !== null ? current.items : null;
  const total = current?.total ?? 0;

  if (error) {
    return <p className="provenance-strip">Source-figure index unavailable: {error}</p>;
  }
  if (items === null) {
    return (
      <p className="flex items-center gap-2 text-xs text-muted-foreground" aria-live="polite">
        <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden /> Indexing source figures…
      </p>
    );
  }
  if (items.length === 0) {
    return (
      <p className="provenance-strip">
        No source-document figures mapped to {accession} in the ingestion layers yet. Facility
        documents (CIR, FCF, MSG) are indexed under the 3D Lab equipment records.
      </p>
    );
  }

  const open = openIdx !== null ? items[openIdx] : null;

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <FileImage className="h-4 w-4 text-primary" aria-hidden />
          Figures from the original source documents
        </h3>
        <p className="text-[11px] text-muted-foreground">
          {items.length} shown of {total} extracted · served from the ingestion layers with per-figure provenance
        </p>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-4">
        {items.map((it, i) => (
          <figure key={`${it.path}-${i}`} className="group relative overflow-hidden rounded-lg border border-border/60">
            <button
              onClick={() => setOpenIdx(i)}
              className="block w-full cursor-zoom-in"
              aria-label={`Open figure from ${it.sourceFile}, page ${it.page ?? "?"}`}
            >
              <img
                src={`/api/ingest/media?path=${encodeURIComponent(it.path)}`}
                alt={`Figure extracted from ${it.sourceFile}, page ${it.page ?? "?"}`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
            </button>
            <figcaption className="bg-[#0a1638]/90 px-2 py-1.5 text-[9px] leading-snug text-muted-foreground">
              <span className="block truncate text-foreground/80" title={it.sourceFile}>{it.sourceFile}</span>
              {it.page !== null && <span>page {it.page} · </span>}
              <span className="font-mono">{it.batchId}</span>
              {it.interpretation && (
                <Badge variant="outline" className="ml-1 text-[8px] uppercase">AI-described</Badge>
              )}
            </figcaption>
          </figure>
        ))}
      </div>

      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
        <DialogContent className="max-w-3xl border-border/60 sm:max-w-3xl">
          {open && (
            <>
              <DialogHeader className="text-left">
                <DialogTitle className="pr-6 text-sm font-semibold leading-snug sm:text-base">
                  Source figure — {open.sourceFile}
                </DialogTitle>
                <DialogDescription className="text-[11px]">
                  Extracted by the ingestion pipeline from the original NASA source document ·{" "}
                  {open.page !== null ? `page ${open.page} · ` : ""}
                  <span className="font-mono">{open.batchId}</span>
                  {open.interpretation ? " · AI-described (AI-INTERPRETED, not a NASA caption)" : ""}
                </DialogDescription>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border border-border/60 bg-black/40">
                <img
                  src={`/api/ingest/media?path=${encodeURIComponent(open.path)}`}
                  alt={`Figure extracted from ${open.sourceFile}, page ${open.page ?? "?"}`}
                  className="max-h-[62vh] w-full object-contain"
                />
              </div>
              <p className="provenance-strip">
                Citation: extract from “{open.sourceFile}”, page {open.page ?? "—"}, ZERO FLARE ingestion
                batch {open.batchId}, pipeline reference <span className="font-mono">{open.path}</span>. Figures
                are document page renders/extracted images — treat page context, not AI description, as the
                scientific caption.
              </p>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
