"use client";
/**
 * ZERO FLARE — Related literature panel (Phase 4, research doc §2.1/§2.2).
 *
 * Surfaces the Fold Data archive papers whose FULL TEXT links to this
 * investigation, with page counts, extracted figure captions and published
 * high-resolution figures served from /corpus/paper-figures/.
 *
 * Honesty: links are candidate-level (full-text name occurrence in the paper),
 * verified only after citation review. Captions come from the PDF text layer.
 * Nothing here is synthesized; figures are original source extractions.
 */
import { useMemo, useState } from "react";
import { FileText, ImageOff } from "lucide-react";
import paperFigures from "@/data/generated/paper-figures.json";

interface FigureAsset { asset: string; page: number; bytes: number }
interface PaperEntry {
  file: string;
  pages: number;
  figures_extracted_total?: number;
  figures_published?: FigureAsset[];
  investigations_linked: string[];
  link_status: string;
  figure_captions: { n: string; caption: string }[];
  abstract_snippet?: string;
  error?: string;
}

const REG = paperFigures as unknown as { papers: PaperEntry[] };

function shortTitle(file: string): string {
  return file
    .replace(/\.pdf$/, "")
    .replace(/^1-s2\.0-S\d+-am$/, "Combustion and Flame (Elsevier)")
    .replace(/^1-s2\.0-S\d+-main$/, "Journal article (Elsevier)")
    .replace(/^nihms-\d+$/, "PMC open-access manuscript")
    .replace(/_/g, " ")
    .slice(0, 110);
}

export function RelatedLiterature({ accession }: { accession: string }) {
  const papers = useMemo(
    () => REG.papers.filter((p) => !p.error && p.investigations_linked.some((k) => k.toLowerCase() === accession.toLowerCase())),
    [accession],
  );
  const [openPaper, setOpenPaper] = useState<string | null>(null);

  if (!papers.length) return null;

  return (
    <div className="glass-panel rounded-xl p-4">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <FileText className="h-3.5 w-3.5" /> Related literature — Fold Data archive
      </h3>
      <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
        {papers.length} archived paper{papers.length === 1 ? "" : "s"} reference {accession} in their full text.
        Links are candidate-level until citation-verified; figures are original extractions from the PDFs
        (page-attributed, unmodified).
      </p>
      <div className="mt-3 flex flex-col gap-2">
        {papers.map((p) => {
          const key = p.file;
          const open = openPaper === key;
          return (
            <div key={key} className="rounded-lg border border-border/50 bg-accent/10">
              <button
                onClick={() => setOpenPaper(open ? null : key)}
                aria-expanded={open}
                className="flex w-full items-start justify-between gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-accent/30 transition-colors"
              >
                <span className="min-w-0">
                  <span className="block truncate text-[13px] font-medium">{shortTitle(p.file)}</span>
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {p.pages} pages · {p.figures_published?.length ?? 0} published figure
                    {(p.figures_published?.length ?? 0) === 1 ? "" : "s"} · {p.figure_captions.length} caption
                    {p.figure_captions.length === 1 ? "" : "s"} extracted
                  </span>
                </span>
                <span className="shrink-0 rounded border border-border/50 px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground">
                  {open ? "hide" : "view"}
                </span>
              </button>
              {open && (
                <div className="border-t border-border/40 px-3 py-3">
                  {p.figure_captions.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">Extracted figure captions</div>
                      <ul className="mt-1 space-y-1">
                        {p.figure_captions.slice(0, 6).map((c, i) => (
                          <li key={i} className="text-[11px] leading-snug text-foreground/80">
                            <span className="font-mono text-primary">Fig. {c.n}</span> — {c.caption}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {p.figures_published && p.figures_published.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                      {p.figures_published.map((f) => (
                        <a
                          key={f.asset}
                          href={f.asset}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group rounded-md border border-border/50 p-1.5 hover:border-primary/50"
                          title={`Original figure extracted from page ${f.page} — opens full resolution`}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={f.asset}
                            alt={`Figure from page ${f.page} of ${shortTitle(p.file)}`}
                            loading="lazy"
                            className="h-20 w-full rounded object-contain object-top"
                          />
                          <span className="mt-1 block text-[10px] text-muted-foreground group-hover:text-primary">
                            page {f.page} · {(f.bytes / 1024).toFixed(0)} KB
                          </span>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                      <ImageOff className="h-3 w-3" /> No publishable-resolution figure passed the curation filter for this paper —
                      all {p.figures_extracted_total ?? 0} extracted assets remain in the audit archive.
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
