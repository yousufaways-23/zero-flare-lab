"use client";

// FLAME EVIDENCE LAB — Animated 3D experiment demonstration (enhancement brief §9.4).
// Plays the DOCUMENTED experiment procedure as an animated, step-annotated
// 3D scene: preparation → flow → ignition → flame growth → steady burn +
// diagnostics → termination → extinction/post-test.
// HONESTY: this is an ILLUSTRATIVE ANIMATION. The stages paraphrase the
// experiment flow documented in the NASA PSI investigation records; nothing
// here is a physically computed simulation (no CFD, no combustion solver).

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { APPARATUS_MODELS } from "@/components/flame/lab3d/ApparatusModels";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, RotateCcw, Clapperboard } from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Stage definitions per apparatus family — paraphrased from the documented
// experiment flow of the linked NASA PSI investigations. Windows are progress
// fractions (0..1) of the demo timeline.
// ---------------------------------------------------------------------------

export type DemoFamily = "burner-cone" | "droplet" | "duct" | "support";

interface DemoStage {
  id: string;
  label: string;
  detail: string;
  from: number;
  to: number;
}

const BURNER_STAGES: DemoStage[] = [
  { id: "prep", label: "Chamber preparation", detail: "Chamber sealed and purged; the planned test atmosphere (O₂/N₂ mixture and pressure) is established per the investigation matrix.", from: 0.0, to: 0.12 },
  { id: "flow", label: "Fuel + co-flow established", detail: "Fuel and shroud/co-flow gas streams start; operators verify steady flow rates before ignition.", from: 0.12, to: 0.28 },
  { id: "ignition", label: "Ignition", detail: "An igniter lights the gas jet at the nozzle rim. In microgravity the flame is spherical-to-conical, diffusion-driven — no buoyant teardrop.", from: 0.28, to: 0.36 },
  { id: "growth", label: "Flame growth", detail: "The diffusion flame grows toward its quasi-steady size set by the reactant flow rate and ambient oxygen.", from: 0.36, to: 0.54 },
  { id: "steady", label: "Quasi-steady burn + diagnostics", detail: "Cameras, radiometers and thin-filament pyrometry record the flame while conditions are held constant.", from: 0.54, to: 0.76 },
  { id: "terminate", label: "Fuel flow termination", detail: "Reactant flow is shut off; the flame loses its fuel supply and starts to shrink.", from: 0.76, to: 0.88 },
  { id: "extinction", label: "Extinction + post-test", detail: "The flame self-extinguishes as it approaches its radiative extinction limit; data are downlinked and the record lands in the PSI archive.", from: 0.88, to: 1.0 },
];

const DROPLET_STAGES: DemoStage[] = [
  { id: "deploy", label: "Droplet deployment", detail: "Opposing needles deploy a single fuel droplet at chamber center (book-and-needle deployment).", from: 0.0, to: 0.14 },
  { id: "retract", label: "Needle retraction", detail: "Needles retract, leaving the droplet free-floating in the quiescent test atmosphere.", from: 0.14, to: 0.24 },
  { id: "ignition", label: "Ignition — hot flame", detail: "A hot spherical diffusion flame wraps the droplet. In microgravity it is perfectly spherical and soot shells can form.", from: 0.24, to: 0.34 },
  { id: "burning", label: "Spherical burn + droplet regression", detail: "The droplet vaporizes and shrinks while the flame burns; the D²-law regime documented in FLEX/FLEX-2.", from: 0.34, to: 0.62 },
  { id: "cool", label: "Hot-flame extinction → cool-flame regime", detail: "After hot-flame extinction a low-temperature cool flame can persist and even re-ignite — the FLEX discovery with fire-safety implications.", from: 0.62, to: 0.84 },
  { id: "burnout", label: "Burnout / final extinction", detail: "The droplet consumes or the cool flame radiatively extinguishes; post-test imaging completes the record.", from: 0.84, to: 1.0 },
];

const DUCT_STAGES: DemoStage[] = [
  { id: "flow", label: "Duct flow establishment", detail: "Forced ventilation flow is established through the instrumented duct, mimicking spacecraft cabin airflow over the sample face.", from: 0.0, to: 0.14 },
  { id: "ignite", label: "Upstream sample ignition", detail: "The upstream edge of the sample card is ignited — the start of a large-scale microgravity flame-spread test.", from: 0.14, to: 0.28 },
  { id: "spread", label: "Flame spread along samples", detail: "The flame front propagates across the sample material against/with the ventilation flow, as documented in the SAFFIRE series.", from: 0.28, to: 0.62 },
  { id: "steady", label: "Steady spread + instrumentation", detail: "Heat flux, temperature and gas sensors along the duct record the spreading fire.", from: 0.62, to: 0.82 },
  { id: "burnout", label: "Burnout / extinction", detail: "The sample is consumed or the flame weakens and extinguishes; the autonomous data package is downlinked.", from: 0.82, to: 1.0 },
];

export const DEMO_STAGES: Record<DemoFamily, DemoStage[]> = {
  "burner-cone": BURNER_STAGES,
  droplet: DROPLET_STAGES,
  duct: DUCT_STAGES,
  support: [],
};

const MODEL_FAMILY: Record<string, DemoFamily> = {
  "acme-burner": "burner-cone",
  "spice-burner": "burner-cone",
  "mdca-droplet": "droplet",
  "saffire-duct": "duct",
  "cir-rack": "support",
  "msg-glovebox": "support",
};

const EMBER = "#e8823f";
const HOTCORE = "#fcdaa7";
const COOLBLUE = "#5799d1";
const FLOWBLUE = "#8fbfe8";

/** Shared mutable progress (0..1) — updated by the UI loop, read in useFrame
 * so the canvas animates without React re-renders. */
export interface DemoDriver {
  progress: number;
  reducedMotion: boolean;
}

// ---------------------------------------------------------------------------
// In-canvas effects
// ---------------------------------------------------------------------------

function envelope(p: number, from: number, to: number): number {
  if (p <= from || p >= to) return 0;
  return (p - from) / (to - from);
}

/** Ignition spark — bright flickering flash inside the ignition window. */
function Spark({ position, driver, window: [from, to] }: { position: [number, number, number]; driver: React.MutableRefObject<DemoDriver>; window: [number, number] }) {
  const ref = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const e = envelope(driver.current.progress, from, to);
    const on = e > 0;
    if (ref.current) ref.current.visible = on;
    if (light.current) light.current.intensity = on ? 8 + Math.sin(clock.elapsedTime * 40) * 4 : 0;
  });
  return (
    <group position={position}>
      <mesh ref={ref} visible={false}>
        <sphereGeometry args={[0.05, 10, 8]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
      <pointLight ref={light} color="#fff3d6" distance={2.4} intensity={0} />
    </group>
  );
}

/** Gas-flow tracer particles (burner: up along +Y; duct: along +X). */
function FlowParticles({ driver, axis, count = 26, span = 1.2, window: [from, to], origin }: {
  driver: React.MutableRefObject<DemoDriver>;
  axis: "y" | "x";
  count?: number;
  span?: number;
  window: [number, number];
  origin: [number, number, number];
}) {
  const group = useRef<THREE.Group>(null);
  const seeds = useMemo(
    () => Array.from({ length: count }, (_, i) => ({ phase: (i / count) % 1, offset: ((i * 37) % 11) / 11 - 0.5 })),
    [count],
  );
  useFrame(({ clock }) => {
    if (!group.current) return;
    const p = driver.current.progress;
    // visible from window start until flame extinction begins (flow stops at termination)
    const active = p >= from && p < to;
    group.current.visible = active;
    if (!active) return;
    const t = clock.elapsedTime * 0.55;
    group.current.children.forEach((child, i) => {
      const s = seeds[i];
      const pos = ((t + s.phase) % 1);
      if (axis === "y") {
        child.position.set(origin[0] + s.offset * 0.12, origin[1] + pos * span, origin[2] + (s.offset * 0.3));
      } else {
        child.position.set(origin[0] + pos * span, origin[1] + s.offset * 0.1, origin[2] + (s.offset * 0.12));
      }
    });
  });
  return (
    <group ref={group}>
      {seeds.map((s, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.014, 6, 5]} />
          <meshBasicMaterial color={FLOWBLUE} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  );
}

/** Animated burner flame (cone pair) — scale driven by the stage envelope. */
function BurnerFlame({ driver, position }: { driver: React.MutableRefObject<DemoDriver>; position: [number, number, number] }) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const p = driver.current.progress;
    // growth: 0.36→0.54 ramps 0→1; steady 0.54→0.76 = 1; termination 0.76→0.88 ramps 1→0; after: 0
    let s = 0;
    if (p >= 0.36 && p < 0.54) s = envelope(p, 0.36, 0.54);
    else if (p >= 0.54 && p < 0.76) s = 1;
    else if (p >= 0.76 && p < 0.92) s = 1 - envelope(p, 0.76, 0.92);
    const flicker = driver.current.reducedMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 3.2) * 0.05 * s;
    const scale = Math.max(0.0001, s * flicker);
    if (outer.current) {
      outer.current.scale.set(scale, scale * (driver.current.reducedMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 2.2) * 0.06), scale);
      (outer.current.material as THREE.MeshStandardMaterial).opacity = 0.5 * s;
    }
    if (inner.current) {
      inner.current.scale.setScalar(Math.max(0.0001, s * 0.6));
      (inner.current.material as THREE.MeshStandardMaterial).opacity = 0.9 * s;
    }
    if (light.current) light.current.intensity = 3.5 * s;
  });
  return (
    <group position={position}>
      <mesh ref={outer}>
        <coneGeometry args={[0.17, 0.6, 20]} />
        <meshStandardMaterial color={EMBER} emissive={EMBER} emissiveIntensity={1.5} transparent opacity={0.5} roughness={0.35} depthWrite={false} />
      </mesh>
      <mesh ref={inner} position={[0, -0.03, 0]}>
        <coneGeometry args={[0.1, 0.44, 16]} />
        <meshStandardMaterial color={HOTCORE} emissive={HOTCORE} emissiveIntensity={2.1} transparent opacity={0.9} depthWrite={false} />
      </mesh>
      <pointLight ref={light} color={EMBER} distance={3} intensity={0} />
    </group>
  );
}

/** Animated droplet + flame shells (spherical diffusion flame). */
function DropletFlame({ driver }: { driver: React.MutableRefObject<DemoDriver> }) {
  const droplet = useRef<THREE.Mesh>(null);
  const hotShell = useRef<THREE.Mesh>(null);
  const coolShell = useRef<THREE.Mesh>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const p = driver.current.progress;
    // droplet: grows 0→0.14 (deploy), shrinks 0.34→0.84 (regression), gone after
    let d = 0;
    if (p < 0.14) d = envelope(p, 0, 0.14);
    else if (p < 0.34) d = 1;
    else if (p < 0.84) d = 1 - 0.72 * envelope(p, 0.34, 0.84);
    else d = 0;
    // hot flame: 0.24→0.34 ramp in, holds, dims 0.62→0.74 (hot extinction)
    let hot = 0;
    if (p >= 0.24 && p < 0.34) hot = envelope(p, 0.24, 0.34);
    else if (p >= 0.34 && p < 0.62) hot = 1;
    else if (p >= 0.62 && p < 0.74) hot = 1 - envelope(p, 0.62, 0.74);
    // cool flame: appears 0.62→0.72, faint blue, extinguishes 0.84→0.96
    let cool = 0;
    if (p >= 0.62 && p < 0.72) cool = envelope(p, 0.62, 0.72);
    else if (p >= 0.72 && p < 0.84) cool = 1;
    else if (p >= 0.84 && p < 0.96) cool = 1 - envelope(p, 0.84, 0.96);
    const pulse = driver.current.reducedMotion ? 1 : 1 + Math.sin(clock.elapsedTime * 2.4) * 0.05;
    if (droplet.current) droplet.current.scale.setScalar(Math.max(0.0001, d * pulse));
    if (hotShell.current) {
      hotShell.current.scale.setScalar(Math.max(0.0001, (0.6 + 0.4 * hot) * pulse));
      (hotShell.current.material as THREE.MeshStandardMaterial).opacity = 0.3 * hot;
    }
    if (coolShell.current) {
      coolShell.current.scale.setScalar(Math.max(0.0001, 0.5 * pulse));
      (coolShell.current.material as THREE.MeshStandardMaterial).opacity = 0.22 * cool;
    }
    if (light.current) light.current.intensity = 3 * hot + 0.8 * cool;
  });
  return (
    <group>
      <mesh ref={droplet}>
        <sphereGeometry args={[0.09, 18, 14]} />
        <meshStandardMaterial color="#f5c26b" emissive="#d98e4a" emissiveIntensity={0.5} roughness={0.25} />
      </mesh>
      <mesh ref={hotShell}>
        <sphereGeometry args={[0.22, 20, 16]} />
        <meshStandardMaterial color={EMBER} emissive={EMBER} emissiveIntensity={1.4} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      <mesh ref={coolShell}>
        <sphereGeometry args={[0.16, 20, 16]} />
        <meshStandardMaterial color={COOLBLUE} emissive={COOLBLUE} emissiveIntensity={1.2} transparent opacity={0.22} depthWrite={false} />
      </mesh>
      <pointLight ref={light} color={EMBER} distance={2.6} intensity={0} />
    </group>
  );
}

/** Flame front spreading across the SAFFIRE sample cards. */
function DuctFront({ driver }: { driver: React.MutableRefObject<DemoDriver> }) {
  const glows = useRef<(THREE.Mesh | null)[]>([]);
  const front = useRef<THREE.Mesh>(null);
  const CARD_X = [-0.96, -0.48, 0, 0.48, 0.96];
  useFrame(({ clock }) => {
    const p = driver.current.progress;
    // front moves from x=-1.16 to x=1.16 during 0.14→0.82; embers fade 0.82→0.98
    const travel = p < 0.14 ? 0 : p < 0.82 ? envelope(p, 0.14, 0.82) : 1;
    const fade = p >= 0.82 ? 1 - envelope(p, 0.82, 0.98) : 1;
    const frontX = -1.16 + travel * 2.32;
    glows.current.forEach((m, i) => {
      if (!m) return;
      const lit = CARD_X[i] <= frontX + 0.001;
      const e = lit ? fade : 0;
      m.scale.setScalar(Math.max(0.0001, e));
      (m.material as THREE.MeshStandardMaterial).opacity = 0.85 * e;
      (m.material as THREE.MeshStandardMaterial).emissiveIntensity = (1.2 + (driver.current.reducedMotion ? 0 : Math.sin(clock.elapsedTime * 5 + i) * 0.4)) * e;
    });
    if (front.current) {
      const active = p >= 0.14 && p < 0.84;
      front.current.visible = active;
      front.current.position.x = frontX;
      front.current.scale.y = Math.max(0.0001, active ? 0.5 + Math.sin(clock.elapsedTime * 6) * 0.03 : 0);
    }
  });
  return (
    <group>
      {CARD_X.map((x, i) => (
        <mesh key={x} ref={(m) => { glows.current[i] = m; }} position={[x, -0.02, 0.5]}>
          <boxGeometry args={[0.36, 0.4, 0.03]} />
          <meshStandardMaterial color={EMBER} emissive={EMBER} emissiveIntensity={1.2} transparent opacity={0.85} depthWrite={false} />
        </mesh>
      ))}
      {/* leading edge marker */}
      <mesh ref={front} position={[-1.16, -0.02, 0.52]}>
        <boxGeometry args={[0.06, 0.46, 0.05]} />
        <meshStandardMaterial color={HOTCORE} emissive={HOTCORE} emissiveIntensity={2.4} transparent opacity={0.95} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Diagnostic ping rings during the steady/measurement stage. */
function SensorPings({ driver, positions, window: [from, to] }: { driver: React.MutableRefObject<DemoDriver>; positions: [number, number, number][]; window: [number, number] }) {
  const rings = useRef<(THREE.Mesh | null)[]>([]);
  useFrame(({ clock }) => {
    const p = driver.current.progress;
    const active = p >= from && p < to;
    rings.current.forEach((r, i) => {
      if (!r) return;
      r.visible = active;
      if (!active) return;
      const cycle = (clock.elapsedTime * 0.8 + i * 0.33) % 1;
      r.scale.setScalar(0.3 + cycle * 0.7);
      (r.material as THREE.MeshBasicMaterial).opacity = (1 - cycle) * 0.5;
    });
  });
  return (
    <group>
      {positions.map((pos, i) => (
        <mesh key={i} ref={(m) => { rings.current[i] = m; }} position={pos} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.16, 0.19, 32]} />
          <meshBasicMaterial color={COOLBLUE} transparent opacity={0.4} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </group>
  );
}

// ---------------------------------------------------------------------------
// Scene composition per family
// ---------------------------------------------------------------------------

function DemoScene({ modelId, driver }: { modelId: string; driver: React.MutableRefObject<DemoDriver> }) {
  const family = MODEL_FAMILY[modelId] ?? "support";
  const Model = APPARATUS_MODELS[modelId];
  return (
    <group position={[0, -0.35, 0]}>
      {Model ? <Model labels={false} hideFlame /> : null}
      {family === "burner-cone" && modelId === "acme-burner" && (
        <>
          <FlowParticles driver={driver} axis="y" origin={[0, -0.35, 0]} span={0.75} window={[0.12, 0.78]} />
          <Spark driver={driver} position={[0, 0.05, 0]} window={[0.28, 0.36]} />
          <BurnerFlame driver={driver} position={[0, 0.32, 0]} />
          <SensorPings driver={driver} positions={[[0.9, 0.55, 0.3], [-0.9, 0.55, 0.3]]} window={[0.54, 0.76]} />
        </>
      )}
      {family === "burner-cone" && modelId === "spice-burner" && (
        <>
          <FlowParticles driver={driver} axis="y" origin={[0, -0.1, 0]} span={0.85} window={[0.12, 0.78]} />
          <Spark driver={driver} position={[0, 0.22, 0]} window={[0.28, 0.36]} />
          <BurnerFlame driver={driver} position={[0, 0.5, 0]} />
          <SensorPings driver={driver} positions={[[0.7, 0.75, 0.2], [-0.7, 0.75, 0.2]]} window={[0.54, 0.76]} />
        </>
      )}
      {family === "droplet" && (
        <>
          <Spark driver={driver} position={[0, 0.16, 0]} window={[0.24, 0.34]} />
          <DropletFlame driver={driver} />
          <SensorPings driver={driver} positions={[[0, 0.65, 0.4], [0, -0.65, 0.4]]} window={[0.34, 0.62]} />
        </>
      )}
      {family === "duct" && (
        <>
          <FlowParticles driver={driver} axis="x" origin={[-1.5, -0.02, 0.1]} span={2.9} window={[0.0, 0.86]} />
          <Spark driver={driver} position={[-1.1, -0.02, 0.5]} window={[0.14, 0.28]} />
          <DuctFront driver={driver} />
          <SensorPings driver={driver} positions={[[-0.55, 0.62, 0], [0.05, 0.62, 0], [0.65, 0.62, 0]]} window={[0.28, 0.82]} />
        </>
      )}
    </group>
  );
}

// ---------------------------------------------------------------------------
// UI wrapper
// ---------------------------------------------------------------------------

const DEMO_DURATION_S = 24; // one full play-through

export function ExperimentDemo({ modelId, equipmentName }: { modelId: string; equipmentName: string }) {
  const family = MODEL_FAMILY[modelId] ?? "support";
  const stages = DEMO_STAGES[family];
  const driver = useRef<DemoDriver>({ progress: 0, reducedMotion: false });
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  // client-only component (dynamic ssr:false) — matchMedia is safe at init
  const [reduced, setReduced] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    driver.current.reducedMotion = reduced;
  }, [reduced]);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  // animation loop (skipped under reduced motion — stage buttons snap instead)
  useEffect(() => {
    if (!playing) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = (now - last) / 1000;
      last = now;
      const next = Math.min(1, driver.current.progress + dt / DEMO_DURATION_S);
      driver.current.progress = next;
      setProgress(next);
      if (next >= 1) {
        setPlaying(false);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing]);

  if (family === "support" || stages.length === 0) {
    return (
      <div className="glass-panel rounded-xl p-4 text-[12px] leading-relaxed text-muted-foreground">
        <p className="flex items-center gap-1.5 font-semibold text-foreground/90">
          <Clapperboard className="h-4 w-4 text-primary" aria-hidden /> Experiment demonstration
        </p>
        <p className="mt-1.5">
          {equipmentName} is a support facility in the recovered records — no specific flame-test procedure is documented for a
          standalone demonstration, so none is animated here. Demonstrations are available for the ACME burner inserts, the
          MDCA droplet apparatus and the SAFFIRE flow duct.
        </p>
      </div>
    );
  }

  const activeIdx = stages.findIndex((s) => progress >= s.from && progress < s.to);
  const currentIdx = activeIdx === -1 ? (progress >= 1 ? stages.length - 1 : 0) : activeIdx;

  const seek = (p: number) => {
    const next = Math.max(0, Math.min(1, p));
    driver.current.progress = next;
    setProgress(next);
  };
  const jumpToStage = (i: number) => {
    const s = stages[i];
    seek((s.from + s.to) / 2);
    setPlaying(false);
  };

  return (
    <div className="glass-panel rounded-xl">
      <div className="flex flex-wrap items-center gap-2 p-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#be5f35] to-[#d98e4a]">
          <Clapperboard className="h-4 w-4 text-white" aria-hidden />
        </div>
        <div className="leading-tight">
          <h4 className="text-sm font-semibold">Experiment demonstration — animated procedure</h4>
          <p className="text-[10.5px] text-muted-foreground">{stages.length} documented stages · scrub, play or step</p>
        </div>
        <Badge variant="outline" className="ml-auto border-amber-500/40 bg-amber-500/10 text-[10px] text-amber-400">
          illustrative animation — NOT a physical simulation
        </Badge>
      </div>

      <div className="grid gap-4 border-t border-border/50 p-4 lg:grid-cols-[1.15fr_1fr]">
        {/* canvas */}
        <div className="relative h-[340px] overflow-hidden rounded-lg border border-border/60 bg-[color:var(--space-deep)] sm:h-[380px]">
          <Canvas
            dpr={[1, 1.5]}
            camera={{ position: [3.4, 2.1, 4.2], fov: 40, near: 0.1, far: 60 }}
            gl={{ antialias: true, powerPreference: "low-power" }}
            role="img"
            aria-label={`Animated 3D demonstration of the documented experiment procedure for ${equipmentName}. Illustrative animation, not a physical simulation.`}
          >
            <ambientLight intensity={0.55} />
            <hemisphereLight args={["#5799d1", "#030b26", 0.35]} />
            <directionalLight position={[4, 6, 3]} intensity={1.15} color="#fff1de" />
            <pointLight position={[-3, -1, -2]} intensity={6} distance={18} color="#5799d1" />
            <DemoScene modelId={modelId} driver={driver} />
            <OrbitControls
              enablePan={false}
              minDistance={2.6}
              maxDistance={9}
              minPolarAngle={0.35}
              maxPolarAngle={Math.PI / 2 + 0.35}
            />
          </Canvas>
          {/* stage caption overlay */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#030b26]/95 to-transparent p-3">
            <p className="font-mono text-[10px] uppercase tracking-widest text-[#5799d1]">
              stage {currentIdx + 1}/{stages.length} · {Math.round(progress * 100)}%
            </p>
            <p className="text-[12px] font-semibold text-[#fcdaa7]">{stages[currentIdx].label}</p>
          </div>
        </div>

        {/* controls + stages */}
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1.5" onClick={() => (progress >= 1 ? (seek(0), setPlaying(true)) : setPlaying(!playing))} disabled={reduced}>
              {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {playing ? "Pause" : progress >= 1 ? "Replay" : "Play"}
            </Button>
            <Button size="sm" variant="outline" className="h-8 gap-1.5 border-border/60" onClick={() => { seek(0); setPlaying(false); }}>
              <RotateCcw className="h-3.5 w-3.5" /> Reset
            </Button>
            {reduced && (
              <span className="text-[10px] leading-snug text-muted-foreground">
                reduced motion: continuous playback disabled — use the stage list to step
              </span>
            )}
          </div>
          <label className="block text-[11px]">
            <span className="text-muted-foreground">Timeline ({Math.round(progress * 100)}%)</span>
            <input
              type="range"
              min={0}
              max={1000}
              value={Math.round(progress * 1000)}
              onChange={(e) => seek(Number(e.target.value) / 1000)}
              className="mt-1 w-full accent-[#d98e4a]"
              aria-label="Scrub the experiment demonstration timeline"
            />
          </label>
          <ol className="data-scroll max-h-64 space-y-1.5 overflow-y-auto pr-1">
            {stages.map((s, i) => (
              <li key={s.id}>
                <button
                  onClick={() => jumpToStage(i)}
                  className={cn(
                    "w-full rounded-lg border p-2.5 text-left transition-colors",
                    i === currentIdx ? "border-primary/60 bg-primary/10" : "border-border/50 bg-card/30 hover:border-primary/40",
                  )}
                  aria-current={i === currentIdx ? "step" : undefined}
                >
                  <div className="flex items-center gap-2">
                    <span className={cn("font-mono text-[10px]", i === currentIdx ? "text-primary" : "text-muted-foreground")}>
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-[12px] font-medium">{s.label}</span>
                    <span className="ml-auto font-mono text-[9px] text-muted-foreground">
                      {Math.round(s.from * 100)}–{Math.round(s.to * 100)}%
                    </span>
                  </div>
                  {i === currentIdx && <p className="mt-1 text-[11px] leading-snug text-muted-foreground">{s.detail}</p>}
                </button>
              </li>
            ))}
          </ol>
        </div>
      </div>

      <p className="provenance-strip border-t border-border/50 p-3">
        Stages paraphrase the experiment flow documented in the NASA PSI investigation records (burner inserts: ACME
        programs; droplet: FLEX/FLEX-2/CFI; duct: SAFFIRE). The 3D model is a schematic reconstruction and the flame motion
        is an illustrative keyframe animation — no combustion solver runs here. Physically computed results live in
        Investigations (recovered data) and the equation registry (verified calculators).
      </p>
    </div>
  );
}

export default ExperimentDemo;
