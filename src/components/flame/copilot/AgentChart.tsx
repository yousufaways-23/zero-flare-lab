"use client";

import type { ChartSpec } from "@/lib/app-store";
import {
  ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell,
} from "recharts";

// Chart rendered from a tool-produced spec; values are exactly the tool output.
export function AgentChart({ spec }: { spec: ChartSpec }) {
  if (spec.histogram) {
    const data = spec.histogram.binStart.map((start, i) => ({
      name: `${start}–${spec.histogram!.binEnd[i]}`,
      [spec.histogram!.label ?? "count"]: spec.histogram!.counts[i],
    }));
    return (
      <div className="rounded-lg border border-border/50 bg-[color:var(--research)] p-3">
        <div className="text-[11px] font-semibold text-[color:var(--research-foreground)]">{spec.title}</div>
        {spec.subtitle && <div className="text-[10px] text-[color:var(--research-foreground)]/70">{spec.subtitle}</div>}
        <div className="mt-2 h-40">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 4, right: 8, bottom: 4, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,40,0.12)" />
              <XAxis dataKey="name" tick={{ fontSize: 8, fill: "#444" }} interval={0} angle={-30} textAnchor="end" height={38} />
              <YAxis tick={{ fontSize: 9, fill: "#444" }} allowDecimals={false} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Bar dataKey={spec.histogram.label ?? "count"} radius={[3, 3, 0, 0]}>
                {data.map((_, i) => (
                  <Cell key={i} fill="#be5f35" fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-1 text-[9px] text-[color:var(--research-foreground)]/60">{spec.source}</div>
      </div>
    );
  }

  if (spec.points) {
    const data = spec.points.map((p) => ({ x: p.x, y: p.y }));
    return (
      <div className="rounded-lg border border-border/50 bg-[color:var(--research)] p-3">
        <div className="text-[11px] font-semibold text-[color:var(--research-foreground)]">{spec.title}</div>
        <div className="mt-2 h-44">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 6, right: 12, bottom: 14, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(30,30,40,0.12)" />
              <XAxis
                type="number" dataKey="x" name={spec.xLabel ?? "x"}
                tick={{ fontSize: 9, fill: "#444" }}
                label={spec.xLabel ? { value: spec.xLabel, position: "insideBottom", offset: -8, fontSize: 10, fill: "#555" } : undefined}
              />
              <YAxis
                type="number" dataKey="y" name={spec.yLabel ?? "y"}
                tick={{ fontSize: 9, fill: "#444" }}
                label={spec.yLabel ? { value: spec.yLabel, angle: -90, position: "insideLeft", fontSize: 10, fill: "#555" } : undefined}
              />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Scatter data={data} fill="#be5f35" fillOpacity={0.75} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
        <div className="text-[9px] text-[color:var(--research-foreground)]/60">{spec.source}</div>
      </div>
    );
  }
  return null;
}
