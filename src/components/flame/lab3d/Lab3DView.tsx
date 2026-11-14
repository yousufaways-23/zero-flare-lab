"use client";

// FLAME EVIDENCE LAB — 3D Lab view (M5): equipment catalogue + apparatus viewer.
// HONESTY: every 3D model here is a procedural SCHEMATIC RECONSTRUCTION built
// from public NASA facility descriptions — NOT official NASA CAD. Fidelity
// labels are shown above every canvas; record-only entries stay record-only.

import { Component, useEffect, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { useReducedMotion } from "framer-motion";
import {
  Boxes,
  Camera,
  ExternalLink,
  Flame,
  RotateCcw,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import { useAppStore } from "@/lib/app-store";
import { cn } from "@/lib/utils";
import { Deferred3D } from "@/components/flame/shell/Deferred3D";
import { getEquipment, searchMediaLocal, type Equipment, type MediaItem } from "@/lib/data/catalog";
import { PART_INFO, type PartInfo } from "@/components/flame/lab3d/ApparatusModels";
import { OfficialNasaModels } from "@/components/flame/lab3d/OfficialNasaModels";
import { SaveItemButton } from "@/components/flame/shell/SaveItemButton";
import { VideoShelf } from "@/components/flame/shell/VideoShelf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";

const ApparatusViewer = dynamic(() => import("./ApparatusModels").then((m) => m.ApparatusViewer), {
  ssr: false,
  loading: () => (
    <div className="grid h-full w-full place-items-center">
      <p className="font-mono text-xs text-muted-foreground">loading schematic…</p>
    </div>
  ),
});

const ExperimentDemo = dynamic(() => import("./ExperimentDemo").then((m) => m.ExperimentDemo), {
  ssr: false,
  loading: () => (
    <div className="glass-panel grid h-64 w-full place-items-center rounded-xl">
      <p className="font-mono text-xs text-muted-foreground">loading experiment demonstration…</p>
    </div>
  ),
});

// ---------- helpers ----------

let webglSupportCache: boolean | null = null;

function readWebGLSupport(): boolean {
  if (webglSupportCache === null) {
    try {
      const canvas = document.createElement("canvas");
      webglSupportCache = Boolean(
        window.WebGLRenderingContext && (canvas.getContext("webgl2") || canvas.getContext("webgl")),
      );
    } catch {
      webglSupportCache = false;
    }
  }
  return webglSupportCache;
}

const noopSubscribe = () => () => {};

/** null = unknown (server / first paint), then true/false once the client mounts. */
function useWebGLSupport(): boolean | null {
  return useSyncExternalStore(
    noopSubscribe,
    () => readWebGLSupport(),
    () => null,
  );
}

class SceneBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Media-index query per equipment id (falls back to the record name). */
const EQUIPMENT_MEDIA_QUERY: Record<string, string> = {
  cir: "Combustion Integrated Rack",
  acme: "ACME combustion",
  mdca: "FLEX droplet",
  msg: "Microgravity Science Glovebox",
  "spice-insert": "SPICE smoke point",
  saffire: "SAFFIRE",
};

/** Part names per model — used by the 2D schematic fallback when WebGL is unavailable. */
const MODEL_PARTS: Record<string, string[]> = {
  "cir-rack": ["ISS rack chassis", "instrument panel grid", "chamber insert bay", "rack handles"],
  "acme-burner": ["combustion chamber", "central gas nozzle", "co-flow tube", "burner base", "flame proxy"],
  "mdca-droplet": ["deployment frame", "opposing needles", "fuel droplet", "imaging cameras"],
  "msg-glovebox": ["sealed work volume", "airlock door", "glove ports", "viewing window"],
  "spice-burner": ["vertical fuel nozzle", "co-flow shroud", "flame proxy", "burner base"],
  "saffire-duct": ["flow duct", "sample card face", "instrument studs", "flow inlet"],
};

const FIDELITY_LEGEND: { id: string; label: string; note: string; available: boolean }[] = [
  { id: "official-3d", label: "official 3D model", note: "NASA ISS + Perseverance GLBs below (geometry unchanged)", available: true },
  { id: "schematic", label: "source-based reconstruction / schematic", note: "what every apparatus model below is", available: true },
  { id: "replay", label: "recorded data replay", note: "recovered PSI tables + embedded EDA", available: true },
  { id: "simulation", label: "scientific simulation", note: "guarded calculators only", available: true },
];

const PROCESS_STEPS: { title: string; detail: string; icon: LucideIcon }[] = [
  { title: "Setup", detail: "Hardware configured in the rack or glovebox; test atmosphere and fuel condition set per the investigation matrix.", icon: Wrench },
  { title: "Ignition", detail: "Fuel introduced; ignition source activated under the planned microgravity conditions.", icon: Flame },
  { title: "Burn", detail: "Flame or droplet evolves while chamber conditions are held constant.", icon: Wrench },
  { title: "Observation", detail: "Cameras, radiometers and sensors record the event through viewport windows.", icon: Camera },
  { title: "Extinction", detail: "Event terminates by burnout, dilution or extinguishment.", icon: RotateCcw },
  { title: "Post-test", detail: "Data downlink, table assembly and sample stowage; records land in the PSI archive.", icon: Wrench },
];
void PROCESS_STEPS; // superseded by the animated ExperimentDemo stage timelines (kept as parity reference)

function TypeBadge({ type }: { type: string }) {
  if (type === "facility") {
    return <Badge className="border-[#5799d1]/40 bg-[#5799d1]/10 text-[#5799d1] hover:bg-[#5799d1]/10">facility</Badge>;
  }
  if (type === "apparatus") {
    return <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">apparatus</Badge>;
  }
  return <Badge variant="secondary">instrument</Badge>;
}

function FidelityChip({ fidelity }: { fidelity: string }) {
  if (fidelity === "schematic") {
    return <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">3D schematic</Badge>;
  }
  return <Badge variant="outline" className="text-muted-foreground">record only</Badge>;
}

/** 2D labelled block diagram — shown when WebGL is unavailable or the canvas fails. */
function SchematicFallback({ name, parts }: { name: string; parts: string[] }) {
  const rows = parts.slice(0, 6);
  const height = rows.length * 46 + 74;
  const title = name.length > 42 ? `${name.slice(0, 42)}…` : name;
  return (
    <div role="img" aria-label={`2D schematic diagram of ${name}: ${rows.join(", ")}. WebGL is unavailable.`} className="absolute inset-0 grid place-items-center p-4">
      <svg viewBox={`0 0 320 ${height}`} className="h-full max-h-[440px] w-full max-w-[440px]" xmlns="http://www.w3.org/2000/svg">
        <text x="160" y="18" textAnchor="middle" fill="#fcdaa7" fontSize="11" fontFamily="monospace">
          {title}
        </text>
        {rows.map((part, i) => {
          const y = 34 + i * 46;
          return (
            <g key={part}>
              {i < rows.length - 1 && (
                <line x1="160" y1={y + 30} x2="160" y2={y + 46} stroke="#5799d1" strokeDasharray="3 3" opacity="0.6" />
              )}
              <rect x="42" y={y} width="236" height="30" rx="6" fill="#0b1c3f" stroke="#5799d1" strokeOpacity="0.65" />
              <text x="160" y={y + 19} textAnchor="middle" fill="#fcdaa7" fontSize="10.5" fontFamily="monospace">
                {part}
              </text>
            </g>
          );
        })}
        <text x="160" y={height - 6} textAnchor="middle" fill="#8fa3c8" fontSize="9" fontFamily="monospace">
          2D schematic fallback — WebGL unavailable
        </text>
      </svg>
    </div>
  );
}

// ---------- view ----------

export function Lab3DView() {
  const openInvestigation = useAppStore((s) => s.openInvestigation);
  const setSelectedEquipment = useAppStore((s) => s.setSelectedEquipment);
  const setCopilotOpen = useAppStore((s) => s.setCopilotOpen);
  const setCopilotContext = useAppStore((s) => s.setCopilotContext);

  const equipment = useMemo(() => getEquipment(), []);
  const [selectedId, setSelectedId] = useState<string | null>(() => equipment.find((e) => e.model3d)?.id ?? null);
  const [showLabels, setShowLabels] = useState(true);
  // §3 interaction modes — assembled / cutaway / exploded + camera presets + part isolation
  const [viewMode, setViewMode] = useState<"assembled" | "cutaway" | "exploded">("assembled");
  const [cameraPreset, setCameraPreset] = useState<"default" | "front" | "interior" | "top">("default");
  const [isolated, setIsolated] = useState<string | null>(null);
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);
  const [viewerFailed, setViewerFailed] = useState(false);
  const [selectedPart, setSelectedPart] = useState<PartInfo | null>(null);

  const webglOk = useWebGLSupport();
  const reducedMotion = useReducedMotion();
  void reducedMotion; // motion variants retired with the static replay; kept for future use

  const selected: Equipment | undefined = useMemo(() => equipment.find((e) => e.id === selectedId), [equipment, selectedId]);
  const withModel = equipment.filter((e) => e.model3d).length;

  // deep-link sync: the store's selectedEquipment (set by CIR-1 navigate, the
  // guided tour, or the copilot) takes effect when this view mounts or changes.
  const storeEquipmentId = useAppStore((s) => s.selectedEquipment);
  useEffect(() => {
    if (storeEquipmentId && equipment.some((e) => e.id === storeEquipmentId)) {
      // applied in the next frame (async): avoids a synchronous setState-in-effect
      // cascade and matches the deferred scroll below
      requestAnimationFrame(() => {
        setSelectedId(storeEquipmentId);
        setViewerFailed(false);
        setLightboxIdx(null);
        setSelectedPart(null);
        setIsolated(null);
        setViewMode("assembled");
        setCameraPreset("default");
        document.getElementById("apparatus-viewer")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  }, [storeEquipmentId, equipment]);

  const photos: MediaItem[] = useMemo(() => {
    if (!selected) return [];
    const query = EQUIPMENT_MEDIA_QUERY[selected.id] ?? selected.name;
    return searchMediaLocal(query, 8);
  }, [selected]);

  const lightboxPhoto = lightboxIdx !== null ? photos[lightboxIdx] : undefined;

  const selectEquipment = (id: string) => {
    setSelectedId(id);
    setViewerFailed(false);
    setLightboxIdx(null);
    setSelectedPart(null);
    setIsolated(null);
    setViewMode("assembled");
    setCameraPreset("default");
    setSelectedEquipment(id); // §11.1 — copilot context follows the inspected apparatus
    requestAnimationFrame(() => {
      document.getElementById("apparatus-viewer")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="pb-12">
      {/* ================= HEADER + FIDELITY LEGEND ================= */}
      <header>
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">3D Lab · Equipment catalogue</p>
        <h1 className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">3D Lab — spacecraft combustion hardware</h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          All models below are procedural schematic reconstructions built from public NASA facility descriptions —{" "}
          <span className="font-semibold text-foreground">NOT official NASA CAD</span>. Authentic NASA photography is attached
          wherever the recovered media index has it.
        </p>
        <ul className="mt-4 flex flex-wrap gap-2" aria-label="Fidelity legend">
          {FIDELITY_LEGEND.map((chip) => (
            <li
              key={chip.id}
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] ${
                !chip.available
                  ? "border-dashed border-border/70 text-muted-foreground opacity-60"
                  : chip.id === "schematic"
                    ? "border-primary/50 bg-primary/10 text-primary"
                    : "border-[#5799d1]/35 bg-[#5799d1]/5 text-[#5799d1]"
              }`}
            >
              <span className="font-medium">{chip.label}</span>
              <span className="text-muted-foreground">— {chip.note}</span>
            </li>
          ))}
        </ul>
      </header>

      {/* ================= EQUIPMENT CATALOGUE ================= */}
      <section aria-labelledby="lab3d-catalogue" className="mt-8">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <h2 id="lab3d-catalogue" className="text-base font-semibold sm:text-lg">
            Hardware records
          </h2>
          <p className="font-mono text-[11px] text-muted-foreground">
            {equipment.length} records · {withModel} with schematic 3D models
          </p>
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {equipment.map((eq) => {
            const hasModel = eq.model3d !== null;
            const isSelected = selectedId === eq.id && hasModel;
            return (
              <article
                key={eq.id}
                aria-current={isSelected ? "true" : undefined}
                onClick={hasModel ? () => selectEquipment(eq.id) : undefined}
                className={`glass-panel flex flex-col gap-3 rounded-xl p-4 transition-colors ${
                  hasModel ? "cursor-pointer hover:border-primary/50" : ""
                } ${isSelected ? "border-primary/70 ring-1 ring-primary/40" : ""}`}
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-sm font-semibold leading-snug">{eq.name}</h3>
                  <TypeBadge type={eq.type} />
                </div>
                <p className="line-clamp-3 text-xs leading-relaxed text-muted-foreground">{eq.description}</p>

                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">used by</span>
                  {eq.usedBy.map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openInvestigation(acc);
                      }}
                      className="rounded border border-border bg-secondary/60 px-1.5 py-0.5 font-mono text-[10px] transition-colors hover:border-primary/60 hover:text-primary focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                    >
                      {acc}
                    </button>
                  ))}
                </div>

                <p className="provenance-strip">{eq.sourceNote}</p>

                <div className="mt-auto flex flex-wrap items-center justify-between gap-2 pt-1">
                  <FidelityChip fidelity={eq.fidelity} />
                  <div className="flex items-center gap-1.5">
                    {hasModel ? (
                      <Button
                        size="sm"
                        variant={isSelected ? "default" : "secondary"}
                        onClick={(e) => {
                          e.stopPropagation();
                          selectEquipment(eq.id);
                        }}
                      >
                        <Boxes className="mr-1 h-3.5 w-3.5" aria-hidden="true" />
                        View model
                      </Button>
                    ) : (
                      <span className="text-[10px] italic text-muted-foreground">no 3D model — record only</span>
                    )}
                    <a
                      href={eq.sourceLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="inline-flex items-center gap-1 rounded-md border border-border/70 px-2 py-1.5 text-[11px] text-muted-foreground transition-colors hover:border-primary/50 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                    >
                      View source
                      <ExternalLink className="h-3 w-3" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* ================= APPARATUS VIEWER ================= */}
      {selected && selected.model3d && (
        <section id="apparatus-viewer" aria-labelledby="apparatus-viewer-title" className="mt-10 scroll-mt-20">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 id="apparatus-viewer-title" className="text-base font-semibold sm:text-lg">
              Apparatus viewer — <span className="text-muted-foreground">{selected.name}</span>
            </h2>
            <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">
              schematic — source-based reconstruction
            </Badge>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
            {/* 3D model */}
            <div className="glass-panel relative min-h-[380px] overflow-hidden rounded-xl sm:min-h-[480px]">
              <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-primary/40 bg-[color:var(--space-deep)]/85 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-primary backdrop-blur-sm">
                schematic — source-based reconstruction
              </div>
              <div className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-md border border-border/60 bg-[color:var(--space-deep)]/85 px-2.5 py-1.5 backdrop-blur-sm">
                <Switch id="part-labels" checked={showLabels} onCheckedChange={setShowLabels} aria-label="Show part labels" />
                <Label htmlFor="part-labels" className="text-[11px] text-muted-foreground">
                  Show part labels
                </Label>
              </div>

              {/* §3 interaction modes: assembled / cutaway / exploded + camera presets */}
              <div className="absolute bottom-3 left-1/2 z-10 flex -translate-x-1/2 flex-wrap items-center justify-center gap-1 rounded-lg border border-border/60 bg-[color:var(--space-deep)]/90 px-2 py-1.5 backdrop-blur-md">
                {([
                  ["assembled", "Assembled"],
                  ["cutaway", "Cutaway"],
                  ["exploded", "Exploded"],
                ] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    aria-pressed={viewMode === mode}
                    className={cn(
                      "rounded px-2 py-1 text-[10px] font-medium transition-colors",
                      viewMode === mode ? "bg-primary/25 text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
                <span className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />
                {([
                  ["front", "Front"],
                  ["interior", "Interior"],
                  ["top", "Top"],
                ] as const).map(([preset, label]) => (
                  <button
                    key={preset}
                    onClick={() => setCameraPreset(preset)}
                    aria-pressed={cameraPreset === preset}
                    className={cn(
                      "rounded px-2 py-1 text-[10px] font-medium transition-colors",
                      cameraPreset === preset ? "bg-primary/25 text-primary" : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
                {selectedPart && (
                  <>
                    <span className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />
                    <button
                      onClick={() => setIsolated(isolated ? null : selectedPart.id)}
                      aria-pressed={!!isolated}
                      className={cn(
                        "rounded px-2 py-1 text-[10px] font-medium transition-colors",
                        isolated ? "bg-primary/25 text-primary" : "text-muted-foreground hover:text-foreground",
                      )}
                      title={isolated ? "Restore all components" : `Isolate the ${selectedPart.name} to inspect it alone`}
                    >
                      {isolated ? "Show all" : "Isolate part"}
                    </button>
                  </>
                )}
              </div>

              {webglOk === false || viewerFailed ? (
                <SchematicFallback name={selected.name} parts={MODEL_PARTS[selected.model3d] ?? [selected.name]} />
              ) : webglOk === null ? (
                <div className="grid h-full place-items-center">
                  <p className="font-mono text-xs text-muted-foreground">loading schematic…</p>
                </div>
              ) : (
                <Deferred3D show={webglOk === true && !viewerFailed}>
                  <div className="h-full w-full animate-in fade-in duration-700">
                    <SceneBoundary onFail={() => setViewerFailed(true)}>
                      <ApparatusViewer
                        modelId={selected.model3d}
                        labels={showLabels}
                        onSelectPart={setSelectedPart}
                        explode={viewMode === "exploded" ? 1 : 0}
                        cutaway={viewMode === "cutaway"}
                        isolated={isolated}
                        cameraPreset={cameraPreset}
                      />
                    </SceneBoundary>
                  </div>
                </Deferred3D>
              )}

              <p className="pointer-events-none absolute bottom-3 left-3 z-10 font-mono text-[10px] text-muted-foreground">
                drag to orbit · scroll to zoom · click a part to identify it
              </p>

              {/* component detail overlay (brief §9.3) */}
              {selectedPart && (
                <div className="absolute bottom-3 right-3 z-10 max-w-[300px] rounded-lg border border-primary/50 bg-[color:var(--space-deep)]/92 p-3 shadow-xl backdrop-blur-md">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-xs font-semibold text-[color:var(--hotcore)]">{selectedPart.name}</p>
                    <button
                      className="rounded p-0.5 text-muted-foreground hover:text-foreground"
                      onClick={() => setSelectedPart(null)}
                      aria-label="Close part details"
                    >
                      ×
                    </button>
                  </div>
                  <p className="mt-1.5 text-[11px] leading-relaxed text-foreground/85">{selectedPart.function}</p>
                  <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">{selectedPart.sourceNote}</p>
                </div>
              )}
            </div>

            {/* metadata + photos */}
            <div className="flex flex-col gap-4">
              <div className="research-panel rounded-xl p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Equipment record</p>
                    <h3 className="mt-0.5 text-sm font-semibold leading-snug">{selected.name}</h3>
                  </div>
                  <div className="flex shrink-0 flex-col items-end gap-1.5">
                    <TypeBadge type={selected.type} />
                    <SaveItemButton kind="equipment" label={selected.name} detail={selected.description} url="#lab3d" />
                  </div>
                </div>
                <p className="mt-3 text-xs leading-relaxed">{selected.description}</p>
                <Separator className="my-3 bg-black/10" />
                <dl className="grid gap-2 text-xs">
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">Fidelity</dt>
                    <dd className="text-right">{selected.fidelityNote}</dd>
                  </div>
                  <div className="flex items-start justify-between gap-3">
                    <dt className="text-muted-foreground">Source</dt>
                    <dd className="text-right">
                      <a
                        href={selected.sourceLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-medium text-[#5799d1] underline underline-offset-2 hover:text-[#9ccae9]"
                      >
                        NASA facility page
                        <ExternalLink className="h-3 w-3" aria-hidden="true" />
                      </a>
                    </dd>
                  </div>
                </dl>
                <div className="mt-3 flex flex-wrap items-center gap-1.5">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">used by</span>
                  {selected.usedBy.map((acc) => (
                    <button
                      key={acc}
                      type="button"
                      onClick={() => openInvestigation(acc)}
                      className="rounded border border-border/50 bg-white/5 px-1.5 py-0.5 font-mono text-[10px] transition-colors hover:border-[#5799d1] hover:text-[#9ccae9]"
                    >
                      {acc}
                    </button>
                  ))}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full gap-1.5 border-primary/40 text-[11px] text-primary hover:border-primary"
                  onClick={() => {
                    setSelectedEquipment(selected.id);
                    setCopilotContext(`3D Lab equipment: ${selected.name}. ${selectedPart ? `User selected component: ${selectedPart.name}.` : ""}`);
                    setCopilotOpen(true);
                  }}
                >
                  Ask the Copilot about this apparatus
                </Button>
                <p className="provenance-strip mt-3">{selected.sourceNote}</p>
              </div>

              {/* interactive component list (keyboard-accessible alternative to 3D clicking) */}
              <div className="glass-panel rounded-xl p-4">
                <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                  <Wrench className="h-4 w-4 text-primary" aria-hidden="true" />
                  Components — click in 3D or select below
                </h4>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {(PART_INFO[selected.model3d] ?? []).map((p) => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedPart(selectedPart?.id === p.id ? null : p)}
                      aria-pressed={selectedPart?.id === p.id}
                      className={`rounded-full border px-2.5 py-1 text-[11px] transition-colors ${
                        selectedPart?.id === p.id
                          ? "border-primary/60 bg-primary/15 text-primary"
                          : "border-border/60 text-muted-foreground hover:border-primary/50 hover:text-foreground"
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                {selectedPart && (
                  <div className="mt-3 rounded-lg border border-border/50 bg-card/40 p-3">
                    <p className="text-xs font-semibold text-[color:var(--hotcore)]">{selectedPart.name}</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-foreground/85">{selectedPart.function}</p>
                    <p className="mt-1.5 font-mono text-[9px] uppercase tracking-wide text-muted-foreground">{selectedPart.sourceNote}</p>
                  </div>
                )}
                <p className="provenance-strip mt-3">
                  Part functions paraphrase public NASA facility pages linked from the equipment record — no engineering
                  specifications are claimed.
                </p>
              </div>

              {/* photo carousel */}
              <div className="glass-panel rounded-xl p-4">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="flex items-center gap-1.5 text-sm font-semibold">
                    <Camera className="h-4 w-4 text-primary" aria-hidden="true" />
                    Authentic NASA photos
                  </h4>
                  <span className="font-mono text-[10px] text-muted-foreground">{photos.length} in local index</span>
                </div>
                {photos.length === 0 ? (
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    No matching authentic NASA media in the recovered local index for this apparatus — shown as missing,
                    never fabricated.
                  </p>
                ) : (
                  <div className="data-scroll mt-3 flex gap-2 overflow-x-auto pb-2">
                    {photos.map((m, i) => (
                      <button
                        key={m.nasa_id}
                        type="button"
                        onClick={() => setLightboxIdx(i)}
                        aria-label={`Open NASA image: ${m.title}`}
                        className="relative shrink-0 overflow-hidden rounded-md border border-border/60 transition-colors hover:border-primary/60 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring"
                      >
                        <img
                          src={m.thumb}
                          alt={`${m.title} — credit NASA`}
                          loading="lazy"
                          className="h-20 w-28 object-cover sm:h-24 sm:w-32"
                        />
                      </button>
                    ))}
                  </div>
                )}
                <p className="provenance-strip mt-2">
                  NASA Images and Video Library · local index query “{EQUIPMENT_MEDIA_QUERY[selected.id] ?? selected.name}” · credit
                  NASA
                </p>
              </div>
            </div>
          </div>

          {/* ================= ANIMATED EXPERIMENT DEMONSTRATION (§9.4) ================= */}
          <div className="mt-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h3 className="text-base font-semibold sm:text-lg">Experiment method — animated demonstration</h3>
            </div>
            <ExperimentDemo key={selected.model3d} modelId={selected.model3d} equipmentName={selected.name} />
          </div>
        </section>
      )}

      {/* ================= OFFICIAL NASA GLB ASSETS (M8) ================= */}
      <OfficialNasaModels />

      {/* curated facility/research videos for equipment context */}
      <VideoShelf context="lab3d" />

      {/* ================= PHOTO LIGHTBOX ================= */}
      <Dialog open={lightboxIdx !== null} onOpenChange={(open) => !open && setLightboxIdx(null)}>
        <DialogContent className="max-w-3xl border-border/60 bg-[color:var(--space-panel)] sm:max-w-3xl">
          {lightboxPhoto && (
            <>
              <DialogHeader className="text-left">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <DialogTitle className="text-sm font-semibold leading-snug sm:text-base">{lightboxPhoto.title}</DialogTitle>
                    <DialogDescription className="text-[11px]">
                      {lightboxPhoto.center} · {lightboxPhoto.date_created.slice(0, 10)} ·{" "}
                      <span className="text-[#5799d1]">credit NASA</span> · id{" "}
                      <span className="font-mono">{lightboxPhoto.nasa_id}</span>
                    </DialogDescription>
                  </div>
                  <SaveItemButton
                    variant="icon"
                    kind="media"
                    label={lightboxPhoto.title}
                    detail={`${lightboxPhoto.center} · credit NASA · ${lightboxPhoto.nasa_id}`}
                    url={lightboxPhoto.full}
                    className="mt-0.5"
                  />
                </div>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg border border-border/60 bg-black/40">
                <img
                  src={lightboxPhoto.full}
                  alt={`${lightboxPhoto.title} — credit NASA`}
                  className="max-h-[62vh] w-full object-contain"
                />
              </div>
              {lightboxPhoto.description && (
                <p className="line-clamp-4 text-xs leading-relaxed text-muted-foreground">{lightboxPhoto.description}</p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
