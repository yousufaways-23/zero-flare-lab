# SOURCE_CONFLICT_REPORT — ZERO FLARE / FLAME EVIDENCE LAB merge (M0)

**Date:** 2026-11-12 · **Scope:** the six version artifacts + data.zip + the supplied comparative audit

## 1. The count conflicts, resolved

The comparative audit flagged inconsistent investigation/table/row/media counts. Reconciliation against the actual trees resolves every discrepancy to **one canonical corpus**:

| Count | ORIGINAL_MAIN | SECOND_EVIDENCE | THIRD_PRESENTATION | **Canonical (F)** | Resolution |
|---|---:|---:|---:|---:|---|
| Investigations | 24 | 17 | 19 | **24** | O's set is the PSI-API superset (17 = S's investigations *with recovered tables*; 19 = T's PSI-sync subset). All 24 ship; table coverage differs per record and is displayed per record. |
| Experimental tables | 22 | 19 | 21 | **22** | The 19 shared CSVs are **byte-identical (SHA-256) across O and S** (verified pairwise). O adds PSI-142, PSI-47, PSI-98 (recorded in O's fetch ledger as "+3 beyond the 19-file manifest"). T's 21 datasets are its own slice of the same PSI sources. |
| Rows | 2,009 | 1,995 | — | **2,009** | Difference is exactly the 3 extra tables (+14 rows). |
| Parse failures | 620 | 623 | — | **both shown** | Rule difference documented in O's M12 report (623 under S's near-identical counting rule). O's per-column parse-failure counts are canonical; the discrepancy is *displayed*, not hidden. |
| Duplicate rows | 50 | 50 | — | **50** | Match. |
| Knowledge graph | 53 nodes / 70 edges (typed, evidence+confidence+review) | 84 / 240 (10 types + evidence keys) | 202 / 313 (co-occurrence-weighted) | **O's typed graph (53/70) as canonical semantic layer** | T's larger graph is co-mention-based — its own honesty note says "not causal claims". S's runtime gap-node overlay concept is retained in Compare's gap discovery. No untyped co-mention graph ships as evidence. |
| Media | 41 NASA Images API records | 0 binaries (index claims 2,393, **all binaries absent from the TAR**) | 9 PSI representative images | **41 Images API records** | S's 2,393 media paths are unverifiable in every supplied artifact (index says present, files absent — the V7 audit's P0). Never displayed as available. The 2,393 remain status: inaccessible in Data & Sources. |
| Equations | 51 (54/54 tests) | 40 | 40 | **63 (68/68 tests)** | Union: O's registry is canonical schema; T's unique equations (richardson, nusselt-sphere, effusivity, schmidt, knudsen, brownian, stokes, optical-extinction, mae, rmse, f1, fpr) ported with test vectors. S's overlaps were already covered by O's. |
| Agent tools | 24 | 18 | 7 | **26** | O's full set + 2 merged tools (analyze_fire_safety_scenario from S's engine; compare_comparability_gate new). |
| Historical batches | "recorded ledger" display | 4 real batch receipts (440 files, 362 unique, 78 dups) + registry | — | **S's receipts as recorded history; O's display pattern** | Both agree these are *recorded history*, not current filesystem state. Shipped in Data & Sources with the honesty alert that the 2,393 media binaries are absent. |

## 2. Packaging conflicts

1. **`flame_src/` nested inside ORIGINAL_MAIN** — a complete older V6 build (Nov 9, 137 src files, 19-table corpus) nested inside the Nov 11 rebuild. **Decision: ARCHIVE/removed** from the merged tree. It is a stale competing source, not an importable module (verified: root `src/` never imports from it).
2. **ZIP/TAR pairs** — ZIPs of O and S contain only reports+screenshots; TARs contain the full trees. TARs are authoritative; ZIP contents serve as report evidence.
3. **S's orphaned components** (`DataStudio.tsx`, `MediaGallery.tsx`) — present but never imported; their capabilities live in InvestigationDetail. Not ported.
4. **S's stale checkpoint** (`data/ingest/batches/B-20261109-003.state.json`) — not ported.
5. **S's `media_index.json` claims 2,393 present / 0 missing while every batch layer directory ships only `.gitkeep`** — the exact P0 from the supplied V7 audit. The merged build does not ship that index as available media; the historical status is displayed honestly.
6. **T's hardcoded `/home/z/my-project` paths** in scripts/.env — not ported; the merged tree uses relative paths.

## 3. Data corpus (data.zip) — registered, not yet fully ingested

The supplied corpus contains **22 official PSI investigation archives** (metadata zips, experimental-table CSVs, reports, representative images), NASA facility PDFs (CIR, FCF, MSG, ACME), the Ross *Microgravity Combustion* treatise, Turns' *Introduction to Combustion*, and ~30 Combustion and Flame papers. **Status: EXTERNAL LEAD NOT INGESTED as structured records** — the canonical tables were recovered earlier directly from the PSI endpoint (SHA-256-verified, and byte-identical to the CSVs inside these archives for the sampled files). The archives themselves are raw source material the ingestion pipeline can process batch-wise (demonstrated end-to-end with a live receipt B-20261112-001). They are *not* silently counted as ingested evidence.

## 4. Conflicts with the supplied audit narrative

- The audit's claim "2,393 media binaries missing" was **verified true** in every supplied artifact; the merged build's media layer therefore uses only verifiable assets (41 NASA Images API records with per-item provenance).
- The audit's "header overlap at 1440px" was **reproduced in the merged build's first screenshot** and fixed structurally (nav region min-w-0 + overflow-hidden, env chip moved to ≥1728px), with a non-vacuous Playwright guard (10 widths × brand/nav/actions slots) — the original test was vacuous because the markers did not exist; the fix adds the markers *and* the assertion.
- The audit's "40 equations vs README 44" applied to S/T; the canonical O registry's 51 were verified present, and the merged registry is 63 with all tests passing.
