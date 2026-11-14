# SCIENTIFIC MATHEMATICAL MODELING AUDIT — ZERO FLARE (17A.18)

**Date:** 2026-11-13 · **Registry version:** 1.0 · **Registry file:** `src/data/generated/mathematical_models.json` (builder: `scripts/flame/build-math-models.mjs`) · **Science layer:** `src/lib/science/math-models.ts`

---

## 1. Registry statistics (17A.18 required counts)

| Metric | Count |
|---|---|
| Identified mathematical models | **11** |
| Models extracted from papers / literature | 3 (cool-flame two-stage, FGM flame spread, ISS fine-water-mist) |
| Source-verified models | 11/11 (every model carries source references; 3 carry live knowledge-index citations) |
| Models linked to the 63-equation registry | **8** (34 related_equation_ids, all resolving — selftest check `math-model-registry`) |
| Implemented models (executable) | **8** |
| Code-verified models | **8** (equation-registry reference tests + /api/selftest runner check) |
| Experimentally validated models | **1** (flex-extinction-v2 — grouped-CV AUC 0.882, n=259 recovered FLEX rows, 110 condition groups) |
| Partially validated models | **1** (d²-law — internal consistency n=256 + literature order-of-magnitude; explicitly NOT independent campaign validation) |
| Documented-only models | **3** |
| Models outside their applicability domain | gate-enforced per environment (e.g. flex-extinction-v2 refuses lunar/Mars: training = ISS µg) |
| Rejected or unsuitable models | 0 rejected from registry; selection-engine rejections are per-request with reasons |

**Class coverage:** analytical-theoretical ×4 · semi-empirical ×2 · mechanistic-physical ×1 (documented) · numerical-simulation ×1 (documented) · machine-learning ×2 · empirical ×0 dedicated (d²-law and ignition cover the empirical burning-rate/ignition correlations via their source equations).

**Environment coverage:** Earth (direct: 6 models), ISS (direct: 5, qualitative: 4), Lunar habitat (qualitative: 6 — partial-g gap), Mars habitat (qualitative: 6), Spacecraft cabin (qualitative: 5), Space suit (not-applicable: 6, qualitative: 2). Habitat-vs-exterior distinction encoded for Moon/Mars profiles.

**Phenomenon coverage:** atmosphere · buoyancy/transport · droplet-combustion · extinction · ignition · solid-fuel · flame-spread · smoke/detection · suppression (documented) · cool-flames (documented) · flammability-context.

## 2. Model-by-model summary

| model_id | class | equations linked | env (earth/iss/moon) | lifecycle | validation |
|---|---|---|---|---|---|
| ideal-atmosphere-state | analytical-theoretical | p-o2-kpa, partial-pressure, ideal-gas-law, gas-density, mean-molecular-weight | direct/direct/direct | IMPLEMENTED, CODE_VERIFIED | reference tests (analytical identity) |
| buoyancy-transport-regime | analytical-theoretical | rayleigh, grashof, froude, richardson, buoyant-velocity-scale | direct/direct/direct | IMPLEMENTED, CODE_VERIFIED | reference tests (scaling) |
| d2-law-droplet-combustion | analytical-theoretical | d2-law, burning-rate-constant, droplet-lifetime, spalding-b-number | direct*/direct*/qualitative | IMPLEMENTED, CODE_VERIFIED, **PARTIALLY_VALIDATED** | PSI-69 n=259: MAE 7.9-10.3 s, RMSE 10.4-19.0 s (see §4) |
| thermally-thick-ignition | semi-empirical | ignition-time-thick, critical-heat-flux, thermal-inertia | direct/qualitative/qualitative | IMPLEMENTED, CODE_VERIFIED | not independently validated (BASS-II fitting = future work) |
| stokes-smoke-settling | analytical-theoretical | stokes-settling, cunningham-correction, brownian-diffusivity | direct/direct/direct | IMPLEMENTED, CODE_VERIFIED | reference tests; SAME/SAME-R distributions external |
| froude-spread-scaling | semi-empirical | froude-number, froude-spread-scaling, buoyant-velocity-scale | direct/qualitative/qualitative | IMPLEMENTED, CODE_VERIFIED | not validated quantitatively (no fuel-specific constants) |
| flex-extinction-v2 | machine-learning | logistic-sigmoid, roc-auc-pairs | not-applicable/direct/not-applicable | IMPLEMENTED, CODE_VERIFIED, **EXPERIMENTALLY_VALIDATED** | grouped-CV AUC 0.882 (110 groups), refusal >0.02 g |
| cfig-hot-ignition | machine-learning | logistic-sigmoid | not-applicable/direct/not-applicable | IMPLEMENTED (exploratory) | below oxygen baseline (0.682 vs 0.728) — honest negative retained |
| cool-flame-two-stage-ignition | mechanistic-physical | none (literature kinetics) | direct/direct/qualitative | DOCUMENTED_ONLY | documented in sources (Zhao et al. 2015; PSI-159 final report) |
| fgm-concurrent-flame-spread | numerical-simulation | none (CFD/FGM per source) | direct/direct/n-a | DOCUMENTED_ONLY | documented in sources (PSI-62) |
| iss-fine-water-mist-suppression | mechanistic-physical | none (mechanisms documented) | qualitative/direct/qualitative | DOCUMENTED_ONLY | documented in sources (AIAA FWM/ESA) |

\* d²-law earth: direct for the algebra; the *microgravity spherical-symmetry assumption* is what makes ISS the primary regime.

## 3. d²-law partial validation detail (17A.13)

**Source:** PSI-69_FLEX canonical table (SHA-256-verified, n=259 usable rows of 274).
**Internal consistency (t = d0²/K vs measured burn time):** n=256 · MAE 10.25 s · RMSE 18.99 s · median 4.63 s.
**K by fuel (recovered 'Burning rate'):** Methanol median 0.46 mm²/s (n=117), Heptane 0.54 mm²/s (n=106) — **reduced vs terrestrial O(0.5-1.5) ranges as physically expected in microgravity** (weaker convective transport), all within literature order-of-magnitude.
**Lifetime prediction (per-fuel median K):** Methanol MAE 7.87 s / RMSE 10.44 s; Heptane MAE 8.58 s / RMSE 12.25 s.
**Verdict:** the constant-K d²-law is a first-order trajectory model only — per-test quantitative prediction fails (time-varying K, disruption events, dilution-dependent extinction). Recorded as `PARTIALLY_VALIDATED` with limitations; never promoted to "validated". Evidence file: `data/validation/d2law_validation.json` (regenerate: `node scripts/flame/validate-d2law.mjs`).

**User-supplied independent pipeline (2026-11-13):** 20 Colab-cleaned experiment CSVs + `NASA_All_Experiments_Analysis.json` + `experiments_colab_from_scratch.ipynb` staged in `data/validation/experiments/` with Experiment→PSI mapping (Exp-13→PSI-69, Exp-5→PSI-10, Exp-6→PSI-159, Exp-9→PSI-39, Exp-16→PSI-107, Exp-17→PSI-99, Exp-7→PSI-25, Exp-8→PSI-26, Exp-15→PSI-102, Exp-22→PSI-22, Exp-23→PSI-23, Exp-11→FLEX-2/CFI droplets, Exp-12→FLEX-2 conditions). Provenance: user Colab re-processing of the same recovered tables — pipeline cross-check source, not independent experimental data.

## 4. Model selection engine (17A.7)

- **Compatibility gate** (verified in selftest): thermally-thick-ignition @ ISS → `qualitative` (preheat transfers, spread stage does not); flex-extinction-v2 @ Moon → `not-applicable` (refuses >0.02 g); thermally-thick @ Earth → `direct`.
- **Selection** (output-disambiguated): droplet-combustion @ ISS with requested output `lifetime` → recommends **d2-law-droplet-combustion**; extinction-outcome questions route to **flex-extinction-v2** (higher validation tier). Ranking is documented policy (environment compatibility → validation tier → executable first) — no invented weights or probabilities.
- **Honest refusal:** phenomena/environments without a validated quantitative model produce "reliable quantitative prediction cannot currently be produced" with per-candidate rejection reasons (verified in UI and via the compare tool).
- **CIR-1 tools added (5):** `search_mathematical_models`, `get_mathematical_model`, `check_model_applicability`, `run_mathematical_model`, `compare_model_candidates` — agent now **38 tools**. DOCUMENTED_ONLY models refuse execution and return citations.

## 5. Missing mathematical relationships (17A.18)

1. Partial-gravity (0.02-0.65 g) combustion models — no experimental validation data exists anywhere in PSI (field-wide gap; LUCI/FM2 expected).
2. Transient coupled droplet model (time-varying K, disruption) — literature-level understanding exists; no implemented solver.
3. Solid-fuel flame-spread model with µg heat-feedback — FGM/CFD-class (PSI-62) documented, not implemented.
4. Detection-time estimation (smoke transport → sensor response) — needs ventilation-field data.
5. Suppressant effectiveness quantification — tests not condition-matched (suppressant gap).

## 6. Model-selection test results

- `/api/selftest` **8/8** — three new checks: `math-model-registry` (integrity), `math-model-runner` (d²-law code verification), `math-model-applicability` (gate honesty), `math-model-selection` (output-disambiguated recommendation).
- `/api/scientific-qa-eval` **14/14 across 12 domains** — added q13 (model discovery for droplet combustion) and q14 (thermally-thick @ ISS applicability = qualitative).
- Playwright 30/30 · tsc 0 errors · eslint 0 errors/1 pre-existing warning · `next build` verified in the prior round.

## 7. Remaining research gaps and limitations

- Model-to-Knowledge-Graph node/edge extension (MODEL_CONTAINS_EQUATION etc.) is designed but not yet rendered in the graph viewer (typeColors are data-driven; follow-up documented in registry `cross_references.knowledge_graph_note`).
- d²-law validation is internal-consistency + literature order-of-magnitude; an independent campaign split (e.g. calibration on FLEX-1 campaigns, validation on FLEX-2) is future work.
- DOCUMENTED_ONLY models depend on source literature for their validation claims — ZERO FLARE does not re-validate them.
- No CFD/ODE/PDE solver is implemented (CFD boundary respected per 17A.12-E).
- Fine-water-mist/suppressant quantitative ranking remains refused (condition-mismatch).

## 8. Master-plan integration mapping (17A.20)

| Section | Integration |
|---|---|
| §4 Philosophy | model_class taxonomy distinguishes equations/models/simulations/ML in registry + UI badges |
| §5 Loop | registry lifecycle = the required chain (source → extraction → review → IMPLEMENTED → CODE_VERIFIED → validation) |
| §8 Datasets | validation datasets mapped to model inputs (d²law vs PSI-69; BASS-II flagged for ignition fitting) |
| §10 CIR-1 | 5 new tools + intent routing (search/applicability/run/compare) |
| §11 RAG/KG | registry carries equation links + KB citations; KG rendering extension documented |
| §12 Investigations | d²-law validated against PSI-69 corpus rows; per-investigation model linkage via phenomenon tags |
| §13 Scenarios | FacilityAnalysisPanel context + selection engine output; gate enforced pre-execution |
| §17 Sci-ML | ML models (FLEX/CFI-G) registered under machine-learning class, separate from physical models |
| §20 Reporting | this document = the 17A.18 audit |
