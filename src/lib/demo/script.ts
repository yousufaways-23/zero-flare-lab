/**
 * ZERO FLARE — deterministic guided-tour script (Phase 5 W3 rewrite).
 *
 * Nine stops in navigation order: Mission → Investigations → Compare →
 * Scenarios → 3D Lab → Data & Sources → My Work → Research Tools → CIR-1.
 * Every scripted CIR-1 exchange is composed AT RUNTIME from the same
 * deterministic tools the live agent uses (equation registry, comparability
 * gate, model cards) — no LLM, no network, no fabricated numbers. The reply
 * is explicitly labelled as a deterministic demo replay.
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
  /** Stable data-tour anchor for the spotlight (rendered on the target view). */
  target: string;
  view: "mission" | "investigations" | "compare" | "scenarios" | "lab3d" | "data-sources" | "my-work" | "tools";
  /** Optional store actions applied when the step becomes active. */
  action?: {
    investigation?: string;
    investigationTab?: "overview" | "data" | "equipment" | "media" | "equations" | "graph" | "gaps";
    equipment?: string;
    compare?: string[];
    copilotSeed?: boolean;
    copilotOpen?: boolean;
  };
}

export const DEMO_STEPS: DemoStep[] = [
  {
    id: "mission",
    title: "Mission — the question behind the platform",
    caption:
      "Everything here serves one bounded question: how does gravity change flame behaviour, and what does the NASA evidence actually support? Pick a research environment — Earth, ISS, Moon, Mars — and its evidence status follows you through every calculator.",
    why: "Best Use of Science: a bounded scientific question, not a data dump.",
    target: "tour-mission",
    view: "mission",
  },
  {
    id: "investigations",
    title: "Investigations — 25 evidence workspaces, one real example",
    caption:
      "We opened PSI-69 (FLEX droplet combustion). Overview shows objectives, hardware and authentic NASA media; Data holds the recovered table (SHA-256 on screen); Charts are computed live with units and missingness stated; Media shows figures extracted from the original papers; Gaps lists what the data cannot answer.",
    why: "Best Use of Data: every record traces to the official PSI repository with a DOI.",
    target: "tour-investigations",
    view: "investigations",
    action: { investigation: "PSI-69", investigationTab: "overview" },
  },
  {
    id: "compare",
    title: "Compare — the gate decides before any chart does",
    caption:
      "FLEX (droplet, microgravity) and SAFFIRE-II (bed, spacecraft) are both real — and the gate still refuses to pool them, listing scale and gravity reasons. Derived overlays appear only when the gate passes; original source figures sit beside them with page attribution.",
    why: "Best Use of Science: a comparison that is not defensible is not plotted.",
    target: "tour-compare",
    view: "compare",
    action: { compare: ["PSI-69", "PSI-99"] },
  },
  {
    id: "scenarios",
    title: "Scenarios — decision support with its feet on the data",
    caption:
      "Screen a lunar-habitat concept: a deterministic engine weighs six visible drivers, every recommendation cites PSI evidence or is labelled heuristic, and partial-gravity inputs trigger the no-data caveat. It is decision support — never a safety certificate.",
    why: "Best Use of Science: transparent reasoning with explicit uncertainty.",
    target: "tour-scenarios",
    view: "scenarios",
  },
  {
    id: "lab3d",
    title: "3D Lab — inside the Combustion Integrated Rack",
    caption:
      "The CIR schematic separates into eight labelled assemblies. CUTAWAY makes the skins translucent, EXPLODED pulls chamber, diagnostics and gas modules apart, and camera presets fly you around any part you click.",
    why: "Engineering transparency: an approximate reconstruction, honestly labelled — never claimed as NASA CAD.",
    target: "tour-lab3d",
    view: "lab3d",
    action: { equipment: "cir" },
  },
  {
    id: "data-sources",
    title: "Data & Sources — follow any number home",
    caption:
      "The acquisition ledger, batch receipts and per-file SHA-256 hashes live here, next to the downloadable /corpus mirror — the exact files the platform computes from. The 2,393 historical media binaries that were never recovered stay visible as unrecovered, not silently dropped.",
    why: "Best Use of Data: provenance you can audit, including what is missing.",
    target: "tour-data-sources",
    view: "data-sources",
  },
  {
    id: "my-work",
    title: "My Work — the evidence packet",
    caption:
      "Save investigations, gaps, equations and media as you research, then export a provenance-carrying packet: sources, transformations and standing limitations included. On the deployed edge this persists in the Worker's D1 database.",
    why: "Best Use of Data: the audit trail survives the session — reproducibly.",
    target: "tour-my-work",
    view: "my-work",
  },
  {
    id: "tools",
    title: "Research Tools — the registries behind every claim",
    caption:
      "63 verified equations with reference tests, a variable dictionary with units and fill rates, model cards that keep negative results visible, the AI evaluation metrics, and the recovery ledger with every discrepancy.",
    why: "Best Use of Science: the machinery is inspectable, not a black box.",
    target: "tour-tools",
    view: "tools",
  },
  {
    id: "cir1",
    title: "CIR-1 — answers with receipts",
    caption:
      "The copilot composes answers from its deterministic tools — the reply below is a labelled replay of the live tool path (same equations, same gate), not model improvisation. Ask it anything live: every number it states comes from these registries.",
    why: "Best Use of Science: LLM output is orchestration; measurement stays deterministic.",
    target: "tour-cir1",
    view: "investigations",
    action: { investigation: "PSI-69", investigationTab: "overview", copilotSeed: true, copilotOpen: true },
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
