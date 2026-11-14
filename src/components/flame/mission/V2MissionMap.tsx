"use client";

/**
 * MISSION MAP — the immersive 3D mission-selection scene (M2).
 *
 * A spatial overview: Earth (NASA Blue Marble via three.js example textures,
 * day/night shader + clouds + atmospheric rim), the Moon, Mars, the official
 * NASA ISS 3D model in orbit (optimised, meshopt) and the official NASA
 * Perseverance rover model near Mars, plus a clearly-labelled conceptual
 * spacecraft marker. Selecting a destination flies the camera there and
 * reveals its research panel.
 *
 * Honesty labels:
 *  - ISS / Perseverance: “Official NASA 3D model (optimised)”.
 *  - Spacecraft marker: “conceptual illustration”.
 *  - The scene is a stylised mission map — NOT to scale, NOT a simulator.
 *
 * Labels are DOM buttons projected from 3D each frame by <LabelProjector/>
 * (no drei <Html>: its internal ReactDOM roots race React 19’s renderer and
 * spam the dev console). Occlusion behind planets is tested analytically
 * (ray–sphere), so labels never float through worlds.
 */

import { Suspense, useMemo, useRef, useState, useEffect, useLayoutEffect, useSyncExternalStore, useCallback } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Stars, useTexture, useGLTF, Line } from "@react-three/drei";

/** Local environments table (adapted from the V2 app store) — destinations
 *  anchor the camera flight; ids kept V2-internal ("lunar" = our "moon"). */
const ENVIRONMENTS: { id: EnvironmentId; short: string; gravity: string; destination: { anchor: [number, number, number]; camera: [number, number, number]; approach: string } }[] = [
  { id: "iss", short: "ISS", gravity: "≈10⁻⁶ g", destination: { anchor: [-14, 2.6, 4.2], camera: [-6.2, 5.2, 14.5], approach: "Approaching the International Space Station — 402 km, orbital velocity 7.66 km/s" } },
  { id: "lunar", short: "Lunar", gravity: "0.166 g", destination: { anchor: [16, 2, -6], camera: [21.2, 4.6, 1.8], approach: "Descending toward the lunar surface — 0.166 g, no combustion outcome data yet" } },
  { id: "mars", short: "Mars", gravity: "0.38 g", destination: { anchor: [34, -3, -18], camera: [41.2, 1.2, -11.2], approach: "On approach to Mars — 0.38 g partial gravity" } },
  { id: "spacecraft", short: "Cabin", gravity: "≈10⁻⁶ g", destination: { anchor: [9.5, -4.5, 9], camera: [13.5, -2.6, 14.2], approach: "Docked with the conceptual transit vehicle" } },
];
type EnvironmentId = "iss" | "lunar" | "mars" | "spacecraft";

const SUN_DIR = new THREE.Vector3(1, 0.38, 0.55).normalize();
const DEFAULT_CAM = new THREE.Vector3(2.5, 7.5, 46.5);
const DEFAULT_TGT = new THREE.Vector3(6.5, 0, -6);
const EARTH_POS = new THREE.Vector3(-14, 0, 0);
const MOON_POS = new THREE.Vector3(16, 2, -6);
const MARS_POS = new THREE.Vector3(34, -3, -18);
const CRAFT_POS = new THREE.Vector3(9.5, -4.5, 9);
const ROVER_POS = new THREE.Vector3(28.6, -0.9, -12.6);
const ISS_ORBIT_R = 10;
const ISS_INCLINATION = 0.52; // rad

const PLANET_TEXTURES = [
  "/textures/planets/earth_atmos_2048.jpg",
  "/textures/planets/earth_lights_2048.png",
  "/textures/planets/earth_clouds_1024.png",
  "/textures/planets/moon_1024.jpg",
  "/textures/planets/mars_2k.jpg",
];

/** Occluder spheres for label visibility (analytic ray–sphere tests). */
const OCCLUDERS = [
  { center: EARTH_POS, r: 6.05 },
  { center: MOON_POS, r: 1.62 },
  { center: MARS_POS, r: 3.42 },
];

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia(REDUCED_MOTION_QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

export function useReducedMotion() {
  return useSyncExternalStore(
    subscribeReducedMotion,
    () => window.matchMedia(REDUCED_MOTION_QUERY).matches,
    () => false,
  );
}

/** Warms every texture + GLB before the asset subtree mounts (atomic reveal). */
function PreludeAssets() {
  useTexture(PLANET_TEXTURES);
  useGLTF("/textures/models/iss-nasa.glb", false, true);
  useGLTF("/textures/models/perseverance-nasa.glb", false, true);
  return null;
}

/* ------------------------------------------------------------------ Earth */

function Earth({ selected }: { selected: EnvironmentId | null }) {
  const group = useRef<THREE.Group>(null);
  const [day, night] = useTexture([
    "/textures/planets/earth_atmos_2048.jpg",
    "/textures/planets/earth_lights_2048.png",
  ]);
  useLayoutEffect(() => {
    // react-hooks/immutability suppressed: useTexture returns module-cached
    // three.js objects — configuring them is the documented drei idiom; React
    // memoization cannot observe these external objects, cloning would only
    // duplicate GPU memory.
    // eslint-disable-next-line react-hooks/immutability
    day.colorSpace = THREE.SRGBColorSpace;
    // eslint-disable-next-line react-hooks/immutability
    night.colorSpace = THREE.SRGBColorSpace;
    day.anisotropy = 4;
    night.anisotropy = 4;
  }, [day, night]);

  const earthMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: {
          dayMap: { value: day },
          nightMap: { value: night },
          sunDir: { value: SUN_DIR },
        },
        vertexShader: /* glsl */ `
          varying vec2 vUv; varying vec3 vN; varying vec3 vW;
          void main(){
            vUv = uv;
            vN = normalize(mat3(modelMatrix) * normal);
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vW = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }`,
        fragmentShader: /* glsl */ `
          uniform sampler2D dayMap; uniform sampler2D nightMap; uniform vec3 sunDir;
          varying vec2 vUv; varying vec3 vN; varying vec3 vW;
          void main(){
            vec3 n = normalize(vN);
            float sd = dot(n, normalize(sunDir));
            float dayMix = smoothstep(-0.16, 0.34, sd);
            vec3 day = texture2D(dayMap, vUv).rgb;
            vec3 night = texture2D(nightMap, vUv).rgb * vec3(1.0, 0.84, 0.60) * 2.4;
            vec3 col = mix(night, day, dayMix);
            vec3 v = normalize(cameraPosition - vW);
            float fres = pow(1.0 - abs(dot(n, v)), 3.0);
            col += vec3(0.16, 0.32, 0.60) * fres * 0.6;
            gl_FragColor = vec4(col, 1.0);
            #include <colorspace_fragment>
          }`,
      }),
    [day, night],
  );

  const atmoMat = useMemo(
    () =>
      new THREE.ShaderMaterial({
        uniforms: { sunDir: { value: SUN_DIR } },
        vertexShader: /* glsl */ `
          varying vec3 vN; varying vec3 vW;
          void main(){
            vN = normalize(mat3(modelMatrix) * normal);
            vec4 wp = modelMatrix * vec4(position, 1.0);
            vW = wp.xyz;
            gl_Position = projectionMatrix * viewMatrix * wp;
          }`,
        fragmentShader: /* glsl */ `
          uniform vec3 sunDir; varying vec3 vN; varying vec3 vW;
          void main(){
            vec3 n = normalize(vN);
            vec3 v = normalize(cameraPosition - vW);
            float rim = pow(1.0 - abs(dot(n, v)), 3.4);
            float sun = 0.35 + 0.65 * max(dot(-n, normalize(sunDir)), 0.0);
            gl_FragColor = vec4(vec3(0.30, 0.55, 1.0) * rim * sun * 1.5, rim);
            #include <colorspace_fragment>
          }`,
        transparent: true,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
        depthWrite: false,
      }),
    [],
  );

  useFrame((_, dt) => {
    if (group.current) group.current.rotation.y += dt * 0.012;
  });

  return (
    <group position={EARTH_POS}>
      <group ref={group}>
        <mesh material={earthMat}>
          <sphereGeometry args={[6, 64, 48]} />
        </mesh>
        <CloudShell />
      </group>
      <mesh material={atmoMat} scale={1.075}>
        <sphereGeometry args={[6, 48, 32]} />
      </mesh>
      <group rotation={[ISS_INCLINATION, 0.2, 0]}>
        <OrbitRing radius={ISS_ORBIT_R} opacity={selected === "iss" ? 0.85 : 0.3} />
      </group>
    </group>
  );
}

function CloudShell() {
  const ref = useRef<THREE.Mesh>(null);
  const clouds = useTexture("/textures/planets/earth_clouds_1024.png");
  useFrame((_, dt) => {
    if (ref.current) ref.current.rotation.y += dt * 0.017;
  });
  return (
    <mesh ref={ref}>
      <sphereGeometry args={[6.09, 48, 32]} />
      <meshStandardMaterial
        color="#ffffff"
        alphaMap={clouds}
        transparent
        opacity={0.62}
        depthWrite={false}
        roughness={1}
      />
    </mesh>
  );
}

function OrbitRing({ radius, opacity }: { radius: number; opacity: number }) {
  const pts = useMemo(() => {
    const p: THREE.Vector3[] = [];
    for (let i = 0; i <= 128; i++) {
      const a = (i / 128) * Math.PI * 2;
      p.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    return p;
  }, [radius]);
  return (
    <Line points={pts} color="#97e2fe" transparent opacity={opacity} lineWidth={1} dashed dashSize={0.55} gapSize={0.4} />
  );
}

/* -------------------------------------------------------------- ISS (NASA) */

function ISSAssembly({
  selected,
  issRef,
}: {
  selected: EnvironmentId | null;
  issRef: React.RefObject<THREE.Group | null>;
}) {
  const orbit = useRef<THREE.Group>(null);
  const spin = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();

  useFrame((state) => {
    if (!orbit.current) return;
    const freeze = selected === "iss" || reduced;
    if (!freeze) orbit.current.rotation.y = state.clock.elapsedTime * 0.05 + 1.2;
    if (spin.current && !reduced) spin.current.rotation.z = Math.sin(state.clock.elapsedTime * 0.1) * 0.04;
    orbit.current.updateWorldMatrix(true, false);
  });

  return (
    <group rotation={[ISS_INCLINATION, 0.2, 0]} position={EARTH_POS}>
      <group ref={orbit}>
        <group position={[ISS_ORBIT_R, 0, 0]}>
          <Suspense fallback={<ISSPlaceholder />}>
            <ISSModel issRef={issRef} spinRef={spin} />
          </Suspense>
        </group>
      </group>
    </group>
  );
}

function ISSPlaceholder() {
  return (
    <group>
      <mesh>
        <boxGeometry args={[2.4, 0.5, 0.7]} />
        <meshBasicMaterial color="#4784d9" transparent opacity={0.25} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[1.6, 1.7, 32]} />
        <meshBasicMaterial color="#97e2fe" transparent opacity={0.3} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ISSModel({
  issRef,
  spinRef,
}: {
  issRef: React.RefObject<THREE.Group | null>;
  spinRef: React.RefObject<THREE.Group | null>;
}) {
  const { scene } = useGLTF("/textures/models/iss-nasa.glb", false, true);

  const model = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    const s = 4.6 / Math.max(size.x, size.y, size.z);
    root.position.copy(center).multiplyScalar(-s);
    root.scale.setScalar(s);
    const wrap = new THREE.Group();
    wrap.add(root);
    return wrap;
  }, [scene]);

  return (
    <group ref={issRef}>
      <group ref={spinRef}>
        <primitive object={model} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------- Moon & Mars */

function Moon({ moonRef }: { moonRef: React.RefObject<THREE.Group | null> }) {
  const g = useRef<THREE.Group>(null);
  const tex = useTexture("/textures/planets/moon_1024.jpg");
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- cached drei texture, see Earth
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.004;
  });
  return (
    <group position={MOON_POS} ref={moonRef}>
      <group ref={g}>
        <mesh>
          <sphereGeometry args={[1.6, 48, 32]} />
          <meshStandardMaterial map={tex} bumpMap={tex} bumpScale={0.05} roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

function Mars({ marsRef }: { marsRef: React.RefObject<THREE.Group | null> }) {
  const g = useRef<THREE.Group>(null);
  const tex = useTexture("/textures/planets/mars_2k.jpg");
  useLayoutEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- cached drei texture, see Earth
    tex.colorSpace = THREE.SRGBColorSpace;
  }, [tex]);
  useFrame((_, dt) => {
    if (g.current) g.current.rotation.y += dt * 0.008;
  });
  return (
    <group position={MARS_POS} ref={marsRef}>
      <group ref={g}>
        <mesh>
          <sphereGeometry args={[3.4, 56, 40]} />
          <meshStandardMaterial map={tex} bumpMap={tex} bumpScale={0.07} roughness={1} />
        </mesh>
      </group>
    </group>
  );
}

/* -------------------------------------------------- Perseverance (official) */

function PerseveranceModel() {
  const { scene } = useGLTF("/textures/models/perseverance-nasa.glb", false, true);
  const g = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();
  const model = useMemo(() => {
    const root = scene.clone(true);
    const box = new THREE.Box3().setFromObject(root);
    const size = new THREE.Vector3(); box.getSize(size);
    const center = new THREE.Vector3(); box.getCenter(center);
    const s = 1.7 / Math.max(size.x, size.y, size.z);
    root.position.copy(center).multiplyScalar(-s);
    root.scale.setScalar(s);
    const wrap = new THREE.Group();
    wrap.add(root);
    return wrap;
  }, [scene]);
  useFrame((state) => {
    if (g.current && !reduced) g.current.rotation.y = state.clock.elapsedTime * 0.22;
  });
  return (
    <group ref={g} position={[0, 0.95, 0]}>
      <primitive object={model} />
    </group>
  );
}

/* ----------------------------------------------- Conceptual spacecraft mark */

function ConceptCraft({ craftRef }: { craftRef: React.RefObject<THREE.Group | null> }) {
  const g = useRef<THREE.Group>(null);
  const reduced = useReducedMotion();
  useFrame((state) => {
    if (!g.current) return;
    if (!reduced) {
      g.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.18;
      g.current.rotation.y = state.clock.elapsedTime * 0.12 + 0.6;
    }
  });
  const panelMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1c2f66",
        roughness: 0.35,
        metalness: 0.55,
        emissive: "#0a1230",
        emissiveIntensity: 0.4,
      }),
    [],
  );
  return (
    <group position={CRAFT_POS} ref={craftRef}>
      <group ref={g}>
        {/* pressurized cabin module */}
        <mesh>
          <capsuleGeometry args={[0.34, 0.7, 8, 16]} />
          <meshStandardMaterial color="#cdd8ef" roughness={0.4} metalness={0.35} />
        </mesh>
        {/* window ring */}
        <mesh position={[0, 0, 0.36]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.16, 0.035, 10, 24]} />
          <meshStandardMaterial color="#97e2fe" emissive="#4784d9" emissiveIntensity={0.8} />
        </mesh>
        {/* docking adapter */}
        <mesh position={[0, -0.62, 0]}>
          <cylinderGeometry args={[0.14, 0.18, 0.22, 12]} />
          <meshStandardMaterial color="#8fa2c8" metalness={0.5} roughness={0.4} />
        </mesh>
        {/* solar wings */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.62, 0, 0]} rotation={[0, 0, s * 0.06]}>
            <mesh material={panelMat}>
              <boxGeometry args={[0.92, 0.02, 0.5]} />
            </mesh>
            <mesh position={[s * -0.48, 0, 0]}>
              <cylinderGeometry args={[0.018, 0.018, 0.18, 8]} />
              <meshStandardMaterial color="#6d7fa8" metalness={0.6} roughness={0.3} />
            </mesh>
          </group>
        ))}
      </group>
    </group>
  );
}

/* --------------------------------------------------------- journey arcs */

function TransferArcs() {
  const arcs = useMemo(() => {
    const mk = (to: THREE.Vector3, lift: number) => {
      const mid = EARTH_POS.clone().add(to).multiplyScalar(0.5);
      mid.y += lift;
      const curve = new THREE.QuadraticBezierCurve3(
        EARTH_POS.clone().add(new THREE.Vector3(3.4, 2.4, 2.6)),
        mid,
        to,
      );
      return curve.getPoints(60);
    };
    return [
      mk(MOON_POS.clone().add(new THREE.Vector3(0, 1.8, 0)), 4.5),
      mk(MARS_POS.clone().add(new THREE.Vector3(0, 3.4, 0)), 6.5),
      mk(CRAFT_POS.clone().add(new THREE.Vector3(0, 1.2, 0)), 2.4),
    ];
  }, []);
  return (
    <group>
      {arcs.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#4784d9"
          transparent
          opacity={0.34}
          lineWidth={1}
          dashed
          dashSize={0.5}
          gapSize={0.42}
        />
      ))}
    </group>
  );
}

/* ------------------------------------------------------- label projection */

export interface LabelAnchor {
  id: string;
  kind: "dest" | "micro";
  env?: EnvironmentId;
  text?: string;
  /** object to track (world position each frame) */
  obj?: React.RefObject<THREE.Group | null>;
  /** static world position (when no object) */
  pos?: [number, number, number];
  /** world-space offset above the anchor */
  offset: [number, number, number];
}

const LABEL_ANCHORS: LabelAnchor[] = [
  { id: "iss", kind: "dest", env: "iss", offset: [0, 1.8, 0] },
  { id: "lunar", kind: "dest", env: "lunar", offset: [0, 2.4, 0] },
  { id: "mars", kind: "dest", env: "mars", offset: [0, 4.4, 0] },
  { id: "spacecraft", kind: "dest", env: "spacecraft", offset: [0, 1.2, 0] },
  { id: "rover", kind: "micro", text: "Perseverance · NASA official 3D model", pos: [ROVER_POS.x + 1.6, ROVER_POS.y + 0.3, ROVER_POS.z], offset: [0, 0, 0] },
  { id: "habitat", kind: "micro", text: "habitat · concept", pos: [MOON_POS.x - 1.25, MOON_POS.y - 0.8, MOON_POS.z + 0.95], offset: [0, 0.4, 0] },
];

/**
 * Projects label anchors to screen space every frame and writes transforms
 * straight to the overlay DOM (no React re-renders, no ReactDOM roots).
 */
function LabelProjector({
  overlayRef,
  refs,
  selected,
}: {
  overlayRef: React.RefObject<HTMLDivElement | null>;
  refs: Record<EnvironmentId, React.RefObject<THREE.Group | null>>;
  selected: EnvironmentId | null;
}) {
  const { camera, size } = useThree();
  // scratch objects live in a ref: mutated every frame inside useFrame,
  // never touched during render (React-compiler-clean).
  const scratch = useRef({
    v: new THREE.Vector3(),
    world: new THREE.Vector3(),
    ray: new THREE.Ray(),
    hit: new THREE.Vector3(),
    sphere: new THREE.Sphere(new THREE.Vector3(), 1),
  });

  useFrame(() => {
    const { v, world, ray, hit, sphere } = scratch.current;
    const overlay = overlayRef.current;
    if (!overlay) return;
    for (const a of LABEL_ANCHORS) {
      const el = overlay.querySelector<HTMLElement>(`[data-label="${a.id}"]`);
      if (!el) continue;
      if (a.env) {
        const obj = refs[a.env]?.current;
        if (!obj) continue;
        obj.getWorldPosition(v);
      } else {
        v.set(a.pos![0], a.pos![1], a.pos![2]);
      }
      v.x += a.offset[0];
      v.y += a.offset[1];
      v.z += a.offset[2];
      world.copy(v);
      const dist = world.distanceTo(camera.position);
      v.project(camera);
      if (v.z > 1) {
        el.style.opacity = "0";
        el.style.pointerEvents = "none";
        continue;
      }
      const x = (v.x * 0.5 + 0.5) * size.width;
      const y = (-v.y * 0.5 + 0.5) * size.height;

      // analytic occlusion: ray from camera toward the anchor, test planets
      ray.origin.copy(camera.position);
      ray.direction.copy(world).sub(camera.position).normalize();
      let occluded = false;
      for (const oc of OCCLUDERS) {
        sphere.center.copy(oc.center);
        sphere.radius = oc.r;
        if (ray.intersectSphere(sphere, hit)) {
          const dHit = camera.position.distanceTo(hit);
          if (dHit < dist - 0.5) {
            occluded = true;
            break;
          }
        }
      }
      const scale = THREE.MathUtils.clamp(26 / dist, 0.72, 1.3);
      // keep the label fully inside the viewport (its own width, centered)
      const half = (el.offsetWidth || 80) / 2 + 6;
      const cx = THREE.MathUtils.clamp(x, half, Math.max(half, size.width - half));
      const cy = THREE.MathUtils.clamp(y, 26, size.height - 10);
      el.style.transform = `translate(-50%, -100%) translate(${cx.toFixed(1)}px, ${cy.toFixed(1)}px) scale(${scale.toFixed(2)})`;
      el.style.opacity = occluded ? "0.12" : "1";
      el.style.pointerEvents = occluded ? "none" : "auto";
      el.style.zIndex = a.kind === "dest" ? "8" : "6";
    }
  });
  return null;
}

/* -------------------------------------------------------------- camera rig */

/** Bridges the hero’s “Enter VR” button into the live renderer: only ever
 *  activated from a real WebXR session request — no fake VR. */
function XRBridge() {
  const { gl } = useThree();
  useEffect(() => {
    const fn = (ev: Event) => {
      const session = (ev as CustomEvent<XRSession>).detail;
      if (session) {
        gl.xr.enabled = true;
        void gl.xr.setSession(session);
      }
    };
    window.addEventListener("mission-xr-session", fn);
    return () => window.removeEventListener("mission-xr-session", fn);
  }, [gl]);
  return null;
}

interface RigProps {
  selected: EnvironmentId | null;
  traveling: boolean;
  refs: Record<EnvironmentId, React.RefObject<THREE.Group | null>>;
  onArrive: () => void;
  resetSignal?: number;
}

function CameraRig({ selected, traveling, refs, onArrive, resetSignal = 0 }: RigProps) {
  const { camera, controls } = useThree();
  const reduced = useReducedMotion();
  const tmp = useRef(new THREE.Vector3());
  const camT = useRef(new THREE.Vector3());
  const tgtT = useRef(new THREE.Vector3());
  const offset = useRef(new THREE.Vector3());
  const arrived = useRef(true);
  // Task 4 — reset: momentarily clear the destination so the rig lerp flies home.
  // A ref (not state): consumed only inside useFrame, so no render cascade.
  const resetHome = useRef(false);

  useEffect(() => {
    arrived.current = false;
  }, [selected, traveling]);

  useEffect(() => {
    if (resetSignal > 0) {
      resetHome.current = true;
      const id = setTimeout(() => (resetHome.current = false), 60);
      return () => clearTimeout(id);
    }
  }, [resetSignal]);

  useFrame((_, dt) => {
    const ctl = controls as unknown as { target: THREE.Vector3; update: () => void } | null;
    if (!ctl) return;
    const k = reduced ? 1 : 1 - Math.exp(-4.2 * Math.min(dt, 0.05));

    if (selected && !resetHome.current) {
      const obj = refs[selected]?.current;
      if (obj) {
        obj.getWorldPosition(tmp.current);
        tgtT.current.copy(tmp.current);
        const env = ENVIRONMENTS.find((e) => e.id === selected)!;
        offset.current
          .set(...env.destination.camera)
          .sub(new THREE.Vector3(...env.destination.anchor));
        camT.current.copy(tmp.current).add(offset.current);
      }
    } else {
      camT.current.copy(DEFAULT_CAM);
      tgtT.current.copy(DEFAULT_TGT);
    }

    // While traveling: drive both camera and look-at. After arrival: keep the
    // destination centred (look-at only) so the user can orbit around it freely.
    if (traveling || selected === null) {
      camera.position.lerp(camT.current, k);
    }
    ctl.target.lerp(tgtT.current, traveling ? k : k * 0.35);
    ctl.update();

    if (!arrived.current) {
      const d = camera.position.distanceTo(camT.current);
      if (d < 0.3) {
        arrived.current = true;
        onArrive();
      }
    }
  });
  return null;
}

/* ------------------------------------------------------------- scene root */

function Scene({
  selected,
  traveling,
  onArrive,
  overlayRef,
  hidden,
  isolate,
  resetSignal,
}: Omit<MissionMapProps, "onSelect"> & { overlayRef: React.RefObject<HTMLDivElement | null> }) {
  const issRef = useRef<THREE.Group>(null);
  const moonRef = useRef<THREE.Group>(null);
  const marsRef = useRef<THREE.Group>(null);
  const craftRef = useRef<THREE.Group>(null);
  const refs = { iss: issRef, lunar: moonRef, mars: marsRef, spacecraft: craftRef };
  const show = (b: BodyId) => !hidden?.[b] && (!isolate || isolate === b);

  return (
    <>
      <ambientLight intensity={0.34} color="#8fa8e0" />
      <directionalLight position={[70, 26, 38]} intensity={2.4} color="#fff5e8" />
      <hemisphereLight args={["#20335f", "#05070f", 0.4]} />

      <Stars radius={220} depth={70} count={3800} factor={4.2} saturation={0} fade speed={0.6} />
      <TransferArcs />

      {/* conceptual lunar habitat marker (no assets — never suspends) */}
      {show("moon") && (
        <group position={[MOON_POS.x - 1.25, MOON_POS.y - 0.95, MOON_POS.z + 0.95]}>
          <mesh>
            <cylinderGeometry args={[0.16, 0.2, 0.18, 10]} />
            <meshStandardMaterial color="#c8d4ee" roughness={0.5} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.14, 0]}>
            <sphereGeometry args={[0.15, 16, 12]} />
            <meshStandardMaterial color="#9fb6e6" roughness={0.4} />
          </mesh>
        </group>
      )}

      {show("iss") && <ISSAssembly selected={selected} issRef={issRef} />}

      {/* Asset-bearing bodies — mount atomically after the prelude resolves */}
      <Suspense fallback={null}>
        <PreludeAssets />
        {show("earth") && <Earth selected={selected} />}
        {show("moon") && <Moon moonRef={moonRef} />}
        {show("mars") && <Mars marsRef={marsRef} />}
        {show("rover") && (
          <group position={ROVER_POS}>
            {/* holographic pedestal — clearly decorative */}
            <mesh rotation={[-Math.PI / 2, 0, 0]}>
              <ringGeometry args={[0.72, 0.86, 48]} />
              <meshBasicMaterial color="#97e2fe" transparent opacity={0.35} side={THREE.DoubleSide} />
            </mesh>
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
              <ringGeometry args={[0.3, 0.36, 40]} />
              <meshBasicMaterial color="#4784d9" transparent opacity={0.5} side={THREE.DoubleSide} />
            </mesh>
            <PerseveranceModel />
          </group>
        )}
      </Suspense>

      {show("spacecraft") && <ConceptCraft craftRef={craftRef} />}

      <XRBridge />
      <LabelProjector overlayRef={overlayRef} refs={refs} selected={selected} />
      <CameraRig selected={selected} traveling={traveling} refs={refs} onArrive={onArrive} resetSignal={resetSignal} />
      <OrbitControls
        makeDefault
        enablePan={false}
        enabled={!traveling}
        enableDamping
        dampingFactor={0.08}
        minDistance={3.5}
        maxDistance={110}
        rotateSpeed={0.55}
        zoomSpeed={0.7}
      />
    </>
  );
}

/* --------------------------------------------------------------- overlay */

function DestLabelButton({
  env,
  active,
  onSelect,
}: {
  env: EnvironmentId;
  active: boolean;
  onSelect: (e: EnvironmentId) => void;
}) {
  const e = ENVIRONMENTS.find((x) => x.id === env)!;
  return (
    <button
      className="dest-label"
      data-active={active}
      onClick={(ev) => {
        ev.stopPropagation();
        onSelect(env);
      }}
      aria-pressed={active}
    >
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: active ? "#97e2fe" : "#4784d9", boxShadow: "0 0 8px #4784d9aa" }}
      />
      {e.short} · {e.gravity}
    </button>
  );
}

export type BodyId = "earth" | "moon" | "mars" | "iss" | "rover" | "spacecraft";

export interface MissionMapProps {
  selected: EnvironmentId | null;
  traveling: boolean;
  onSelect: (env: EnvironmentId) => void;
  onArrive: () => void;
  /** Task 4 interactivity — per-body visibility toggles. */
  hidden?: Partial<Record<BodyId, boolean>>;
  /** Task 4 interactivity — isolate one body (all others hidden). */
  isolate?: BodyId | null;
  /** Task 4 interactivity — increment to fly the camera home. */
  resetSignal?: number;
}

export default function MissionMap(props: MissionMapProps) {
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);
  const isMobile = useMemo(
    () => typeof window !== "undefined" && window.innerWidth < 768,
    [],
  );

  useEffect(() => {
    let webglFailed = false;
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2") || c.getContext("webgl");
      if (!gl) webglFailed = true;
    } catch {
      webglFailed = true;
    }
    const id = requestAnimationFrame(() => {
      setFailed(webglFailed);
      setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, []);

  const overlay = useCallback(
    (node: HTMLDivElement | null) => {
      // keep the projector's overlay ref in sync across re-renders
      (overlayRef as { current: HTMLDivElement | null }).current = node;
    },
    [],
  );

  if (failed) {
    return (
      <div className="grid h-full w-full place-items-center p-6">
        <div className="panel-glass max-w-md p-6 text-center">
          <p className="text-[13px] font-semibold">WebGL is unavailable on this device.</p>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
            The interactive 3D mission map needs WebGL. You can still select a mission environment with the
            buttons above — the full research platform works without 3D.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      {!ready ? (
        <div className="grid h-full w-full place-items-center">
          <div className="relative h-12 w-12">
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-[#4784d9] border-r-[#97e2fe]" />
          </div>
        </div>
      ) : (
        <Canvas
          className="!touch-pan-y"
          camera={{ position: DEFAULT_CAM.toArray(), fov: 40, near: 0.1, far: 400 }}
          dpr={[1, isMobile ? 1.5 : 2]}
          gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
          onCreated={({ gl }) => {
            gl.toneMapping = THREE.ACESFilmicToneMapping;
            gl.toneMappingExposure = 1.05;
          }}
        >
          <Scene
            selected={props.selected}
            traveling={props.traveling}
            onArrive={props.onArrive}
            overlayRef={overlayRef}
            hidden={props.hidden}
            isolate={props.isolate}
            resetSignal={props.resetSignal}
          />
        </Canvas>
      )}

      {/* Label overlay — plain DOM above the canvas, positioned imperatively
          each frame; pointer-events pass through except on the labels. */}
      <div ref={overlay} className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        {LABEL_ANCHORS.filter((a) => a.kind === "dest").map((a) => (
          <span
            key={a.id}
            data-label={a.id}
            className="absolute left-0 top-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <span className="pointer-events-auto block">
              <DestLabelButton env={a.env!} active={props.selected === a.env} onSelect={props.onSelect} />
            </span>
          </span>
        ))}
        {LABEL_ANCHORS.filter((a) => a.kind === "micro").map((a) => (
          <span
            key={a.id}
            data-label={a.id}
            className="absolute left-0 top-0 will-change-transform"
            style={{ opacity: 0 }}
          >
            <span className="dest-label !cursor-default !text-[0.62rem] !opacity-90">{a.text}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
