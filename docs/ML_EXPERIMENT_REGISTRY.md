# ML Experiment Registry — ZERO FLARE (M7, definitive master build)

Updated 2026-11-14. Companion artifacts: `data/ml/experiment_log.json` (every run),
`data/ml/flex_extinction_experiment.json` (summary + decision),
`models/flex-extinction/v2/model_card.json` (registered artifact + reverification).

---

## 1. Registry of ML tasks

| Task ID | Task | Data | Status | Registered model |
|---|---|---|---|---|
| T1 | FLEX droplet visible-flame extinction classification (binary) | PSI-69 `Experiment_13_cleaned.csv` — 274 raw / 262 clean / 180 positive | **SELECTED after multi-candidate comparison (2026-11-14)** | `flex-extinction-v2` (6-feature IRLS logistic regression) |
| T2 | CFI-G hot-ignition scoring | CFI-G inverse-flame conditions | EXPLORATORY — honest negative retained (does not beat single-feature O2 baseline: AUC 0.682 vs 0.728 under grouped validation) | `cfig-hot-ignition` |
| T3 | d²-law droplet lifetime (physics, not ML) | PSI-69 n=259 | PARTIALLY_VALIDATED — deterministic runner, constant-K fails per-test prediction (MAE 7.9–10.3 s); registered as a mathematical model, deliberately NOT replaced by a black-box predictor | `d2-law-droplet-combustion` |
| T4 | Evidence retrieval (RAG) | 392-doc knowledge index + corpus | Hybrid BM25 + metadata-filtered legs; measured via `/api/scientific-qa-eval` (14 checks incl. citation correctness) | deterministic pipelines (BM25 `catalog.ts`, `knowledge-retrieval.ts`, NTRS external leg) |

Deliberately NOT done (documented refusals): no image-segmentation model (no annotated flame-image dataset — the 216 extracted figures are unlabelled document renders); no LLM fine-tuning (corpus too small vs. cost; RAG + tool-calling measured sufficient); no black-box replacement of the d²-law physics model (a deterministic equation with validated limits beats an opaque surrogate for this task).

---

## 2. T1 experiment record — flex-extinction multi-candidate comparison

**Experiment ID:** `M7-flex-extinction-20261114` · seed 20261114 · harness `scripts/flame/ml-flex-extinction-experiment.mjs` (portable Node, no external ML deps).

### Dataset
- Source: team's cleaned canonical PSI-69 FLEX table (SHA-256-tracked in the dataset registry).
- 274 raw → **262 clean** rows (12 dropped: missing pressure/O2/d0). Extinction positive share 0.687.
- Features (pre-test only): `XO2, p_mmHg, d0_mm, fuel_heptane, XHe, XCO`. Burning rate, burn time and extinction diameter are **excluded as outcome leakage**.
- Outcome definition: `y=1` iff `Test end == Extinction` (Disruption/Completion merged — documented limitation).

### Validation protocol (pre-declared)
- **Group-aware only** — no random row splits. Primary: condition groups `(fuel, ⌊p⌋, XO2@2dp)` K=4 (v2's original scheme). Secondary: test-date groups K=8 (stricter — same-day chamber conditions never straddle folds).
- Replacement bar declared before running: a challenger must beat the registered champion by **≥ +0.01 mean grouped AUC**; ties prefer the simpler/interpretable model.
- Known limitation: hyperparameters evaluated on the same grouped CV used for reporting (no nested CV); mitigated by the conservative replacement bar and group-bootstrap CI.

### Reproduction of flex-extinction-v2 (§9.8)
- Full-data refit reproduces the registered artifact **exactly**: coefficients Δ ≤ 0.0001 at 4 dp (`[-1.8695, -0.0235, 0.69, -0.4076, 0.4167, 0.3405]` on the registered means/stds).
- Grouped AUC 0.8711 vs registered 0.8816 (Δ 0.0105, within the pre-declared <0.02 pass bar) — fold-composition sensitivity from rounding differences in group keys between the 2026-11-12 python environment and this harness; mean over folds is stable.

### Leaderboard (condition-group K=4; top lines)
| Candidate | Hyper | mean AUC | bal acc | F1 |
|---|---|---|---|---|
| logistic-irls (registered v2 lineage) | ridge 0.001 | 0.8711 | 0.786 | 0.809 |
| logistic-irls | ridge 0.01 | 0.8714 | 0.786 | 0.809 |
| logistic-irls | ridge 0.1 / 1.0 | 0.8709–0.8703 | 0.786–0.789 | 0.809–0.813 |
| bagged-trees-forest (60) | depth 3, minLeaf 5 | 0.8709 | **0.660** | 0.858 |
| knn-distance | k ∈ {5,7,9} | 0.838–0.840 | 0.773–0.779 | 0.859 |
| cart-tree | depth ≤4, minLeaf ≥5 | ≤0.835 | ≤0.720 | 0.827 |
| majority-class / O2-only baselines | — | 0.500 / 0.8175 | — | — |

### Decision
**RETAIN `flex-extinction-v2`** — the best rival (LogReg ridge 0.01) is +0.0003 AUC (statistical noise), and logistic regression remains the most interpretable, deployable, calibration-friendly choice. The forest matches AUC but collapses balanced accuracy (0.660); kNN/CART are clearly inferior. Negative results retained in the log.

Secondary date-grouped K=8 and the champion group-bootstrap CI are recorded in `model_card.json → reverification`.

### Where the model runs
- In-product scoring: `src/lib/science/models.ts` (reads `models/flex-extinction/v2/model_card.json → inBrowserScoring`); guarded by the applicability gate (gravity ≤ 0.02 g, fuel/pressure/O2 ranges).
- Integrity gate: `/api/selftest` check `ml-experiment-registry` (9th check) verifies artifact ↔ experiment-log consistency and the reproduction pass flag on every release checkpoint.

## 3. Software/tool versions
Node 24.22.0 (ESM, deterministic PRNG mulberry32 — no external ML framework). Data pipeline: scripts/flame/* (Node). Product runtime: Next.js 16.4.6 / React 19.
