# IMPLEMENTATION CHANGELOG — ZERO FLARE / FLAME EVIDENCE LAB (merged final build)

All changes below are implemented and verified in `zero-flare/` (2026-11-12).

## Review round 3 (continuous loop)

- **Guided demo mode shipped** (audit §39 / P1 #10): `src/lib/demo/script.ts` (8-step script) + `DemoWalkthrough` overlay + store `demoOpen`; entry points: Mission hero "90-second guided tour" button + command palette. The CIR-1 step seeds a **deterministically composed reply at runtime** (p-o2-kpa registry equation ×2, comparability gate verdict, FLEX model guard, corpus totals — all recomputed live, labelled "Deterministic demo replay — no LLM, no network") via a `flame:copilot-seed` window event handled by the dock with an inspectable tool trace. E2E: `tests/e2e/demo.spec.ts` walks the full journey (hero → PSI-69 → data → seeded copilot → gate verdict → gaps → scenarios → My Work), verifies the kPa numbers and gate banner, and checks no overflow.
- **data.zip provenance chain closed**: the 19 experimental-table CSVs extracted from the supplied official PSI archives were ingested through the governance pipeline (batches B-20261112-002: 10 files/1,278 rows + B-20261112-003: 9 files/717 rows; 46 entities; global audit run after explicit confirm-all-uploads), and **all 19 are SHA-256 byte-identical to the canonical data/raw corpus** — the chain PSI endpoint → recovered corpus → team-supplied archives is now independently verified end-to-end.
- **Latent model-card bug fixed**: the cards' JSON carries `model_id` while the interface claimed `id` — `getFlexCard().id` was `undefined` (visible in the demo reply and the live `model_validation_metrics` tool summary). Interface + both inline cards + usages migrated to `model_id`.
- Verification: tsc 0 errors · eslint clean · Playwright 30/30 (29 + demo flow) · selftest 4/4.

## Review round 2 (continuous loop)

- **Evidence Coverage Map shipped** (audit P1 #1): new `src/lib/science/coverage.ts` + `EvidenceCoverageMap` on Mission — 24 investigations × 8 dimensions (gravity/O₂/pressure/fuel/scale/hardware/outcome/context), cells derived from PSI metadata + recovered columns + typed graph fuel edges; legend + live counts + corpus-vs-field honesty note.
- **My Work save affordances closed the functional gap**: the store action existed but nothing called it. New reusable `SaveItemButton` wired on investigation headers, gap cards, equation-registry rows, equipment records and the media lightbox; `equipment` added to SavedItemKind; My Work "Reopen" routes per kind; new CIR-1 tool `save_research_item` (tool count 26 → 27) with dock dispatch (saves + navigates to My Work).
- **axe-core + console monitoring added to CI** (`tests/e2e/quality.spec.ts`): suite 15 → 29 tests. Fixed all found violations: Slider primitive now forwards aria-label to the Radix thumb; brand button name from visible text; atlas compare labels start with visible text; heat-map `role="img"` removed + visible-text names; console/page-error monitors pass on all 8 routes.
- **Rate limiting implemented** (`src/lib/server/rate-limit.ts`): /api/copilot 10/min, /api/ingest 6/min, /api/external 20/min, /api/selftest 5/min — per-IP fixed window, 429 + Retry-After, honest messages.
- **Visual defects fixed**: stale "official 3D model — none available" legend replaced (official GLBs exist); footer padding so the floating CIR-1 button no longer obscures the Sources column.
- Verification: eslint 0/0 · tsc 0 errors · Playwright **29/29** · selftest 4/4 · production build OK · new screenshot 14-coverage-map-1440.png.

## M0 — Archive & workspace reconciliation
- Extracted 6 version artifacts (ZIP/TAR pairs) + data.zip into `_reconcile/` (outside the release tree).
- SHA-256-verified all 7 source archives; resolved the count conflicts (24/22/2009 canonical; 19 shared CSVs byte-identical O↔S; parse-failure rule difference documented).
- `flame_src/` stale V6 tree + checkpoints removed from the merged tree (ARCHIVE decision).
- Produced: CANONICAL_SOURCE_MANIFEST.json · CANONICAL_DATA_MANIFEST.json (48 records, real hashes) · SOURCE_CONFLICT_REPORT.md.

## M1 — Architecture & IA consolidation
- ViewId: mission | investigations | compare | scenarios | lab3d | data-sources | my-work | tools (zustand persisted v2 with migration; savedItems shelf added).
- Hash deep links (#investigation/PSI-69/data, #scenarios/<pillar>, #data-sources/<tab>) + hashchange hydration.
- Header: three-region layout with data-header-slot markers, environment dropdown switcher (≥1728px chip), overflow containment; CIR-1 naming in nav, dock, command palette, footer.
- New MyWorkView (saved items × 8 kinds, gap shelf, sessions, evidence-packet Markdown export).

## M2 — Evidence & data governance merge
- Ported Second's ingestion pipeline (3,134 lines, type-fixed): identify/extract/science/storage; pipeline checks + receipts + confirm-all-uploads/run-global-audit gates.
- New API routes: /api/ingest (GET/POST/PUT), /api/ingest/media (traversal-proof, nosniff, SVG/PDF forced download), /api/selftest.
- DataSourcesView upgrades: ServerBatchPanel with live receipt display + audit gating; recovery ledger; historical batch ledger + honesty alert.

## M4 — Evidence workflow
- NEW comparability gate (`src/lib/science/comparability.ts`): gravity/scale/project/hardware/outcome audit; verdict banner in CompareView before the matrix; CIR-1 tool `compare_comparability_gate`.

## M5 — Unified scenario assistant
- Ported Second's engines as typed modules: physics.ts (buoyant velocity, flow regimes, Gr/Ra/Ri/Fr, nearest-FLEX), scenario.ts (presets), firesafety.ts (analyzeFacility: 6 drivers, evidence-linked recommendations, uncertainties).
- NEW FacilityAnalysisPanel embedded in Scenarios lifecycle (ranked band cards, expandable driver breakdown, partial-gravity caveats).
- CIR-1 tool `analyze_fire_safety_scenario` with live scenario-context injection (ENV_SCENARIO seeds + facility compartments from the client state).

## M6 — CIR-1 agent
- tools.ts: 24 → 26 tools; scenario context injection via setScenarioToolContext; core.ts CIR-1 identity + environment seeds; dock welcome/labels updated.
- /api/selftest release gate (equations, gate, engine, physics).

## M7 — Equation & variable registry merge
- 12 equations ported from Third into the canonical schema with test vectors → **63 equations, 68/68 reference tests** (richardson-number, nusselt-sphere, thermal-effusivity, schmidt-number, knudsen-number, brownian-diffusivity, stokes-number, optical-extinction, mae, rmse, f1-score, fpr).

## M8 — 3D Lab & equipment
- OfficialNasaModels: ISS (4.8 MB) + Perseverance (2.3 MB) official NASA GLBs with provenance panel, MeshoptDecoder, error boundary → NASA link fallback, fidelity badges.
- Brand: round ZERO emblem extracted from the supplied brand art (replaces the forbidden rectangular crop); favicon updated; brand art added as Mission hero backdrop (0.3 opacity under 3D, full in static fallback).

## M9 — Security, persistence
- Ingest security model verified (allowlist roots, magic bytes, caps, nosniff, forced downloads); secrets server-side; honest gap list documented (auth/rate-limit, Postgres, malware scan).

## M10 — UI/UX, performance, accessibility
- Fixed real 1440px nav overlap (found via screenshot) + made the Playwright guard non-vacuous; env chip repositioned; lint suppressions justified (3 hydration patterns).
- Playwright harness: playwright.config.ts + tests/e2e/layout.spec.ts (10 widths × 3 slots + 5 flows) — **15/15 pass**; screenshot matrix (13 captures, 3 viewports) reviewed.

## M11/M12 — Release
- Production `next build` succeeds (BUILD_ID written).
- 15 required documents delivered under docs/ (this changelog + merge report + manifests + matrix + conflict report + architecture decisions + evidence guide + data-quality report + equation registry + model cards + agent report + gap report + UI/UX review + security report + acceptance report).
- README to be regenerated for the merged product identity (ZERO FLARE / CIR-1).
