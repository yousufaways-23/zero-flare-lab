"use client";

// ZERO FLARE — DemoWalkthrough (audit §39): the deterministic 90-second judge
// journey as a guided overlay. Navigates the real app via the store; the
// CIR-1 step seeds a labelled, deterministically-composed reply (no LLM).
// Skippable, keyboard-accessible, reduced-motion safe.

import { useCallback, useEffect, useState } from "react";
import { useAppStore } from "@/lib/app-store";
import { DEMO_STEPS, composeDemoCopilotReply, type DemoStep } from "@/lib/demo/script";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export const DEMO_SEED_EVENT = "flame:copilot-seed";

export function DemoWalkthrough({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const step: DemoStep = DEMO_STEPS[stepIdx];
  const setView = useAppStore((s) => s.setView);

  // apply the step's navigation actions
  useEffect(() => {
    if (!open) return;
    const s = useAppStore.getState();
    s.setView(step.view);
    if (step.action?.investigation) {
      s.openInvestigation(step.action.investigation, step.action.investigationTab ?? "overview");
    }
    if (step.action?.equipment) {
      s.setSelectedEquipment(step.action.equipment);
    }
    if (step.action?.compare) {
      s.clearCompare();
      for (const acc of step.action.compare) s.toggleCompare(acc);
      s.setView("compare");
    }
    if (step.action?.copilotSeed) {
      const { user, assistant, tools } = composeDemoCopilotReply();
      window.dispatchEvent(new CustomEvent(DEMO_SEED_EVENT, { detail: { user, assistant, tools } }));
    }
  }, [open, stepIdx, step]);

  const exit = useCallback(() => {
    setStepIdx(0);
    onClose();
  }, [onClose]);

  // Escape exits; arrows navigate
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      if (e.key === "ArrowRight" && stepIdx < DEMO_STEPS.length - 1) setStepIdx((i) => i + 1);
      if (e.key === "ArrowLeft" && stepIdx > 0) setStepIdx((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stepIdx, exit]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-label="ZERO FLARE guided demonstration"
      className="fixed inset-x-0 bottom-0 z-[70] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-md"
    >
      <div className="glass-panel rounded-t-xl border-primary/50 p-4 shadow-2xl sm:rounded-xl">
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-primary">
            <Play className="h-3 w-3" aria-hidden="true" /> Guided demo · step {stepIdx + 1}/{DEMO_STEPS.length}
          </p>
          <button
            onClick={exit}
            aria-label="Exit the demonstration"
            className="rounded p-1 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <h3 className="mt-2 text-sm font-semibold leading-snug">{step.title}</h3>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{step.caption}</p>
        <p className="mt-2 flex items-start gap-1.5 rounded-md border border-[#5799d1]/35 bg-[#5799d1]/10 px-2.5 py-1.5 text-[11px] leading-snug text-[#9ccae9]">
          <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
          {step.why}
        </p>

        {/* progress dots — buttons keep their button role (never override interactive roles) */}
        <div className="mt-3 flex items-center gap-1.5" aria-label="Demo progress">
          {DEMO_STEPS.map((s, i) => (
            <button
              key={s.id}
              onClick={() => setStepIdx(i)}
              aria-label={`Go to step ${i + 1}: ${s.title}`}
              aria-current={i === stepIdx ? "step" : undefined}
              className={cn(
                "h-1.5 rounded-full transition-all",
                i === stepIdx ? "w-6 bg-primary" : i < stepIdx ? "w-1.5 bg-primary/50" : "w-1.5 bg-border",
              )}
            />
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 gap-1 text-xs"
            onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
            disabled={stepIdx === 0}
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Back
          </Button>
          <span className="font-mono text-[10px] text-muted-foreground">deterministic replay · no network needed</span>
          {stepIdx < DEMO_STEPS.length - 1 ? (
            <Button size="sm" className="h-8 gap-1 bg-gradient-to-r from-[#b45a2b] to-[#a34d28] text-xs text-white hover:brightness-110" onClick={() => setStepIdx((i) => i + 1)}>
              Next <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button size="sm" className="h-8 gap-1 bg-gradient-to-r from-[#b45a2b] to-[#a34d28] text-xs text-white hover:brightness-110" onClick={exit}>
              <Play className="h-3.5 w-3.5" /> Start researching
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Store bridge for the demo trigger. */
export function useDemoControl() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
