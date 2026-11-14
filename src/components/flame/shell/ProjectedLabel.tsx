"use client";

// Race-free 3D label overlay: projects 3D anchor points to screen space and
// imperatively positions plain DOM chips inside a normal React overlay div.
// Replaces drei <Html>, whose separate portal root races with React 19
// unmounts ("Attempted to synchronously unmount a root" / removeChild errors).
//
// Two usage styles:
// 1) Declarative chips: <LabelLayer> wraps <Canvas> + <LabelOverlay>;
//    chips declared in the overlay with <LabelChip id>, anchors inside the
//    canvas with <Projector id position>. Projector toggles chip visibility.
// 2) Auto-registry: inside the canvas, <SceneLabel position>text</SceneLabel>
//    registers its chip content automatically (used by 3D part labels).

import { createContext, useContext, useEffect, useId, useRef, useState, type ReactNode } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";

const OverlayCtx = createContext<React.RefObject<HTMLDivElement | null> | null>(null);

// ---- registry state (module-scoped per bundle; single 3D layer at a time) ----
interface RegistryEntry {
  id: string;
  node: ReactNode;
}
const registry = new Map<string, RegistryEntry>();
const listeners = new Set<() => void>();

function notify() {
  listeners.forEach((l) => l());
}

function useRegistrySnapshot(): RegistryEntry[] {
  const [snapshot, setSnapshot] = useState<RegistryEntry[]>(() => [...registry.values()]);
  useEffect(() => {
    const listener = () => setSnapshot([...registry.values()]);
    listeners.add(listener);
    // ensure initial sync after mount
    const t = window.setTimeout(listener, 0);
    return () => {
      listeners.delete(listener);
      window.clearTimeout(t);
    };
  }, []);
  return snapshot;
}

export function LabelLayer({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement | null>(null);
  return <OverlayCtx.Provider value={ref}>{children}</OverlayCtx.Provider>;
}

export function LabelOverlay({ children }: { children?: ReactNode }) {
  const ref = useContext(OverlayCtx);
  const entries = useRegistrySnapshot();
  return (
    <div ref={ref} className="pointer-events-none absolute inset-0 z-10 overflow-hidden" aria-hidden="true">
      {children}
      {entries.map((e) => (
        <div key={e.id} data-plabel={e.id} style={{ position: "absolute", left: 0, top: 0, display: "none", willChange: "transform" }}>
          {e.node}
        </div>
      ))}
    </div>
  );
}

/** Declarative chip (usage style 1): rendered inside LabelOverlay; visibility driven by its Projector. */
export function LabelChip({ id, children }: { id: string; children: ReactNode }) {
  return (
    <div data-plabel={id} style={{ position: "absolute", left: 0, top: 0, display: "none", willChange: "transform" }}>
      {children}
    </div>
  );
}

/** Auto-registering label (usage style 2): call inside the Canvas. */
export function SceneLabel({ position, children }: { position: [number, number, number]; children: ReactNode }) {
  const rawId = useId();
  const id = `sl-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;
  useEffect(() => {
    registry.set(id, { id, node: children });
    const t = window.setTimeout(notify, 0);
    return () => {
      window.clearTimeout(t);
      registry.delete(id);
      notify();
    };
  }, [id, children]);
  return <Projector id={id} position={position} />;
}

/** Place inside the Canvas (any nested group); projects its world position onto the matching chip each frame. */
export function Projector({ id, position = [0, 0, 0] }: { id: string; position?: [number, number, number] }) {
  const ref = useRef<THREE.Group>(null);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const overlayRef = useContext(OverlayCtx);
  const v = useRef(new THREE.Vector3());

  // hide the chip when this projector unmounts (hover/selection ended)
  useEffect(() => {
    return () => {
      const el = overlayRef?.current?.querySelector<HTMLElement>(`[data-plabel="${id}"]`);
      if (el) el.style.display = "none";
    };
  }, [id, overlayRef]);

  useFrame(() => {
    const g = ref.current;
    const overlay = overlayRef?.current;
    if (!g || !overlay) return;
    const el = overlay.querySelector<HTMLElement>(`[data-plabel="${id}"]`);
    if (!el) return;
    g.getWorldPosition(v.current);
    v.current.project(camera);
    if (v.current.z > 1) {
      el.style.visibility = "hidden";
      return;
    }
    el.style.visibility = "visible";
    el.style.display = "block";
    const x = (v.current.x * 0.5 + 0.5) * size.width;
    const y = (-v.current.y * 0.5 + 0.5) * size.height;
    el.style.transform = `translate(-50%, -100%) translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
  });

  return <group ref={ref} position={position} />;
}
