"use client";

// ZERO FLARE — SaveItemButton: the universal "save to My Work" affordance.
// One bookmark control reused on investigations, gaps, equations, equipment
// and media so the My Work shelf is actually reachable from where research
// happens (M1 acceptance: saving is contextual, not a separate destination).

import { Bookmark, BookmarkCheck } from "lucide-react";
import { useAppStore, type SavedItemKind } from "@/lib/app-store";
import { cn } from "@/lib/utils";

interface SaveItemButtonProps {
  kind: SavedItemKind;
  label: string;
  detail?: string;
  url?: string;
  className?: string;
  /** "icon" renders a compact bookmark-only control (for tight toolbars). */
  variant?: "labeled" | "icon";
}

export function SaveItemButton({ kind, label, detail, url, className, variant = "labeled" }: SaveItemButtonProps) {
  const savedItems = useAppStore((s) => s.savedItems);
  const toggleSavedItem = useAppStore((s) => s.toggleSavedItem);
  const saved = savedItems.some((it) => it.kind === kind && it.label === label);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleSavedItem({ kind, label, detail, url });
      }}
      aria-pressed={saved}
      aria-label={saved ? `Remove ${label} from My Work` : `Save ${label} to My Work`}
      title={saved ? "Saved to My Work — click to remove" : "Save to My Work"}
      className={cn(
        "inline-flex shrink-0 items-center gap-1.5 rounded-md border text-xs font-medium transition-colors",
        saved
          ? "border-primary/60 bg-primary/15 text-primary"
          : "border-border/60 bg-accent/30 text-muted-foreground hover:border-primary/50 hover:text-foreground",
        variant === "icon" ? "h-7 w-7 justify-center" : "h-7 px-2.5",
        className,
      )}
    >
      {saved ? <BookmarkCheck className="h-3.5 w-3.5" aria-hidden="true" /> : <Bookmark className="h-3.5 w-3.5" aria-hidden="true" />}
      {variant !== "icon" && <span>{saved ? "Saved" : "Save"}</span>}
    </button>
  );
}
