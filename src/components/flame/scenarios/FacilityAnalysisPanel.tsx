"use client";

// ZERO FLARE — FacilityAnalysisPanel (M5): deterministic fire-safety facility
// analysis rendered from the ported SECOND_EVIDENCE engine (analyzeFacility).
// Every compartment decomposes into six visible drivers; every recommendation
// carries evidence links or an explicit heuristic label. Scores are relative
// heuristics — never probabilities, never a safety certificate.

import { useMemo } from "react";
import { useAppStore, type EnvId } from "@/lib/app-store";
import { analyzeFacility, type FacilitySpec, type StationType } from "@/lib/science/firesafety";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { useState } from "react";

const ENV_SPEC: Record<EnvId, { stationType: StationType; gravity: number; o2: number; pressureKpa: number; label: string }> = {
  earth: { stationType: "spacecraft-cabin", gravity: 1, o2: 0.21, pressureKpa: 101.3, label: "Earth reference" },
  iss: { stationType: "iss-module", gravity: 1e-6, o2: 0.21, pressureKpa: 101.3, label: "ISS module" },
  moon: { stationType: "lunar-habitat", gravity: 0.166, o2: 0.3, pressureKpa: 70.3, label: "Lunar habitat (concept)" },
  mars: { stationType: "pressurized-rover", gravity: 0.38, o2: 0.21, pressureKpa: 70.3, label: "Pressurized rover (concept)" },
  spacecraft: { stationType: "spacecraft-cabin", gravity: 1e-6, o2: 0.21, pressureKpa: 101.3, label: "Deep-space cabin" },
  spacesuit: { stationType: "spacecraft-cabin", gravity: 1e-6, o2: 1.0, pressureKpa: 29.6, label: "Spacesuit (concept)" },
};

/** Map the screening material ids (screening.ts) onto the engine's material classes. */
const MATERIAL_MAP: Record<string, string> = {
  cotton: "paper-cotton",
  pmma: "pmma",
  insulation: "nomex",
  other: "wiring",
};

const BAND_COLOR: Record<string, string> = {
  high: "text-red-500 border-red-500/40 bg-red-500/10",
  elevated: "text-amber-600 border-amber-500/40 bg-amber-500/10",
  lower: "text-emerald-600 border-emerald-500/40 bg-emerald-500/10",
};

export function FacilityAnalysisPanel() {
  const environment = useAppStore((s) => s.environment) as EnvId;
  const facility = useAppStore((s) => s.facility);
  const [open, setOpen] = useState(false);

  const spec: FacilitySpec = useMemo(() => {
    const seed = ENV_SPEC[environment] ?? ENV_SPEC.iss;
    return {
      stationType: seed.stationType,
      gravity: seed.gravity,
      o2: seed.o2,
      pressureKpa: seed.pressureKpa,
      ventilationCmS: 8,
      compartments: facility.compartments.map((c) => ({
        id: c.id,
        name: c.name,
        lengthM: Math.max(1, Math.sqrt(Math.max(c.areaM2, 1))),
        widthM: Math.max(1, Math.sqrt(Math.max(c.areaM2, 1))),
        heightM: Math.max(1.8, c.heightM),
        materials: c.materials.map((m) => MATERIAL_MAP[m] ?? "wiring"),
        ventilationCmS: c.ventilation === "forced" ? 10 : c.ventilation === "quiescent" ? 0.5 : 5,
        ignitionSources: c.ignitionSources > 1 ? ["electronics", "hot-surface"] : ["electronics"],
        detection: c.detection === "integrated" ? ["photoelectric", "ionization"] : c.detection === "local" ? ["photoelectric"] : [],
        suppression: ["portable-ext"],
      })),
    };
  }, [environment, facility]);

  const analysis = useMemo(() => analyzeFacility(spec), [spec]);
  const ranked = [...analysis.compartments].sort((a, b) => b.total - a.total);

  return (
    <section aria-label="Deterministic facility analysis" className="glass-panel rounded-xl p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold">Deterministic facility analysis — six transparent drivers</h3>
          <p className="mt-0.5 text-[11px] text-muted-foreground">
            {analysis.gravityLabel} gravity · {(spec.o2 * 100).toFixed(0)}% O₂ at {spec.pressureKpa.toFixed(0)} kPa →
            pO₂ <span className="font-mono text-foreground">{analysis.pO2Kpa.toFixed(1)} kPa</span> · regime:{" "}
            {analysis.regimeLabel} · Ri {Number.isFinite(analysis.richardsonNumber) ? analysis.richardsonNumber.toFixed(2) : "∞"}
          </p>
        </div>
        <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => setOpen(!open)} aria-expanded={open}>
          {open ? "Hide" : "Show"} driver breakdown <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
        </Button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {ranked.map((c) => (
          <div key={c.id} className={`rounded-lg border p-3 ${BAND_COLOR[c.band] ?? ""}`}>
            <div className="flex items-baseline justify-between gap-2">
              <span className="truncate text-sm font-medium text-foreground">{c.name}</span>
              <span className="font-mono text-sm font-semibold">{c.total}/100</span>
            </div>
            <p className="mt-0.5 text-[10px] uppercase tracking-wide">{c.band} · {c.volumeM3.toFixed(0)} m³</p>
            {open && (
              <div className="mt-2 space-y-1">
                {c.drivers.map((d) => (
                  <div key={d.label} className="flex items-center gap-2 text-[10px]">
                    <span className="w-24 shrink-0 text-muted-foreground">{d.label}</span>
                    <div className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-muted">
                      <div className="h-full rounded-full bg-primary/70" style={{ width: `${(d.score / d.max) * 100}%` }} />
                    </div>
                    <span className="w-10 text-right font-mono">{d.score}/{d.max}</span>
                  </div>
                ))}
                {c.notes.map((n, i) => (
                  <p key={i} className="text-[10px] italic leading-snug text-muted-foreground">{n}</p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        {analysis.recommendations.slice(0, 4).map((r, i) => (
          <div key={i} className="rounded-lg border border-border/50 bg-accent/20 p-2.5">
            <div className="flex items-center gap-1.5">
              <Badge variant="outline" className="text-[9px] uppercase">{r.area}</Badge>
              {r.strength === "evidence-linked" ? (
                <Badge variant="outline" className="text-[9px] text-emerald-600">evidence-linked</Badge>
              ) : (
                <Badge variant="outline" className="text-[9px] text-muted-foreground">heuristic</Badge>
              )}
              <span className="ml-auto font-mono text-[10px] text-muted-foreground">{r.evidence.join(" · ") || "—"}</span>
            </div>
            <p className="mt-1.5 line-clamp-3 text-[11px] leading-snug text-muted-foreground">{r.text}</p>
          </div>
        ))}
      </div>

      <p className="provenance-strip mt-3">
        Deterministic engine (SECOND_EVIDENCE port) · evidence: PSI-25/26/99 solid fuels, PSI-159 oxygen enrichment,
        PSI-101/102 smoke aerosols, PSI-68/69 diluent extinction · heuristic relative scores — NOT probabilities and
        NOT a certified fire-safety analysis.
        {analysis.partialGravityCaveat ? " Partial-gravity regime: no PSI combustion outcome data exists — microgravity/1-g bounds only." : ""}
      </p>
    </section>
  );
}
