# Model Versioning & Training Policy — FLAME EVIDENCE LAB

This file is the policy of record for everything under `/models/`.

## Rules (non-negotiable)

1. **Ingestion never trains.** Uploading batches registers and extracts content
   only. No production model is retrained, updated or overwritten while
   batches may still arrive.
2. **The global audit gates everything.** Schema harmonization, ML eligibility
   assessment and the training strategy run only after the user explicitly
   confirms that all source files have been uploaded (`PUT /api/ingest`
   `{"action":"confirm-all-uploads"}` → then `run-global-audit`).
3. **New training creates a new version.** A validated production model (e.g.
   the FLEX extinction classifier, `models/flex-extinction@v1`) is immutable.
   Retraining produces `@v2`, `@v3`… with its own model card, metrics, data
   version and applicability domain. Nothing is silently overwritten.
4. **Candidate → review → promote.** New versions are born as *candidates*.
   Promotion to production requires human review of: dataset version, grouped
   validation (no leakage across test/experiment groups), calibration,
   uncertainty and applicability-domain controls.
5. **Label semantics are audited first.** Ambiguous labels are never forced
   into a negative class (the CFI-G rule). Datasets whose outcome semantics
   cannot be established are registered as descriptive-only.
6. **Provenance travels with the model.** Every model version records the
   exact dataset version (file hashes), preprocessing ledger and evaluation
   protocol that produced its metrics.

## Current registry

| Version | Status | Basis | Metrics source |
|---|---|---|---|
| `flex-extinction@v1` | production (read-only) | PSI-69 FLEX, 261 cleaned rows | recomputed at request time from `data/raw/PSI-69_FLEX.csv` — see `/api/flex` |

The training workflow for candidate versions lands with the Model Studio
upgrade milestone; this policy file is the contract it must satisfy.
