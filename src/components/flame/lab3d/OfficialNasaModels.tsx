"use client";

// ZERO FLARE — OfficialNasaModels (M8): the official NASA-linked GLB assets
// (ISS + Perseverance rover) with full provenance, lazy loading and honesty
// labels. Fidelity class: "official NASA 3D model (repackaged)" — geometry
// unchanged from the NASA Science source, textures re-encoded (WebP @1024).
// NOT a digital twin; NOT a simulator; not to scale with other apparatus.

import { Component, Suspense, useState, type ReactNode } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, useGLTF } from "@react-three/drei";
import { Badge } from "@/components/ui/badge";

interface GlbSpec {
  id: string;
  name: string;
  file: string;
  originalUrl: string;
  originalName: string;
  processed: string;
  size: string;
  note: string;
}

const GLB_ASSETS: GlbSpec[] = [
  {
    id: "iss-station",
    name: "International Space Station",
    file: "/textures/models/iss-nasa.glb",
    originalUrl: "https://science.nasa.gov/resource/international-space-station-3d-model/",
    originalName: "ISS_stationary.glb (44.5 MB, 2023-09-09)",
    processed: "gltf-transform: meshopt compression + WebP textures @1024; geometry unchanged",
    size: "4.8 MB",
    note: "The orbital laboratory hosting the Fluids & Combustion Facility racks that carried most of the PSI microgravity combustion experiments.",
  },
  {
    id: "perseverance",
    name: "Perseverance rover",
    file: "/textures/models/perseverance-nasa.glb",
    originalUrl: "https://science.nasa.gov/resource/perseverance-rover-3d-model/",
    originalName: "25042_Perseverance.glb (11.7 MB, 2024-03-08)",
    processed: "gltf-transform: meshopt compression + WebP textures @1024; geometry unchanged",
    size: "2.3 MB",
    note: "Mars surface context asset — Mars gravity (0.38 g) is a partial-gravity regime where PSI carries no combustion outcome data (evidence gap, shown honestly).",
  },
];

function OfficialGlb({ file }: { file: string }) {
  // third useGLTF arg enables the MeshoptDecoder for the compressed buffers
  const gltf = useGLTF(file, false, true);
  return <primitive object={gltf.scene} scale={1} />;
}

/** Error boundary so a failed GLB load degrades to a link, never a blank view. */
class ModelBoundary extends Component<{ children: ReactNode; onFail: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    this.props.onFail();
  }
  render() {
    if (this.state.failed) return null;
    return this.props.children;
  }
}

export function OfficialNasaModels() {
  const [selected, setSelected] = useState<GlbSpec>(GLB_ASSETS[0]);
  const [failed, setFailed] = useState(false);

  return (
    <section aria-labelledby="official-models-title" className="mt-10 scroll-mt-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="official-models-title" className="text-base font-semibold sm:text-lg">
          Official NASA 3D assets — <span className="text-muted-foreground">provenance-tracked GLB</span>
        </h2>
        <Badge className="border-emerald-500/40 bg-emerald-500/15 text-emerald-600 hover:bg-emerald-500/15">
          official NASA 3D model — geometry unchanged
        </Badge>
      </div>
      <p className="mt-1.5 max-w-3xl text-[11px] leading-relaxed text-muted-foreground">
        These are genuine NASA Science visualization models, repackaged for the web (compression + texture re-encode;
        geometry untouched). Full provenance: <span className="font-mono">public/textures/PROVENANCE.md</span>. This is
        mission orientation, not engineering CAD and not a validated facility digital twin.
      </p>

      <div className="mt-3 grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="glass-panel relative min-h-[340px] overflow-hidden rounded-xl sm:min-h-[440px]">
          <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md border border-emerald-500/50 bg-[color:var(--space-deep)]/85 px-2 py-1 font-mono text-[10px] uppercase tracking-wider text-emerald-400 backdrop-blur-sm">
            official NASA asset · not a simulator · not to scale
          </div>
          {failed ? (
            <div className="grid h-full place-items-center p-6 text-center">
              <div>
                <p className="text-sm text-muted-foreground">3D loading unavailable in this browser session.</p>
                <a className="mt-2 inline-block text-xs text-primary hover:underline" href={selected.originalUrl} target="_blank" rel="noopener noreferrer">
                  View the original model on NASA Science →
                </a>
              </div>
            </div>
          ) : (
            <Canvas
              camera={{ position: [14, 8, 16], fov: 45 }}
              gl={{ antialias: true, powerPreference: "low-power" }}
              onCreated={({ gl }) => gl.setClearColor("#040a1f")}
            >
              <ambientLight intensity={0.85} />
              <directionalLight position={[10, 12, 8]} intensity={1.4} />
              <ModelBoundary onFail={() => setFailed(true)}>
                <Suspense fallback={null}>
                  <OfficialGlb file={selected.file} />
                </Suspense>
              </ModelBoundary>
              <OrbitControls enableDamping dampingFactor={0.08} minDistance={4} maxDistance={60} />
            </Canvas>
          )}
          <p className="pointer-events-none absolute bottom-3 left-3 z-10 font-mono text-[10px] text-muted-foreground">
            drag to orbit · scroll to zoom
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            {GLB_ASSETS.map((a) => (
              <button
                key={a.id}
                onClick={() => {
                  setSelected(a);
                  setFailed(false);
                }}
                className={`flex-1 rounded-lg border px-3 py-2 text-left text-xs transition-colors ${
                  selected.id === a.id
                    ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-600"
                    : "border-border/60 bg-accent/20 hover:border-primary/50"
                }`}
              >
                <span className="block font-medium">{a.name}</span>
                <span className="block font-mono text-[10px] text-muted-foreground">{a.size} · official</span>
              </button>
            ))}
          </div>
          <div className="research-panel rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Provenance record</p>
            <h3 className="mt-0.5 text-sm font-semibold">{selected.name}</h3>
            <dl className="mt-2 space-y-1.5 text-[11px] leading-snug">
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted-foreground">original</dt>
                <dd className="min-w-0">
                  <a href={selected.originalUrl} target="_blank" rel="noopener noreferrer" className="break-all text-primary hover:underline">
                    {selected.originalName}
                  </a>
                </dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted-foreground">publisher</dt>
                <dd>NASA Science Visualization Studio / science.nasa.gov (public domain — NASA media usage guidelines)</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted-foreground">processing</dt>
                <dd className="text-muted-foreground">{selected.processed}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="w-24 shrink-0 text-muted-foreground">role here</dt>
                <dd>{selected.note}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
