# MODEL CARDS AND VALIDATION REPORT — ZERO FLARE (M12)

## Registry (implemented, honest statuses)

| Model | Status | Task | Key metrics (recomputed from recovered data) | Domain guard |
|---|---|---|---|---|
| FLEX extinction v2 | **verified-reproduction** | droplet extinction classification (PSI-69) | grouped AUC **0.882** (historical 0.875), O₂-only baseline 0.818, balanced acc 0.786; 274→262 clean rows; extinction share 0.687 | refuses gravity > 0.02 g, non-FLEX fuels, out-of-range conditions; output = UNCALIBRATED relative score, never a safety verdict |
| CFI-G hot-ignition | **exploratory** (below baseline) | inverse-config hot ignition (PSI-159) | grouped AUC 0.682 vs oxygen-only baseline **0.728**; 146 usable rows / 131 positives; 'flash' rows excluded as ambiguous — never coerced to negatives | shown for transparency; explicitly not a production predictor |
| SPICE flame duration | **negative-result** | burn-duration regression (PSI-107) | no candidate beats the fuel-mean baseline (negative R² recorded) | preserved and displayed; NOT offered as a predictor |
| Flame image segmentation (CV) | **absent** | segmentation | no labelled mask data in corpus | reason stated, no fabricated model |
| PINN flame fields | **absent** | PDE surrogate | no field data + no solver validation | reason stated |
| Domain foundation LLM | **absent** | language model | pretrained generic LLM used only for orchestration via RAG-style tools | no corpus training claimed |

## Governance policy (implemented)

Second's MODEL_POLICY rules are enforced by the pipeline + UI:
1. Ingestion never trains — every batch receipt states "model impact: NONE by design" (verified live).
2. `confirm-all-uploads` gates the global audit; audit only reconciles + pre-assesses eligibility.
3. New training creates a new immutable version with its own card.
4. Candidate → review → promote; nothing auto-promotes.
5. Ambiguous labels never forced into negative classes (CFI-G rule).
6. Provenance travels with the model (dataset hashes, cleaning ledger, evaluation protocol).

## Validation discipline

- Group-aware splits (test/experiment groups) — no leakage across repeated conditions.
- Baselines required (O₂-only for FLEX/CFI-G; fuel-mean for SPICE) — a model below baseline is recorded as a negative result, not hidden.
- Metrics recomputed from raw at request time (FLEX card) — the UI shows recomputed AND historical values side by side.
- Out-of-domain behaviour = refusal with reason (verified: lunar 0.166 g FLEX request → refusal + evidence-gap citation).
- Applicability ceilings and calibration status are part of every card and every playground.

## No fabricated capabilities

No neural network, CV model, PINN, or fine-tuned LLM is claimed. The 2,393-media historical asset is not represented as available. SIMULATED data is not presented as NASA observation. All absent models carry reasons in Model Studio.
