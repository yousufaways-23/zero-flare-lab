"use client";

// ZERO FLARE — FLAME EVIDENCE LAB application store (merged IA, M1 consolidation)
// Views: mission | investigations | compare | scenarios | lab3d | data-sources | my-work | tools
// The CIR-1 copilot is a global dock, not a view.
// Hash deep links (#investigations, #investigation/PSI-69, #scenarios) keep views shareable.

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type ViewId =
  | "mission"
  | "investigations"
  | "compare"
  | "scenarios"
  | "lab3d"
  | "data-sources"
  | "my-work"
  | "tools";
export type AdvancedPanel = "model-studio" | "math-models" | "variables" | "equations" | "diagnostics" | "evaluation";
export type EnvId = "earth" | "iss" | "moon" | "mars" | "spacecraft" | "spacesuit";
export type PillarId = "prevention" | "detection" | "prediction" | "suppression";
export type InvestigationTab =
  | "overview"
  | "data"
  | "charts"
  | "equipment"
  | "media"
  | "equations"
  | "graph"
  | "gaps";
export type DataSourceTab = "ingestion" | "sources" | "media";
export type SavedItemKind =
  | "investigation"
  | "dataset"
  | "gap"
  | "equation"
  | "chart"
  | "source"
  | "media"
  | "scenario"
  | "equipment";

export interface ChartSpec {
  title: string;
  subtitle?: string;
  xLabel?: string;
  yLabel?: string;
  points?: { x: number; y: number; label?: string; group?: string }[];
  series?: { name: string; points: { x: number; y: number }[]; color?: string }[];
  histogram?: { binStart: number[]; binEnd: number[]; counts: number[]; label?: string };
  source: string; // provenance
}

export interface ResearchSession {
  id: string;
  title: string;
  createdAt: string;
  environment?: EnvId;
  investigation?: string;
  notes?: string;
  stateJson?: string;
  provenance?: string;
}

export interface SavedGap {
  id: string;
  gapId: string;
  topic: string;
  savedAt: string;
  note?: string;
  externalHits?: number; // number of external (NTRS) results found when saved
}

/** M1 — My Work shelf item: anything a researcher saves from anywhere. */
export interface SavedItem {
  id: string;
  kind: SavedItemKind;
  label: string;
  detail?: string;
  url?: string; // deep link (hash or source URL)
  savedAt: string;
  note?: string;
}

// §7.1/§8 — shared facility screening state (used by FacilityScreening,
// the Fire Safety Assistant and the CIR-1 context).
export interface FacilityCompartment {
  id: string;
  name: string;
  areaM2: number;
  heightM: number;
  materials: string[]; // material-evidence ids (see lib/science/screening.ts)
  ignitionSources: number;
  ventilation: "forced" | "quiescent" | "unknown";
  detection: "none" | "local" | "integrated";
}

/** Stable default concept compartments (fixed ids — SSR-safe, no Date.now). */
function initialCompartments(): FacilityCompartment[] {
  return [
    { id: "c-crew", name: "Crew quarter", areaM2: 12, heightM: 2.4, materials: ["cotton", "insulation"], ignitionSources: 2, ventilation: "forced", detection: "local" },
    { id: "c-lab", name: "Lab bench / workstation", areaM2: 10, heightM: 2.4, materials: ["pmma", "insulation"], ignitionSources: 3, ventilation: "forced", detection: "integrated" },
    { id: "c-eclss", name: "ECLSS equipment rack", areaM2: 6, heightM: 2.1, materials: ["other"], ignitionSources: 1, ventilation: "forced", detection: "integrated" },
  ];
}

export interface FacilityState {
  name: string;
  compartments: FacilityCompartment[];
  layoutImageName: string | null; // reference image filename (data URL kept in memory only)
  layoutImageData: string | null;
}

interface AppState {
  view: ViewId;
  advancedPanel: AdvancedPanel;
  environment: EnvId;
  environmentLabel: string;
  // investigations
  selectedInvestigation: string | null;
  investigationTab: InvestigationTab;
  selectedTableId: string | null;
  // compare
  compareSelection: string[]; // accessions
  // scenarios
  scenarioPillar: PillarId;
  // data & sources
  dataSourceTab: DataSourceTab;
  // facility screening (§7.1) — shared with the Fire Safety Assistant (§8)
  facility: FacilityState;
  // lab3d context (§11.1)
  selectedEquipment: string | null;
  // sessions + shelves (My Work)
  sessions: ResearchSession[];
  savedGaps: SavedGap[];
  savedItems: SavedItem[];
  // copilot
  copilotOpen: boolean;
  copilotContextNote: string | null;
  // command search
  commandOpen: boolean;
  // guided demo (audit §39) — session-only, not persisted
  demoOpen: boolean;
  // actions
  setView: (v: ViewId) => void;
  setDemoOpen: (open: boolean) => void;
  openAdvanced: (p: AdvancedPanel) => void;
  setEnvironment: (e: EnvId, label?: string) => void;
  openInvestigation: (acc: string, tab?: InvestigationTab) => void;
  setInvestigationTab: (t: InvestigationTab) => void;
  selectTable: (id: string | null) => void;
  toggleCompare: (acc: string) => void;
  clearCompare: () => void;
  setScenarioPillar: (p: PillarId) => void;
  setDataSourceTab: (t: DataSourceTab) => void;
  setFacility: (f: Partial<FacilityState>) => void;
  setFacilityCompartments: (cs: FacilityCompartment[]) => void;
  setSelectedEquipment: (id: string | null) => void;
  saveSession: (s: Omit<ResearchSession, "id" | "createdAt">) => void;
  deleteSession: (id: string) => void;
  toggleSavedGap: (gap: { gapId: string; topic: string; note?: string; externalHits?: number }) => void;
  removeSavedGap: (id: string) => void;
  toggleSavedItem: (item: Omit<SavedItem, "id" | "savedAt">) => void;
  removeSavedItem: (id: string) => void;
  setCopilotOpen: (open: boolean) => void;
  setCopilotContext: (note: string | null) => void;
  setCommandOpen: (open: boolean) => void;
}

export const VIEW_META: Record<ViewId, { label: string; group: string; hint: string }> = {
  mission: { label: "Mission", group: "Explore", hint: "Earth–Moon–Mars–ISS journey, evidence coverage, environment switcher" },
  investigations: { label: "Investigations", group: "Research", hint: "PSI investigation atlas with embedded EDA, equipment, media, equations, graph and gaps" },
  compare: { label: "Compare", group: "Research", hint: "Cross-investigation condition matrices with the comparability gate, graph slices, gap discovery" },
  scenarios: { label: "Scenarios", group: "Research", hint: "AI-powered fire-safety scenario assistant: Prevention → Detection → Prediction → Suppression" },
  lab3d: { label: "3D Lab", group: "Research", hint: "Source-labelled apparatus models, equipment catalogue, authentic NASA media" },
  "data-sources": { label: "Data & Sources", group: "Data", hint: "Ingestion pipeline, batch receipts, source registry, media catalogue, provenance" },
  "my-work": { label: "My Work", group: "Data", hint: "Saved sessions, research items, gap shelf, exportable evidence packets" },
  tools: { label: "Research Tools", group: "Data", hint: "Model Studio, variable dictionary, equation registry, diagnostics" },
};

/** Parse a location.hash deep link into a partial store update (M1). */
export function parseHash(h: string): { view?: ViewId; investigation?: string; tab?: string; pillar?: string } | null {
  if (!h || h.length < 2) return null;
  const parts = h.replace(/^#\/?/, "").split("/");
  const head = parts[0];
  const valid: ViewId[] = ["mission", "investigations", "compare", "scenarios", "lab3d", "data-sources", "my-work", "tools"];
  if (head === "investigation" && parts[1] && /^PSI-\d+$/i.test(parts[1])) {
    return { view: "investigations", investigation: parts[1].toUpperCase(), tab: parts[2] };
  }
  if (valid.includes(head as ViewId)) return { view: head as ViewId, tab: parts[1] };
  return null;
}

/** Build a hash deep link for the current context. */
export function viewHash(v: ViewId, sub?: string): string {
  return sub ? `#${v}/${sub}` : `#${v}`;
}

/** Shape of what we actually persist (zustand persist 4th generic). */
interface PersistedFlameState {
  environment: EnvId;
  environmentLabel: string;
  sessions: ResearchSession[];
  savedGaps: SavedGap[];
  savedItems: SavedItem[];
  compareSelection: string[];
  facility: {
    name: string;
    compartments: FacilityCompartment[];
    layoutImageName: string | null;
    layoutImageData: null;
  };
}

export const useAppStore = create<AppState>()(
  persist<AppState, [], [], PersistedFlameState>(
    (set, get) => ({
      view: "mission",
      advancedPanel: "model-studio",
      environment: "iss",
      environmentLabel: "ISS (CIR/ACME era)",
      selectedInvestigation: null,
      investigationTab: "overview",
      selectedTableId: null,
      compareSelection: [],
      scenarioPillar: "prevention",
      dataSourceTab: "ingestion",
      facility: {
        name: "Lunar Habitat Module (concept)",
        compartments: initialCompartments(),
        layoutImageName: null,
        layoutImageData: null,
      },
      selectedEquipment: null,
      sessions: [],
      savedGaps: [],
      savedItems: [],
      copilotOpen: false,
      copilotContextNote: null,
      commandOpen: false,
      demoOpen: false,

      setView: (v) => set({ view: v }),
      setDemoOpen: (open) => set({ demoOpen: open }),
      openAdvanced: (p) => set({ view: "tools", advancedPanel: p }),
      setEnvironment: (e, label) => set({ environment: e, environmentLabel: label ?? e }),
      openInvestigation: (acc, tab) =>
        set({ view: "investigations", selectedInvestigation: acc, investigationTab: tab ?? "overview" }),
      setInvestigationTab: (t) => set({ investigationTab: t }),
      selectTable: (id) => set({ selectedTableId: id }),
      toggleCompare: (acc) => {
        const cur = get().compareSelection;
        set({ compareSelection: cur.includes(acc) ? cur.filter((a) => a !== acc) : [...cur, acc].slice(-4), view: "compare" });
      },
      clearCompare: () => set({ compareSelection: [] }),
      setScenarioPillar: (p) => set({ scenarioPillar: p }),
      setDataSourceTab: (t) => set({ dataSourceTab: t }),
      setFacility: (f) => set({ facility: { ...get().facility, ...f } }),
      setFacilityCompartments: (cs) => set({ facility: { ...get().facility, compartments: cs } }),
      setSelectedEquipment: (id) => set({ selectedEquipment: id }),
      saveSession: (s) =>
        set({
          sessions: [
            { ...s, id: `s-${Date.now().toString(36)}`, createdAt: new Date().toISOString() },
            ...get().sessions,
          ].slice(0, 60),
        }),
      deleteSession: (id) => set({ sessions: get().sessions.filter((x) => x.id !== id) }),
      toggleSavedGap: (gap) => {
        const cur = get().savedGaps;
        const existing = cur.find((x) => x.gapId === gap.gapId);
        if (existing) {
          set({ savedGaps: cur.filter((x) => x.gapId !== gap.gapId) });
          return;
        }
        set({
          savedGaps: [
            { ...gap, id: `gap-${Date.now().toString(36)}`, savedAt: new Date().toISOString() },
            ...cur,
          ].slice(0, 80),
        });
      },
      removeSavedGap: (id) => set({ savedGaps: get().savedGaps.filter((x) => x.id !== id) }),
      toggleSavedItem: (item) => {
        const cur = get().savedItems;
        const key = `${item.kind}:${item.label}`;
        const existing = cur.find((x) => `${x.kind}:${x.label}` === key);
        if (existing) {
          set({ savedItems: cur.filter((x) => x.id !== existing.id) });
          // durable mirror (ADR-014): best-effort server delete; localStorage stays the offline copy
          void fetch(`/api/workspace/items?id=${encodeURIComponent(existing.id)}`, { method: "DELETE" }).catch(() => undefined);
          return;
        }
        const full: SavedItem = {
          ...item,
          id: `it-${Date.now().toString(36)}-${Math.floor(Math.random() * 1e4)}`,
          savedAt: new Date().toISOString(),
        };
        set({
          savedItems: [full, ...cur].slice(0, 200),
        });
        void fetch("/api/workspace/items", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(full),
        }).catch(() => undefined);
      },
      removeSavedItem: (id) => {
        set({ savedItems: get().savedItems.filter((x) => x.id !== id) });
        void fetch(`/api/workspace/items?id=${encodeURIComponent(id)}`, { method: "DELETE" }).catch(() => undefined);
      },
      setCopilotOpen: (open) => set({ copilotOpen: open }),
      setCopilotContext: (note) => set({ copilotContextNote: note }),
      setCommandOpen: (open) => set({ commandOpen: open }),
    }),
    {
      name: "flame-evidence-lab-v1",
      partialize: (s) => ({
        environment: s.environment,
        environmentLabel: s.environmentLabel,
        sessions: s.sessions,
        savedGaps: s.savedGaps,
        savedItems: s.savedItems,
        compareSelection: s.compareSelection,
        facility: {
          name: s.facility.name,
          compartments: s.facility.compartments,
          layoutImageName: s.facility.layoutImageName,
          layoutImageData: null, // image bytes stay in-memory only (localStorage budget)
        },
      }),
      migrate: (persisted: unknown) => {
        // v1→v2: legacy views renamed; savedItems added.
        const p = (persisted ?? {}) as Partial<PersistedFlameState>;
        return {
          environment: p.environment ?? "iss",
          environmentLabel: p.environmentLabel ?? "ISS (CIR/ACME era)",
          sessions: p.sessions ?? [],
          savedGaps: p.savedGaps ?? [],
          savedItems: p.savedItems ?? [],
          compareSelection: p.compareSelection ?? [],
          facility: {
            name: p.facility?.name ?? "Lunar Habitat Module (concept)",
            compartments: p.facility?.compartments ?? initialCompartments(),
            layoutImageName: p.facility?.layoutImageName ?? null,
            layoutImageData: null,
          },
        };
      },
      version: 2,
    },
  ),
);
