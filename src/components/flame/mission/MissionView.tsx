"use client";

// FLAME EVIDENCE LAB — Mission view (M3): immersive mission entry.
// Hero with 3D destination journey (WebGL, graceful static fallback),
// corpus stats, environment switcher (persisted), evidence coverage,
// ranked findings and the authentic NASA media band.
// Honesty: all numbers come from the data API; the scene is schematic.

import { Component, useMemo, useState, useSyncExternalStore, type ReactNode } from "react";
import dynamic from "next/dynamic";
import { ArrowRight, Ban, FlaskConical, GitCompareArrows, MessageSquareText, Workflow, type LucideIcon } from "lucide-react";
import { useAppStore, VIEW_META, type EnvId, type ViewId } from "@/lib/app-store";
import { cn } from "@/lib/utils";
import { Deferred3D } from "@/components/flame/shell/Deferred3D";
import { EvidenceCoverageMap } from "@/components/flame/mission/EvidenceCoverageMap";
import { VideoShelf } from "@/components/flame/shell/VideoShelf";
import {
  getAtmospheres,
  getCorpusTotals,
  getEnvironment,
  getFindings,
  getGaps,
  getInvestigations,
  getMedia,
  searchMediaLocal,
  type AtmosphereEnv,
  type Finding,
  type MediaItem,
} from "@/lib/data/catalog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// Backup preserved: ./MissionScene (origin stylized scene) remains in the tree;
// the V2 mission map (real NASA textures + official ISS GLB) is the primary hero scene.
const MissionScene = dynamic(() => import("./MissionScene"), { ssr: false, loading: () => null });
const V2MissionMap = dynamic(() => import("./V2MissionMap"), { ssr: false, loading: () => null });

// ---------- small shared helpers ----------

const SUPERScript: Record<string, string> = { "-": "⁻", "0": "⁰", "1": "¹", "2": "²", "3": "³", "4": "⁴", "5": "⁵", "6": "⁶", "7": "⁷", "8": "⁸", "9": "⁹" };

function formatGravity(g: number): string {
  if (g === 0) return "0 g";
  if (g >= 0.01) return `${g} g`;
  const [mantissa, exponent] = g.toExponential(0).split("e");
  return `${mantissa}×10${exponent
    .split("")
    .map((ch) => SUPERScript[ch] ?? ch)
    .join("")} g`;
}

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

// ---------- static CSS fallback (no WebGL / scene failure / first paint) ----------

const FALLBACK_MARKERS: Record<string, { x: string; y: string }> = {
  earth: { x: "50%", y: "60%" },
  moon: { x: "15%", y: "26%" },
  mars: { x: "82%", y: "20%" },
  iss: { x: "67%", y: "42%" },
  spacecraft: { x: "27%", y: "70%" },
  spacesuit: { x: "42%", y: "80%" },
};

function StaticStarfield({ environments, selected }: { environments: AtmosphereEnv[]; selected: EnvId }) {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0"
      style={{
        background: [
          "radial-gradient(1.2px 1.2px at 12% 22%, rgba(255,255,255,.9), transparent)",
          "radial-gradient(1px 1px at 28% 64%, rgba(255,255,255,.7), transparent)",
          "radial-gradient(1.4px 1.4px at 41% 12%, rgba(252,218,167,.85), transparent)",
          "radial-gradient(1px 1px at 55% 34%, rgba(255,255,255,.6), transparent)",
          "radial-gradient(1.2px 1.2px at 68% 78%, rgba(255,255,255,.8), transparent)",
          "radial-gradient(1px 1px at 78% 55%, rgba(255,255,255,.6), transparent)",
          "radial-gradient(1.2px 1.2px at 88% 30%, rgba(255,255,255,.75), transparent)",
          "radial-gradient(1px 1px at 8% 48%, rgba(255,255,255,.55), transparent)",
          "radial-gradient(1px 1px at 33% 86%, rgba(255,255,255,.65), transparent)",
          "radial-gradient(1.2px 1.2px at 62% 8%, rgba(255,255,255,.7), transparent)",
          "radial-gradient(1px 1px at 92% 84%, rgba(255,255,255,.6), transparent)",
          "radial-gradient(1px 1px at 18% 72%, rgba(255,255,255,.5), transparent)",
          "radial-gradient(1000px 640px at 82% -12%, rgba(87,153,209,.16), transparent 60%)",
          "radial-gradient(860px 560px at -12% 24%, rgba(84,68,150,.22), transparent 55%)",
          "radial-gradient(1300px 860px at 50% 122%, rgba(153,86,60,.13), transparent 62%)",
        ].join(", "),
      }}
    >
      {environments.map((env) => {
        const pos = FALLBACK_MARKERS[env.id] ?? { x: "50%", y: "50%" };
        const active = env.id === selected;
        return (
          <div key={env.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: pos.x, top: pos.y }}>
            <span className={`block h-1.5 w-1.5 rounded-full ${active ? "bg-[#fcdaa7] shadow-[0_0_10px_2px_rgba(252,218,167,.55)]" : "bg-white/55"}`} />
            <span className={`mt-1 block whitespace-nowrap font-mono text-[9px] ${active ? "text-[#fcdaa7]" : "text-white/45"}`}>{env.label}</span>
          </div>
        );
      })}
    </div>
  );
}

// ---------- hero pieces ----------

function KindBadge({ kind }: { kind: string }) {
  if (kind === "flight-proven") {
    return <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">flight-proven</Badge>;
  }
  if (kind === "concept") {
    return <Badge className="border-[#5799d1]/40 bg-[#5799d1]/10 text-[#5799d1] hover:bg-[#5799d1]/10">concept</Badge>;
  }
  return <Badge variant="secondary">reference</Badge>;
}

function StatBlock({ value, label, provenance }: { value: number; label: string; provenance: string }) {
  return (
    <div className="glass-panel rounded-lg p-3 transition-transform duration-300 hover:-translate-y-0.5">
      <div className="mono-readout text-2xl font-semibold leading-none sm:text-3xl">{value.toLocaleString("en-US")}</div>
      <div className="mt-1.5 text-[11px] font-medium uppercase tracking-wider text-foreground/80">{label}</div>
      <div className="mt-1 text-[10px] leading-snug text-muted-foreground">{provenance}</div>
    </div>
  );
}

function DestinationChip({ env, active, onSelect }: { env: AtmosphereEnv; active: boolean; onSelect: (env: AtmosphereEnv) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(env)}
      aria-pressed={active}
      className={`pointer-events-auto inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ${
        active
          ? "border-primary/70 bg-primary/15 text-[color:var(--hotcore)] ring-1 ring-primary/40"
          : "border-border/60 bg-[color:var(--space-panel)]/60 text-foreground/85 hover:border-primary/50 hover:text-foreground"
      }`}
    >
      <span
        aria-hidden="true"
        className={`h-1.5 w-1.5 rounded-full ${env.kind === "flight-proven" ? "bg-primary" : env.kind === "concept" ? "bg-[#5799d1]" : "bg-muted-foreground/60"}`}
      />
      {env.label}
      {env.kind === "concept" && (
        <span className="rounded border border-[#5799d1]/40 px-1 text-[9px] uppercase tracking-wide text-[#5799d1]">concept</span>
      )}
      {env.kind === "flight-proven" && (
        <span className="rounded border border-primary/40 px-1 text-[9px] uppercase tracking-wide text-primary">flight-proven</span>
      )}
    </button>
  );
}

function EnvironmentCard({ env, note }: { env: AtmosphereEnv; note: string }) {
  return (
    <div className="pointer-events-auto w-full rounded-xl border border-border/60 bg-[color:var(--space-deep)]/92 p-4 shadow-xl backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Research environment</p>
          <h3 className="mt-0.5 truncate text-sm font-semibold">{env.label}</h3>
        </div>
        <KindBadge kind={env.kind} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 font-mono text-xs">
        <div>
          <dt className="whitespace-nowrap text-[9px] uppercase tracking-wider text-muted-foreground">gravity</dt>
          <dd className="mono-readout">{formatGravity(env.gravityG)}</dd>
        </div>
        <div>
          <dt className="whitespace-nowrap text-[9px] uppercase tracking-wider text-muted-foreground">pressure</dt>
          <dd className="mono-readout whitespace-nowrap text-[11px]">{env.totalPressurePsi} psi · {env.totalPressureKpa} kPa</dd>
        </div>
        <div>
          <dt className="whitespace-nowrap text-[9px] uppercase tracking-wider text-muted-foreground">O₂ frac.</dt>
          <dd className="mono-readout">{Math.round(env.o2Fraction * 100)}%</dd>
        </div>
        <div>
          <dt className="whitespace-nowrap text-[9px] uppercase tracking-wider text-muted-foreground">pO₂</dt>
          <dd className="mono-readout">{env.pO2Kpa} kPa</dd>
        </div>
        <div className="col-span-2">
          <dt className="whitespace-nowrap text-[9px] uppercase tracking-wider text-muted-foreground">diluents</dt>
          <dd className="mono-readout">{env.diluents}</dd>
        </div>
      </dl>
      <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{env.evidenceStatus}</p>
      <p className="provenance-strip mt-3">{note}</p>
    </div>
  );
}

// ---------- findings ----------

function TierBadge({ tier }: { tier: Finding["tier"] }) {
  if (tier === "verified") {
    return <Badge className="border-primary/40 bg-primary/15 text-primary hover:bg-primary/15">verified</Badge>;
  }
  if (tier === "negative-result") {
    return <Badge variant="secondary" className="text-muted-foreground">negative result</Badge>;
  }
  return <Badge className="border-[#5799d1]/40 bg-[#5799d1]/10 text-[#5799d1] hover:bg-[#5799d1]/10">source-reported</Badge>;
}

// ---------- view ----------

export function MissionView() {
  const environment = useAppStore((s) => s.environment);
  const setEnvironment = useAppStore((s) => s.setEnvironment);
  const setView = useAppStore((s) => s.setView);
  const setCopilotOpen = useAppStore((s) => s.setCopilotOpen);
  const setCopilotContext = useAppStore((s) => s.setCopilotContext);

  const [sceneFailed, setSceneFailed] = useState(false);
  const webglOk = useWebGLSupport();
  // Task 4 — V2 mission map interactivity state
  const [mapBodiesHidden, setMapBodiesHidden] = useState<Record<string, boolean>>({});
  const [mapIsolate, setMapIsolate] = useState<string | null>(null);
  const [mapResetSignal, setMapResetSignal] = useState(0);

  // store EnvId → V2 map id ("moon" ↔ "lunar")
  const mapEnvId = environment === "moon" ? "lunar" : environment === "mars" ? "mars" : environment === "iss" ? "iss" : environment === "spacecraft" ? "spacecraft" : null;

  const atmo = useMemo(() => getAtmospheres(), []);
  const investigations = useMemo(() => getInvestigations(), []);
  const totals = useMemo(() => getCorpusTotals(), []);
  const mediaIndex = useMemo(() => getMedia(), []);
  const findings = useMemo(() => getFindings(), []);
  const gaps = useMemo(() => getGaps(), []);

  const selectedEnv = useMemo(
    () => atmo.environments.find((e) => e.id === environment) ?? atmo.environments[0],
    [atmo, environment],
  );

  const partialGap = gaps.find((g) => g.id === "gap-partial-g");
  const mediaGap = gaps.find((g) => g.id === "gap-media-batch");
  const moonG = getEnvironment("moon")?.gravityG;
  const marsG = getEnvironment("mars")?.gravityG;

  const mediaBand = useMemo(() => {
    const primary = searchMediaLocal("Combustion Integrated Rack", 8);
    const extra = searchMediaLocal("microgravity combustion", 8);
    const seen = new Set<string>();
    const out: MediaItem[] = [];
    for (const m of [...primary, ...extra]) {
      if (!seen.has(m.nasa_id)) {
        seen.add(m.nasa_id);
        out.push(m);
      }
      if (out.length >= 6) break;
    }
    return out;
  }, []);

  const stats: { value: number; label: string; provenance: string }[] = [
    { value: investigations.length, label: "PSI investigations", provenance: "NASA Physical Sciences Informatics records" },
    { value: totals.tables ?? 0, label: "recovered data tables", provenance: "recovered from NASA PSI, sha256-verified" },
    { value: totals.rows ?? 0, label: "experimental table rows", provenance: "recovered from NASA PSI, sha256-verified" },
    { value: mediaIndex.length, label: "authentic NASA media items", provenance: "NASA Images and Video Library — credit NASA" },
  ];

  const entryPoints: { view: ViewId; icon: LucideIcon }[] = [
    { view: "investigations", icon: FlaskConical },
    { view: "compare", icon: GitCompareArrows },
    { view: "scenarios", icon: Workflow },
  ];

  const wontDo = [
    {
      title: "Not certified fire protection",
      detail: "Research decision support over recovered NASA evidence — no spacecraft fire-safety certification is claimed or implied.",
    },
    {
      title: "No operational emergency instructions",
      detail: "Spacecraft fire response lives in official NASA crew procedures; this lab provides none and improvises none.",
    },
    {
      title: "No partial-gravity predictions",
      detail: `No validated lunar (${moonG} g) or Martian (${marsG} g) combustion outcomes exist in the recovered PSI corpus; verified models refuse those inputs.`,
    },
    {
      title: "Missing media stays missing",
      detail: "Historically indexed research media binaries are not recovered in this environment — gaps are shown as gaps, never fabricated.",
    },
  ];

  const handleSelectEnv = (env: AtmosphereEnv) => {
    setEnvironment(env.id as EnvId, env.label);
  };

  const openCopilot = () => {
    setCopilotContext(
      `Mission overview — ${investigations.length} recovered NASA PSI microgravity combustion investigations, destination atmospheres and ranked findings. Ask about any of them.`,
    );
    setCopilotOpen(true);
  };

  const sceneActive = webglOk === true && !sceneFailed;

  return (
    <div className="pb-24">
      {/* ================= HERO ================= */}
      <section aria-labelledby="mission-hero-title" className="relative -mx-3 -mt-4 min-h-[85vh] overflow-hidden sm:-mx-6 sm:-mt-6">
        {/* ZERO FLARE brand-art backdrop (supplied team reference) — sits under the scene layer,
            fully visible in the static fallback state, softly mixed under the 3D scene otherwise */}
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url(/brand/spaceapps_cosmic_iss_background.png)",
            opacity: sceneActive ? 0.3 : 1,
          }}
        />
        {/* scene layer: V2 mission map (real NASA textures + ISS GLB) when WebGL is available, static schematic otherwise */}
        <div className="absolute inset-0">
          <Deferred3D show={sceneActive}>
            <div className="h-full w-full animate-in fade-in duration-700">
              <SceneBoundary onFail={() => setSceneFailed(true)}>
                <V2MissionMap
                  selected={(mapEnvId as never) ?? null}
                  traveling={false}
                  onSelect={(v2Id) => {
                    const storeId = v2Id === "lunar" ? "moon" : v2Id;
                    handleSelectEnv(atmo.environments.find((e) => e.id === storeId) ?? selectedEnv);
                  }}
                  onArrive={() => undefined}
                  hidden={mapBodiesHidden}
                  isolate={mapIsolate as never}
                  resetSignal={mapResetSignal}
                />
              </SceneBoundary>
            </div>
          </Deferred3D>
          {!sceneActive && <StaticStarfield environments={atmo.environments} selected={environment} />}
        </div>

        {/* Task 4 — mission scene controls: body visibility, isolate, reset */}
        {sceneActive && (
          <div
            role="toolbar"
            aria-label="Mission scene controls"
            className="pointer-events-auto absolute bottom-3 right-3 z-20 flex flex-wrap items-center justify-end gap-1 rounded-lg border border-border/60 bg-[color:var(--space-deep)]/90 px-2 py-1.5 backdrop-blur-md"
          >
            {([
              ["earth", "Earth"],
              ["moon", "Moon"],
              ["mars", "Mars"],
              ["iss", "ISS"],
              ["rover", "Rover"],
              ["spacecraft", "Craft"],
            ] as const).map(([id, label]) => {
              const active = mapIsolate ? mapIsolate === id : !mapBodiesHidden[id];
              return (
                <button
                  key={id}
                  onClick={() => {
                    setMapIsolate(null);
                    setMapBodiesHidden((prev) => ({ ...prev, [id]: !prev[id] }));
                  }}
                  aria-pressed={active}
                  title={active ? `Hide ${label}` : `Show ${label}`}
                  className={cn(
                    "rounded px-2 py-1 text-[10px] font-medium transition-colors",
                    active ? "bg-primary/25 text-primary" : "text-muted-foreground/60 line-through hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              );
            })}
            <span className="mx-1 h-4 w-px bg-border/60" aria-hidden="true" />
            <button
              onClick={() => {
                setMapBodiesHidden({});
                setMapIsolate(null);
                setMapResetSignal((n) => n + 1);
              }}
              className="rounded px-2 py-1 text-[10px] font-medium text-muted-foreground transition-colors hover:text-foreground"
              title="Restore the complete scene and reset the camera"
            >
              Reset scene
            </button>
          </div>
        )}

        {/* origin blueprint grid — technical-drawing overlay above the scene, below content */}
        <div aria-hidden="true" className="blueprint-overlay pointer-events-none absolute inset-0 z-[2]" />

        {/* readability scrims (never block pointer events) — strengthened left band keeps glass stat cards legible over the scene */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] bg-gradient-to-b from-[color:var(--space-deep)]/80 via-[color:var(--space-deep)]/40 to-[color:var(--space-deep)]/85" />
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-[1] hidden bg-gradient-to-r from-[color:var(--space-deep)]/92 via-[color:var(--space-deep)]/62 to-transparent lg:block lg:w-[64%]" />

        {/* overlay content */}
        <div className="pointer-events-none relative z-10 mx-auto flex w-full max-w-[1600px] flex-col px-4 pb-16 pt-12 sm:px-8 sm:pt-16 lg:pt-20">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_330px] lg:gap-10">
            <div className="flex min-w-0 flex-col">
              <p className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
                <span className="rounded-full border border-border/60 px-2 py-0.5">NASA Space Apps 2026 · Flame in Freefall</span>
                <span className="ember-gradient-text font-semibold">Zero Flare Mission Team</span>
              </p>

              <h1 id="mission-hero-title" className="mt-4 max-w-2xl text-3xl font-semibold leading-tight tracking-tight sm:text-4xl lg:text-5xl">
                Microgravity fire evidence,
                <span className="hero-gradient-text"> ready for research.</span>
              </h1>

              <p className="mt-4 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {investigations.length} NASA PSI combustion investigations, {totals.tables ?? 0} recovered experimental tables
                (SHA-256-verified), a verified equation registry and guarded models — one traceable research environment.
              </p>

              {/* stats */}
              <div className="pointer-events-none mt-8 grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
                {stats.map((s) => (
                  <StatBlock key={s.label} value={s.value} label={s.label} provenance={s.provenance} />
                ))}
              </div>

              {/* destination chips */}
              <div className="mt-8">
                <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
                  Destinations — pick a research environment
                </p>
                <div className="mt-2.5 flex flex-wrap gap-2">
                  {atmo.environments.map((env) => (
                    <DestinationChip key={env.id} env={env} active={env.id === environment} onSelect={handleSelectEnv} />
                  ))}
                </div>
              </div>

              {/* CTAs */}
              <div className="pointer-events-auto mt-6 flex flex-wrap gap-3">
                <Button size="lg" onClick={() => setView("investigations")} className="cta-glow font-semibold">
                  Enter Investigations
                  <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
                </Button>
                <Button size="lg" variant="outline" onClick={() => useAppStore.getState().setDemoOpen(true)} className="cta-glow-cool border-primary/50 text-primary">
                  <Workflow className="mr-1 h-4 w-4" aria-hidden="true" />
                  90-second guided tour
                </Button>
                <Button size="lg" variant="outline" onClick={openCopilot} className="cta-glow-cool border-border/70">
                  <MessageSquareText className="mr-1 h-4 w-4" aria-hidden="true" />
                  Ask the Copilot
                </Button>
              </div>
            </div>

            {/* environment card (compact, follows selection) */}
            <div className="lg:mt-auto lg:self-end">
              <EnvironmentCard env={selectedEnv} note={atmo.note} />
            </div>
          </div>
        </div>

        {/* honesty caption over the scene — static under the hero on mobile, absolute on sm+ */}
        <div className="z-10 max-w-[320px] max-sm:pointer-events-auto max-sm:static max-sm:mx-4 max-sm:mt-2 sm:pointer-events-none sm:absolute sm:bottom-4 sm:left-4">
          <p className="rounded-md border border-border/50 bg-[color:var(--space-deep)]/80 px-2.5 py-1.5 text-[10px] leading-relaxed text-muted-foreground backdrop-blur-sm">
            Schematic scene — stylized, not to scale. Official NASA 3D assets are linked in the{" "}
            <button
              type="button"
              onClick={() => setView("lab3d")}
              className="pointer-events-auto font-medium text-[#5799d1] underline underline-offset-2 hover:text-[#8fbfe8]"
            >
              3D Lab
            </button>
            .
          </p>
        </div>
      </section>

      {/* ================= ENVIRONMENT JOURNEY ================= */}
      <section aria-labelledby="mission-journey" className="mt-12 sm:mt-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">The journey</p>
        <h2 id="mission-journey" className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          Research environments — Earth to Mars
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground">
          Fire behaviour changes fundamentally with gravity and atmosphere. Select a destination to scope the whole
          platform — its reference atmosphere follows you into Scenarios, calculators and the Copilot.
        </p>
        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              id: "iss",
              img: "/media/environments/env-iss-orbit.jpg",
              title: "International Space Station",
              desc: "Flight-era microgravity fire evidence — every recovered PSI outcome row lives here.",
            },
            {
              id: "moon",
              img: "/media/environments/env-lunar-base.jpg",
              title: "Lunar habitat (concept)",
              desc: "0.166 g, reduced pressure, O₂-enriched — flammability rises with oxygen fraction.",
            },
            {
              id: "mars",
              img: "/media/environments/env-mars-rover.jpg",
              title: "Mars habitat (concept)",
              desc: "0.38 g partial gravity — no validated combustion outcomes exist yet.",
            },
            {
              id: "spacecraft",
              img: "/media/environments/env-spacecraft-cabin.jpg",
              title: "Spacecraft cabin (concept)",
              desc: "Transit environment — detection and suppression evidence from Saffire applies.",
            },
          ].map((env) => {
            const active = environment === env.id;
            const envRecord = atmo.environments.find((e) => e.id === env.id);
            return (
              <button
                key={env.id}
                type="button"
                onClick={() => handleSelectEnv(atmo.environments.find((e) => e.id === env.id) ?? selectedEnv)}
                aria-pressed={active}
                className={`group relative flex flex-col overflow-hidden rounded-xl border text-left transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring hover:-translate-y-1 hover:shadow-[0_18px_44px_-14px_rgba(3,11,38,0.9)] ${
                  active ? "border-primary/70 ring-1 ring-primary/40" : "border-border/60 hover:border-primary/50"
                }`}
              >
                <div className="relative">
                  <img
                    src={env.img}
                    alt={`${env.title} — concept environment imagery`}
                    loading="lazy"
                    className={`aspect-[16/10] w-full object-cover transition-transform duration-700 group-hover:scale-105 ${active ? "" : "opacity-90"}`}
                  />
                  {/* unified colour-grade + gradient blend into the card body (no hard cut) */}
                  <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#0a1030] via-[#0a1030]/35 to-transparent" />
                  <div aria-hidden="true" className="absolute inset-0 bg-[#5799d1] opacity-[0.07] mix-blend-overlay" />
                  {/* origin glass chips over the imagery — instrument readouts */}
                  <div className="absolute left-2.5 top-2.5 flex flex-wrap gap-1.5">
                    <span className="glass-chip font-mono">{envRecord ? formatGravity(envRecord.gravityG) : "—"}</span>
                    {envRecord && <span className="glass-chip font-mono">O₂ {Math.round(envRecord.o2Fraction * 100)}%</span>}
                  </div>
                  {active && (
                    <span className="absolute right-2.5 top-2.5 rounded-full border border-primary/60 bg-[color:var(--space-deep)]/85 px-2 py-0.5 text-[10px] font-semibold text-primary backdrop-blur-sm">
                      selected
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col bg-[#0a1030] p-3.5">
                  <p className="text-sm font-semibold leading-tight text-white">{env.title}</p>
                  <p className="mono-readout mt-1 text-[10.5px]">
                    {envRecord ? `${formatGravity(envRecord.gravityG)} · O₂ ${Math.round(envRecord.o2Fraction * 100)}% @ ${envRecord.totalPressurePsi} psi` : ""}
                  </p>
                  <p className="mt-1.5 text-[11px] leading-snug text-foreground/70">{env.desc}</p>
                  <span className="mt-auto inline-flex items-center gap-1 pt-2.5 text-[10px] font-semibold text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    Select environment <ArrowRight className="h-3 w-3" aria-hidden="true" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
        <p className="provenance-strip mt-3">
          Environment imagery from the project workspace archive (recovered 2026-11-12) — stylized concept art for the
          journey, NOT NASA photography; authentic NASA media is labelled separately below.
        </p>
      </section>

      {/* ================= EVIDENCE COVERAGE ================= */}
      <section aria-labelledby="mission-coverage" className="mt-12 sm:mt-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Evidence coverage</p>
        <h2 id="mission-coverage" className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          Start from the evidence
        </h2>

        <div className="mt-5 grid gap-4 md:grid-cols-3">
          {entryPoints.map(({ view, icon: Icon }) => (
            <button
              key={view}
              type="button"
              onClick={() => setView(view)}
              className="glass-panel group rounded-xl p-5 text-left transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
            >
              <div className="flex items-center justify-between">
                <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" aria-hidden="true" />
              </div>
              <h3 className="mt-3 text-sm font-semibold">{VIEW_META[view].label}</h3>
              <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{VIEW_META[view].hint}</p>
            </button>
          ))}
        </div>

        {/* honesty panel */}
        <div className="glass-panel mt-6 rounded-xl p-5 sm:p-6">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <Ban className="h-4 w-4 text-primary" aria-hidden="true" />
            What this lab will NOT do
          </h3>
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {wontDo.map((item) => (
              <li key={item.title} className="rounded-lg border border-border/50 bg-[color:var(--space-panel)]/50 p-3.5">
                <p className="text-xs font-semibold">{item.title}</p>
                <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{item.detail}</p>
              </li>
            ))}
          </ul>
          <p className="provenance-strip mt-4">
            Registered gaps in the evidence registry — {partialGap ? `${partialGap.id} (${partialGap.status})` : "partial-gravity: no evidence found"} ·{" "}
            {mediaGap ? `${mediaGap.id} (${mediaGap.status})` : "historical media: inaccessible"}. Full registry in Ingestion &amp; Sources.
          </p>
        </div>

        {/* Evidence Coverage Map — the audit's P1 matrix (observed / reported / conditions-only / not recorded) */}
        <EvidenceCoverageMap />

        {/* microgravity research context videos */}
        <VideoShelf context="mission" />
      </section>

      {/* ================= RANKED FINDINGS ================= */}
      <section aria-labelledby="mission-findings" className="mt-12 sm:mt-16">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Ranked findings</p>
            <h2 id="mission-findings" className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
              What the evidence says
            </h2>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setView("investigations")} className="text-muted-foreground">
            All investigations
            <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
          </Button>
        </div>

        <div className="data-scroll mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-3">
          {findings.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setView("investigations")}
              className="glass-panel flex min-w-[270px] max-w-[340px] snap-start flex-col gap-2.5 rounded-xl p-4 text-left transition-colors hover:border-primary/50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring sm:min-w-[320px]"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">rank #{f.rank}</span>
                <TierBadge tier={f.tier} />
              </div>
              <p className="line-clamp-3 text-sm leading-relaxed text-foreground/90">{f.statement}</p>
              <p className="provenance-strip">{f.basis}</p>
              <p className="text-[10px] italic leading-relaxed text-muted-foreground">Caveat: {f.caveat}</p>
              <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-medium text-primary">
                Open investigations
                <ArrowRight className="h-3 w-3" aria-hidden="true" />
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ================= AUTHENTIC MEDIA BAND ================= */}
      <section aria-labelledby="mission-media" className="mt-12 sm:mt-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-primary">Authentic media</p>
        <h2 id="mission-media" className="mt-1.5 text-xl font-semibold tracking-tight sm:text-2xl">
          NASA microgravity combustion imagery
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
          {mediaBand.map((m) => (
            <figure key={m.nasa_id} className="group relative overflow-hidden rounded-lg border border-border/60 bg-card">
              <img
                src={m.thumb}
                alt={`${m.title} — credit NASA`}
                loading="lazy"
                className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <figcaption className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/55 to-transparent p-2 pt-7">
                <p className="line-clamp-1 text-[11px] font-medium text-white">{m.title}</p>
                <p className="mt-0.5 text-[9px] text-white/70">
                  {m.center} · {m.date_created.slice(0, 10)} · Credit: NASA
                </p>
              </figcaption>
            </figure>
          ))}
        </div>

        <p className="provenance-strip mt-3">
          Source: NASA Images and Video Library (images.nasa.gov) — {mediaIndex.length} authentic items recovered in the local index; credit
          NASA. The full historical media set is not recovered in this environment and stays missing
          {mediaGap ? ` (registered gap ${mediaGap.id}: ${mediaGap.status})` : ""}.
        </p>
      </section>
    </div>
  );
}
