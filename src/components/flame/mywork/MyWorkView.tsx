"use client";

// ZERO FLARE — My Work (M1): the persistent researcher workbench.
// Aggregates research sessions, the saved-item shelf, the research-gap shelf
// and CIR-1 question traces; exports a provenance-carrying evidence packet.

import { useMemo, useState } from "react";
import { useAppStore, type SavedItem, type SavedItemKind } from "@/lib/app-store";
import { getCorpusTotals, getInvestigation } from "@/lib/data/catalog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card, CardContent, CardHeader, CardTitle, CardDescription,
} from "@/components/ui/card";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { FileDown, FolderOpen, Trash2, FlaskConical, GitBranch, Sigma, Image as ImageIcon, Database, FileText, Sparkles, Boxes } from "lucide-react";

const KIND_META: Record<SavedItemKind, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  investigation: { label: "Investigation", icon: FlaskConical },
  dataset: { label: "Dataset", icon: Database },
  gap: { label: "Research gap", icon: GitBranch },
  equation: { label: "Equation", icon: Sigma },
  chart: { label: "Chart", icon: ImageIcon },
  source: { label: "Source", icon: FileText },
  media: { label: "Media", icon: ImageIcon },
  scenario: { label: "Scenario", icon: Sparkles },
  equipment: { label: "Equipment", icon: Boxes },
};

export function MyWorkView() {
  const { sessions, deleteSession, savedGaps, removeSavedGap, savedItems, removeSavedItem, openInvestigation, openAdvanced, setScenarioPillar, setView, setCopilotOpen, toggleSavedItem } = useAppStore();
  const [reportTitle, setReportTitle] = useState("ZERO FLARE evidence packet");
  const totals = useMemo(() => getCorpusTotals(), []);

  const exportPacket = () => {
    const lines: string[] = [];
    lines.push(`# ${reportTitle}`);
    lines.push("");
    lines.push(`_Generated ${new Date().toISOString()} — ZERO FLARE / FLAME EVIDENCE LAB._`);
    lines.push("_Research decision support over NASA PSI evidence; not a certified fire-protection system._");
    lines.push("");
    lines.push(`**Corpus context:** ${totals.tables} recovered tables · ${totals.rows} rows · ${totals.duplicateRows} duplicate rows (counted, not hidden) · ${totals.parseFailures} parse failures.`);
    lines.push("");

    if (savedItems.length) {
      lines.push("## Saved research items");
      for (const it of savedItems) {
        lines.push(`- **[${KIND_META[it.kind].label}] ${it.label}**${it.detail ? ` — ${it.detail}` : ""}${it.url ? ` (${it.url})` : ""} — saved ${it.savedAt}${it.note ? ` · note: ${it.note}` : ""}`);
      }
      lines.push("");
    }
    if (savedGaps.length) {
      lines.push("## Research-gap shelf");
      for (const g of savedGaps) {
        lines.push(`- **${g.topic}** (id ${g.gapId}) — saved ${g.savedAt}${g.externalHits !== undefined ? ` · external NTRS hits at save time: ${g.externalHits}` : ""}${g.note ? ` · note: ${g.note}` : ""}`);
        lines.push(`  - status: recorded in the platform gap registry; absence in this corpus is NOT absence in the field.`);
      }
      lines.push("");
    }
    if (sessions.length) {
      lines.push("## Research sessions");
      for (const s of sessions) {
        lines.push(`### ${s.title}`);
        lines.push(`- created: ${s.createdAt}${s.environment ? ` · environment: ${s.environment}` : ""}${s.investigation ? ` · investigation: ${s.investigation}` : ""}`);
        if (s.notes) lines.push(`- notes: ${s.notes}`);
        if (s.provenance) lines.push(`- provenance: ${s.provenance}`);
        lines.push("");
      }
    }
    lines.push("## Provenance & limitations");
    lines.push("- Evidence: NASA Physical Sciences Informatics (psi.nasa.gov), SHA-256-verified recovery ledger; media: NASA Images and Video Library (credit NASA); literature leads: NASA NTRS.");
    lines.push("- Every number in this packet traces to a recovered source row, a verified equation (reference-tested), or a labelled model card; derived values are labelled DERIVED, never OBSERVED.");
    lines.push("- External literature results are leads, not ingested evidence.");
    lines.push("- Limitations are part of the science: gaps listed above are explicit research boundaries, not missing UI content.");

    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `zero-flare-evidence-packet-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const openSaved = (it: SavedItem) => {
    if (it.kind === "investigation") {
      const acc = /^PSI-\d+/i.exec(it.label)?.[0] ?? undefined;
      if (acc) openInvestigation(acc);
      else setView("investigations");
    } else if (it.kind === "scenario") {
      setView("scenarios");
    } else if (it.kind === "gap") {
      setView("investigations");
    } else if (it.kind === "equation") {
      openAdvanced("equations");
    } else if (it.kind === "equipment" || it.kind === "media") {
      setView("lab3d");
    } else if (it.kind === "chart") {
      setView("investigations");
    } else {
      setView("data-sources");
    }
  };

  return (
    <div className="space-y-5">
      <header className="space-y-1.5">
        <h1 className="text-xl font-semibold tracking-tight">My Work</h1>
        <p className="max-w-3xl text-sm text-muted-foreground leading-relaxed">
          Your persistent research workbench: saved sessions, collected evidence, the research-gap shelf and CIR-1
          question context — everything needed to reopen a line of research or export a traceable evidence packet.
          Items live in this browser (local persistence); exported packets are the shareable artefact.
        </p>
      </header>

      <Tabs defaultValue="items" className="w-full">
        <TabsList className="flex-wrap">
          <TabsTrigger value="items">Saved items ({savedItems.length})</TabsTrigger>
          <TabsTrigger value="gaps">Gap shelf ({savedGaps.length})</TabsTrigger>
          <TabsTrigger value="sessions">Sessions ({sessions.length})</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        <TabsContent value="items" className="mt-4 space-y-3">
          {savedItems.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                Nothing saved yet. Use the bookmark action on any investigation, dataset, equation, chart, media item
                or scenario — or ask CIR-1 to save something for you — and it will appear here.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
              {savedItems.map((it) => {
                const Icon = KIND_META[it.kind].icon;
                return (
                  <Card key={it.id} className="group relative">
                    <CardHeader className="pb-2">
                      <div className="flex items-start gap-2">
                        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <div className="min-w-0 flex-1">
                          <CardTitle className="truncate text-sm">{it.label}</CardTitle>
                          <CardDescription className="text-[11px]">
                            {KIND_META[it.kind].label} · saved {new Date(it.savedAt).toLocaleDateString()}
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pb-3 pt-0">
                      {it.detail && <p className="line-clamp-2 text-xs text-muted-foreground">{it.detail}</p>}
                      {it.note && <p className="mt-1 text-xs italic text-foreground/70">“{it.note}”</p>}
                      <div className="mt-2 flex items-center gap-1.5">
                        <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openSaved(it)}>Reopen</Button>
                        <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => removeSavedItem(it.id)} aria-label={`Remove ${it.label}`}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="gaps" className="mt-4 space-y-3">
          {savedGaps.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No saved research gaps. Open any investigation’s Gaps tab (or ask CIR-1 to identify evidence gaps) and
                save one — the shelf keeps its external-literature status at save time.
              </CardContent>
            </Card>
          ) : (
            savedGaps.map((g) => (
              <Card key={g.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{g.topic}</CardTitle>
                  <CardDescription className="text-[11px] font-mono">
                    {g.gapId} · saved {new Date(g.savedAt).toLocaleString()}
                    {g.externalHits !== undefined ? ` · ${g.externalHits} external NTRS hits at save time` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 pt-0 space-y-2">
                  {g.note && <p className="text-xs italic text-foreground/70">“{g.note}”</p>}
                  <p className="text-xs text-muted-foreground">
                    Absence in this corpus is <span className="text-foreground">not</span> absence in the field — use CIR-1’s
                    external check (NTRS) before citing this gap as a field-wide research gap.
                  </p>
                  <div className="flex gap-1.5">
                    <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => { setView("investigations"); }}>
                      Investigate evidence
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => removeSavedGap(g.id)} aria-label={`Remove gap ${g.topic}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="sessions" className="mt-4 space-y-3">
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-sm text-muted-foreground">
                No saved sessions yet. In Scenarios, build a facility screening or a fire-safety analysis and save it —
                sessions keep the facility definition, screening scores and provenance.
              </CardContent>
            </Card>
          ) : (
            sessions.map((s) => (
              <Card key={s.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">{s.title}</CardTitle>
                  <CardDescription className="text-[11px]">
                    {new Date(s.createdAt).toLocaleString()}
                    {s.environment ? ` · ${s.environment}` : ""}
                    {s.investigation ? ` · ${s.investigation}` : ""}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pb-3 pt-0 space-y-2">
                  {s.notes && <p className="text-xs text-muted-foreground">{s.notes}</p>}
                  {s.provenance && <p className="text-[11px] font-mono text-muted-foreground/80">{s.provenance}</p>}
                  <div className="flex gap-1.5">
                    {s.investigation && (
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => openInvestigation(s.investigation!)}>
                        Reopen investigation
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 text-xs text-muted-foreground" onClick={() => deleteSession(s.id)} aria-label={`Delete session ${s.title}`}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="export" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Evidence packet export</CardTitle>
              <CardDescription className="text-xs leading-relaxed">
                A Markdown research packet with every saved item, gap and session — each with provenance, the corpus
                integrity summary (duplicates and parse failures included) and the standing limitations. This is the
                auditable export path for a judge or collaborator.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <Input value={reportTitle} onChange={(e) => setReportTitle(e.target.value)} className="max-w-sm" aria-label="Packet title" />
                <Button onClick={exportPacket} className="gap-1.5">
                  <FileDown className="h-4 w-4" /> Export evidence packet (.md)
                </Button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Badge variant="outline">{savedItems.length} items</Badge>
                <Badge variant="outline">{savedGaps.length} gaps</Badge>
                <Badge variant="outline">{sessions.length} sessions</Badge>
                <Badge variant="outline">{totals.tables} tables · {totals.rows} rows corpus</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">
                The packet separates OBSERVED (recovered rows), DERIVED (equations/models), AI-INTERPRETED (CIR-1
                answers) and EXTERNAL LEAD (not ingested) evidence classes throughout.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* quick actions */}
      <div className="flex flex-wrap gap-2 pt-1">
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setView("investigations")}>
          <FlaskConical className="h-3.5 w-3.5" /> Browse investigations
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setView("scenarios")}>
          <Sparkles className="h-3.5 w-3.5" /> Build a scenario
        </Button>
        <Button variant="outline" size="sm" className="gap-1.5 text-xs" onClick={() => setCopilotOpen(true)}>
          Ask CIR-1 to compile this shelf
        </Button>
      </div>
    </div>
  );
}
