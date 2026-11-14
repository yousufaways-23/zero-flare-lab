"use client";

// FLAME EVIDENCE LAB — Facility Screening (brief §7.1, §7.2, §7.4, §7.5)
// Scenario configuration: facility + compartments + materials + ignition sources,
// then a DETERMINISTIC advisory risk screening computed with transparent
// arithmetic over documented factors. Every material entry cites the NASA PSI
// investigations that tested it. This is NOT a fire model, NOT CFD, and NOT
// certified guidance — the score is an explicit, inspectable screening index.

import { useMemo, useState } from "react";
import { useAppStore, type FacilityCompartment } from "@/lib/app-store";
import type { AtmosphereEnv } from "@/lib/data/catalog";
import {
  MATERIALS, VENTILATION, screenCompartment, scoreColor,
  type MaterialEvidence,
} from "@/lib/science/screening";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Building2, Flame, Plus, Trash2, Info, Thermometer, RadioTower, Radar, ShieldAlert, ChevronDown, ChevronRight,
  Image as ImageIcon, Download, Upload, Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Material evidence table, ventilation options and the deterministic screening
// arithmetic live in the shared module `@/lib/science/screening.ts` so the
// Fire Safety Assistant computes identical scores from identical inputs.
// ---------------------------------------------------------------------------

let seq = 0;
function newCompartment(name: string): FacilityCompartment {
  seq += 1;
  return {
    id: `c-${Date.now().toString(36)}-${seq}`,
    name,
    areaM2: 12,
    heightM: 2.4,
    materials: ["other"],
    ignitionSources: 1,
    ventilation: "forced",
    detection: "local",
  };
}

// ---------------------------------------------------------------------------
// Deterministic screening lives in `@/lib/science/screening.ts` (shared with
// the Fire Safety Assistant). Weights are EXPLICIT policy choices displayed
// in the breakdown; they are not calibrated to incident data.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
export function FacilityScreening({ env, onAskAssistant }: { env: AtmosphereEnv; onAskAssistant?: (prompt: string) => void }) {
  const saveSession = useAppStore((s) => s.saveSession);
  const environment = useAppStore((s) => s.environment);
  const facility = useAppStore((s) => s.facility);
  const setFacility = useAppStore((s) => s.setFacility);
  const setCompartments = useAppStore((s) => s.setFacilityCompartments);
  const [open, setOpen] = useState(true);
  const facilityName = facility.name;
  const compartments = facility.compartments;
  const [selected, setSelected] = useState<string | null>(null);
  const [layoutError, setLayoutError] = useState<string | null>(null);

  const results = useMemo(
    () => compartments.map((c) => ({ c, ...screenCompartment(c, env) })).sort((a, b) => b.score - a.score),
    [compartments, env],
  );
  const selectedResult = results.find((r) => r.c.id === selected) ?? null;

  const update = (id: string, patch: Partial<FacilityCompartment>) =>
    setCompartments(compartments.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  const toggleMaterial = (id: string, matId: string) =>
    setCompartments(
      compartments.map((c) =>
        c.id === id
          ? { ...c, materials: c.materials.includes(matId) ? c.materials.filter((m) => m !== matId) : [...c.materials, matId] }
          : c,
      ),
    );

  // §7.1 — layout reference upload (honest: displayed as a visual reference,
  // NOT parsed into parameters; the assistant sees only the filename).
  const onLayoutFile = (file: File | null) => {
    setLayoutError(null);
    if (!file) return;
    if (!/^image\/(png|jpeg|webp|gif)$/.test(file.type)) {
      setLayoutError("Layout reference must be an image (PNG/JPEG/WebP/GIF). CAD/vector parsing is not implemented — the image is attached as a visual reference only.");
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      setLayoutError("Layout image larger than 4 MB — please attach a smaller reference image.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setFacility({ layoutImageName: file.name, layoutImageData: String(reader.result) });
    reader.onerror = () => setLayoutError("Could not read the selected file.");
    reader.readAsDataURL(file);
  };

  // structured compartment exchange (real import/export — no parsing claims)
  const exportFacilityJson = () => {
    const payload = { facility: facilityName, environment: env.id, compartments };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `facility-screening-${env.id}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const importFacilityJson = (file: File | null) => {
    setLayoutError(null);
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as { facility?: string; compartments?: FacilityCompartment[] };
        const valid = (parsed.compartments ?? []).filter(
          (c) => c && typeof c.name === "string" && Array.isArray(c.materials),
        );
        if (!valid.length) throw new Error("no valid compartments in file");
        setCompartments(valid.map((c, i) => ({ ...c, id: c.id || `c-import-${i}` })));
        if (typeof parsed.facility === "string" && parsed.facility) setFacility({ name: parsed.facility });
      } catch (e) {
        setLayoutError(`Import failed: ${(e as Error).message}. Expected the JSON exported by this panel.`);
      }
    };
    reader.onerror = () => setLayoutError("Could not read the selected file.");
    reader.readAsText(file);
  };

  const exportSession = () => {
    const lines = results.map((r, i) => `${i + 1}. ${r.c.name}: screening ${r.score}/100 (${scoreColor(r.score).label}) — volume ${r.volume.toFixed(0)} m³, materials [${r.c.materials.join(", ")}], ${r.c.ignitionSources} ignition source(s), ${r.c.ventilation} ventilation, ${r.c.detection} detection`);
    saveSession({
      title: `Facility screening — ${facilityName}`,
      notes: `Environment: ${env.label} (pO2 ${env.pO2Kpa} kPa, O₂ ${(env.o2Fraction * 100).toFixed(0)}%, ${env.gravityG} g).\nAdvisory screening ranking (deterministic arithmetic, not a fire model):\n${lines.join("\n")}`,
      provenance: "Deterministic screening over the material-evidence table (BASS/BASS-II/SAFFIRE-II/FLEX/CFI-G/SAME recovered PSI records) + atmospheres.json reference values",
      environment: environment as never,
    });
  };

  return (
    <section aria-label="Facility screening" className="glass-panel rounded-xl">
      <button className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 p-4 text-left" onClick={() => setOpen(!open)} aria-expanded={open}>
        {open ? <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />}
        <Building2 className="h-4 w-4 shrink-0 text-primary" />
        <span className="min-w-0 flex-1 basis-52 text-sm font-semibold">Facility screening — define compartments, rank risk, place detection</span>
        <Badge variant="outline" className="ml-auto border-border/60 text-[10px] text-muted-foreground">
          advisory · deterministic arithmetic · not a fire model
        </Badge>
      </button>

      {open && (
        <div className="border-t border-border/50 p-4">
          {/* honesty banner */}
          <div className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 text-[11px] leading-relaxed text-foreground/80">
            <ShieldAlert className="mr-1 inline h-3.5 w-3.5 text-amber-400" aria-hidden />
            <strong>What this is:</strong> a transparent screening index over documented factors — atmosphere reference values, material
            evidence classes from recovered NASA PSI tests, and your configuration. <strong>What this is not:</strong> a validated fire
            growth/CFD model or certified spacecraft safety analysis. Screening weights are explicit policy choices shown in each
            breakdown. All results are research decision support only.
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            {/* ---------------- configuration ---------------- */}
            <div className="min-w-0">
              <div className="mb-3 flex items-center gap-2">
                <Input
                  value={facilityName}
                  onChange={(e) => setFacility({ name: e.target.value })}
                  className="h-8 max-w-[280px] bg-background/60 text-sm"
                  aria-label="Facility name"
                />
                <Button size="sm" variant="outline" className="h-8 gap-1 border-border/60" onClick={() => setCompartments([...compartments, newCompartment(`Compartment ${compartments.length + 1}`)])}>
                  <Plus className="h-3.5 w-3.5" /> Add compartment
                </Button>
              </div>

              <div className="space-y-2.5">
                {compartments.map((c) => {
                  const res = results.find((r) => r.c.id === c.id)!;
                  const col = scoreColor(res.score);
                  const isOpen = selected === c.id;
                  return (
                    <div key={c.id} className={cn("rounded-lg border p-3 transition-colors", isOpen ? "border-primary/50 bg-accent/20" : "border-border/60 bg-card/30")}>
                      <div className="flex flex-wrap items-center gap-2">
                        <button className="min-w-0 flex-1 text-left" onClick={() => setSelected(isOpen ? null : c.id)} aria-expanded={isOpen}>
                          <span className="text-sm font-medium">{c.name || "Unnamed compartment"}</span>
                          <span className="ml-2 font-mono text-[10px] text-muted-foreground">{res.volume.toFixed(0)} m³ · {c.materials.length} material(s) · {c.ignitionSources} ign. source(s)</span>
                        </button>
                        <span
                          className="rounded-full px-2 py-0.5 font-mono text-[11px] font-semibold"
                          style={{ background: col.bg2, color: col.text }}
                          title={`screening score ${res.score}/100 — ${col.label}`}
                        >
                          {res.score} · {col.label}
                        </span>
                        <button
                          className="rounded p-1 text-muted-foreground hover:text-red-400"
                          onClick={() => setCompartments(compartments.filter((x) => x.id !== c.id))}
                          aria-label={`Remove ${c.name}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      {isOpen && (
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          <label className="block text-[11px]">
                            <span className="text-muted-foreground">Name</span>
                            <Input value={c.name} onChange={(e) => update(c.id, { name: e.target.value })} className="mt-1 h-8 bg-background/60" />
                          </label>
                          <div className="grid grid-cols-2 gap-2">
                            <label className="block text-[11px]">
                              <span className="text-muted-foreground">Floor area (m²)</span>
                              <Input type="number" min={1} max={500} value={c.areaM2} onChange={(e) => update(c.id, { areaM2: Math.max(1, Number(e.target.value) || 0) })} className="mt-1 h-8 bg-background/60" />
                            </label>
                            <label className="block text-[11px]">
                              <span className="text-muted-foreground">Height (m)</span>
                              <Input type="number" min={1} max={10} step={0.1} value={c.heightM} onChange={(e) => update(c.id, { heightM: Math.max(1, Number(e.target.value) || 0) })} className="mt-1 h-8 bg-background/60" />
                            </label>
                          </div>
                          <label className="block text-[11px]">
                            <span className="text-muted-foreground">Ignition sources (count)</span>
                            <Input type="number" min={0} max={20} value={c.ignitionSources} onChange={(e) => update(c.id, { ignitionSources: Math.max(0, Math.round(Number(e.target.value) || 0)) })} className="mt-1 h-8 bg-background/60" />
                          </label>
                          <label className="block text-[11px]">
                            <span className="text-muted-foreground">Ventilation</span>
                            <Select value={c.ventilation} onValueChange={(v) => update(c.id, { ventilation: v as FacilityCompartment["ventilation"] })}>
                              <SelectTrigger className="mt-1 h-8 bg-background/60"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {VENTILATION.map((v) => <SelectItem key={v.id} value={v.id}>{v.label}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </label>
                          <label className="block text-[11px]">
                            <span className="text-muted-foreground">Fire detection</span>
                            <Select value={c.detection} onValueChange={(v) => update(c.id, { detection: v as FacilityCompartment["detection"] })}>
                              <SelectTrigger className="mt-1 h-8 bg-background/60"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="none">None in this compartment</SelectItem>
                                <SelectItem value="local">Local detector(s) present</SelectItem>
                                <SelectItem value="integrated">Integrated with vehicle safety system</SelectItem>
                              </SelectContent>
                            </Select>
                          </label>
                          <div className="text-[11px] sm:col-span-2">
                            <span className="text-muted-foreground">Materials present (each cites its NASA PSI test evidence):</span>
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                              {MATERIALS.map((m) => (
                                <button
                                  key={m.id}
                                  onClick={() => toggleMaterial(c.id, m.id)}
                                  title={m.evidence}
                                  className={cn(
                                    "rounded-full border px-2 py-0.5 text-[10.5px] transition-colors",
                                    c.materials.includes(m.id)
                                      ? m.class === "no-evidence"
                                        ? "border-amber-500/60 bg-amber-500/15 text-amber-300"
                                        : "border-primary/60 bg-primary/15 text-primary"
                                      : "border-border/50 text-muted-foreground hover:border-primary/40",
                                  )}
                                >
                                  {m.label}
                                </button>
                              ))}
                            </div>
                            {isOpen && (
                              <ul className="mt-2 space-y-1">
                                {c.materials.map((mid) => {
                                  const m = MATERIALS.find((x) => x.id === mid);
                                  if (!m) return null;
                                  return (
                                    <li key={mid} className="flex items-start gap-1.5 text-[10px] leading-snug text-muted-foreground">
                                      <Flame className={cn("mt-0.5 h-3 w-3 shrink-0", m.class === "no-evidence" ? "text-amber-400" : "text-primary/70")} aria-hidden />
                                      <span>{m.evidence}</span>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" className="gap-1.5" onClick={exportSession}>
                  Save screening to session shelf
                </Button>
                {onAskAssistant && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1.5 border-primary/50 text-primary hover:border-primary"
                    onClick={() =>
                      onAskAssistant(
                        `Analyze my facility screening for "${facilityName}" in the ${env.label} environment. Rank the compartments, review the material evidence, and give prevention + detection + suppression recommendations with citations.`,
                      )
                    }
                  >
                    <Sparkles className="h-3.5 w-3.5" /> Ask the Fire Safety Assistant
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="h-8 gap-1 px-2 text-[11px] text-muted-foreground" onClick={exportFacilityJson}>
                  <Download className="h-3 w-3" /> JSON
                </Button>
                <label className="inline-flex h-8 cursor-pointer items-center gap-1 rounded-md px-2 text-[11px] text-muted-foreground hover:text-foreground">
                  <Upload className="h-3 w-3" /> Import JSON
                  <input
                    type="file"
                    accept="application/json,.json"
                    className="sr-only"
                    onChange={(e) => {
                      importFacilityJson(e.target.files?.[0] ?? null);
                      e.currentTarget.value = "";
                    }}
                    aria-label="Import facility compartments from JSON"
                  />
                </label>
              </div>

              {/* §7.1 — layout reference (honest: visual reference only) */}
              <div className="mt-3 rounded-lg border border-border/60 bg-card/30 p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <ImageIcon className="h-3.5 w-3.5 text-[#5799d1]" aria-hidden />
                  <span className="text-[11px] font-medium">Facility layout reference (optional)</span>
                  <label className="ml-auto inline-flex h-7 cursor-pointer items-center gap-1 rounded-md border border-border/60 px-2 text-[10.5px] text-muted-foreground hover:border-primary/50 hover:text-foreground">
                    <Upload className="h-3 w-3" /> {facility.layoutImageName ? "Replace image" : "Attach image"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/gif"
                      className="sr-only"
                      onChange={(e) => {
                        onLayoutFile(e.target.files?.[0] ?? null);
                        e.currentTarget.value = "";
                      }}
                      aria-label="Attach a facility layout reference image"
                    />
                  </label>
                  {facility.layoutImageName && (
                    <button
                      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[10.5px] text-muted-foreground hover:text-red-400"
                      onClick={() => setFacility({ layoutImageName: null, layoutImageData: null })}
                    >
                      <Trash2 className="h-3 w-3" /> Remove
                    </button>
                  )}
                </div>
                {layoutError && <p className="mt-2 text-[10.5px] text-amber-400">{layoutError}</p>}
                {facility.layoutImageData ? (
                  <a href={facility.layoutImageData} target="_blank" rel="noopener noreferrer" className="mt-2 block overflow-hidden rounded-md border border-border/60">
                    <img
                      src={facility.layoutImageData}
                      alt={`Facility layout reference: ${facility.layoutImageName ?? "uploaded image"}`}
                      className="max-h-40 w-full object-contain bg-black/30"
                    />
                  </a>
                ) : (
                  <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                    Attach a drawing/photo of the facility layout as a visual reference for your screening review. The image is
                    <strong> not parsed</strong> — no automatic extraction is claimed; parameters are entered above. (Click the image to enlarge.)
                  </p>
                )}
              </div>
            </div>

            {/* ---------------- results ---------------- */}
            <div className="min-w-0">
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Thermometer className="h-3.5 w-3.5" /> Risk ranking + heat map (schematic)
              </h4>
              {/* heat map strip — the buttons ARE the interactive heat-map cells (no role=img wrapper: interactive content cannot nest inside a presentational role) */}
              <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3" aria-label="Compartment screening heat map — select a compartment to inspect its breakdown">
                {results.map((r) => {
                  const col = scoreColor(r.score);
                  return (
                    <button
                      key={r.c.id}
                      onClick={() => setSelected(r.c.id)}
                      className="rounded-lg p-3 text-left transition-transform hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-ring"
                      style={{ background: `linear-gradient(135deg, ${col.bg}, ${col.bg2})` }}
                      title={`Screening ${r.score}/100 — ${col.label}. Schematic indicator, not a CFD result. Select to inspect the driver breakdown.`}
                    >
                      <div className="truncate text-[11px] font-semibold text-white/95">{r.c.name || "Unnamed"}</div>
                      <div className="font-mono text-xl font-bold" style={{ color: col.text }}>{r.score}</div>
                      <div className="text-[10px] uppercase tracking-wide text-white/70">{col.label}</div>
                    </button>
                  );
                })}
              </div>
              <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">
                Schematic risk indicator from the screening arithmetic below — grid position is not a spatial simulation.
                Atmosphere: {env.label} · pO₂ {env.pO2Kpa} kPa · O₂ {(env.o2Fraction * 100).toFixed(0)}% · {env.gravityG} g.
              </p>

              {/* ranking table */}
              <div className="mt-3 overflow-hidden rounded-lg border border-border/60">
                <table className="w-full text-left text-[11px]">
                  <thead className="bg-accent/40 text-[10px] uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-2.5 py-1.5">#</th>
                      <th className="px-2.5 py-1.5">Compartment</th>
                      <th className="px-2.5 py-1.5 text-right">Score</th>
                      <th className="px-2.5 py-1.5">Class</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((r, i) => {
                      const col = scoreColor(r.score);
                      return (
                        <tr key={r.c.id} className="border-t border-border/40">
                          <td className="px-2.5 py-1.5 font-mono text-muted-foreground">{i + 1}</td>
                          <td className="px-2.5 py-1.5">{r.c.name || "Unnamed"}</td>
                          <td className="px-2.5 py-1.5 text-right font-mono font-semibold" style={{ color: col.bg2 === "#16a34a" ? "#4ade80" : col.bg2 === "#5799d1" ? "#8fbfe8" : col.text }}>
                            {r.score}
                          </td>
                          <td className="px-2.5 py-1.5 text-muted-foreground">{col.label}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* selected breakdown */}
              {selectedResult && (
                <div className="mt-3 rounded-lg border border-border/60 bg-card/40 p-3">
                  <p className="text-xs font-semibold">Arithmetic breakdown — {selectedResult.c.name || "unnamed"} (every factor visible, nothing hidden)</p>
                  <ul className="mt-2 space-y-1">
                    {selectedResult.breakdown.map((b) => (
                      <li key={b.factor} className="flex items-baseline justify-between gap-3 text-[11px]">
                        <span className="min-w-0 text-muted-foreground">{b.factor}</span>
                        <span className={cn("shrink-0 font-mono", b.points < 0 ? "text-emerald-400" : "text-foreground/90")}>
                          {b.points > 0 ? "+" : ""}{b.points}
                        </span>
                      </li>
                    ))}
                    <li className="flex items-baseline justify-between gap-3 border-t border-border/50 pt-1 text-[11px] font-semibold">
                      <span>Screening score (0–100)</span>
                      <span className="font-mono">{selectedResult.score}</span>
                    </li>
                  </ul>
                  {selectedResult.noEvidenceMaterials.length > 0 && (
                    <p className="mt-2 rounded border border-amber-500/30 bg-amber-500/5 p-2 text-[10px] leading-snug text-amber-300">
                      Evidence gap: {selectedResult.noEvidenceMaterials.map((m) => m.label).join(", ")} — no microgravity test evidence in
                      the recovered corpus. This is shown as a gap, never assumed safe.
                    </p>
                  )}
                </div>
              )}

              <Separator className="my-3 bg-border/60" />

              {/* detection placement */}
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Radar className="h-3.5 w-3.5" /> Detection placement guidance (evidence-linked)
              </h4>
              <ul className="mt-2 space-y-2 text-[11px] leading-relaxed text-foreground/85">
                <li className="flex gap-1.5">
                  <RadioTower className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5799d1]" aria-hidden />
                  <span>
                    In microgravity there is <strong>no buoyant ceiling plume</strong> — smoke from a smoldering source spreads radially
                    and follows ventilation flow. Ceiling-only placement inherited from 1-g practice is not supported by the evidence.
                    <span className="text-muted-foreground"> [SAME (PSI-102), SAME-R (PSI-101), DAFT (PSI-47) smoke-aerosol flight studies]</span>
                  </span>
                </li>
                <li className="flex gap-1.5">
                  <RadioTower className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#5799d1]" aria-hidden />
                  <span>
                    Prefer detector placement in <strong>return-air / ventilation intake paths</strong> for every forced-ventilation
                    compartment, plus point coverage near documented ignition sources.
                    <span className="text-muted-foreground"> [derived from the SAME transport finding, not a certified placement rule]</span>
                  </span>
                </li>
                <li className="flex gap-1.5">
                  <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary/70" aria-hidden />
                  <span>
                    Overheated insulation (Kapton/Teflon/silicone) is a documented smoke source class — compartments containing wiring
                    with ≥2 ignition sources justify the highest detection attention even without flaming combustion.
                    <span className="text-muted-foreground"> [SAME/SAME-R aerosol-generation materials]</span>
                  </span>
                </li>
              </ul>

              <Separator className="my-3 bg-border/60" />

              {/* suppression honesty note */}
              <h4 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <Flame className="h-3.5 w-3.5" /> Suppression context (evidence-linked, not ranked)
              </h4>
              <ul className="mt-2 space-y-1.5 text-[11px] leading-relaxed text-foreground/85">
                <li>
                  • FLEX documented <strong>radiatively-driven extinction</strong> of small droplet flames without any suppressant
                  (extinction share ≈ 0.687 in the recovered PSI-69 table) — physics that any suppressant strategy must be compared
                  against. [PSI-69 FLEX, FLEX-2 PSI-68 cool-flame transitions]
                </li>
                <li>
                  • No suppressant agent is ranked or recommended by this platform: the recovered corpus does not contain a
                  comparative suppressant-effectiveness dataset for spacecraft applications. Suppression choices require qualified
                  engineering review. [honest limitation]
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
