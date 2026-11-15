"use client";

// ZERO FLARE — DemoWalkthrough (Phase 5 W3 rewrite): a 9-stop guided tour in
// navigation order. Navigates the real app via the store; spotlights a stable
// [data-tour] anchor per stop; the CIR-1 stop seeds a labelled, deterministic
// reply (no LLM). Skippable, restartable, keyboard- and touch-accessible,
// reduced-motion safe. Panel is near-opaque (97%) for readability.

import { useCallback, useEffect, useRef, useState } from "react";
import { useAppStore } from "@/lib/app-store";
import { DEMO_STEPS, composeDemoCopilotReply, type DemoStep } from "@/lib/demo/script";
import { Button } from "@/components/ui/button";
import { X, ChevronLeft, ChevronRight, Play, Info, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export const DEMO_SEED_EVENT = "flame:copilot-seed";

interface Rect {
  top: number;
  left: number;
  width: number;
  height: number;
}

function measureTarget(target: string): Rect | null {
  const el = document.querySelector<HTMLElement>(`[data-tour="${target}"]`);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 4 || r.height < 4) return null;
  // pad the spotlight so the target breathes inside the dimmed page
  const pad = 8;
  return {
    top: Math.max(0, r.top - pad),
    left: Math.max(0, r.left - pad),
    width: Math.min(window.innerWidth, r.width + pad * 2),
    height: r.height + pad * 2,
  };
}

export function DemoWalkthrough({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [stepIdx, setStepIdx] = useState(0);
  const [spot, setSpot] = useState<Rect | null>(null);
  const step: DemoStep = DEMO_STEPS[stepIdx];
  const panelRef = useRef<HTMLDivElement>(null);

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
    if (step.action?.copilotOpen) {
      s.setCopilotOpen(true);
    }
    if (step.action?.copilotSeed) {
      const { user, assistant, tools } = composeDemoCopilotReply();
      window.dispatchEvent(new CustomEvent(DEMO_SEED_EVENT, { detail: { user, assistant, tools } }));
    }
  }, [open, stepIdx, step]);

  // spotlight: measure after the view transition settles, re-measure on resize/scroll.
  // (no state reset on close is needed — the component renders nothing when !open,
  // and the effect re-measures on every open/step change)
  useEffect(() => {
    if (!open) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    const update = () => {
      raf = 0;
      setSpot(measureTarget(step.target));
    };
    const schedule = (delay: number) => {
      if (raf) window.clearTimeout(raf);
      raf = window.setTimeout(update, delay);
    };
    schedule(reduced ? 80 : 420); // let the view render + settle
    const onResize = () => schedule(reduced ? 80 : 200);
    window.addEventListener("resize", onResize);
    window.addEventListener("scroll", onResize, true);
    return () => {
      if (raf) window.clearTimeout(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onResize, true);
    };
  }, [open, stepIdx, step]);

  // move focus into the dialog when it opens
  useEffect(() => {
    if (open) panelRef.current?.focus();
  }, [open]);

  const exit = useCallback(() => {
    setStepIdx(0);
    onClose();
  }, [onClose]);

  const restart = useCallback(() => setStepIdx(0), []);

  // Escape exits; arrows navigate; Enter advances
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") exit();
      if (e.key === "ArrowRight" || e.key === "Enter") {
        if (stepIdx < DEMO_STEPS.length - 1) setStepIdx((i) => i + 1);
      }
      if (e.key === "ArrowLeft" && stepIdx > 0) setStepIdx((i) => i - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, stepIdx, exit]);

  if (!open) return null;

  const last = stepIdx === DEMO_STEPS.length - 1;

  return (
    <>
      {/* page dim + spotlight cut-out (non-blocking: pointer-events none, so the
          judge can still scroll or explore underneath) */}
      {spot && (
        <div
          aria-hidden="true"
          className="pointer-events-none fixed z-[65] rounded-xl border-2 border-[#97e2fe]/70"
          style={{
            top: spot.top,
            left: spot.left,
            width: spot.width,
            height: spot.height,
            boxShadow: "0 0 0 9999px rgba(3, 8, 24, 0.55)",
            transition: "top 240ms ease, left 240ms ease, width 240ms ease, height 240ms ease",
          }}
        />
      )}

      <div
        role="dialog"
        aria-label="ZERO FLARE guided tour"
        aria-modal="false"
        className="fixed inset-x-0 bottom-0 z-[70] sm:inset-x-auto sm:bottom-4 sm:left-4 sm:max-w-md"
      >
        <div ref={panelRef} tabIndex={-1} className="tour-panel rounded-t-xl border-[#97e2fe]/30 p-4 shadow-2xl outline-none sm:rounded-xl">
          <div className="flex items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.18em] text-[#97e2fe]">
              <Play className="h-3 w-3" aria-hidden="true" /> Guided tour · step {stepIdx + 1}/{DEMO_STEPS.length}
            </p>
            <button
              onClick={exit}
              aria-label="Close the tour"
              className="rounded p-1 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <h3 className="mt-2 text-sm font-semibold leading-snug">{step.title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-foreground/85">{step.caption}</p>
          <p className="mt-2 flex items-start gap-1.5 rounded-md border border-[#5799d1]/35 bg-[#5799d1]/10 px-2.5 py-1.5 text-[11px] leading-snug text-[#9ccae9]">
            <Info className="mt-0.5 h-3 w-3 shrink-0" aria-hidden="true" />
            {step.why}
          </p>

          {/* progress dots — buttons keep their button role (never override interactive roles) */}
          <div className="mt-3 flex items-center gap-1.5" aria-label="Tour progress">
            {DEMO_STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStepIdx(i)}
                aria-label={`Go to stop ${i + 1}: ${s.title}`}
                aria-current={i === stepIdx ? "step" : undefined}
                className={cn(
                  "h-1.5 rounded-full transition-all",
                  i === stepIdx ? "w-6 bg-[#97e2fe]" : i < stepIdx ? "w-1.5 bg-[#97e2fe]/50" : "w-1.5 bg-border",
                )}
              />
            ))}
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-9 gap-1 text-xs"
              onClick={() => setStepIdx((i) => Math.max(0, i - 1))}
              disabled={stepIdx === 0}
            >
              <ChevronLeft className="h-3.5 w-3.5" /> Back
            </Button>
            <span className="font-mono text-[10px] text-muted-foreground">9 stops · about 2 minutes</span>
            {last ? (
              <span className="flex items-center gap-1.5">
                <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs" onClick={restart}>
                  <RotateCcw className="h-3.5 w-3.5" /> Restart
                </Button>
                <Button
                  size="sm"
                  className="h-9 gap-1 bg-gradient-to-r from-[#b45a2b] to-[#a34d28] text-xs text-white hover:brightness-110"
                  onClick={exit}
                >
                  <Play className="h-3.5 w-3.5" /> Start researching
                </Button>
              </span>
            ) : (
              <Button
                size="sm"
                className="h-9 gap-1 bg-gradient-to-r from-[#b45a2b] to-[#a34d28] text-xs text-white hover:brightness-110"
                onClick={() => setStepIdx((i) => i + 1)}
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
          {/* Skip — always available, never the only way out */}
          <button
            onClick={exit}
            className="mt-2 w-full rounded py-1 text-center text-[11px] text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Skip the tour
          </button>
        </div>
      </div>
    </>
  );
}

/** Store bridge for the demo trigger. */
export function useDemoControl() {
  const [open, setOpen] = useState(false);
  return { open, setOpen };
}
