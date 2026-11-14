"use client";

// ZERO FLARE — ConditionComparison: automatic categorical × numeric analysis.
// Inspects the active table for a low-cardinality categorical column and
// numeric columns, then renders per-group mean with min–max range and n.
// Group means are DESCRIPTIVE statistics of the recovered rows — not effect
// claims; groups with n < 3 are shown but flagged.

import { useMemo, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ErrorBar } from "recharts";
import type { DataTable } from "@/lib/data/catalog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SlidersHorizontal } from "lucide-react";

interface GroupStat {
  group: string;
  n: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  range?: [number, number];
}

function computeGroups(table: DataTable, catIdx: number, numIdx: number, maxGroups = 8): GroupStat[] {
  const groups = new Map<string, number[]>();
  for (const row of table.rows) {
    const g = (row[catIdx] ?? "").trim();
    const v = Number((row[numIdx] ?? "").trim());
    if (!g || !Number.isFinite(v)) continue;
    const list = groups.get(g) ?? [];
    list.push(v);
    groups.set(g, list);
  }
  const stats: GroupStat[] = [];
  for (const [g, vals] of groups) {
    const n = vals.length;
    const mean = n ? vals.reduce((a, b) => a + b, 0) / n : null;
    const min = n ? Math.min(...vals) : null;
    const max = n ? Math.max(...vals) : null;
    stats.push({ group: g.length > 18 ? `${g.slice(0, 17)}…` : g, n, mean, min, max });
  }
  return stats.sort((a, b) => b.n - a.n).slice(0, maxGroups);
}

export function ConditionComparison({ table }: { table: DataTable }) {
  const { catCols, numCols } = useMemo(() => {
    const counts = new Map<number, Set<string>>();
    for (const row of table.rows) {
      table.columns.forEach((c) => {
        const v = (row[c.index] ?? "").trim();
        if (v && c.type === "categorical") {
          const s = counts.get(c.index) ?? new Set<string>();
          s.add(v);
          counts.set(c.index, s);
        }
      });
    }
    const cats = table.columns
      .filter((c) => c.type === "categorical" && (counts.get(c.index)?.size ?? 0) >= 2 && (counts.get(c.index)?.size ?? 0) <= 8)
      .map((c) => c.index);
    const nums = table.columns.filter((c) => c.type === "numeric" && c.fillRate >= 0.5).map((c) => c.index);
    return { catCols: cats, numCols: nums };
  }, [table]);

  const [catIdx, setCatIdx] = useState<number | null>(null);
  const [numIdx, setNumIdx] = useState<number | null>(null);

  const cat = catIdx ?? (catCols.length ? catCols[0] : null);
  const num = numIdx ?? (numCols.length ? numCols[0] : null);

  const rawGroups = useMemo(
    () => (cat !== null && num !== null ? computeGroups(table, cat, num) : []),
    [table, cat, num],
  );
  const data = useMemo(() => withRangeData(rawGroups), [rawGroups]);

  const catName = cat !== null ? table.columns[cat]?.name : null;
  const numName = num !== null ? table.columns[num]?.name : null;
  const numUnit = num !== null ? table.columns[num]?.unit : null;

  if (catCols.length === 0 || numCols.length === 0 || data.length < 2) {
    return null; // this table does not support a condition comparison — honest skip
  }

  const smallGroups = data.filter((d) => d.n < 3).length;

  return (
    <section aria-label="Condition comparison" className="research-panel rounded-lg p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <SlidersHorizontal className="h-4 w-4 text-primary" aria-hidden />
          Condition comparison — grouped means from recovered rows
        </h3>
        <div className="flex flex-wrap gap-2">
          <Select value={String(cat)} onValueChange={(v) => setCatIdx(Number(v))}>
            <SelectTrigger size="sm" className="w-[220px] text-xs" aria-label="Group by column">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {catCols.map((i) => (
                <SelectItem key={i} value={String(i)}>{table.columns[i]?.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={String(num)} onValueChange={(v) => setNumIdx(Number(v))}>
            <SelectTrigger size="sm" className="w-[220px] text-xs" aria-label="Measure column">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {numCols.map((i) => (
                <SelectItem key={i} value={String(i)}>{table.columns[i]?.name}{table.columns[i]?.unit ? ` [${table.columns[i].unit}]` : ""}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Mean of <span className="text-foreground">{numName}</span>{numUnit ? ` [${numUnit}]` : ""} grouped by{" "}
        <span className="text-foreground">{catName}</span>; bars span observed min–max. Descriptive statistics of
        recovered rows — not effect claims. Groups with n &lt; 3 are flagged.
      </p>
      <div className="mt-3 h-[240px]" role="img" aria-label={`Grouped means of ${numName} by ${catName} with observed ranges`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 16, bottom: 8, left: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(126,156,224,0.2)" />
            <XAxis dataKey="group" tick={{ fontSize: 10, fill: "#93a7d9" }} interval={0} angle={-18} textAnchor="end" height={54} />
            <YAxis tick={{ fontSize: 10, fill: "#93a7d9" }} />
            <Tooltip
              contentStyle={{ background: "#0a1638", border: "1px solid #2c3f7e", borderRadius: 8, fontSize: 11 }}
              formatter={(value, name) => [typeof value === "number" ? Number(value.toFixed(3)) : value, name === "mean" ? "mean" : name]}
              labelFormatter={(label, payload) => {
                const p = payload?.[0]?.payload as GroupStat | undefined;
                return label + (p ? ` (n = ${p.n})` : "");
              }}
            />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="mean" name="mean" fill="#4784d9" radius={[3, 3, 0, 0]} maxBarSize={44}>
              <ErrorBar dataKey="range" direction="y" width={5} strokeWidth={1.2} stroke="#97e2fe" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      {/* range values for the ErrorBar: recharts expects [low, high] arrays — provide via data transform */}
      {smallGroups > 0 && (
        <p className="text-[10px] italic text-muted-foreground">{smallGroups} group(s) have n &lt; 3 — descriptive only, interpret with caution.</p>
      )}
    </section>
  );
}

/** Attach min/max range arrays for the Recharts ErrorBar. */
export function withRangeData(data: GroupStat[]): GroupStat[] {
  return data.map((d) => ({
    ...d,
    range: [d.mean != null && d.min != null ? d.mean - d.min : 0, d.max != null && d.mean != null ? d.max - d.mean : 0] as [number, number],
  }));
}
