"use client";

// FLAME EVIDENCE LAB — Knowledge Gap Explorer (brief §10)
// Registry gaps with explicit statuses + LIVE external verification via NASA NTRS
// (so a local coverage gap is never confused with a field-wide research gap)
// + persisted save shelf. Nothing is fabricated: external results are real API
// responses with citation URLs; failures are shown as failures.

import { useMemo, useState } from "react";
import { getGaps, getInvestigation, searchEvidence, type Gap } from "@/lib/data/catalog";
import { useAppStore } from "@/lib/app-store";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  BookMarked, BookmarkCheck, ExternalLink, Loader2, Search, ChevronDown, ChevronRight,
  CircleDot, FileText, ShieldQuestion, EyeOff, ArchiveX,
} from "lucide-react";

interface ExternalDocLite {
  id: string;
  title: string;
  url: string;
  date: string | null;
  center: string | null;
  kind: string;
}

interface GapCheckState {
  loading: boolean;
  error?: string;
  total?: number | null;
  docs?: ExternalDocLite[];
  classification?: string;
}

const STATUS_META: Record<Gap["status"], { label: string; icon: React.ComponentType<{ className?: string }>; cls: string }> = {
  absent: { label: "absent", icon: ArchiveX, cls: "border-muted-foreground/40 bg-muted/10 text-muted-foreground" },
  "not-indexed": { label: "not indexed", icon: CircleDot, cls: "border-[#5799d1]/40 bg-[#5799d1]/10 text-[#5799d1]" },
  inaccessible: { label: "inaccessible", icon: EyeOff, cls: "border-amber-500/40 bg-amber-500/10 text-amber-500" },
  "no-evidence-found": { label: "no evidence found", icon: ShieldQuestion, cls: "border-primary/40 bg-primary/10 text-primary" },
};

export function GapExplorer({ scopedAccession }: { scopedAccession?: string }) {
  const gaps = useMemo(() => getGaps(), []);
  const savedGaps = useAppStore((s) => s.savedGaps);
  const toggleSavedGap = useAppStore((s) => s.toggleSavedGap);
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  const setCopilotOpen = useAppStore((s) => s.setCopilotOpen);
  const setCopilotContext = useAppStore((s) => s.setCopilotContext);

  const [expanded, setExpanded] = useState<string | null>(null);
  const [checks, setChecks] = useState<Record<string, GapCheckState>>({});

  const visibleGaps = useMemo(
    () => (scopedAccession ? gaps.filter((g) => g.related.some((r) => r === scopedAccession || r.startsWith(scopedAccession))) : gaps),
    [gaps, scopedAccession],
  );
  const savedIds = new Set(savedGaps.map((s) => s.gapId));

  const runExternalCheck = async (gap: Gap) => {
    setChecks((c) => ({ ...c, [gap.id]: { loading: true } }));
    try {
      const res = await fetch("/api/external", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source: "ntrs", query: `${gap.topic} microgravity combustion`, limit: 5 }),
      });
      const data = (await res.json()) as { ok: boolean; total?: number | null; docs?: ExternalDocLite[]; error?: string };
      if (!data.ok) {
        setChecks((c) => ({ ...c, [gap.id]: { loading: false, error: data.error ?? "NTRS unavailable" } }));
        return;
      }
      const total = data.total ?? null;
      const classification = total && total > 0
        ? `External literature EXISTS (${total} NTRS matches) — this is a coverage gap in our index, not a field-wide gap.`
        : "No NTRS evidence found either — consistent with a genuine research gap (one source, not proof of absence).";
      setChecks((c) => ({ ...c, [gap.id]: { loading: false, total, docs: data.docs ?? [], classification } }));
    } catch (err) {
      setChecks((c) => ({ ...c, [gap.id]: { loading: false, error: (err as Error).message } }));
    }
  };

  const askCopilotAboutGap = (gap: Gap) => {
    setCopilotContext(`Research gap: ${gap.topic} (status: ${gap.status}). ${gap.detail}`);
    setCopilotOpen(true);
  };

  if (!visibleGaps.length) {
    return (
      <div className="rounded-xl border border-border/60 bg-card/40 p-6 text-center text-sm text-muted-foreground">
        No registered evidence gaps for this scope — gap discovery also runs in Compare and the Copilot.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* saved shelf */}
      {savedGaps.length > 0 && (
        <div className="glass-panel rounded-xl p-4">
          <p className="flex items-center gap-1.5 text-xs font-semibold text-primary">
            <BookmarkCheck className="h-3.5 w-3.5" /> Saved research gaps ({savedGaps.length})
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {savedGaps.map((s) => (
              <button
                key={s.id}
                onClick={() => toggleSavedGap({ gapId: s.gapId, topic: s.topic })}
                className="group flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-2.5 py-1 text-[11px] text-primary hover:border-primary/70"
                title="Click to unsave"
              >
                {s.topic}
                {typeof s.externalHits === "number" && <span className="font-mono text-[9px] text-muted-foreground">NTRS:{s.externalHits}</span>}
                <span className="hidden text-[9px] group-hover:inline">× remove</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* gap cards */}
      <div className="space-y-2">
        {visibleGaps.map((gap) => {
          const meta = STATUS_META[gap.status];
          const StatusIcon = meta.icon;
          const isOpen = expanded === gap.id;
          const check = checks[gap.id];
          const isSaved = savedIds.has(gap.id);
          const relatedInv = gap.related.map((r) => getInvestigation(r)).filter(Boolean);
          const localHits = isOpen ? searchEvidence(gap.topic, 3) : [];
          return (
            <div key={gap.id} className="glass-panel rounded-xl">
              <div className="flex items-start gap-3 p-4">
                <button
                  className="mt-0.5 rounded p-0.5 text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-ring"
                  onClick={() => setExpanded(isOpen ? null : gap.id)}
                  aria-expanded={isOpen}
                  aria-label={isOpen ? "Collapse gap details" : "Expand gap details"}
                >
                  {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                </button>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">{gap.id}</span>
                    <Badge variant="outline" className={`h-5 gap-1 px-1.5 text-[10px] ${meta.cls}`}>
                      <StatusIcon className="h-3 w-3" /> {meta.label}
                    </Badge>
                  </div>
                  <p className="mt-1 text-sm font-medium leading-snug">{gap.topic}</p>
                  <p className={`mt-1 text-[12px] leading-relaxed text-muted-foreground ${isOpen ? "" : "line-clamp-2"}`}>{gap.detail}</p>

                  {isOpen && (
                    <div className="mt-3 space-y-3 text-[12px]">
                      {relatedInv.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Related investigations</p>
                          <div className="mt-1 flex flex-wrap gap-1.5">
                            {relatedInv.map((inv) => (
                              <button
                                key={inv!.accession}
                                onClick={() => openInvestigation(inv!.accession)}
                                className="rounded-md border border-border/60 bg-accent/30 px-2 py-0.5 font-mono text-[11px] text-foreground/85 hover:border-primary/50"
                              >
                                {inv!.accession} · {inv!.shortLabel}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {localHits.length > 0 && (
                        <div>
                          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Nearest local evidence</p>
                          <ul className="mt-1 space-y-1">
                            {localHits.map((h) => (
                              <li key={h.id} className="flex items-start gap-1.5 text-muted-foreground">
                                <FileText className="mt-0.5 h-3 w-3 shrink-0" /> <span className="line-clamp-1">{h.title}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <p className="provenance-strip">{gap.specRef}</p>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <button
                    onClick={() => toggleSavedGap({ gapId: gap.id, topic: gap.topic, externalHits: check?.total ?? undefined })}
                    className={`rounded-md border p-1.5 transition-colors focus-visible:outline-2 focus-visible:outline-ring ${isSaved ? "border-primary/60 bg-primary/15 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-primary"}`}
                    aria-label={isSaved ? "Remove from saved gaps" : "Save this research gap"}
                    title={isSaved ? "Remove from saved gaps" : "Save this research gap"}
                  >
                    {isSaved ? <BookmarkCheck className="h-4 w-4" /> : <BookMarked className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {/* external verification strip */}
              <div className="border-t border-border/50 px-4 py-2.5">
                {check?.loading ? (
                  <p className="flex items-center gap-2 text-[11px] text-muted-foreground">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> Searching NASA NTRS live…
                  </p>
                ) : check?.error ? (
                  <p className="text-[11px] text-amber-500">
                    External check unavailable: {check.error} — no external claim made (honest failure).
                  </p>
                ) : check ? (
                  <div className="space-y-2">
                    <p className="text-[11px] font-medium text-foreground/90">{check.classification}</p>
                    {check.docs && check.docs.length > 0 && (
                      <ul className="space-y-1.5">
                        {check.docs.map((d) => (
                          <li key={d.id}>
                            <a
                              href={d.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="group flex items-start gap-1.5 text-[11px] text-[#5799d1] hover:underline"
                            >
                              <ExternalLink className="mt-0.5 h-3 w-3 shrink-0" />
                              <span>
                                {d.title}
                                <span className="ml-1 text-muted-foreground">
                                  ({d.date?.slice(0, 10) ?? "n.d."} · {d.center ?? "NASA"} · {d.kind})
                                </span>
                              </span>
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                    <p className="text-[10px] text-muted-foreground">
                      Live results from NASA NTRS (ntrs.nasa.gov) — fetched at view time; cached ≤10 min server-side.
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-2">
                    <Button size="sm" variant="outline" className="h-7 gap-1.5 border-border/60 px-2.5 text-[11px]" onClick={() => runExternalCheck(gap)}>
                      <Search className="h-3 w-3" /> Verify in NASA NTRS (live)
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 gap-1.5 px-2.5 text-[11px] text-muted-foreground" onClick={() => askCopilotAboutGap(gap)}>
                      Ask the Copilot
                    </Button>
                    <span className="text-[10px] text-muted-foreground">A local gap is not a field-wide gap — verify externally before concluding.</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
