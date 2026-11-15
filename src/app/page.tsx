"use client";

import { useEffect } from "react";
import { useAppStore, parseHash } from "@/lib/app-store";
import { MegaNav } from "@/components/flame/shell/MegaNav";
import { Breadcrumbs } from "@/components/flame/shell/Breadcrumbs";
import { CopilotDock } from "@/components/flame/copilot/CopilotDock";
import { MissionView } from "@/components/flame/mission/MissionView";
import { InvestigationsView } from "@/components/flame/investigations/InvestigationsView";
import { CompareView } from "@/components/flame/compare/CompareView";
import { ScenariosView } from "@/components/flame/scenarios/ScenariosView";
import { Lab3DView } from "@/components/flame/lab3d/Lab3DView";
import { IngestionView } from "@/components/flame/ingestion/IngestionView";
import { AdvancedView } from "@/components/flame/advanced/AdvancedView";
import { MyWorkView } from "@/components/flame/mywork/MyWorkView";
import { DemoWalkthrough } from "@/components/flame/demo/DemoWalkthrough";

export default function Home() {
  const view = useAppStore((s) => s.view);
  const demoOpen = useAppStore((s) => s.demoOpen);

  // M1 — hash deep links: #investigations, #investigation/PSI-69/data, #scenarios …
  useEffect(() => {
    const apply = () => {
      const parsed = parseHash(window.location.hash);
      if (!parsed) return;
      const s = useAppStore.getState();
      if (parsed.view && parsed.view !== s.view) s.setView(parsed.view);
      if (parsed.investigation) s.openInvestigation(parsed.investigation, (parsed.tab as never) ?? undefined);
      if (parsed.tab && !parsed.investigation) {
        if (parsed.view === "scenarios" && ["prevention", "detection", "prediction", "suppression"].includes(parsed.tab)) {
          s.setScenarioPillar(parsed.tab as never);
        }
        if (parsed.view === "data-sources" && ["ingestion", "sources", "media"].includes(parsed.tab)) {
          s.setDataSourceTab(parsed.tab as never);
        }
      }
    };
    apply(); // hydrate from the initial URL
    window.addEventListener("hashchange", apply);
    return () => window.removeEventListener("hashchange", apply);
  }, []);

  return (
    <div className="min-h-screen flex flex-col space-deep text-foreground">
      <MegaNav />
      <main className="flex-1 mx-auto w-full max-w-[1600px] px-3 sm:px-6 py-4 sm:py-6">
        {/* breadcrumb hidden on Mission — the full-bleed hero sits flush under the header */}
        {view !== "mission" && (
          <div className="mb-3"><Breadcrumbs /></div>
        )}
        {/* data-tour anchors — stable targets for the guided tour spotlight (Phase 5 W3) */}
        {view === "mission" && <div data-tour="tour-mission"><MissionView /></div>}
        {view === "investigations" && <div data-tour="tour-investigations"><InvestigationsView /></div>}
        {view === "compare" && <div data-tour="tour-compare"><CompareView /></div>}
        {view === "scenarios" && <div data-tour="tour-scenarios"><ScenariosView /></div>}
        {view === "lab3d" && <div data-tour="tour-lab3d"><Lab3DView /></div>}
        {view === "data-sources" && <div data-tour="tour-data-sources"><IngestionView /></div>}
        {view === "my-work" && <div data-tour="tour-my-work"><MyWorkView /></div>}
        {view === "tools" && <div data-tour="tour-tools"><AdvancedView /></div>}
      </main>
      <footer className="mt-auto border-t border-border/40 bg-[color:var(--space-deep)]/80 pb-14 sm:pb-12">
        <div className="mx-auto max-w-[1600px] px-4 py-5 text-[11px] leading-relaxed text-muted-foreground grid gap-3 md:grid-cols-3">
          <div>
            <div className="font-semibold text-foreground/90">ZERO FLARE — FLAME EVIDENCE LAB</div>
            NASA Space Apps 2026 · Flame in Freefall. Research decision support over NASA microgravity combustion
            evidence, with CIR-1 as the evidence-grounded research copilot.{" "}
            <span className="text-foreground/80">Not a certified spacecraft fire-protection system.</span>
          </div>
          <div>
            <div className="font-semibold text-foreground/90">Honesty contract</div>
            Every number is recomputed from recovered NASA PSI tables (SHA-256-verified) or produced by the verified
            equation registry. Missing data stays missing. Models refuse out-of-domain inputs. Landing pages are
            labelled landing pages. Negative results stay visible.
          </div>
          <div>
            <div className="font-semibold text-foreground/90">Sources</div>
            Evidence: NASA Physical Sciences Informatics (psi.nasa.gov) · Media: NASA Images and Video Library
            (credit NASA) · Literature: NASA NTRS. The 2,393 historical media binaries remain unrecovered —
            status shown honestly in Data &amp; Sources; external leads are labelled “not ingested”.
          </div>
        </div>
      </footer>
      <CopilotDock />
      <DemoWalkthrough open={demoOpen} onClose={() => useAppStore.getState().setDemoOpen(false)} />
    </div>
  );
}
