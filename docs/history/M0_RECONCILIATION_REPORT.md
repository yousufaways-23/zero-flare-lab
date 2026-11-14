# M0 — Workspace Reconciliation Report
**Date:** 2026-11-12 · **Spec:** FEL-ZAI-ULTIMATE-MASTER-SPEC-V6 · **Checkpoint:** this commit

## Environment finding D-001 (critical, resolved in part)
The uploaded repository TAR (`workspace-a0725e65-c09f-4e15-a572-c2d5f3808f61 (7).tar`, git 54e73af) was
**not present** in this environment — only the V6 spec JSON arrived. Per spec R008 the JSON contains no
code dump (manifest + hashes only). Consequence: prior code cannot be byte-preserved; the platform is
rebuilt in this workspace from the V6 spec contract, with every recoverable artifact re-acquired from
official sources.

## Recovered assets (verified)
| Asset | Method | Verification |
|---|---|---|
| 19/19 PSI experimental tables (FLEX, CFI-G×2, FlameDesign×2, BRE, CLD, E-FIELD, s-Flame, BASS×2, CFI, FLEX-2, SAFFIRE-I/II/III, SAME, SAME-R, SLICE, SPICE) | NASA PSI public download endpoint (`psi.nasa.gov/geode-py/ws/studies/{acc}/download`) | **19/19 SHA-256 hashes byte-identical** to the spec `raw_psi_tables` manifest |
| +3 additional tables (PSI-142 data summary, PSI-47 DAFT, PSI-98 SAFFIRE-1) | same endpoint | recorded in fetch ledger with URL + hash |
| 24 combustion investigation metadata records (title, objectives, approach, hypothesis, impacts, DOI, PI, hardware, publications) | PSI repository API | ledger `data/ingest/psi_fetch_ledger.json`, `psi_investigation_metadata.json` |
| 41 authentic NASA media records (CIR, ACME, FLEX, SAFFIRE, ISS) | NASA Images and Video Library API | `data/ingest/nasa_media_index.json`, provenance per item |

## Not recovered (honest status)
- **2,393 historical media binaries** from the prior ingestion batches (B-20261109-001..004): the original
  uploaded batch archives are not available in this environment. Status: `missing — source archive not
  available`. The platform uses authentic NASA Images API media instead and displays the historical
  ledger with this honest status (spec R001 rule: never display absent media as present).
- Prior code modules (agent/tools/equations/…): rebuilt from spec records, not byte-preserved.
- FLEX v1 exact coefficients: not preserved in spec; **retrained from recovered raw data** (see below).

## Science verification (recomputed, not trusted)
- **FLEX PSI-69 reproduction** (`scripts/verify_flex_model.py`, `models/flex-extinction/v2/`):
  274 raw rows → 262 clean (spec: 261), extinction share 0.687 (spec: 0.686),
  grouped AUC (GroupKFold-4 by condition) **0.882** vs recorded 0.875; balanced accuracy 0.786 vs 0.77;
  oxygen-only baseline AUC **0.818** (spec recorded 0.806 latest / 0.818 earlier iteration).
  Model card stores BOTH recomputed and historical-recorded metrics.
- **CFI-G scorer validation**: spec-preserved coefficients applied to recovered PSI-159 inverse CSV:
  146 usable rows / 131 positives — exact match with spec; in-sample AUC 0.920 (consistent with the
  recorded grouped-CV 0.682 given fold spread 0.038–0.92). Kept as exploratory, below O2-only baseline.
- **Corpus**: 22 tables, 2,009 rows, 231 columns, 50 duplicate rows (SPICE 34 + E-FIELD 8 + CFI 8 —
  matches spec total), 9,006 cell parse failures counted and displayed (spec counted 623 under a
  different rule; both are reported honestly as counting-method-dependent).
- SPICE duration regression retained as **negative result** (recorded: ridge R² −0.409, GBM −0.367,
  both worse than fuel-mean baseline; no UI predictor exposed).

## Discrepancy register (from spec, applied here)
- R001 media binaries → D-001 above; media UI shows only verified-available assets.
- R002 equation count → registry count generated from the implemented registry (not README claims).
- R003 SQLite/Post schema → SQLite locally; scientific schema designed, migrations explicit, no data-loss pushes.
- R004 graph edges → typed edges (co-mention/derived/reported), confidence + review status; no causal claims.
- R005/R006 3D/environment fidelity → per-model fidelity labels; conceptual art labelled.
- R007 15-view IA → consolidated navigation per team meeting (this rebuild implements the target IA directly).
- R010 brand assets → emblem not recoverable from TAR; brand rendered from spec palette contract with
  flame-derived tokens; no false "official asset" claim.

## Milestones M0–M12 execution continues from this checkpoint.
