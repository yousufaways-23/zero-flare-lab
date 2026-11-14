/**
 * ZERO FLARE — deterministic demo script (audit §39 / P1 #10).
 *
 * The 90-second judge journey as a reproducible walkthrough. Every scripted
 * CIR-1 exchange is composed AT RUNTIME from the same deterministic tools the
 * live agent uses (equation registry, comparability gate, model cards) —
 * no LLM, no network, no fabricated numbers. The reply is explicitly labelled
 * as a deterministic demo replay.
 */

import { getInvestigation, getCorpusTotals } from "@/lib/data/catalog";
import { runCalculation, getEquation } from "@/lib/science/equations";
import { auditComparability } from "@/lib/science/comparability";
import { getFlexCard } from "@/lib/science/models";

export interface DemoStep {
  id: string;
  title: string;
  /** What the judge should notice on this screen. */
  caption: string;
  /** Why it matters for Best Use of Science / Best Use of Data. */
  why: string;
  view: "mission" | "investigations" | "compare" | "scenarios" | "lab3d" | "data-sources" | "my-work";
  /** Optional store actions applied when the step becomes active. */
  action?: {
    investigation?: string;
    investigationTab?: "overview" | "data" | "equipment" | "media" | "equations" | "graph" | "gaps";
    equipment?: string;
    compare?: string[];
    copilotSeed?: boolean;
  };
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: "mission",
    title: "Mission — the research question",
    caption:
      "One question drives the platform: how does gravity change flame behaviour, and what does the NASA evidence actually support? Pick a research environment — Earth, ISS, Moon, Mars — each with its evidence status.",
    why: "Best Use of Science: the platform is framed as a bounded scientific question, not a data dump.",
    view: "mission",
  },
  {
    id: "investigation",
    title: "PSI-69 FLEX — a real experiment workspace",
    caption:
      "24 NASA PSI investigations, each with objectives, hardware, authentic NASA media, equipment, equations, a typed graph — and its documented limitations. The integrity case notes exactly what the recovered data can and cannot support.",
    why: "Best Use of Data: every record traces to the official PSI repository with a DOI.",
    view: "investigations",
    action: { investigation: "PSI-69", investigationTab: "overview" },
  },
  {
    id: "data",
    title: "Recovered data — real rows, real charts",
    caption:
      "Charts are computed live from the recovered tables — 2,009 rows, SHA-256-verified. Sample size, units and provenance strips travel with every chart. Duplicates and parse failures are counted, never hidden.",
    why: "Best Use of Data: data quality IS part of the scientific result.",
    view: "investigations",
    action: { investigation: "PSI-69", investigationTab: "data" },
  },
  {
    id: "copilot",
    title: "CIR-1 — deterministic research copilot",
    caption:
      "CIR-1 answers with numbers from its deterministic tools, never from a language model. The reply below is a labelled replay of the live tool path — the same equations, the same gate, no network needed.",
    why: "Best Use of Science: LLM output is orchestration; measurement stays deterministic.",
    view: "investigations",
    action: { investigation: "PSI-69", investigationTab: "overview", copilotSeed: true },
  },
  {
    id: "compare",
    title: "Compare — the comparability gate",
    caption:
      "Before any cross-study chart, the gate audits gravity regime, experimental scale, hardware and outcome data. Here it refuses a direct FLEX vs SAFFIRE-II comparison and states exactly why — scientific caution as a product feature.",
    why: "Best Use of Science: a comparison that is not defensible is not plotted.",
    view: "compare",
    action: { compare: ["PSI-69", "PSI-99"] },
  },
  {
    id: "gaps",
    title: "Research gaps — missing data is a result",
    caption:
      "The gap registry distinguishes absent / not-indexed / inaccessible / no-evidence-found. Partial gravity (0.02–0.65 g) has NO combustion outcome data in PSI — the field-wide gap, visible everywhere gravity is partial.",
    why: "Best Use of Science: limitations are credibility signals, not buried footnotes.",
    view: "investigations",
    action: { investigation: "PSI-69", investigationTab: "gaps" },
  },
  {
    id: "scenarios",
    title: "Scenarios — fire-safety decision support",
    caption:
      "A lunar habitat concept is screened by a deterministic engine with six visible drivers; every recommendation cites PSI evidence or is labelled heuristic. Partial-gravity inputs trigger the no-data caveat. Never a safety certificate.",
    why: "Best Use of Science: transparent decision support with explicit uncertainty.",
    view: "scenarios",
  },
  {
    id: "my-work",
    title: "My Work — the evidence packet",
    caption:
      "Save investigations, gaps, equations and media as you research — then export a provenance-carrying evidence packet: sources, transformations, model versions and standing limitations included.",
    why: "Best Use of Data: the audit trail survives the demo — reproducibly.",
    view: "my-work",
  },
  {
    id: "source-media",
    title: "Source figures & videos — the original documents",
    caption:
      "Every investigation's Media tab now shows figures extracted from the ORIGINAL NASA source documents (page + batch provenance) plus curated, oEmbed-verified research videos — each labelled by true source type, never presented as NASA footage when it is not.",
    why: "Best Use of Data: published figures stay cited source assets, distinct from generated charts.",
    view: "investigations",
    action: { investigation: "PSI-69", investigationTab: "media" },
  },
  {
    id: "coverage",
    title: "Evidence coverage map — what the corpus cannot answer",
    caption:
      "24 investigations × 8 dimensions with observed / reported / conditions-only statuses. A corpus gap is NOT proof of absence — the standing note points to CIR-1's external check before any field-wide claim.",
    why: "Best Use of Science: limitations rendered as first-class evidence.",
    view: "mission",
  },
  {
    id: "lab3d-cir",
    title: "3D Lab — inside the Combustion Integrated Rack",
    caption:
      "The CIR schematic now separates into eight labelled assemblies. Try CUTAWAY to make the outer skins translucent, EXPLODED to pull the chamber, diagnostics and gas modules apart, or the camera presets — and isolate any part you clicked.",
    why: "Engineering transparency: approximate reconstruction, honestly labelled — never claimed NASA CAD.",
    view: "lab3d",
    action: { equipment: "cir" },
  },
  {
    id: "mission-map",
    title: "Mission map — real NASA assets",
    caption:
      "The hero scene now runs the Version 2 mission map: Blue-Marble Earth with day/night shader, textured Moon and Mars, and the OFFICIAL NASA ISS model on orbit. Select a destination to fly there; the toolbar toggles bodies and resets the camera.",
    why: "Immersive orientation with verified assets and full camera freedom.",
    view: "mission",
  },
];

/** Compose the scripted CIR-1 reply deterministically from the live registries. */
export function composeDemoCopilotReply(): { user: string; assistant: string; tools: string[] } {
  const pO2 = getEquation("p-o2-kpa");
  const moon = runCalculation("p-o2-kpa", { o2: 0.3, psi: 10.2 });
  const earth = runCalculation("p-o2-kpa", { o2: 0.21, psi: 14.7 });
  const invs = [getInvestigation("PSI-69"), getInvestigation("PSI-99")].filter(Boolean) as NonNullable<ReturnType<typeof getInvestigation>>[];
  const gate = auditComparability(invs);
  const flex = getFlexCard();
  const totals = getCorpusTotals();

  const user = "Compare the Moon concept and Earth oxygen partial pressure — and can I directly compare FLEX with SAFFIRE-II?";
  const assistant = [
    `**Deterministic demo replay — same tools as the live copilot, no LLM, no network.**`,
    ``,
    `**Oxygen partial pressure** (registry equation \`${pO2?.id}\`, ${pO2?.source ?? "challenge-documented atmospheres"}):`,
    `- Moon concept: 30% O₂ at 10.2 psi → **${moon.value.toFixed(2)} kPa**`,
    `- Earth reference: 21% O₂ at 14.7 psi → **${earth.value.toFixed(2)} kPa**`,
    `Both sit near 21 kPa — but the *fractions* differ (30% vs 21%), and flammability tracks fraction and pressure together, not pO₂ alone. Moon concept atmospheres are **concept references**, not flight-proven standards.`,
    ``,
    `**FLEX (PSI-69) vs SAFFIRE-II (PSI-99):** the comparability gate returns **${gate.level}** — ${gate.reasons[0] ?? "conditions differ"} Scale and gravity differences mean spread/extinction results do not transfer; compare them as complementary evidence classes, not pooled measurements.`,
    ``,
    `**Model guard to remember:** ${flex.model_id} refuses gravity above 0.02 g — a lunar-gravity FLEX prediction is refused with the partial-gravity gap cited, never extrapolated. Corpus context: ${totals.tables} tables · ${totals.rows} rows, SHA-256-verified.`,
    ``,
    `Ask the live copilot anything — every number it states will come from these same tools.`,
  ].join("\n");

  return { user, assistant, tools: ["calculate_equation (p-o2-kpa ×2)", "compare_comparability_gate", "get_model_registry (FLEX card)", "get_corpus_totals"] };
}
