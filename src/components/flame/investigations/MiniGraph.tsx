"use client";

/**
 * MiniGraph — local typed evidence-graph slice (pure SVG, deterministic radial
 * layout, no physics library). Centers on one or more investigation nodes and
 * shows everything connected by a single typed, evidence-carrying edge.
 *
 * Shared by InvestigationsView (Graph tab) and CompareView. Imports only the
 * data catalog and the app store, so it can never take part in a cycle.
 */

import { useMemo, useState } from "react";
import { ChevronDown, ExternalLink, MousePointerClick } from "lucide-react";
import { getGraph, type GraphEdge, type GraphNode } from "@/lib/data/catalog";
import { useAppStore } from "@/lib/app-store";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export interface MiniGraphProps {
  /** Accessions (or other node ids) to center the slice on. */
  centerIds: string[];
  title?: string;
}

/* Node sizing by type — investigations read largest. */
const NODE_RADIUS: Record<string, number> = {
  investigation: 15,
  facility: 11,
  apparatus: 10,
};
const nodeRadius = (type: string) => NODE_RADIUS[type] ?? 8;

/* Edge palette — muted so evidence nodes carry the color; aligned with graph type colors. */
const EDGE_COLORS: Record<string, string> = {
  uses_equipment: "#5B8DB8",
  studies_fuel: "#C26415",
  related_investigation: "#8B93A3",
  produced_model: "#9A5B8F",
  tests_diluent: "#7C6BAF",
  conducted_in: "#4E5D6C",
  related_evidence: "#3E9B7A",
};
const edgeColor = (type: string) => EDGE_COLORS[type] ?? "#7C8798";

/* Presentation gloss for the legend (edge semantics; per-edge evidence text is shown in the edge list). */
const EDGE_GLOSS: Record<string, string> = {
  uses_equipment: "investigation ran on this apparatus / facility",
  studies_fuel: "investigation studied this fuel",
  related_investigation: "PSI Related Investigations field",
  produced_model: "investigation produced this model",
  tests_diluent: "investigation tested this suppressant / diluent",
  conducted_in: "conducted in this mission environment",
  related_evidence: "other recorded evidence link",
};

const truncateLabel = (s: string, n = 16) => (s.length > n ? `${s.slice(0, n - 1)}…` : s);

interface Pt {
  x: number;
  y: number;
}

interface Slice {
  centers: GraphNode[];
  centerSet: Set<string>;
  neighbors: GraphNode[];
  edges: GraphEdge[];
  pos: Map<string, Pt>;
  typeColors: Record<string, string>;
  types: string[];
  edgeTypesUsed: string[];
  honesty: string;
}

function buildSlice(centerIds: string[]): Slice | null {
  const g = getGraph();
  const nodeById = new Map(g.nodes.map((n) => [n.id, n]));
  const centers = centerIds.map((id) => nodeById.get(id)).filter((n): n is GraphNode => !!n);
  if (centers.length === 0) return null;

  const centerSet = new Set(centers.map((n) => n.id));
  const edges = g.edges.filter((e) => centerSet.has(e.source) || centerSet.has(e.dst));

  const neighborIds = new Set<string>();
  for (const e of edges) {
    if (!centerSet.has(e.source)) neighborIds.add(e.source);
    if (!centerSet.has(e.dst)) neighborIds.add(e.dst);
  }
  const neighbors = g.nodes.filter((n) => neighborIds.has(n.id));

  /* Deterministic radial layout: centers on an inner circle (a point when single),
     neighbors evenly on an outer circle, ordered by the center they attach to. */
  const pos = new Map<string, Pt>();
  const k = centers.length;
  for (let i = 0; i < k; i++) {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / k;
    const r = k === 1 ? 0 : 55 + 15 * k;
    pos.set(centers[i].id, { x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  const attachedCenter = (nb: GraphNode) => {
    for (let i = 0; i < centers.length; i++) {
      const c = centers[i].id;
      if (edges.some((e) => (e.source === c && e.dst === nb.id) || (e.dst === c && e.source === nb.id))) return i;
    }
    return 0;
  };
  const groups = new Map<number, GraphNode[]>();
  for (const nb of neighbors) {
    const gi = attachedCenter(nb);
    const list = groups.get(gi);
    if (list) list.push(nb);
    else groups.set(gi, [nb]);
  }
  const ordered: GraphNode[] = [];
  [...groups.keys()]
    .sort((a, b) => a - b)
    .forEach((gi) => {
      const list = (groups.get(gi) ?? []).sort((a, b) => a.id.localeCompare(b.id));
      ordered.push(...list);
    });
  const R = 212;
  const n = ordered.length;
  ordered.forEach((nb, i) => {
    const a = -Math.PI / 2 + (i * 2 * Math.PI) / Math.max(n, 1);
    pos.set(nb.id, { x: Math.cos(a) * R, y: Math.sin(a) * R });
  });

  const types = [...new Set([...centers, ...neighbors].map((x) => x.type))];
  const edgeTypesUsed = [...new Set(edges.map((e) => e.type))];
  return { centers, centerSet, neighbors, edges, pos, typeColors: g.typeColors, types, edgeTypesUsed, honesty: g.honesty };
}

export function MiniGraph({ centerIds, title }: MiniGraphProps) {
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  const setView = useAppStore((s) => s.setView);
  const setScenarioPillar = useAppStore((s) => s.setScenarioPillar);
  const [hovered, setHovered] = useState<GraphNode | null>(null);
  const [edgesOpen, setEdgesOpen] = useState(false);

  const slice = useMemo(() => buildSlice(centerIds), [centerIds]);

  if (!slice) {
    return (
      <div className="glass-panel rounded-xl p-6 text-center text-sm text-muted-foreground">
        No graph nodes found for: <span className="font-mono text-xs">{centerIds.join(", ") || "—"}</span>
      </div>
    );
  }

  const nodeColor = (type: string) => slice.typeColors[type] ?? "#7C8798";
  const actionable = (type: string) =>
    type === "investigation" || type === "apparatus" || type === "facility" || type === "fuel";

  const clickHint = (node: GraphNode): string | null => {
    if (node.type === "investigation") return "Click to open the investigation workspace";
    if (node.type === "apparatus" || node.type === "facility") return "Click to open in the 3D Lab";
    if (node.type === "fuel") return "Click for prevention scenarios";
    return null;
  };

  const onNodeClick = (node: GraphNode) => {
    if (node.type === "investigation") {
      openInvestigation(node.id);
      return;
    }
    if (node.type === "apparatus" || node.type === "facility") {
      setView("lab3d");
      return;
    }
    if (node.type === "fuel") {
      setScenarioPillar("prevention");
      setView("scenarios");
      return;
    }
    setHovered(node); // non-actionable node: inspect on tap (touch-friendly)
  };

  return (
    <div className="glass-panel rounded-xl p-4">
      {title && <div className="mb-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</div>}
      <div className="relative" onMouseLeave={() => setHovered(null)}>
        <svg
          viewBox="-330 -248 660 496"
          className="mx-auto block h-auto w-full max-w-[680px]"
          style={{ maxHeight: 460 }}
          role="img"
          aria-label={`Evidence graph slice centered on ${slice.centers.map((c) => c.label).join(", ")}`}
        >
          {/* edges */}
          {slice.edges.map((e, i) => {
            const a = slice.pos.get(e.source);
            const b = slice.pos.get(e.dst);
            if (!a || !b) return null;
            return (
              <line
                key={`e-${i}`}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke={edgeColor(e.type)}
                strokeOpacity={0.55}
                strokeWidth={1.4}
                strokeDasharray={e.reviewStatus !== "source-reported" ? "5 4" : undefined}
              >
                <title>{`${e.type}: ${e.evidence} (${e.confidence}, ${e.reviewStatus})`}</title>
              </line>
            );
          })}
          {/* nodes */}
          {[...slice.neighbors, ...slice.centers].map((node) => {
            const p = slice.pos.get(node.id);
            if (!p) return null;
            const r = nodeRadius(node.type);
            const color = nodeColor(node.type);
            const isCenter = slice.centerSet.has(node.id);
            return (
              <g
                key={node.id}
                transform={`translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`}
                className={actionable(node.type) ? "cursor-pointer" : "cursor-default"}
                onClick={() => onNodeClick(node)}
                onMouseEnter={() => setHovered(node)}
                onFocus={() => setHovered(node)}
                onBlur={() => setHovered(null)}
                tabIndex={0}
                role="button"
                aria-label={`${node.type}: ${node.title ?? node.label}`}
              >
                <title>{`${node.title ?? node.label} (${node.type})`}</title>
                <circle r={r + 8} fill="transparent" />
                {isCenter && (
                  <circle r={r + 5} fill="none" stroke={color} strokeOpacity={0.35} strokeWidth={1} />
                )}
                <circle
                  r={r}
                  fill={color}
                  fillOpacity={isCenter ? 0.42 : 0.22}
                  stroke={color}
                  strokeWidth={isCenter ? 2.5 : 1.6}
                />
                <text
                  y={r + 15}
                  textAnchor="middle"
                  fontSize="11"
                  fill={isCenter ? "#e8eef8" : "#a9b7cd"}
                >
                  {truncateLabel(node.label)}
                </text>
              </g>
            );
          })}
        </svg>

        {/* hover / focus inspector */}
        {hovered && (
          <div className="absolute right-2 top-2 max-w-[250px] rounded-lg border border-border/60 bg-[color:var(--space-raised)]/95 p-3 text-xs shadow-xl">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium leading-tight">{hovered.title ?? hovered.label}</span>
              <span
                className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: nodeColor(hovered.type) }}
                aria-hidden="true"
              />
            </div>
            <div className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">{hovered.type}</div>
            {hovered.doi && (
              <div className="mt-1 font-mono text-[10px] text-muted-foreground">DOI {hovered.doi}</div>
            )}
            {hovered.url && (
              <a
                href={hovered.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1.5 inline-flex items-center gap-1 text-[11px] text-primary hover:underline"
              >
                Open source record <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {clickHint(hovered) && (
              <div className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                <MousePointerClick className="h-3 w-3" /> {clickHint(hovered)}
              </div>
            )}
          </div>
        )}
      </div>

      {/* legend: node types + edge types */}
      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-muted-foreground">
        {slice.types.map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: nodeColor(t) }}
              aria-hidden="true"
            />
            {t}
          </span>
        ))}
        <span className="text-border" aria-hidden="true">
          |
        </span>
        {slice.edgeTypesUsed.map((t) => (
          <span key={t} className="inline-flex items-center gap-1.5" title={EDGE_GLOSS[t] ?? t}>
            <span className="inline-block h-0.5 w-4 rounded" style={{ background: edgeColor(t) }} aria-hidden="true" />
            {t}
          </span>
        ))}
      </div>

      {/* honesty strip (verbatim from the graph build) */}
      <p className="provenance-strip mt-3">{slice.honesty}</p>

      {/* collapsible edge list */}
      <Collapsible open={edgesOpen} onOpenChange={setEdgesOpen} className="mt-3">
        <CollapsibleTrigger asChild>
          <button className="flex items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-foreground">
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", edgesOpen && "rotate-180")} />
            Evidence edges ({slice.edges.length})
          </button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <div className="research-panel mt-2 max-h-64 overflow-auto data-scroll rounded-lg">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="border-b border-black/10">
                  <th className="px-2.5 py-2 text-left font-semibold">Type</th>
                  <th className="px-2.5 py-2 text-left font-semibold">Evidence</th>
                  <th className="px-2.5 py-2 text-left font-semibold">Confidence</th>
                  <th className="px-2.5 py-2 text-left font-semibold">Review</th>
                </tr>
              </thead>
              <tbody>
                {slice.edges.map((e, i) => (
                  <tr key={`${e.source}-${e.dst}-${i}`} className="border-b border-black/5">
                    <td className="whitespace-nowrap px-2.5 py-1.5 font-mono">{e.type}</td>
                    <td className="px-2.5 py-1.5 leading-snug">{e.evidence}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5">{e.confidence}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5">{e.reviewStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
