# FINAL_VERSION_MERGE_REPORT — ZERO FLARE · FLAME EVIDENCE LAB

**Date:** 2026-11-12 · **Mission:** NASA Space Apps Challenge 2026 — *Flame in Freefall: AI-Powered Fire Safety Insights from Microgravity Combustion Data* · **Targets:** Best Use of Science + Best Use of Data

---

## 1. What was built

One coherent, scientifically defensible research platform merged from the three verified versions:

> **ORIGINAL_MAIN = product spine · SECOND = evidence/data/governance layer · THIRD = UX simplification reference**

The final tree (`zero-flare/`) is the Original V7 rebuild upgraded with Second's ingestion/governance machinery, Second's deterministic fire-safety engine, Third's navigation patterns, a merged 63-equation registry, a comparability gate, an official NASA 3D-asset layer, a new My Work workbench, CIR-1 agent identity, and a deterministic release-gate harness.

## 2. Verified state at merge completion

| Gate | Result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `eslint src` | 0 errors, 0 warnings |
| Playwright header matrix (360→1920, brand/nav/actions slots) | 10/10 pass, non-vacuous guards |
| Playwright navigation flows (CIR-1 dock, deep links, gate, My Work @390px) | 5/5 pass |
| Scientific self-test (`/api/selftest`) | 4/4 pass — 63 equations · 68/68 reference tests; gate refuses PSI-69 vs PSI-99; facility engine emits partial-g caveat; Ri collapses in µg |
| Ingestion pipeline (live POST /api/ingest) | receipt B-20261112-001: sha256 + extraction + entities + model-impact-none |
| Production `next build` | BUILD_ID written; only standalone-tracing warnings (ingest dynamic FS access, expected) |
| Visual matrix | 13 screenshots captured and reviewed at 1440/768/390 (docs/screenshots/) |
| Real nav overlap found at 1440px | reproduced → fixed structurally → re-verified |

## 3. Merge composition (summary — full detail in VERSION_MERGE_MATRIX.json)

- **Kept from Original:** 8-view architecture core, investigation workspaces (24 PSI records), compare matrices, scenario lifecycle, 3D apparatus viewer with fidelity labels, ingestion & sources surface, research tools, copilot core with bounded tool loop, honest model registry (FLEX v2 verified-reproduction AUC 0.882 / CFI-G exploratory / SPICE negative), 51-equation registry, 22-table corpus, atmospheres, findings, gaps, sources, media, equipment.
- **Ported from Second:** batched server ingestion pipeline (3,134 lines, type-fixed) + `/api/ingest` + traversal-proof `/api/ingest/media`; deterministic fire-safety facility engine (`analyzeFacility` + physics + scenario modules, typed ports); MODEL_POLICY; NASA ISS + Perseverance GLB assets with PROVENANCE.md; EDA/model-card artifacts as reference layers; source-sync snapshot approach.
- **Adopted from Third:** hash deep links; grouped-nav discipline; environment switcher in header; My Work surface (extended into a saved-items shelf + evidence-packet export); equation-resolver intent concept (realized through CIR-1 + command palette); reduced-motion-first motion contract.
- **New in the merge:** comparability gate (`science/comparability.ts` + Compare banner + CIR-1 tool); scenario context injection into tools; 12 equations ported from Third into the canonical schema; `/api/selftest` release gate; Playwright harness; brand-emblem extraction; canonical manifests.

## 4. Acceptance journey (challenge §27) — implemented end-to-end

1. **Mission** → environment journey with flight-proven vs concept labels, evidence coverage, ranked findings, authentic NASA media.
2. **Investigations** → 24 PSI workspaces at merge time (25 in the current merged build): overview, real EDA charts from recovered rows, equipment, media, equations, typed graph, gaps — all with SHA-256 provenance strips.
3. **Compare** → comparability gate verdict BEFORE the matrix; typed graph slices; gap discovery.
4. **CIR-1** → 26 typed tools at merge time (42 in the current build — release manifest `agentTools: 42`), context-aware, citations, inspectable traces; deterministic tools produce every number.
5. **Charts** → `generate_chart` renders only real recovered rows with sample size + provenance.
6. **Calculations** → 63-equation registry, slider↔field two-way inputs, missing inputs refused.
7. **Models** → applicability domains enforced (FLEX refuses >0.02 g); uncertainty and negative results visible.
8. **Gaps** → registry with absent/not-indexed/inaccessible/no-evidence-found statuses + live NTRS external triage.
9. **My Work** → save anything; export a traceable evidence packet (Markdown with provenance + limitations).
10. **Demo path** → the 90-second judge journey in the README (Mission → PSI-69 → Compare gate → CIR-1 question → gap → export).

## 5. Honest limitations (documented, not hidden)

1. LLM provider credentials are configured by the platform runtime; in this sandbox CIR-1's deterministic layer is fully verified while live LLM synthesis is unavailable (graceful degradation implemented and verified — no fabricated answers).
2. The 2,393 historical media binaries remain unrecovered (status: inaccessible, displayed in Data & Sources). Media features use only verifiable NASA Images API records.
3. Dense/hybrid retrieval not configured (BM25 baseline only) — documented next step, not a claimed capability.
4. No auth/rate limiting on API routes (challenge demo posture); documented in SECURITY_AND_PERFORMANCE_REPORT.md.
5. Persistence: research sessions/items are local (labelled in-product); Prisma schema + server-side session path documented for deployment.
6. data.zip's 22 PSI archives are registered raw sources (ingestable batch-wise; live receipt demonstrated) — structured ingestion of the full archives is queued behind the same governance pipeline, not claimed as already-ingested evidence.

## 6. Where everything lives

- Documentation: `docs/` (this report + 14 companion reports/manifests)
- Screenshots: `docs/screenshots/` (13, three viewports)
- Tests: `tests/e2e/layout.spec.ts`, `playwright.config.ts`
- Science engines: `src/lib/science/` (equations, models, comparability, firesafety, physics, scenario, screening)
- Agent: `src/lib/agent/` (26 tools), `src/app/api/copilot`, `src/app/api/selftest`
- Ingestion: `src/lib/ingest/`, `src/app/api/ingest/*`
- 3D: `src/components/flame/lab3d/` (+ `public/textures/PROVENANCE.md`)
- Manifests: `docs/CANONICAL_SOURCE_MANIFEST.json`, `docs/CANONICAL_DATA_MANIFEST.json` (regenerate: `node scripts/flame/build-canonical-manifest.mjs`)
