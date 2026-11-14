# FINAL_ARCHITECTURE_DECISIONS — ZERO FLARE / FLAME EVIDENCE LAB (merged final build)

**Date:** 2026-11-12 · **Status:** implemented (each decision verified in the running app)

## ADR-0 — Composition, not replacement
The recommended architecture from the supplied comparative audit is adopted and implemented:
**ORIGINAL_MAIN = product spine · SECOND = evidence/data/QA/governance layer · THIRD = UX simplification reference.**
The merged tree is built from the Original rebuild, with Second's verified components ported into it and Third's navigation/UX patterns adopted. No wholesale replacement; no directory-level concatenation. (Evidence: VERSION_MERGE_MATRIX.json F-01…F-15.)

## ADR-1 — Eight-section information architecture
Mission · Investigations · Compare · Scenarios · 3D Lab · Data & Sources · My Work · Research Tools — plus the global CIR-1 dock. Standalone Knowledge Graph, Data Studio, Prevention/Detection/Suppression routes are removed; their capabilities are embedded (graph slices inside Investigations/Compare/3D Lab/ingestion; EDA inside the investigation Data tab; pillars as scenario stages). Rationale: the team decision record + Third's demonstrated 8-view comprehension speed. Hash deep links (#investigation/PSI-69/data, #scenarios/suppression, #data-sources/media) preserve shareability. Persisted legacy state migrates via zustand version 2.

## ADR-2 — One canonical corpus with immutable raw layer
22 SHA-256-verified PSI tables / 2,009 rows are canonical; raw CSVs are never edited. 19/19 manifest tables byte-identical to the project manifest; +3 extra tables recorded via the fetch ledger. Generated layers rebuild from raw via documented scripts (`scripts/build_corpus.py`, `scripts/flame/ingest.mjs`, `scripts/flame/build-canonical-manifest.mjs`). The 620-vs-623 parse-failure rule difference is displayed, not reconciled away.

## ADR-3 — Ingestion never trains (model governance)
Second's pipeline + policy are the governance law: raw-bytes-first persistence, SHA-256 global dedup registry, magic-byte type detection, isolated PDF child process, quarantine semantics, receipts, `confirm-all-uploads` gate before the global audit. Model impact of every batch: NONE by design. Candidate → review → promotion for any future model. Negative results (CFI-G below oxygen baseline AUC 0.682 vs 0.728; SPICE negative R²) remain visible registry entries.

## ADR-4 — Comparability gate before cross-study claims
`src/lib/science/comparability.ts` audits gravity regime, experimental scale, project type, hardware/facility, outcome-bearing data — derived only from PSI metadata. Its verdict (direct / conditional / not-comparable) renders **before** the comparison matrix, and CIR-1 exposes the same gate as a tool. This converts scientific caution into a product capability (Best Use of Science).

## ADR-5 — Deterministic truth, LLM orchestration
Every number traces to (a) a recovered source row, (b) the verified equation registry (63 equations, 68/68 reference tests), or (c) a labelled model card. CIR-1 never measures: small talk launches no tools; tool budget is bounded (≤6 calls, 2 rounds); refusals carry reasons; external NTRS results are labelled leads. The LLM-unavailable path degrades to honest deterministic messaging (verified live in this sandbox).

## ADR-6 — Scenario engine is decision support, not safety certification
Second's `analyzeFacility` engine (six visible drivers: atmosphere, materials, ignition, confinement, ventilation regime, protection deficit) is the deterministic core of Scenarios; every recommendation carries evidence links (PSI accessions) or an explicit heuristic label; partial-gravity inputs emit the no-data caveat. Scores are relative heuristics — never probabilities; the platform is not a certified fire-protection system.

## ADR-7 — 3D fidelity classes are permanent labels
Procedural apparatus models are labelled "schematic — source-based reconstruction"; the ISS and Perseverance GLBs are labelled "official NASA 3D model — geometry unchanged" with per-asset provenance (source URL, publisher, processing). No 3D scene is presented as a simulation or digital twin; experiment replays are labelled illustrative.

## ADR-8 — Brand: emblem independent of wordmark
The supplied brand art is used as (a) the Mission hero backdrop and (b) the source for a properly extracted round ZERO emblem (circular mask, independent of the wordmark and galaxy). The rectangular-crop emblem inherited from the Original (which sliced the wordmark) is replaced. Favicon derives from the same emblem.

## ADR-9 — My Work is the single user-work surface
Saved items (8 kinds), the gap shelf, and research sessions aggregate in one view with a provenance-carrying Markdown evidence-packet export. Persistence is explicitly labelled local (browser); server-side sessions remain a documented deployment step (Prisma schema ready).

## ADR-10 — Release gate is deterministic
`GET /api/selftest` (equation tests, gate behaviour, engine caveats, physics sanity) + Playwright matrix (10 widths × header slots, non-vacuous) + 5 navigation flows + screenshot review at 1440/768/390 form the acceptance harness. A green typecheck is not a visual pass; visual evidence is captured and reviewed (docs/screenshots/).

## ADR-11 — Security posture and honest gaps
Ingested from Second: traversal-proof media route, SVG/PDF forced-download + nosniff, batch caps (≤10 files, ≤300 MB), zod validation, fixed timeouts on external fetches, secrets server-side only. Known gaps documented, not hidden: no auth/rate limiting on API routes (challenge demo posture), no Postgres migration yet, dense retrieval not configured (BM25 only), LLM provider must be configured by the platform runtime.

## ADR-12 — Framework unchanged
Next.js App Router + React 19 + TS + Tailwind 4 + shadcn + Zustand + R3F/drei + Recharts + framer-motion + Prisma/SQLite stays. No framework migration for novelty (per the coding contract). Playwright added as the only new dev dependency (test harness required by the release gates).
