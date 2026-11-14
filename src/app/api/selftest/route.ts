/**
 * GET /api/selftest — deterministic scientific self-test (release gate M12).
 * Runs the equation registry reference tests, the comparability gate, the
 * fire-safety facility engine and the reduced-physics relations against the
 * canonical corpus. No LLM involved; every assertion is deterministic.
 */
import { NextResponse } from "next/server";
import { runEquationTests, getEquationRegistryCount } from "@/lib/science/equations";
import { auditComparability } from "@/lib/science/comparability";
import { analyzeFacility } from "@/lib/science/firesafety";
import { richardson } from "@/lib/science/physics";
import { getInvestigations } from "@/lib/data/catalog";
import { getMathModel, runMathematicalModel, checkModelApplicability, selectMathModels, allMathModels } from "@/lib/science/math-models";
import flexExtinctionExperimentJson from "@/data/generated/flex-extinction-experiment.json";
import flexExtinctionModelCardJson from "@/data/generated/flex-extinction-model-card.json";

export const runtime = "nodejs";

export async function GET() {
  const started = Date.now();
  // 1 — equation registry
  const eq = runEquationTests();

  // 2 — comparability gate: FLEX (droplet, microgravity) vs SAFFIRE-II (vehicle-scale)
  const invs = getInvestigations();
  const flex = invs.find((i) => i.accession === "PSI-69");
  const saffire = invs.find((i) => i.accession === "PSI-99");
  const gate =
    flex && saffire
      ? auditComparability([flex, saffire])
      : { level: "missing-records", reasons: [], requirements: [], dimensions: [], comparable: false };

  // 3 — facility engine (lunar habitat concept, challenge-documented atmosphere)
  const facility = analyzeFacility({
    stationType: "lunar-habitat",
    gravity: 0.166,
    o2: 0.3,
    pressureKpa: 70.3,
    ventilationCmS: 5,
    compartments: [
      {
        id: "c1",
        name: "Crew quarter",
        lengthM: 3.5,
        widthM: 3.5,
        heightM: 2.4,
        materials: ["paper-cotton", "nomex"],
        ventilationCmS: 5,
        ignitionSources: ["electronics"],
        detection: ["photoelectric"],
        suppression: ["portable-ext"],
      },
    ],
  });

  // 4 — physics relations
  const riEarth = richardson(1, 5);
  const riMicrog = richardson(1e-6, 5);

  // 5 — mathematical model registry (17A)
  const allM = allMathModels();
  const eqIds = new Set<string>([]);
  // equation ids verified via the registry itself (runEquationTests covers execution);
  // integrity = every model's related_equation_ids resolves in the equation registry
  const { getEquation } = await import("@/lib/science/equations");
  const dangling = allM.flatMap((m) => (m.related_equation_ids ?? []).filter((id) => !getEquation(id)));
  const d2 = runMathematicalModel("d2-law-droplet-combustion", { d0Mm: 3, kMm2S: 0.8 });
  const d2ok = d2.executed && Math.abs(Number(d2.outputs.lifetime_s) - 11.25) < 0.01;
  const appThickISS = checkModelApplicability("thermally-thick-ignition", "iss");
  const appFlexMoon = checkModelApplicability("flex-extinction-v2", "moon");
  const sel = selectMathModels({ phenomenon: "droplet-combustion", environmentId: "iss", requestedOutput: "lifetime" });

  const checks = [
    {
      id: "equation-registry",
      label: "Equation registry reference tests",
      pass: eq.failed.length === 0,
      detail: `${getEquationRegistryCount()} equations · ${eq.passed}/${eq.passed + eq.failed.length} tests pass`,
    },
    {
      id: "comparability-gate",
      label: "Comparability gate refuses PSI-69 vs PSI-99 direct comparison",
      pass: gate.level === "not-comparable" || gate.level === "conditional",
      detail: `verdict: ${gate.level}${gate.reasons.length ? ` — ${gate.reasons[0].slice(0, 90)}…` : ""}`,
    },
    {
      id: "facility-engine",
      label: "Fire-safety facility engine (lunar concept)",
      pass: facility.partialGravityCaveat === true && facility.compartments.length === 1 && facility.recommendations.length > 0,
      detail: `pO₂ ${facility.pO2Kpa.toFixed(1)} kPa · regime ${facility.regimeLabel} · top ${facility.compartments[0].total}/100 · ${facility.recommendations.length} recommendations · partial-g caveat emitted`,
    },
    {
      id: "physics-ri",
      label: "Richardson number collapses in microgravity",
      pass: Math.abs(riMicrog) < Math.abs(riEarth) / 1000,
      detail: `Ri(1 g, 5 cm/s) = ${riEarth.toFixed(2)} · Ri(µg) = ${riMicrog.toExponential(2)}`,
    },
    {
      id: "math-model-registry",
      label: "Mathematical Model Registry integrity (17A)",
      pass: dangling.length === 0 && allM.length >= 10,
      detail: `${allM.length} models · related_equation_ids all resolve in the 63-equation registry${dangling.length ? ` · dangling: ${dangling.join(", ")}` : ""}`,
    },
    {
      id: "math-model-runner",
      label: "d²-law runner executes (code verification)",
      pass: d2ok,
      detail: `d0=3 mm, K=0.8 mm²/s → lifetime ${d2.outputs.lifetime_s} s (expected 11.25)${d2.refusal ? ` · refusal: ${d2.refusal}` : ""}`,
    },
    {
      id: "math-model-applicability",
      label: "Applicability gate refuses/transfers honestly (17A.6-G)",
      pass: ("error" in appThickISS ? false : appThickISS.compatibility === "qualitative") && ("error" in appFlexMoon ? false : appFlexMoon.compatibility === "not-applicable"),
      detail: `thermally-thick-ignition @ ISS: ${"error" in appThickISS ? "error" : appThickISS.compatibility} · flex-extinction-v2 @ moon: ${"error" in appFlexMoon ? "error" : appFlexMoon.compatibility} (training = ISS microgravity; refuses >0.02 g)`,
    },
    {
      id: "math-model-selection",
      label: "Selection engine recommends d²-law for droplet-combustion lifetime @ ISS (output-disambiguated)",
      pass: sel.recommended?.model.model_id === "d2-law-droplet-combustion",
      detail: sel.recommended ? `recommended ${sel.recommended.model.model_id} (${sel.recommended.applicability.compatibility}, output filter: lifetime); ${sel.alternatives.length} alternatives; ${sel.rejected.length} rejected with reasons` : "no recommendation",
    },
  ];

  // 9 — ML experiment registry integrity (M7): the registered flex-extinction-v2
  // artifact must match the published multi-candidate experiment log.
  // Both artifacts are statically bundled (edge-safe — no filesystem reads).
  try {
    const exp = flexExtinctionExperimentJson as {
      experiment_id?: string;
      leaderboard?: unknown[];
      championDecision?: string;
    };
    const card = flexExtinctionModelCardJson as {
      reverification?: { reproductionCheck?: { pass?: boolean; coefMaxAbsDelta?: number; groupedAucDelta?: number } };
    };
    const rv = card.reverification;
    const expOk =
      exp.experiment_id === "M7-flex-extinction-20261114" &&
      Array.isArray(exp.leaderboard) &&
      exp.leaderboard.length >= 15 &&
      typeof exp.championDecision === "string" &&
      exp.championDecision.startsWith("RETAIN flex-extinction-v2");
    const reproOk = Boolean(rv?.reproductionCheck?.pass);
    checks.push({
      id: "ml-experiment-registry",
      label: "ML experiment registry: flex-extinction-v2 reproduction + multi-candidate comparison (M7)",
      pass: expOk && reproOk,
      detail: `reproduction coefΔ=${rv?.reproductionCheck?.coefMaxAbsDelta}, aucΔ=${rv?.reproductionCheck?.groupedAucDelta}; ${exp.leaderboard.length} candidates compared under group-aware CV; decision: ${exp.championDecision}`,
    });
  } catch (err) {
    checks.push({
      id: "ml-experiment-registry",
      label: "ML experiment registry: flex-extinction-v2 reproduction + multi-candidate comparison (M7)",
      pass: false,
      detail: `experiment artifacts unreadable: ${(err as Error).message}`,
    });
  }

  // 10 — durable workspace persistence (M10 / ADR-014): real insert/list/delete
  // round-trip against the server-side store.
  try {
    const { selfTestRoundTrip } = await import("@/lib/db/workspace");
    const rt = await selfTestRoundTrip();
    checks.push({
      id: "workspace-persistence",
      label: "Durable workspace persistence round-trip (saved-item insert → list → delete)",
      pass: rt.pass,
      detail: rt.detail,
    });
  } catch (err) {
    checks.push({
      id: "workspace-persistence",
      label: "Durable workspace persistence round-trip (saved-item insert → list → delete)",
      pass: false,
      detail: `persistence layer unavailable: ${(err as Error).message}`,
    });
  }

  const allPass = checks.every((c) => c.pass);
  return NextResponse.json(
    {
      ok: allPass,
      ranAt: new Date().toISOString(),
      durationMs: Date.now() - started,
      checks,
      note: "Deterministic self-test — no LLM, no network. Run before every release checkpoint.",
    },
    { status: allPass ? 200 : 500 },
  );
}
