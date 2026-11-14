"use client";

// FLAME EVIDENCE LAB — Mission 3D scene (M3).
// Schematic destination selector: Earth / ISS / Moon / Mars / spacecraft / spacesuit.
// Honesty: everything is stylized low-poly procedural geometry — no external
// textures, no official NASA CAD, not to scale (caption rendered by MissionView).

import { useEffect, useMemo, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { Canvas, useFrame, useThree, type ThreeEvent } from "@react-three/fiber";
import { Stars } from "@react-three/drei";
import * as THREE from "three";
import type { EnvId } from "@/lib/app-store";
import { getAtmospheres } from "@/lib/data/catalog";
import { LabelLayer, LabelOverlay, LabelChip, Projector } from "@/components/flame/shell/ProjectedLabel";

type Vec3 = [number, number, number];

interface DestinationSpec {
  id: EnvId;
  position: Vec3; // schematic layout position (not to scale)
  camPos: Vec3; // camera travel pose for this destination
  ringRadius: number; // selection ring radius
  labelY: number; // hover/selected label height above the object
}

const DESTINATIONS: DestinationSpec[] = [
  { id: "earth", position: [0, -1.9, 0], camPos: [0, 1.3, 10.2], ringRadius: 3.1, labelY: 3.6 },
  { id: "iss", position: [4.6, 3.3, 1.6], camPos: [5.6, 4.4, 6.2], ringRadius: 1.6, labelY: 1.35 },
  { id: "moon", position: [-7.2, 2.1, -3.6], camPos: [-4.9, 3.0, 0.0], ringRadius: 0.98, labelY: 1.25 },
  { id: "mars", position: [8.2, 2.7, -5.6], camPos: [5.4, 3.8, -1.2], ringRadius: 1.5, labelY: 1.8 },
  { id: "spacecraft", position: [-4.7, -2.1, 4.6], camPos: [-3.6, -1.8, 8.6], ringRadius: 1.35, labelY: 1.35 },
  { id: "spacesuit", position: [-2.3, -3.1, 6.3], camPos: [-1.7, -2.6, 9.8], ringRadius: 0.72, labelY: 0.95 },
];

const EARTH_CAM: Vec3 = DESTINATIONS[0].camPos;

export interface MissionSceneProps {
  environment: EnvId;
  onSelect: (id: EnvId) => void;
}

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

function envMeta(id: EnvId): { label: string; kind: string } {
  const env = getAtmospheres().environments.find((e) => e.id === id);
  return { label: env?.label ?? id, kind: env?.kind ?? "" };
}

function specFor(id: EnvId): DestinationSpec {
  return DESTINATIONS.find((d) => d.id === id) ?? DESTINATIONS[0];
}

// ---------- procedural bodies (no textures) ----------

/** Two-tone vertex-coloured sphere: procedural "continents" from sine noise. */
function TintedSphere({
  radius,
  base,
  alt,
  cap,
  threshold = 0.55,
  capAt = 0.88,
}: {
  radius: number;
  base: string;
  alt: string;
  cap?: string;
  threshold?: number;
  capAt?: number;
}) {
  const geometry = useMemo(() => {
    const geo = new THREE.SphereGeometry(radius, 32, 24);
    const colors: number[] = [];
    const v = new THREE.Vector3();
    const baseColor = new THREE.Color(base);
    const altColor = new THREE.Color(alt);
    const capColor = cap ? new THREE.Color(cap) : null;
    const pos = geo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const noise =
        Math.sin(3.1 * v.x + 0.8) * Math.cos(2.7 * v.y) +
        Math.sin(2.2 * v.z + 1.7) * 0.8 +
        Math.sin(v.y * 5.3 + 0.4) * 0.35;
      const c = noise > threshold ? altColor.clone() : baseColor.clone();
      if (capColor && Math.abs(v.y) > radius * capAt) c.copy(capColor);
      colors.push(c.r, c.g, c.b);
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
    return geo;
  }, [radius, base, alt, cap, threshold, capAt]);
  return (
    <mesh geometry={geometry}>
      <meshStandardMaterial vertexColors roughness={0.92} metalness={0.04} />
    </mesh>
  );
}

/** Slow self-rotation wrapper; disabled under prefers-reduced-motion. */
function SlowSpin({ children, speed = 0.03 }: { children: ReactNode; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  const reduced = useReducedMotionPref();
  useFrame((_, dt) => {
    if (ref.current && !reduced) ref.current.rotation.y += dt * speed;
  });
  return <group ref={ref}>{children}</group>;
}

/** Gentle idle bob for free-flyers (ISS, spacecraft, suit); reduced-motion aware. */
function FloatBob({ children, amp = 0.08, speed = 0.7 }: { children: ReactNode; amp?: number; speed?: number }) {
  const ref = useRef<THREE.Group>(null);
  const baseY = useRef<number | null>(null);
  const reduced = useReducedMotionPref();
  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (baseY.current === null) baseY.current = ref.current.position.y;
    if (!reduced) ref.current.position.y = baseY.current + Math.sin(clock.elapsedTime * speed) * amp;
  });
  return <group ref={ref}>{children}</group>;
}

function Panel({ position, args }: { position: Vec3; args: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={args} />
      <meshStandardMaterial color="#22346b" emissive="#5799d1" emissiveIntensity={0.22} metalness={0.65} roughness={0.35} />
    </mesh>
  );
}

/** Schematic ISS proxy: truss + pressurized modules + solar planes. */
function IssProxy() {
  return (
    <FloatBob amp={0.05} speed={0.55}>
      <SlowSpin speed={0.05}>
        {/* main truss */}
        <mesh>
          <boxGeometry args={[2.5, 0.07, 0.07]} />
          <meshStandardMaterial color="#c8ccd4" metalness={0.5} roughness={0.5} />
        </mesh>
        {/* pressurized modules across the truss */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0.45]}>
          <cylinderGeometry args={[0.2, 0.2, 1.1, 16]} />
          <meshStandardMaterial color="#dfe3e9" metalness={0.35} roughness={0.55} />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.45]}>
          <cylinderGeometry args={[0.2, 0.2, 1.1, 16]} />
          <meshStandardMaterial color="#dfe3e9" metalness={0.35} roughness={0.55} />
        </mesh>
        {/* node */}
        <mesh>
          <sphereGeometry args={[0.24, 16, 12]} />
          <meshStandardMaterial color="#c8ccd4" metalness={0.4} roughness={0.5} />
        </mesh>
        {/* solar panel wings */}
        <Panel position={[-1.5, 0, 0.32]} args={[0.62, 0.02, 0.3]} />
        <Panel position={[-1.5, 0, -0.32]} args={[0.62, 0.02, 0.3]} />
        <Panel position={[1.5, 0, 0.32]} args={[0.62, 0.02, 0.3]} />
        <Panel position={[1.5, 0, -0.32]} args={[0.62, 0.02, 0.3]} />
        {/* radiator */}
        <mesh position={[0.55, -0.05, 0]} rotation={[0, 0.4, 0]}>
          <boxGeometry args={[0.5, 0.015, 0.34]} />
          <meshStandardMaterial color="#9aa3b0" metalness={0.6} roughness={0.4} />
        </mesh>
      </SlowSpin>
    </FloatBob>
  );
}

/** Schematic cargo spacecraft proxy (Cygnus-class, where SAFFIRE flew). */
function SpacecraftProxy() {
  return (
    <FloatBob amp={0.06} speed={0.45}>
      <group rotation={[0, 0.5, 0]}>
        {/* pressurized module (capsule, axis along Z) */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <capsuleGeometry args={[0.4, 1.0, 8, 16]} />
          <meshStandardMaterial color="#d8dde3" metalness={0.3} roughness={0.55} />
        </mesh>
        {/* service module + gold foil band */}
        <mesh position={[0, 0, -0.85]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.34, 0.34, 0.4, 16]} />
          <meshStandardMaterial color="#3a3f4a" metalness={0.5} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0, -0.62]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.405, 0.405, 0.12, 16]} />
          <meshStandardMaterial color="#c9963f" metalness={0.85} roughness={0.3} emissive="#c9963f" emissiveIntensity={0.12} />
        </mesh>
        {/* solar wings */}
        <Panel position={[0.62, 0, -0.72]} args={[0.02, 0.5, 0.62]} />
        <Panel position={[-0.62, 0, -0.72]} args={[0.02, 0.5, 0.62]} />
        {/* nose cone */}
        <mesh position={[0, 0, 0.78]} rotation={[-Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.4, 0.36, 16]} />
          <meshStandardMaterial color="#c8ccd4" metalness={0.4} roughness={0.5} />
        </mesh>
      </group>
    </FloatBob>
  );
}

/** Schematic EVA suit proxy: helmet + visor + torso + backpack. */
function SuitProxy() {
  return (
    <FloatBob amp={0.07} speed={0.8}>
      <group rotation={[0, -0.4, 0]} scale={0.9}>
        {/* torso */}
        <mesh position={[0, -0.28, 0]}>
          <boxGeometry args={[0.5, 0.6, 0.34]} />
          <meshStandardMaterial color="#e4e7ea" roughness={0.7} metalness={0.1} />
        </mesh>
        {/* life-support backpack */}
        <mesh position={[0, -0.24, -0.26]}>
          <boxGeometry args={[0.42, 0.52, 0.18]} />
          <meshStandardMaterial color="#cfd4da" roughness={0.65} metalness={0.2} />
        </mesh>
        {/* helmet */}
        <mesh position={[0, 0.18, 0]}>
          <sphereGeometry args={[0.28, 20, 16]} />
          <meshStandardMaterial color="#eef1f4" roughness={0.5} metalness={0.15} />
        </mesh>
        {/* gold visor */}
        <mesh position={[0, 0.18, 0.14]} scale={[1, 0.78, 0.55]}>
          <sphereGeometry args={[0.22, 18, 14]} />
          <meshStandardMaterial color="#8a6a2f" metalness={0.9} roughness={0.15} emissive="#c9963f" emissiveIntensity={0.15} />
        </mesh>
        {/* arms */}
        <mesh position={[0.33, -0.24, 0.05]} rotation={[0, 0, 0.5]}>
          <boxGeometry args={[0.16, 0.5, 0.18]} />
          <meshStandardMaterial color="#e4e7ea" roughness={0.7} metalness={0.1} />
        </mesh>
        <mesh position={[-0.33, -0.24, 0.05]} rotation={[0, 0, -0.5]}>
          <boxGeometry args={[0.16, 0.5, 0.18]} />
          <meshStandardMaterial color="#e4e7ea" roughness={0.7} metalness={0.1} />
        </mesh>
      </group>
    </FloatBob>
  );
}

function DestinationBody({ id }: { id: EnvId }) {
  switch (id) {
    case "earth":
      return (
        <>
          <SlowSpin speed={0.03}>
            <TintedSphere radius={2.7} base="#3d7ea6" alt="#7fae72" cap="#e9f2f6" threshold={0.55} capAt={0.88} />
          </SlowSpin>
          {/* thin atmosphere shell */}
          <mesh scale={1.045}>
            <sphereGeometry args={[2.7, 24, 18]} />
            <meshBasicMaterial color="#5799d1" transparent opacity={0.07} />
          </mesh>
        </>
      );
    case "moon":
      return (
        <SlowSpin speed={0.015}>
          <TintedSphere radius={0.72} base="#b9b6b0" alt="#8f8d88" threshold={0.3} />
        </SlowSpin>
      );
    case "mars":
      return (
        <SlowSpin speed={0.02}>
          <TintedSphere radius={1.15} base="#b5573a" alt="#8a3f2a" cap="#e9ded2" threshold={0.45} capAt={0.93} />
        </SlowSpin>
      );
    case "iss":
      return <IssProxy />;
    case "spacecraft":
      return <SpacecraftProxy />;
    case "spacesuit":
      return <SuitProxy />;
    default:
      return null;
  }
}

// ---------- interactive destination wrapper ----------

function Destination({ spec, selected, onSelect }: { spec: DestinationSpec; selected: boolean; onSelect: (id: EnvId) => void }) {
  const [hovered, setHovered] = useState(false);
  const inner = useRef<THREE.Group>(null);
  const meta = envMeta(spec.id);

  useFrame((_, dt) => {
    if (!inner.current) return;
    const target = hovered ? 1.1 : 1;
    inner.current.scale.setScalar(THREE.MathUtils.damp(inner.current.scale.x, target, 9, dt));
  });

  const handleClick = (e: ThreeEvent<MouseEvent>) => {
    e.stopPropagation();
    onSelect(spec.id);
  };

  return (
    <group position={spec.position}>
      <group
        ref={inner}
        onClick={handleClick}
        onPointerOver={(e: ThreeEvent<PointerEvent>) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerOut={() => {
          setHovered(false);
          document.body.style.cursor = "auto";
        }}
      >
        <DestinationBody id={spec.id} />
      </group>

      {/* selection / hover ring (schematic marker, not to scale) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[spec.ringRadius, spec.ringRadius + 0.07, 48]} />
        <meshBasicMaterial color="#fcdaa7" transparent opacity={selected ? 0.85 : hovered ? 0.35 : 0} side={THREE.DoubleSide} />
      </mesh>

      {/* label anchor (projected to the DOM overlay by the LabelChip/Projector pair) */}
      {(hovered || selected) && <Projector id={spec.id} position={[0, spec.labelY, 0]} />}
    </group>
  );
}

// ---------- camera travel rig ----------

function CameraRig({ environment }: { environment: EnvId }) {
  const camera = useThree((s) => s.camera);
  const reduced = useReducedMotionPref();
  const targetPos = useRef(new THREE.Vector3(...EARTH_CAM));
  const targetLook = useRef(new THREE.Vector3(...DESTINATIONS[0].position));
  const currentLook = useRef(new THREE.Vector3(...DESTINATIONS[0].position));

  useEffect(() => {
    const spec = specFor(environment);
    targetPos.current.set(...spec.camPos);
    targetLook.current.set(...spec.position);
  }, [environment]);

  useFrame((_, dt) => {
    if (reduced) {
      // reduced motion: snap to the destination pose instead of lerping
      camera.position.copy(targetPos.current);
      currentLook.current.copy(targetLook.current);
    } else {
      const k = 1 - Math.exp(-2.4 * Math.min(dt, 0.05));
      camera.position.lerp(targetPos.current, k);
      currentLook.current.lerp(targetLook.current, k);
    }
    camera.lookAt(currentLook.current);
  });

  return null;
}

// ---------- scene ----------

export default function MissionScene({ environment, onSelect }: MissionSceneProps) {
  return (
    <LabelLayer>
      <Canvas
        dpr={[1, 1.5]}
        camera={{ position: EARTH_CAM, fov: 46, near: 0.1, far: 320 }}
        gl={{ antialias: true, powerPreference: "low-power" }}
        role="img"
        aria-label="Interactive schematic 3D scene: Earth, the International Space Station, the Moon, Mars, a cargo spacecraft and a spacesuit. Select a destination to change the research environment."
      >
        <ambientLight intensity={0.55} />
        <hemisphereLight args={["#5799d1", "#030b26", 0.45]} />
        <directionalLight position={[10, 6, 4]} intensity={2.0} color="#fff2df" />
        {/* cool rim/fill from the opposite side — keeps hardware models from reading as flat gray */}
        <directionalLight position={[-8, -2, -6]} intensity={0.7} color="#9ccae9" />

        <Stars radius={100} depth={50} count={2600} factor={3.4} saturation={0} fade speed={0.5} />

        <CameraRig environment={environment} />

        {DESTINATIONS.map((spec) => (
          <Destination key={spec.id} spec={spec} selected={environment === spec.id} onSelect={onSelect} />
        ))}
      </Canvas>
      <LabelOverlay>
        {DESTINATIONS.map((spec) => {
          const meta = envMeta(spec.id);
          return (
            <LabelChip key={spec.id} id={spec.id}>
              {/* labels hidden on mobile — projected positions can collide with the headline; the destination chips below select the same environments */}
              <div className="hidden flex-col items-center gap-0.5 sm:flex" data-active-chip>
                <span className="whitespace-nowrap rounded-md border border-[#5799d1]/50 bg-[#030b26]/90 px-2 py-1 font-mono text-[10px] tracking-wider text-[#fcdaa7] shadow-lg">
                  {meta.label}
                </span>
                <span className="text-[9px] font-semibold uppercase tracking-[0.18em] text-white/55">{meta.kind}</span>
              </div>
            </LabelChip>
          );
        })}
      </LabelOverlay>
    </LabelLayer>
  );
}
