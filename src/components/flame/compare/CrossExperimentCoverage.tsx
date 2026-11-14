"use client";

// ZERO FLARE — CrossExperimentCoverage: across the whole corpus, locate
// oxygen / pressure / airflow condition columns per investigation and render
// their observed min–max ranges. Units must match within a compatibility
// class for a strip to be plotted together; incompatible units render as a
// coverage note instead of a forced comparison (comparability-gate values).

import { useMemo } from "react";
import { getTables } from "@/lib/data/catalog";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LabelList } from "recharts";
import { Globe2 } from "lucide-react";

type VarKind = "oxygen" | "pressure" | "airflow";

const VAR_PATTERNS: { kind: VarKind; label: string; patterns: RegExp; unitClass: string[] }[] = [
  { kind: "oxygen", label: "Oxygen concentration", patterns: /(^|[\s_(-])(x\s*o2|o2\b|oxygen|ox\b)/i, unitClass: ["%", "mole fraction", "fraction", "percent"] },
  { kind: "pressure", label: "Ambient pressure", patterns: /(pressure|mmhg|kpa|psi|bar\b)/i, unitClass: ["mmHg", "kPa", "psi", "bar", "Pa"] },
  { kind: "airflow", label: "Airflow velocity", patterns: /(air ?flow|flow rate|velocity|duct flow)/i, unitClass: ["cm/s", "m/s", "mm/s"] },
];

interface RangePoint {
  table: string;
  acc: string;
  column: string;
  unit: string | null;
  min: number;
  max: number;
  n: number;
  mid?: number;
  span?: number;
}

function extractRanges(kind: VarKind): { unit: string; points: RangePoint[]; converted?: boolean }[] {
  const def = VAR_PATTERNS.find((v) => v.kind === kind)!;
  const byUnit = new Map<string, RangePoint[]>();
  for (const t of getTables()) {
    for (const c of t.columns) {
      if (c.type !== "numeric") continue;
      if (!def.patterns.test(c.name)) continue;
      if (kind === "oxygen" && /(flow|mg\/(s|sccm)|sccm|slm)/i.test(c.name)) continue; // flows are not concentrations
      const unit = (c.unit ?? "").trim();
      const vals: number[] = [];
      for (const row of t.rows) {
        const v = Number((row[c.index] ?? "").trim());
        if (Number.isFinite(v)) vals.push(v);
      }
      if (vals.length < 4) continue;
      let plotUnit = unit || "(unitless)";
      let scale = 1;
      let converted = false;
      if (kind === "oxygen") {
        // mole fraction (0–1) and percent by volume (0–100) are the SAME
        // quantity on an exact ×100 scale — normalize fractions to percent
        // and declare the conversion. Values > 1.5 are treated as percent.
        const vMax = Math.max(...vals);
        if (vMax <= 1.5 && !unit.includes("%")) {
          scale = 100;
          plotUnit = "% (converted from mole fraction ×100)";
          converted = true;
        } else if (unit.includes("%") || (unit === "" && vMax > 1.5)) {
          plotUnit = unit || "% (unitless header)";
        } else if (unit && !def.unitClass.some((u) => unit.toLowerCase().includes(u.toLowerCase())) && vMax > 1.5) {
          continue;
        }
      } else if (!def.unitClass.some((u) => unit.toLowerCase().includes(u.toLowerCase()))) {
        continue;
      }
      const point: RangePoint = {
        table: t.id,
        acc: t.investigation,
        column: c.name,
        unit: plotUnit,
        min: Math.min(...vals) * scale,
        max: Math.max(...vals) * scale,
        n: vals.length,
      };
      byUnit.set(plotUnit, [...(byUnit.get(plotUnit) ?? []), point]);
    }
  }
  return [...byUnit.entries()]
    .map(([unit, points]) => ({
      unit,
      points: points.sort((a, b) => a.min - b.min),
      converted: points.some((p) => (p.unit ?? "").includes("converted")),
    }))
    .sort((a, b) => b.points.length - a.points.length);
}

function RangeStrip({ unit, points, label }: { unit: string; points: RangePoint[]; label: string }) {
  const data = points.map((p) => ({
    ...p,
    lower: p.min,
    length: Math.max(p.max - p.min, 0.0001),
    labelTxt: `${p.min.toPrecision(3)}–${p.max.toPrecision(3)}`,
  }));
  const xMin = Math.min(...points.map((p) => p.min));
  const xMax = Math.max(...points.map((p) => p.max));
  const pad = Math.max((xMax - xMin) * 0.08, 0.5);
  return (
    <div style={{ height: Math.min(64 + points.length * 26, 320) }} role="img" aria-label={`${label} observed ranges per investigation (unit ${unit})`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 8, right: 64, bottom: 8, left: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(126,156,224,0.2)" horizontal={false} />
          <XAxis
            type="number"
            domain={[Math.max(0, xMin - pad), xMax + pad]}
            tick={{ fontSize: 10, fill: "#93a7d9" }}
            label={{ value: `${label} [${unit}]`, fontSize: 10, fill: "#93a7d9", position: "insideBottom", offset: -2 }}
          />
          <YAxis type="category" dataKey="acc" width={74} tick={{ fontSize: 9, fill: "#93a7d9" }} />
          <Tooltip
            contentStyle={{ background: "#0a1638", border: "1px solid #2c3f7e", borderRadius: 8, fontSize: 11 }}
            formatter={(value, name, item) => {
              const pl = item?.payload as RangePoint;
              if (name === "observed range") return [`${pl.min} – ${pl.max} (${unit})`, `${pl.column} · n=${pl.n}`];
              return [value, name];
            }}
          />
          <Bar dataKey="lower" stackId="r" fill="transparent" isAnimationActive={false} />
          <Bar dataKey="length" stackId="r" name="observed range" fill="#5799d1" radius={[3, 3, 3, 3]} maxBarSize={14} isAnimationActive={false}>
            <LabelList dataKey="labelTxt" position="right" style={{ fontSize: 9, fill: "#9ccae9" }} />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <p className="sr-only">
        {points.map((p) => `${p.acc}: ${p.min}–${p.max} ${unit} (n=${p.n}, column ${p.column}); `).join("")}
      </p>
    </div>
  );
}

export function CrossExperimentCoverage() {
  const analyses = useMemo(
    () => (["oxygen", "pressure", "airflow"] as VarKind[]).map((k) => ({ kind: k, groups: extractRanges(k) })),
    [],
  );
  const usable = analyses.filter((a) => a.groups.some((g) => g.points.length >= 2));

  return (
    <section aria-label="Cross-experiment condition coverage" className="research-panel rounded-xl p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Globe2 className="h-4 w-4 text-primary" aria-hidden />
          Cross-experiment condition coverage — observed ranges across the corpus
        </h3>
        <p className="text-[11px] text-muted-foreground">
          ranges computed from each recovered table&apos;s own rows; plotted together ONLY within a compatible unit class
        </p>
      </div>
      {usable.length === 0 ? (
        <p className="provenance-strip mt-2">
          No condition variable has comparable numeric coverage across ≥2 recovered tables — the coverage matrix
          and comparability gate remain the honest cross-study view.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          {usable.map(({ kind, groups }) => (
            <div key={kind}>
              <h4 className="text-xs font-semibold text-foreground/90">{VAR_PATTERNS.find((v) => v.kind === kind)!.label}</h4>
              {groups.filter((g) => g.points.length >= 2).slice(0, 2).map((g) => (
                <div key={g.unit} className="mt-1">
                  <RangeStrip unit={g.unit} points={g.points} label={VAR_PATTERNS.find((v) => v.kind === kind)!.label} />
                  <p className="text-[10px] text-muted-foreground">
                    {g.points.length} investigations · column-level ranges (n ≥ 4 rows each) ·{" "}
                    {g.points.map((p) => `${p.acc} [${p.min}–${p.max}]`).join(" · ")}
                  </p>
                </div>
              ))}
              {groups.some((g) => g.converted) && (
                <p className="mt-1 text-[10px] italic text-muted-foreground">
                  Mole-fraction columns (0–1) normalized ×100 to percent — an exact scale conversion, declared
                  here; measurement contexts still differ between experiments (see the comparability gate).
                </p>
              )}
              {groups.filter((g) => g.points.length === 1).length > 0 && (
                <p className="mt-1 text-[10px] italic text-muted-foreground">
                  +{groups.filter((g) => g.points.length === 1).length} unit class(es) with a single investigation —
                  no cross-experiment comparison plotted (incompatible contexts); see the coverage matrix.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
