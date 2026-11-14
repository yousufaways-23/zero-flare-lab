"use client";

// FLAME EVIDENCE LAB — procedural apparatus schematics (M5, 3D Lab).
// HONESTY: every model below is a source-based schematic RECONSTRUCTION built
// from public NASA facility descriptions — NOT official NASA CAD. Primitives
// only (boxes / cylinders / tori / cones), no external assets, low-poly.
// Interactive component exploration (brief §9.3): parts are wrapped in
// <SelectablePart> so a click identifies the component with its function.

import { createContext, useContext, useRef, useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import * as THREE from "three";
import { LabelLayer, LabelOverlay, SceneLabel } from "@/components/flame/shell/ProjectedLabel";

export interface ApparatusModelProps {
  labels?: boolean;
  /** §9.4 — demo mode: hide static flame/droplet proxies so the animated
   * experiment demonstration drives the flame state instead. */
  hideFlame?: boolean;
  /** §3 upgrade — 0 = assembled, 1 = fully exploded (components separate). */
  explode?: number;
  /** §3 upgrade — cutaway: external skins render translucent to reveal internals. */
  cutaway?: boolean;
  /** §3 upgrade — isolate one component: all others fade to near-invisible. */
  isolated?: string | null;
}

/** Cutaway/isolation context — SelectablePart reads it to adjust material opacity. */
export const ModelModeContext = createContext<{ cutaway: boolean; isolated: string | null }>({
  cutaway: false,
  isolated: null,
});

// ---------- interactive part identification (brief §9.3) ----------

export interface PartInfo {
  id: string;
  name: string;
  function: string;
  sourceNote: string;
}

/** Functional part descriptions per model — paraphrased from public NASA
 *  facility pages (the same sources the equipment records link to). These are
 *  NOT engineering specifications and carry no performance claims. */
export const PART_INFO: Record<string, PartInfo[]> = {
  "cir-rack": [
    { id: "chassis", name: "ISS rack chassis", function: "International Standard Payload Rack structure in the ISS Destiny laboratory — provides mechanical support, power, data and thermal interfaces to the inserted combustion hardware.", sourceNote: "public NASA CIR facility description" },
    { id: "panels", name: "Instrument panel grid", function: "Front-face operator panels and status displays of the rack; video screens show chamber views and experiment telemetry during runs.", sourceNote: "public NASA CIR facility description" },
    { id: "chamber", name: "Combustion chamber (≈100 L)", function: "The sealed combustion chamber into which the exchangeable experiment inserts (ACME burner or MDCA droplet apparatus) are mounted. Microgravity flames are ignited and observed inside this volume.", sourceNote: "public NASA CIR facility description — internal geometry is an approximate reconstruction" },
    { id: "diagnostics", name: "Diagnostics package (camera + radiometer)", function: "Colour video camera and radiometric instruments observe the flame through chamber windows — the primary measurement chain for flame shape, soot and radiant output.", sourceNote: "public NASA CIR facility description — placement approximate" },
    { id: "gas-module", name: "Gas delivery module", function: "Pressurized supply bottles and mass-flow control route fuel, oxidizer and diluent gases to the chamber at the experiment-selected composition and pressure.", sourceNote: "public NASA CIR facility description — bottle count schematic" },
    { id: "avionics", name: "Avionics and power bay", function: "Data acquisition, control electronics and power conditioning for the chamber systems and diagnostics.", sourceNote: "schematic interpretation" },
    { id: "thermal", name: "Thermal control duct", function: "Air-cooling loop that removes the heat of long-duration combustion runs from the rack volume.", sourceNote: "schematic interpretation" },
    { id: "handles", name: "Rack handling fixtures", function: "Structural handling rails for installation and maintenance.", sourceNote: "schematic interpretation" },
  ],
  "acme-burner": [
    { id: "chamber", name: "ACME combustion chamber", function: "A roughly 100-liter-class sealed chamber hosting the Advanced Combustion via Microgravity Experiments burner inserts (BRE, CFI-G, CLD-Flame, s-Flame programs).", sourceNote: "public NASA ACME facility description" },
    { id: "window", name: "Observation window", function: "Optical access for cameras and diagnostics to image the flame.", sourceNote: "schematic interpretation" },
    { id: "burner", name: "Burner assembly (nozzle + co-flow + feeds)", function: "Central gas nozzle surrounded by an annular co-flow tube that supplies the oxidizer/gas environment; feed lines route fuel and gas from the rack.", sourceNote: "public NASA ACME facility description" },
    { id: "flame", name: "Flame proxy", function: "Schematic emissive cone marking the flame region — NOT a combustion simulation.", sourceNote: "honesty label: illustrative proxy" },
  ],
  "mdca-droplet": [
    { id: "frame", name: "Deployment frame", function: "Structural chassis of the Multi-user Droplet Combustion Apparatus insert.", sourceNote: "schematic interpretation" },
    { id: "needles", name: "Opposing deployment needles", function: "Two needles position and hold the fuel droplet at chamber center (book-and-needle deployment), then retract for free floating.", sourceNote: "public NASA MDCA/FLEX facility description" },
    { id: "droplet", name: "Fuel droplet + spherical flame", function: "The FLEX/FLEX-2 test subject — a methanol or alkane fuel droplet burning as a spherical diffusion flame in quiescent microgravity.", sourceNote: "public NASA FLEX investigation description" },
    { id: "cameras", name: "Imaging cameras", function: "Multiple views record droplet regression and flame behaviour for the science team.", sourceNote: "schematic interpretation" },
  ],
  "msg-glovebox": [
    { id: "volume", name: "Sealed work volume", function: "The glovebox's sealed working volume (≈255 L) kept at negative pressure so experiment products stay contained.", sourceNote: "public NASA MSG facility description" },
    { id: "airlock", name: "Airlock door", function: "Pass-through for transferring samples and tools without breaking containment.", sourceNote: "public NASA MSG facility description" },
    { id: "gloves", name: "Glove ports", function: "Crew manipulation ports with sealed gloves for working inside the volume.", sourceNote: "public NASA MSG facility description" },
    { id: "window", name: "Viewing window", function: "Optical access for imaging and crew observation.", sourceNote: "schematic interpretation" },
  ],
  "spice-burner": [
    { id: "base", name: "Burner base + mount", function: "Structural mount of the SPICE (Smoke Point In Co-flowing Experiments) insert in the CIR chamber.", sourceNote: "public NASA SPICE investigation description" },
    { id: "nozzle", name: "Vertical fuel nozzle", function: "Emits the gaseous fuel (methane, ethylene, propane, propylene blends) vertically into the co-flow.", sourceNote: "public NASA SPICE investigation description" },
    { id: "shroud", name: "Co-flow shroud", function: "Open-ended cylinder establishing the annular air co-flow around the fuel jet — smoke-point measurements depend on this geometry.", sourceNote: "public NASA SPICE investigation description" },
    { id: "flame", name: "Flame proxy", function: "Schematic emissive cone marking the flame region — NOT a combustion simulation.", sourceNote: "honesty label: illustrative proxy" },
  ],
  "saffire-duct": [
    { id: "duct", name: "Flow duct (Cygnus cargo module)", function: "The instrumented 1.0 × 1.4 × 1.2 m flow duct built into a Cygnus resupply vehicle — burned post-crew-departure for large-scale spacecraft fire-growth data.", sourceNote: "public NASA SAFFIRE investigation description" },
    { id: "cards", name: "Sample card face", function: "Large material samples (e.g. PMMA blocks, cotton-fiberglass fabric) mounted for controlled ignition and flame-spread observation. Left card shown as ignited proxy.", sourceNote: "public NASA SAFFIRE investigation description" },
    { id: "studs", name: "Instrument studs", function: "Sensor mounts along the duct for temperature, heat flux and gas measurements.", sourceNote: "schematic interpretation" },
    { id: "inlet", name: "Flow inlet", function: "Forced-flow air entry establishing the ventilation-driven flow over the sample face.", sourceNote: "schematic interpretation" },
  ],
};

const PartSelectContext = createContext<((part: PartInfo) => void) | null>(null);

/** Clickable part group: cursor feedback + selection callback + hover glow. */
export function SelectablePart({ partId, modelId, children, ...groupProps }: {
  partId: string;
  modelId: string;
  children: ReactNode;
} & Record<string, unknown>) {
  const onSelect = useContext(PartSelectContext);
  const { cutaway, isolated } = useContext(ModelModeContext);
  const [hovered, setHovered] = useState(false);
  const info = PART_INFO[modelId]?.find((p) => p.id === partId);
  const ref = useRef<THREE.Group>(null);
  const isSkin = partId === "panels" || partId === "chassis" || partId === "frame" || partId === "housing";
  const dimmed = isolated !== null && isolated !== partId;
  // cutaway: outer skins go translucent; isolation: everything except the selected part fades
  const opacity = dimmed ? 0.06 : cutaway && isSkin ? 0.14 : hovered ? 0.96 : 1;
  useFrame(({ clock }) => {
    if (!ref.current) return;
    // gentle emissive highlight while hovered/selected is applied via scale cue
    const s = hovered ? 1.03 + Math.sin(clock.elapsedTime * 6) * 0.008 : 1;
    ref.current.scale.setScalar(s);
    ref.current.traverse((o) => {
      const m = (o as THREE.Mesh).material as THREE.MeshStandardMaterial | undefined;
      if (m && "opacity" in m) {
        m.transparent = opacity < 1;
        m.opacity = THREE.MathUtils.lerp(m.opacity, opacity, 0.22);
        m.depthWrite = opacity > 0.5;
      }
    });
  });
  return (
    <group
      ref={ref}
      {...groupProps}
      onClick={(e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        if (info && onSelect) onSelect(info);
      }}
      onPointerOver={(e: { stopPropagation: () => void }) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "auto";
      }}
    >
      {children}
      {hovered && info && (
        <mesh visible={false}><sphereGeometry args={[0.001, 4, 3]} /><meshBasicMaterial /></mesh>
      )}
    </group>
  );
}

// ---- palette (flame design contract) ----
const BODY = "#c9ced6"; // light structure metal
const STEEL = "#aab0ba"; // bright machined steel
const DARK = "#3a3f4a"; // dark metal
const PANEL = "#5799d1"; // emission-blue screens (science accent)
const EMBER = "#e8823f"; // flame proxy
const HOTCORE = "#fcdaa7"; // hot core
const GLASS = "#141d33"; // window glass

// ---------- shared helpers ----------

function subscribeReducedMotion(onChange: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

function useReducedMotionPref(): boolean {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
}

/** Small chip label anchored in 3D space (projected to a race-free DOM overlay). */
export function PartLabel({ position, children }: { position: [number, number, number]; children: ReactNode }) {
  return (
    <SceneLabel position={position}>
      <span className="pointer-events-none whitespace-nowrap rounded border border-[#5799d1]/50 bg-[#030b26]/90 px-1.5 py-0.5 font-mono text-[10px] tracking-wide text-[#fcdaa7] shadow-md">
        {children}
      </span>
    </SceneLabel>
  );
}

/** Pulsing flame proxy cone — gentle scale animation, reduced-motion aware. */
function FlameCone({ position, radius = 0.16, height = 0.55 }: { position: [number, number, number]; radius?: number; height?: number }) {
  const outer = useRef<THREE.Mesh>(null);
  const inner = useRef<THREE.Mesh>(null);
  const reduced = useReducedMotionPref();
  useFrame(({ clock }) => {
    if (reduced) return;
    const t = clock.elapsedTime;
    const sxz = 1 + Math.sin(t * 3.1) * 0.06;
    const sy = 1 + Math.sin(t * 2.3 + 0.7) * 0.08;
    outer.current?.scale.set(sxz, sy, sxz);
    inner.current?.scale.set(sxz, sy, sxz);
  });
  return (
    <group position={position}>
      <mesh ref={outer}>
        <coneGeometry args={[radius, height, 20]} />
        <meshStandardMaterial color={EMBER} emissive={EMBER} emissiveIntensity={1.5} transparent opacity={0.5} roughness={0.35} depthWrite={false} />
      </mesh>
      <mesh ref={inner} position={[0, -height * 0.06, 0]} scale={0.55}>
        <coneGeometry args={[radius, height * 0.8, 16]} />
        <meshStandardMaterial color={HOTCORE} emissive={HOTCORE} emissiveIntensity={2.1} transparent opacity={0.9} depthWrite={false} />
      </mesh>
    </group>
  );
}

/** Pulsing emissive orb (droplet proxy etc.) — reduced-motion aware. */
function PulseOrb({ position, radius = 0.1, color = EMBER }: { position: [number, number, number]; radius?: number; color?: string }) {
  const ref = useRef<THREE.Mesh>(null);
  const reduced = useReducedMotionPref();
  useFrame(({ clock }) => {
    if (reduced || !ref.current) return;
    ref.current.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2.6) * 0.1);
  });
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[radius, 18, 14]} />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} roughness={0.3} />
    </mesh>
  );
}

function buildCirPanelGrid(): { pos: [number, number, number]; kind: "screen" | "switch" | "vent" }[] {
  const panels: { pos: [number, number, number]; kind: "screen" | "switch" | "vent" }[] = [];
  for (let r = 0; r < 4; r++) {
    for (let c = 0; c < 2; c++) {
      const kind = (r * 2 + c) % 3 === 0 ? "screen" : (r * 2 + c) % 3 === 1 ? "switch" : "vent";
      panels.push({ pos: [c === 0 ? -0.26 : 0.26, 0.8 - r * 0.42, 0.5], kind });
    }
  }
  return panels;
}

// ---------- cir-rack: ISS Combustion Integrated Rack ----------

function CirRack({ labels, explode = 0, cutaway = false, isolated = null }: ApparatusModelProps) {
  const panels = buildCirPanelGrid();
  // §3 — explode offsets: each internal assembly slides out along its axis as `explode` → 1
  const zOut = 0.95 * explode;
  const yUp = 0.75 * explode;
  const xSide = 0.85 * explode;
  const yDown = 0.6 * explode;
  return (
    <ModelModeContext.Provider value={{ cutaway, isolated }}>
      <group>
        {/* chassis (outer skin) */}
        <SelectablePart partId="chassis" modelId="cir-rack" position={[0, 0, -0.4 * explode]}>
          <mesh>
            <boxGeometry args={[1.1, 2.3, 0.9]} />
            <meshStandardMaterial color={BODY} metalness={0.35} roughness={0.5} />
          </mesh>
          {/* side rails reveal the internal bays */}
          {[-0.56, 0.56].map((x) => (
            <mesh key={x} position={[x, 0, 0]}>
              <boxGeometry args={[0.06, 2.2, 0.92]} />
              <meshStandardMaterial color={STEEL} metalness={0.45} roughness={0.45} />
            </mesh>
          ))}
          {/* base plinth */}
          <mesh position={[0, -1.21, 0]}>
            <boxGeometry args={[1.18, 0.12, 0.98]} />
            <meshStandardMaterial color={DARK} metalness={0.3} roughness={0.7} />
          </mesh>
        </SelectablePart>
        {/* instrument panel grid (front skin) */}
        <SelectablePart partId="panels" modelId="cir-rack" position={[0, 0, zOut]}>
          {panels.map((p, i) => (
            <mesh key={i} position={p.pos}>
              <boxGeometry args={[0.4, 0.3, 0.05]} />
              <meshStandardMaterial
                color={p.kind === "screen" ? PANEL : p.kind === "switch" ? BODY : DARK}
                emissive={p.kind === "screen" ? PANEL : "#000000"}
                emissiveIntensity={p.kind === "screen" ? 0.55 : 0}
                metalness={0.3}
                roughness={0.55}
              />
            </mesh>
          ))}
          {/* front frame plate — the cutaway skin */}
          <mesh position={[0, 0, 0.46]}>
            <boxGeometry args={[0.98, 2.14, 0.05]} />
            <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.6} transparent opacity={0.85} />
          </mesh>
        </SelectablePart>
        {/* combustion chamber (internal, revealed by cutaway / explode) */}
        <SelectablePart partId="chamber" modelId="cir-rack" position={[0, 0, zOut * 1.55 + 0.06]}>
          <mesh rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.27, 0.27, 0.6, 24]} />
            <meshStandardMaterial color={STEEL} metalness={0.55} roughness={0.35} />
          </mesh>
          {/* end caps + optical window */}
          <mesh position={[0, 0, 0.32]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.27, 0.27, 0.05, 24]} />
            <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
          </mesh>
          <mesh position={[0, 0, 0.38]}>
            <cylinderGeometry args={[0.16, 0.16, 0.03, 20]} />
            <meshStandardMaterial color={GLASS} emissive={PANEL} emissiveIntensity={0.22} transparent opacity={0.85} />
          </mesh>
          {/* chamber support cradle */}
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.5, 0.08, 0.6]} />
            <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.5} />
          </mesh>
        </SelectablePart>
        {/* diagnostics package (internal) */}
        <SelectablePart partId="diagnostics" modelId="cir-rack" position={[0, yUp, zOut * 1.1]}>
          <mesh position={[0.14, 0.12, 0]}>
            <boxGeometry args={[0.3, 0.18, 0.22]} />
            <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.5} />
          </mesh>
          {/* camera lens aimed at the chamber window */}
          <mesh position={[0.14, 0.12, 0.14]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.05, 0.07, 0.12, 14]} />
            <meshStandardMaterial color="#10131a" metalness={0.6} roughness={0.3} />
          </mesh>
          {/* radiometer head */}
          <mesh position={[-0.2, 0.12, 0]}>
            <cylinderGeometry args={[0.06, 0.06, 0.16, 12]} />
            <meshStandardMaterial color={STEEL} metalness={0.5} roughness={0.4} />
          </mesh>
        </SelectablePart>
        {/* gas delivery module (internal) */}
        <SelectablePart partId="gas-module" modelId="cir-rack" position={[-xSide, 0, 0]}>
          {[
            [-0.16, 0.55],
            [-0.16, 0.15],
          ].map(([x, y], i) => (
            <mesh key={i} position={[x, y, 0]}>
              <capsuleGeometry args={[0.09, 0.34, 6, 12]} />
              <meshStandardMaterial color={i === 0 ? "#3d4d78" : PANEL} metalness={0.5} roughness={0.4} />
            </mesh>
          ))}
          {/* feed line to the chamber */}
          <mesh position={[-0.1, 0.35, 0.2]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.016, 0.016, 0.5, 8]} />
            <meshStandardMaterial color="#20242e" metalness={0.5} roughness={0.5} />
          </mesh>
        </SelectablePart>
        {/* avionics and power bay (internal, bottom) */}
        <SelectablePart partId="avionics" modelId="cir-rack" position={[0, -yDown, 0]}>
          {[0, 1, 2].map((i) => (
            <mesh key={i} position={[0.12, -0.85 - i * 0.14, 0.05]}>
              <boxGeometry args={[0.62, 0.1, 0.66]} />
              <meshStandardMaterial color={i % 2 === 0 ? DARK : "#2a2f3c"} metalness={0.35} roughness={0.55} />
            </mesh>
          ))}
        </SelectablePart>
        {/* thermal control duct (internal) */}
        <SelectablePart partId="thermal" modelId="cir-rack" position={[xSide, 0, 0]}>
          <mesh position={[0.42, 0.5, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[0.09, 0.09, 1.6, 14]} />
            <meshStandardMaterial color="#39415a" metalness={0.4} roughness={0.5} />
          </mesh>
        </SelectablePart>
        {/* handle bars */}
        <SelectablePart partId="handles" modelId="cir-rack" position={[0, 0, zOut]}>
          {[-0.62, 0.62].map((x) => (
            <mesh key={x} position={[x, 0.35, 0.5]}>
              <cylinderGeometry args={[0.035, 0.035, 1.5, 10]} />
              <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.4} />
            </mesh>
          ))}
        </SelectablePart>
        {labels && (
          <>
            <PartLabel position={[0, 1.32, 0.5]}>ISS rack chassis</PartLabel>
            <PartLabel position={[0.26, 1.06, 0.55]}>instrument panels</PartLabel>
            <PartLabel position={[0, 0.05, 0.45]}>combustion chamber (≈100 L)</PartLabel>
            <PartLabel position={[0.14, 1.62, 0.4]}>diagnostics package</PartLabel>
            <PartLabel position={[-0.72, 1.1, 0.3]}>gas delivery</PartLabel>
            <PartLabel position={[0.75, -0.7, 0.3]}>avionics bay</PartLabel>
            <PartLabel position={[-0.66, 1.3, 0.55]}>rack handles</PartLabel>
          </>
        )}
      </group>
    </ModelModeContext.Provider>
  );
}

// ---------- acme-burner: ACME chamber insert ----------

function AcmeBurner({ labels, hideFlame }: ApparatusModelProps) {
  return (
    <group>
      {/* chamber shell + frame bands */}
      <SelectablePart partId="chamber" modelId="acme-burner">
        <mesh>
          <boxGeometry args={[1.7, 1.5, 1.4]} />
          <meshStandardMaterial color={BODY} metalness={0.35} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.76, 0]}>
          <boxGeometry args={[1.74, 0.06, 1.44]} />
          <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.55} />
        </mesh>
        <mesh position={[0, -0.76, 0]}>
          <boxGeometry args={[1.74, 0.06, 1.44]} />
          <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.55} />
        </mesh>
      </SelectablePart>
      {/* observation window */}
      <SelectablePart partId="window" modelId="acme-burner">
        <mesh position={[0, 0.12, 0.71]}>
          <boxGeometry args={[0.9, 0.6, 0.04]} />
          <meshStandardMaterial color={GLASS} emissive={PANEL} emissiveIntensity={0.12} metalness={0.2} roughness={0.15} />
        </mesh>
      </SelectablePart>
      {/* burner assembly */}
      <SelectablePart partId="burner" modelId="acme-burner">
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.34, 0.4, 0.16, 20]} />
          <meshStandardMaterial color={DARK} metalness={0.55} roughness={0.4} />
        </mesh>
        <mesh position={[0, -0.26, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 0.5, 12]} />
          <meshStandardMaterial color={STEEL} metalness={0.7} roughness={0.3} />
        </mesh>
        <mesh position={[0, -0.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.28, 0.045, 12, 32]} />
          <meshStandardMaterial color={BODY} metalness={0.6} roughness={0.35} />
        </mesh>
        {[-0.5, 0.5].map((x) => (
          <mesh key={x} position={[x, -0.62, 0]} rotation={[0, 0, Math.PI / 2]}>
            <cylinderGeometry args={[0.045, 0.045, 0.7, 10]} />
            <meshStandardMaterial color={DARK} metalness={0.6} roughness={0.4} />
          </mesh>
        ))}
      </SelectablePart>
      {/* flame proxy (hidden in demo mode — the animated demo drives it) */}
      {!hideFlame && (
        <SelectablePart partId="flame" modelId="acme-burner">
          <FlameCone position={[0, 0.32, 0]} radius={0.17} height={0.6} />
        </SelectablePart>
      )}
      {labels && (
        <>
          <PartLabel position={[0, 0.98, 0]}>combustion chamber</PartLabel>
          <PartLabel position={[0, -0.26, 0.5]}>gas nozzle</PartLabel>
          <PartLabel position={[0.58, -0.4, 0.25]}>co-flow tube</PartLabel>
          <PartLabel position={[0, 0.78, 0.35]}>flame proxy (schematic)</PartLabel>
        </>
      )}
    </group>
  );
}

// ---------- mdca-droplet: Multi-user Droplet Combustion Apparatus ----------

function MdcaDroplet({ labels, hideFlame }: ApparatusModelProps) {
  return (
    <group>
      {/* frame plates + corner posts */}
      <mesh position={[0, 0.85, 0]}>
        <boxGeometry args={[1.3, 0.08, 1.1]} />
        <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.5} />
      </mesh>
      <mesh position={[0, -0.85, 0]}>
        <boxGeometry args={[1.3, 0.08, 1.1]} />
        <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.5} />
      </mesh>
      {(
        [
          [-0.55, -0.45],
          [0.55, -0.45],
          [-0.55, 0.45],
          [0.55, 0.45],
        ] as [number, number][]
      ).map(([x, z], i) => (
        <mesh key={i} position={[x, 0, z]}>
          <cylinderGeometry args={[0.045, 0.045, 1.78, 10]} />
          <meshStandardMaterial color={BODY} metalness={0.5} roughness={0.4} />
        </mesh>
      ))}
      {/* opposing deployment needles (tips meet at the center) */}
      <SelectablePart partId="needles" modelId="mdca-droplet">
        <mesh position={[0, 0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.66, 10]} />
          <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0, -0.5, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.66, 10]} />
          <meshStandardMaterial color={STEEL} metalness={0.8} roughness={0.25} />
        </mesh>
      </SelectablePart>
      {/* droplet + spherical flame proxy (hidden in demo mode) */}
      {!hideFlame && (
        <SelectablePart partId="droplet" modelId="mdca-droplet">
          <PulseOrb position={[0, 0, 0]} radius={0.1} />
          <mesh>
            <sphereGeometry args={[0.2, 18, 14]} />
            <meshStandardMaterial color={EMBER} emissive={EMBER} emissiveIntensity={0.9} transparent opacity={0.28} depthWrite={false} />
          </mesh>
        </SelectablePart>
      )}
      {/* imaging cameras */}
      <SelectablePart partId="cameras" modelId="mdca-droplet">
        {[-0.72, 0.72].map((x) => (
          <group key={x} position={[x, 0.15, 0.35]} rotation={[0, x > 0 ? -0.5 : 0.5, 0]}>
            <mesh>
              <boxGeometry args={[0.34, 0.26, 0.3]} />
              <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.5} />
            </mesh>
            <mesh position={[0.2, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.08, 0.1, 0.12, 12]} />
              <meshStandardMaterial color={BODY} metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </SelectablePart>
      {labels && (
        <>
          <PartLabel position={[0, 0.5, -0.4]}>deployment needles</PartLabel>
          <PartLabel position={[0.18, 0.02, 0.32]}>fuel droplet + spherical flame proxy</PartLabel>
          <PartLabel position={[-0.88, 0.15, 0.6]}>imaging cameras</PartLabel>
        </>
      )}
    </group>
  );
}

// ---------- msg-glovebox: Microgravity Science Glovebox ----------

function MsgGlovebox({ labels }: ApparatusModelProps) {
  return (
    <group>
      {/* sealed work volume */}
      <SelectablePart partId="volume" modelId="msg-glovebox">
        <mesh>
          <boxGeometry args={[1.9, 1.4, 1.2]} />
          <meshStandardMaterial color={BODY} metalness={0.3} roughness={0.55} />
        </mesh>
        {/* front face */}
        <mesh position={[0, 0, 0.61]}>
          <boxGeometry args={[1.7, 1.2, 0.06]} />
          <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.6} />
        </mesh>
      </SelectablePart>
      {/* airlock door (recessed panel, right side) */}
      <SelectablePart partId="airlock" modelId="msg-glovebox">
        <mesh position={[0.5, 0, 0.66]}>
          <boxGeometry args={[0.6, 0.72, 0.05]} />
          <meshStandardMaterial color="#565d6b" metalness={0.45} roughness={0.5} />
        </mesh>
        <mesh position={[0.5, 0, 0.7]}>
          <boxGeometry args={[0.44, 0.5, 0.02]} />
          <meshStandardMaterial color={GLASS} emissive={PANEL} emissiveIntensity={0.15} />
        </mesh>
      </SelectablePart>
      {/* glove ports (left side): torus ring + stub */}
      <SelectablePart partId="gloves" modelId="msg-glovebox">
        {[-0.55, -0.08].map((x) => (
          <group key={x} position={[x, 0, 0.64]}>
            <mesh>
              <torusGeometry args={[0.17, 0.045, 12, 28]} />
              <meshStandardMaterial color={BODY} metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.06]}>
              <cylinderGeometry args={[0.15, 0.15, 0.14, 20]} />
              <meshStandardMaterial color="#8d949e" metalness={0.4} roughness={0.6} />
            </mesh>
          </group>
        ))}
      </SelectablePart>
      {/* top viewing window */}
      <SelectablePart partId="window" modelId="msg-glovebox">
        <mesh position={[0, 0.71, 0]}>
          <boxGeometry args={[0.9, 0.02, 0.7]} />
          <meshStandardMaterial color={GLASS} emissive={PANEL} emissiveIntensity={0.1} metalness={0.2} roughness={0.15} />
        </mesh>
      </SelectablePart>
      {labels && (
        <>
          <PartLabel position={[0, 0.95, 0]}>sealed work volume</PartLabel>
          <PartLabel position={[0.5, 0.55, 0.5]}>airlock door</PartLabel>
          <PartLabel position={[-0.32, -0.4, 0.85]}>glove ports</PartLabel>
          <PartLabel position={[0, 0.84, -0.2]}>viewing window</PartLabel>
        </>
      )}
    </group>
  );
}

// ---------- spice-burner: SPICE co-flow burner insert ----------

function SpiceBurner({ labels, hideFlame }: ApparatusModelProps) {
  return (
    <group>
      {/* base plate + nozzle mount */}
      <SelectablePart partId="base" modelId="spice-burner">
        <mesh position={[0, -0.55, 0]}>
          <boxGeometry args={[1.2, 0.08, 1.0]} />
          <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.6} />
        </mesh>
        <mesh position={[0, -0.44, 0]}>
          <cylinderGeometry args={[0.16, 0.2, 0.14, 16]} />
          <meshStandardMaterial color={BODY} metalness={0.5} roughness={0.4} />
        </mesh>
      </SelectablePart>
      {/* vertical fuel nozzle */}
      <SelectablePart partId="nozzle" modelId="spice-burner">
        <mesh position={[0, -0.05, 0]}>
          <cylinderGeometry args={[0.05, 0.05, 0.75, 12]} />
          <meshStandardMaterial color={STEEL} metalness={0.75} roughness={0.25} />
        </mesh>
      </SelectablePart>
      {/* co-flow shroud (open-ended cylinder) */}
      <SelectablePart partId="shroud" modelId="spice-burner">
        <mesh position={[0, -0.18, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.55, 24, 1, true]} />
          <meshStandardMaterial color={BODY} metalness={0.4} roughness={0.45} side={THREE.DoubleSide} transparent opacity={0.5} />
        </mesh>
        {/* shroud rim */}
        <mesh position={[0, 0.1, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.34, 0.03, 10, 28]} />
          <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
        </mesh>
      </SelectablePart>
      {/* flame proxy (hidden in demo mode) */}
      {!hideFlame && (
        <SelectablePart partId="flame" modelId="spice-burner">
          <FlameCone position={[0, 0.5, 0]} radius={0.15} height={0.55} />
        </SelectablePart>
      )}
      {/* gas feed */}
      <mesh position={[0.5, -0.5, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.05, 0.05, 0.5, 10]} />
        <meshStandardMaterial color={DARK} metalness={0.55} roughness={0.4} />
      </mesh>
      {labels && (
        <>
          <PartLabel position={[0, -0.44, 0.5]}>burner base</PartLabel>
          <PartLabel position={[0.05, 0.02, 0.42]}>vertical fuel nozzle</PartLabel>
          <PartLabel position={[0.62, -0.18, 0.2]}>co-flow shroud (air annulus)</PartLabel>
          <PartLabel position={[0, 0.95, 0]}>flame proxy (schematic)</PartLabel>
        </>
      )}
    </group>
  );
}

// ---------- saffire-duct: SAFFIRE instrumented flow duct ----------

function SaffireDuct({ labels, hideFlame }: ApparatusModelProps) {
  const studs: [number, number][] = [
    [-1.15, 0],
    [-0.55, 0],
    [0.05, 0],
    [0.65, 0],
    [1.25, 0],
  ];
  return (
    <group>
      {/* main duct */}
      <SelectablePart partId="duct" modelId="saffire-duct">
        <mesh>
          <boxGeometry args={[3.0, 0.85, 0.85]} />
          <meshStandardMaterial color={BODY} metalness={0.35} roughness={0.55} />
        </mesh>
      </SelectablePart>
      {/* open sample-card face + cards */}
      <SelectablePart partId="cards" modelId="saffire-duct">
        <mesh position={[0, -0.02, 0.44]}>
          <boxGeometry args={[2.4, 0.5, 0.05]} />
          <meshStandardMaterial color="#2b2e35" metalness={0.4} roughness={0.6} />
        </mesh>
        {[-0.96, -0.48, 0, 0.48, 0.96].map((x) => (
          <mesh key={x} position={[x, -0.02, 0.48]}>
            <boxGeometry args={[0.4, 0.42, 0.02]} />
            <meshStandardMaterial
              color={!hideFlame && x === -0.96 ? EMBER : "#4a4f5a"}
              emissive={!hideFlame && x === -0.96 ? EMBER : "#000000"}
              emissiveIntensity={!hideFlame && x === -0.96 ? 0.8 : 0}
              roughness={0.6}
            />
          </mesh>
        ))}
      </SelectablePart>
      {/* instrument studs on top */}
      <SelectablePart partId="studs" modelId="saffire-duct">
        {studs.map(([x]) => (
          <group key={x} position={[x, 0.49, 0]}>
            <mesh>
              <cylinderGeometry args={[0.05, 0.05, 0.14, 10]} />
              <meshStandardMaterial color={DARK} metalness={0.5} roughness={0.4} />
            </mesh>
            <mesh position={[0, 0.09, 0]}>
              <sphereGeometry args={[0.045, 10, 8]} />
              <meshStandardMaterial color={PANEL} emissive={PANEL} emissiveIntensity={0.7} />
            </mesh>
          </group>
        ))}
      </SelectablePart>
      {/* flow inlet flange */}
      <SelectablePart partId="inlet" modelId="saffire-duct">
        <mesh position={[-1.52, 0, 0]}>
          <boxGeometry args={[0.1, 0.95, 0.95]} />
          <meshStandardMaterial color={DARK} metalness={0.4} roughness={0.55} />
        </mesh>
        <mesh position={[-1.46, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.28, 0.28, 0.1, 20]} />
          <meshStandardMaterial color={GLASS} metalness={0.3} roughness={0.3} />
        </mesh>
      </SelectablePart>
      {labels && (
        <>
          <PartLabel position={[0, 0.75, 0]}>flow duct (Cygnus cargo module)</PartLabel>
          <PartLabel position={[0.6, -0.02, 0.75]}>sample card face (left card: ignited proxy)</PartLabel>
          <PartLabel position={[-0.55, 0.72, 0.2]}>instrument studs</PartLabel>
          <PartLabel position={[-1.52, -0.55, 0.3]}>flow inlet</PartLabel>
        </>
      )}
    </group>
  );
}

// ---------- registry + viewer ----------

export const APPARATUS_MODELS: Record<string, ComponentType<ApparatusModelProps>> = {
  "cir-rack": CirRack,
  "acme-burner": AcmeBurner,
  "mdca-droplet": MdcaDroplet,
  "msg-glovebox": MsgGlovebox,
  "spice-burner": SpiceBurner,
  "saffire-duct": SaffireDuct,
};

/**
 * Interactive schematic viewer: slow auto-orbit, zoom clamp, toggleable part
 * labels. Drag to orbit; the model is a source-based reconstruction.
 */
/** Camera presets — §3 upgrade: named viewpoints lerp into place on change. */
export type CameraPreset = "default" | "front" | "interior" | "top";
const CAMERA_PRESETS: Record<CameraPreset, [number, number, number]> = {
  default: [3.6, 2.3, 4.4],
  front: [0, 0.6, 5.4],
  interior: [1.2, 0.4, 2.6],
  top: [0.4, 5.6, 2.4],
};

function CameraRig({ preset }: { preset: CameraPreset }) {
  const target = CAMERA_PRESETS[preset];
  useFrame(({ camera }) => {
    const k = 0.08;
    camera.position.x += (target[0] - camera.position.x) * k;
    camera.position.y += (target[1] - camera.position.y) * k;
    camera.position.z += (target[2] - camera.position.z) * k;
  });
  return null;
}

export function ApparatusViewer({
  modelId,
  labels = true,
  className,
  onSelectPart,
  explode = 0,
  cutaway = false,
  isolated = null,
  cameraPreset = "default",
  autoRotate,
}: {
  modelId: string;
  labels?: boolean;
  className?: string;
  onSelectPart?: (part: PartInfo) => void;
  explode?: number;
  cutaway?: boolean;
  isolated?: string | null;
  cameraPreset?: CameraPreset;
  autoRotate?: boolean;
}) {
  const reduced = useReducedMotionPref();
  const Model = APPARATUS_MODELS[modelId];
  const spin = autoRotate ?? !reduced;
  return (
    <LabelLayer>
      <PartSelectContext.Provider value={onSelectPart ?? null}>
        <Canvas
          className={className}
          dpr={[1, 1.5]}
          camera={{ position: CAMERA_PRESETS.default, fov: 40, near: 0.1, far: 60 }}
          gl={{ antialias: true, powerPreference: "low-power" }}
          role="img"
          aria-label="Interactive 3D schematic reconstruction of spacecraft combustion hardware — drag to orbit, scroll to zoom, click parts to identify them."
        >
          <ambientLight intensity={0.55} />
          <hemisphereLight args={[PANEL, "#030b26", 0.35]} />
          <directionalLight position={[4, 6, 3]} intensity={1.15} color="#fff1de" />
          <pointLight position={[-3, -1, -2]} intensity={6} distance={18} color={PANEL} />
          <group position={[0, -0.35, 0]}>
            {Model ? <Model labels={labels} explode={explode} cutaway={cutaway} isolated={isolated} /> : null}
          </group>
          <CameraRig preset={cameraPreset} />
          <OrbitControls
            autoRotate={spin && explode < 0.05 && cameraPreset === "default"}
            autoRotateSpeed={0.9}
            enablePan={false}
            minDistance={1.8}
            maxDistance={10}
            minPolarAngle={0.25}
            maxPolarAngle={Math.PI / 2 + 0.35}
          />
        </Canvas>
      </PartSelectContext.Provider>
      <LabelOverlay />
    </LabelLayer>
  );
}

export default ApparatusViewer;
