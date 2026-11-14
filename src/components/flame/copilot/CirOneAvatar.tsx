"use client";

// ZERO FLARE — CirOneAvatar: a lightweight 2D SVG astronaut character for
// CIR-1 (§7). Pure vector + CSS animation (no assets, reduced-motion safe);
// states: idle | thinking | speaking. This is a PRODUCT GUIDE character —
// explicitly not a real astronaut or NASA representative.

import { cn } from "@/lib/utils";

export type AvatarState = "idle" | "thinking" | "speaking";

export function CirOneAvatar({ state = "idle", size = 64, className }: { state?: AvatarState; size?: number; className?: string }) {
  return (
    <div
      className={cn("relative shrink-0 select-none", className)}
      style={{ width: size, height: size }}
      role="img"
      aria-label={`CIR-1 guide character — ${state === "speaking" ? "speaking" : state === "thinking" ? "thinking" : "standing by"}`}
    >
      <svg viewBox="0 0 64 64" width={size} height={size} className="overflow-visible">
        {/* soft drop glow */}
        <ellipse cx="32" cy="59" rx="14" ry="2.5" fill="#4784d9" opacity="0.25" />

        {/* body group — gentle float in idle (CSS, reduced-motion disables) */}
        <g className={cn(state === "idle" && "cir-float")}>
          {/* backpack */}
          <rect x="22" y="30" width="20" height="16" rx="4" fill="#16296b" stroke="#2c3f7e" />
          {/* torso */}
          <path d="M22 32 Q32 28 42 32 L44 48 Q32 53 20 48 Z" fill="#dce7fb" stroke="#8fa2c8" strokeWidth="1" />
          {/* CIR-1 chest badge */}
          <rect x="27" y="36" width="10" height="6" rx="1.5" fill="#0a1638" stroke="#4784d9" strokeWidth="0.8" />
          <text x="32" y="40.6" textAnchor="middle" fontSize="4" fill="#97e2fe" fontFamily="var(--font-mono), monospace" fontWeight="600">CIR-1</text>
          {/* arms */}
          <path d="M22 34 Q17 38 18 44" stroke="#dce7fb" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          <path d="M42 34 Q47 38 46 44" stroke="#dce7fb" strokeWidth="4.5" strokeLinecap="round" fill="none" />
          {/* gloves */}
          <circle cx="18" cy="45" r="2.6" fill="#8fa2c8" />
          <circle cx="46" cy="45" r="2.6" fill="#8fa2c8" />
          {/* legs */}
          <path d="M26 49 L25 57" stroke="#dce7fb" strokeWidth="5" strokeLinecap="round" />
          <path d="M38 49 L39 57" stroke="#dce7fb" strokeWidth="5" strokeLinecap="round" />
          <rect x="21.5" y="56" width="8" height="3.4" rx="1.6" fill="#8fa2c8" />
          <rect x="35.5" y="56" width="8" height="3.4" rx="1.6" fill="#8fa2c8" />

          {/* helmet */}
          <circle cx="32" cy="20" r="12.5" fill="#e9eefb" stroke="#8fa2c8" strokeWidth="1.4" />
          {/* visor */}
          <path d="M21.5 18 Q32 10.5 42.5 18 Q43 26 32 27.5 Q21 26 21.5 18 Z" fill="#0a1638" stroke="#4784d9" strokeWidth="1.2" />
          {/* visor reflection */}
          <path d="M25 17.5 Q29 13.5 34 14.5" stroke="#97e2fe" strokeWidth="1.4" strokeLinecap="round" fill="none" opacity="0.8" />
          {/* helmet light strip */}
          <rect x="26" y="8.2" width="12" height="2" rx="1" fill="#4784d9" />

          {/* antenna */}
          <path d="M42 12 L46 7" stroke="#8fa2c8" strokeWidth="1.2" />
          <circle cx="46.6" cy="6.4" r="1.6" fill={state === "thinking" || state === "speaking" ? "#97e2fe" : "#4784d9"} className={state !== "idle" ? "cir-pulse" : undefined} />
        </g>

        {/* state indicators */}
        {state === "thinking" && (
          <g className="cir-float">
            <circle cx="49" cy="14" r="1.6" fill="#97e2fe" className="cir-dot cir-dot-1" />
            <circle cx="53" cy="11" r="1.6" fill="#97e2fe" className="cir-dot cir-dot-2" />
            <circle cx="57" cy="8" r="1.6" fill="#97e2fe" className="cir-dot cir-dot-3" />
          </g>
        )}
        {state === "speaking" && (
          <g>
            <path d="M50 20 q3 -3 0 -6" stroke="#97e2fe" strokeWidth="1.6" fill="none" strokeLinecap="round" className="cir-wave cir-wave-1" />
            <path d="M54 22 q5 -5 0 -10" stroke="#97e2fe" strokeWidth="1.6" fill="none" strokeLinecap="round" className="cir-wave cir-wave-2" />
          </g>
        )}
      </svg>
      {/* guide disclosure — always visible, tiny */}
      <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full border border-border/60 bg-[#0a1638]/90 px-1.5 text-[8px] leading-4 text-muted-foreground">
        guide character
      </span>
    </div>
  );
}
