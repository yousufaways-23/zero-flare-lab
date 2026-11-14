/**
 * GET /api/scientific-qa-eval — §4 scientific QA evaluation harness.
 *
 * Runs a set of combustion-science questions with KNOWN evidence-based
 * answers against the platform's deterministic tool layer (retrieval,
 * equations, models, gate). Every check asserts that the tool layer surfaces
 * the correct evidence — the foundation the LLM composes answers from.
 * No LLM required: this evaluates the layer the honesty contract guarantees.
 */
import { NextResponse } from "next/server";
import { executeTool } from "@/lib/agent/tools";
import { runEquationTests } from "@/lib/science/equations";

export const runtime = "nodejs";

interface QACheck {
  id: string;
  question: string;
  tool: string;
  args: Record<string, unknown>;
  /** All markers must appear in the tool's summary+data JSON to pass. */
  expect: string[];
  /** When true, the expected outcome is a refusal (res.ok === false). */
  expectOk?: boolean;
  domain: string;
}

const CHECKS: QACheck[] = [
  {
    id: "q01-po2-moon",
    question: "What is the oxygen partial pressure in the Moon-base concept atmosphere (30% O₂ at 10.2 psi)?",
    tool: "calculate_equation",
    args: { equationId: "p-o2-kpa", inputs: { o2: 0.3, psi: 10.2 } },
    expect: ["21.09"],
    domain: "gas laws / habitation atmospheres",
  },
  {
    id: "q02-flex-domain",
    question: "Which investigation recovered droplet-extinction data with He/CO dilution?",
    tool: "search_evidence",
    args: { query: "FLEX droplet extinction helium carbon dioxide dilution", limit: 5 },
    expect: ["PSI-69"],
    domain: "investigation discovery",
  },
  {
    id: "q03-spice-rows",
    question: "How many rows does the recovered SPICE experimental table carry?",
    tool: "get_table_schema",
    args: { tableId: "PSI-107_SPICE" },
    expect: ["469"],
    domain: "corpus integrity",
  },
  {
    id: "q04-flex-refusal",
    question: "Can the FLEX model predict extinction at lunar gravity (0.166 g)?",
    tool: "run_flex_model",
    args: { xo2: 0.25, pressureMmHg: 527, d0Mm: 2.5, fuel: "Methanol", gravityG: 0.166 },
    expect: ["refus", "0.02"],
    expectOk: false,
    domain: "model applicability",
  },
  {
    id: "q05-gate-saffire",
    question: "Are FLEX (PSI-69) and SAFFIRE-II (PSI-99) directly comparable?",
    tool: "compare_comparability_gate",
    args: { accessions: ["PSI-69", "PSI-99"] },
    expect: ["not-comparable", "scale"],
    domain: "cross-study validity",
  },
  {
    id: "q06-d2-law",
    question: "Which registry equation describes droplet-diameter regression over time?",
    tool: "search_equations",
    args: { query: "droplet diameter squared law d-squared regression", limit: 5 },
    expect: ["d2-law"],
    domain: "combustion theory",
  },
  {
    id: "q07-cfig-baseline",
    question: "How does the CFI-G hot-ignition model perform against its baseline?",
    tool: "model_validation_metrics",
    args: { modelId: "cfig" },
    expect: ["0.682", "0.728"],
    domain: "model validation",
  },
  {
    id: "q08-acme-facility",
    question: "Which ISS facility hosted the ACME investigations?",
    tool: "search_knowledge_base",
    args: { query: "ACME hardware Combustion Integrated Rack chamber", limit: 5 },
    expect: ["Combustion"],
    domain: "hardware provenance",
  },
  {
    id: "q09-same-smoke",
    question: "What does the SAME investigation measure about spacecraft smoke?",
    tool: "search_knowledge_base",
    args: { query: "smoke particle size distribution spacecraft aerosol SAME", limit: 5 },
    expect: ["SAME"],
    domain: "detection science",
  },
  {
    id: "q10-corpus-totals",
    question: "How many experimental rows are in the recovered corpus (24 tables after the 2026-11-13 acquisition sweep)?",
    tool: "eda_statistics",
    args: {},
    expect: ["2085"],
    domain: "corpus integrity",
  },
  {
    id: "q11-po2-earth-moon",
    question: "Which equation computes habitat oxygen partial pressure from fraction and pressure?",
    tool: "search_equations",
    args: { query: "oxygen partial pressure habitat atmosphere", limit: 5 },
    expect: ["p-o2-kpa"],
    domain: "gas laws",
  },
  {
    id: "q12-equipment-cir",
    question: "Which equipment record covers the Combustion Integrated Rack with 3D model fidelity?",
    tool: "get_equipment",
    args: {},
    expect: ["Combustion Integrated Rack"],
    domain: "equipment catalogue",
  },
  {
    id: "q13-model-droplet",
    question: "Which mathematical model describes isolated droplet burning in microgravity?",
    tool: "search_mathematical_models",
    args: { query: "droplet combustion microgravity", limit: 5 },
    expect: ["d2-law-droplet-combustion"],
    domain: "mathematical-model discovery",
  },
  {
    id: "q14-model-applicability",
    question: "Can the thermally-thick ignition model be applied quantitatively at ISS microgravity?",
    tool: "check_model_applicability",
    args: { model_id: "thermally-thick-ignition", environment: "iss" },
    expect: ["qualitative"],
    domain: "model applicability",
  },
];

export async function GET() {
  const started = Date.now();
  const eq = runEquationTests();
  const results: {
    id: string;
    question: string;
    tool: string;
    domain: string;
    pass: boolean;
    detail: string;
  }[] = [];

  for (const c of CHECKS) {
    try {
      const res = await executeTool(c.tool, c.args);
      const hay = `${res.summary} ${JSON.stringify(res.data ?? "")}`.toLowerCase();
      const missing = c.expect.filter((m) => !hay.includes(m.toLowerCase()));
      const okMatches = c.expectOk === undefined ? res.ok : res.ok === false;
      results.push({
        id: c.id,
        question: c.question,
        tool: c.tool,
        domain: c.domain,
        pass: okMatches && missing.length === 0,
        detail: missing.length
          ? `missing markers: ${missing.join(", ")} — got: ${res.summary.slice(0, 120)}`
          : res.summary.slice(0, 160),
      });
    } catch (e) {
      results.push({
        id: c.id,
        question: c.question,
        tool: c.tool,
        domain: c.domain,
        pass: false,
        detail: `tool error: ${(e as Error).message}`,
      });
    }
  }

  // §8.8/§10.1 — measured RAG retrieval quality: canonical queries with known
  // relevant investigations; report hit@5 over the BM25 evidence leg.
  const RETRIEVAL_PROBES: { query: string; expectAny: string[] }[] = [
    { query: "droplet extinction oxygen diluent heptane methanol", expectAny: ["PSI-69"] },
    { query: "smoke particulate detection spacecraft alerts", expectAny: ["PSI-23", "PSI-102"] },
    { query: "flame spread solid fuel surface flow duct", expectAny: ["PSI-10", "PSI-25", "PSI-39"] },
    { query: "cool flame gaseous ignition droplet", expectAny: ["PSI-68", "PSI-39"] },
    { query: "material flammability map spacecraft materials", expectAny: ["PSI-117", "PSI-106", "PSI-20"] },
  ];
  const { searchEvidence } = await import("@/lib/data/catalog");
  const retrieval = RETRIEVAL_PROBES.map((p) => {
    const hits = searchEvidence(p.query, 5);
    const hit = hits.some((h) => p.expectAny.some((acc) => `${h.id} ${h.title}`.toUpperCase().includes(acc)));
    return { query: p.query, expectAny: p.expectAny, hitAt5: hit, topIds: hits.slice(0, 3).map((h) => h.id) };
  });
  const hitCount = retrieval.filter((r) => r.hitAt5).length;
  results.push({
    id: "q15-rag-hit-at-5",
    question: `Retrieval quality: canonical evidence queries return the relevant investigation in the top 5 (measured hit@5 = ${hitCount}/${retrieval.length})`,
    tool: "search_evidence",
    domain: "retrieval quality",
    pass: hitCount / retrieval.length >= 0.8,
    detail: retrieval.map((r) => `${r.hitAt5 ? "hit" : "miss"} [${r.topIds.join(", ") || "no hits"}] ← "${r.query}"`).join(" · "),
  });

  // counted AFTER q15 is appended so the summary and HTTP status see all checks
  const passed = results.filter((r) => r.pass).length;

  const allOk = passed === results.length && eq.failed.length === 0;
  return NextResponse.json(
    {
      ok: allOk,
      ranAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      summary: {
        checks: results.length,
        passed,
        failed: results.length - passed,
        domainsCovered: [...new Set(CHECKS.map((c) => c.domain))],
        ragHitAt5: `${hitCount}/${retrieval.length}`,
      },
      equationRegistry: { count: eq.passed + eq.failed.length, testsPassed: eq.passed, testsFailed: eq.failed.length },
      results,
      retrievalQuality: retrieval,
      note:
        "Evaluates the deterministic tool layer (retrieval, equations, models, gate) against questions with evidence-based answers. The LLM synthesis layer composes from these tools; its language quality is provider-dependent and is not evaluated here.",
    },
    { status: allOk ? 200 : 500 },
  );
}
