"use client";

import { useAppStore, VIEW_META, type ViewId, type AdvancedPanel } from "@/lib/app-store";
import { getInvestigation } from "@/lib/data/catalog";
import { ChevronRight } from "lucide-react";

const ADV_LABELS: Record<AdvancedPanel, string> = {
  "model-studio": "Model Studio",
  "math-models": "Mathematical Models",
  variables: "Variable Dictionary",
  equations: "Equation Registry",
  evaluation: "AI Evaluation",
  diagnostics: "Diagnostics & Reconciliation",
};

export function Breadcrumbs() {
  const { view, advancedPanel, selectedInvestigation } = useAppStore();
  const inv = selectedInvestigation ? getInvestigation(selectedInvestigation) : undefined;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground px-1">
      <button onClick={() => useAppStore.getState().setView("mission")} className="hover:text-foreground transition-colors">FLAME EVIDENCE LAB</button>
      <ChevronRight className="h-3 w-3" aria-hidden="true" />
      <span className={selectedInvestigation && view === "investigations" ? "" : "text-foreground"}>{VIEW_META[view].label}</span>
      {view === "tools" && (
        <>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-foreground">{ADV_LABELS[advancedPanel]}</span>
        </>
      )}
      {view === "investigations" && inv && (
        <>
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
          <span className="text-foreground font-mono">{inv.accession}</span>
          <span className="hidden sm:inline text-muted-foreground">· {inv.shortLabel}</span>
        </>
      )}
    </nav>
  );
}
