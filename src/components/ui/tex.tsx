"use client";

/**
 * ZERO FLARE — TeX (Phase 5+ / equation typesetting).
 *
 * Renders a LaTeX string with KaTeX (no MathJax runtime needed). Used for
 * every equation display: the Equation Registry option list and detail
 * dialog, the Scenario equation resolver, and the investigation equation
 * cards. Formulas, calculations and outputs are untouched — this only
 * changes how the same mathematics is typeset.
 *
 * Safety: KaTeX renderToString with throwOnError:false never executes
 * scripts and does not accept arbitrary HTML — output is safe to inject.
 * If a string is not valid LaTeX, KaTeX renders it as red error text
 * instead of throwing, so a display bug can never break the page.
 */

import { useMemo } from "react";
import katex from "katex";
import "katex/dist/katex.min.css";
import { cn } from "@/lib/utils";

export function TeX({
  math,
  block = false,
  className,
  ariaLabel,
}: {
  math: string;
  /** block = display mode (centered, larger fractions); default inline */
  block?: boolean;
  className?: string;
  ariaLabel?: string;
}) {
  const html = useMemo(
    () =>
      katex.renderToString(math, {
        throwOnError: false,
        displayMode: block,
        output: "html",
        strict: false,
        trust: false,
      }),
    [math, block],
  );
  return (
    <span
      role={ariaLabel ? "math" : undefined}
      aria-label={ariaLabel}
      className={cn(block ? "block overflow-x-auto text-center" : "inline-block", className)}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
