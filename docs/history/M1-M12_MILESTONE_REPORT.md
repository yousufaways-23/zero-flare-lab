# FLAME EVIDENCE LAB — Milestone Report M1–M12 (rebuild run)
**Date:** 2026-11-12 · **Base:** V6 master spec · **Checkpoint:** this commit

## Environment reality (D-001)
The original repository TAR was not present in this environment; only the V6 spec JSON arrived.
The platform was rebuilt from the spec contract, with every recoverable artifact re-acquired from
official NASA sources and verified (see `M0_RECONCILIATION_REPORT.md`). No prior-code preservation
claim is made.

## Milestones

### M0 — Workspace reconciliation (done)
- 19/19 PSI experimental tables recovered from the official PSI download endpoint,
  **SHA-256 byte-identical** to the spec manifest. +3 extra tables (PSI-142, PSI-47, PSI-98).
- 24 investigation metadata records (objectives, approach, hypothesis, impacts, DOI, PI, hardware,
  publications) fetched from the PSI repository API with a provenance ledger.
- 41 authentic NASA media records (NASA Images API) with per-item provenance (nasa_id, center, date).
- **FLEX model reproduced from real data**: 274 raw → 262 clean rows (spec: 261), extinction share
  0.687 (spec: 0.686), grouped AUC **0.882** (recorded: 0.875), balanced acc 0.786 (recorded: 0.77),
  O2-only baseline **0.818** (recorded 0.806/0.818). Model card stores recomputed + historical metrics.
- **CFI-G scorer validated**: spec-preserved coefficients applied to recovered PSI-159 inverse table —
  146 usable rows / 131 positives (exact spec match); in-sample AUC 0.920.
- Discrepancy register R001–R010 applied (see Diagnostics panel in-app).

### M1 — IA consolidation (done)
Team-meeting navigation implemented: **Mission · Investigations · Compare · Scenarios · 3D Lab ·
Ingestion & Sources** + nested **Research Tools** (Model Studio, Variable Dictionary, Equation
Registry, Diagnostics) + **global Copilot** (dock on every view). Standalone Graph/Data
Studio/Workspace/Reports/pillar pages removed; their functions are embedded:
- Investigations workspace: 7 tabs (Overview, Data/EDA, Equipment, Media, Equations, Graph, Gaps).
- Compare: cross-study matrix + typed graph slice + gap discovery.
- Scenarios: Prevention → Detection → Prediction → Suppression lifecycle + Research Session Shelf.
- Mega-menu navigation, Ctrl+K command search (views, 24 investigations, 51 equations,
  environments), breadcrumbs, sticky investigation subnav.

### M2 — Brand & progressive UX (done)
- Flame-derived design tokens from the spec palette contract (ember #be5f35 → hot core #fcdaa7,
  emission blue #5799d1, deep-space base #030b26 — layered, never flat black), light research
  panels for data readability, glass surfaces used selectively.
- Vector ZERO FLARE mark from the palette contract (original PNGs not recoverable — R010 logged,
  no "official asset" claim).
- Progressive disclosure: raw rows and technical detail collapsed by default; summary first.
- Reduced-motion support (CSS + per-component), keyboard navigable, aria labels throughout.

### M3 — Mission & 3D journey (done)
- R3F scene: stylized Earth/ISS/Moon/Mars/spacecraft/spacesuit destinations, camera travel on
  selection, environment persisted across views (zustand persist).
- Honesty caption: "schematic — stylized, not to scale; official NASA 3D assets linked in 3D Lab".
- WebGL-failure fallback: static CSS starfield with markers; camera travel snaps under
  prefers-reduced-motion.
- Race-free in-scene labels (custom projector overlay replacing drei Html after a React 19
  unmount race was found and fixed in verification).

### M4 — Investigations & data integration (done)
- Atlas: 24 investigations, search + subResearchArea/projectType filters, compare selection.
- Workspace with embedded tools: column profiles (fill rates, units, parse failures), duplicate
  counts, real recharts (histogram + XY scatter with column selectors) computed from recovered
  rows with sha256 provenance strips; raw-rows explorer (collapsed, first 100 rows, missing = —).
- Integrity cases surfaced per investigation (amber panels, verbatim from spec).
- Authentic NASA media tab with lightbox, credit lines and the honest note about the 2,393
  unrecovered historical binaries (status: inaccessible).

### M5 — Equipment catalogue & 3D Lab (done)
- 9 equipment records from PSI hardware metadata + official source links; fidelity labels
  ("schematic — source-based reconstruction", "record only"); explicit "NOT official NASA CAD".
- 6 distinct procedural apparatus models (CIR rack, ACME burner, MDCA droplet apparatus, MSG
  glovebox, SPICE co-flow burner, SAFFIRE flow duct) with toggleable part labels, orbit controls,
  auto-rotate (reduced-motion aware), photo carousels with authentic NASA imagery.

### M6 — Global contextual Copilot (done)
- Server-side LLM (z-ai-web-dev-sdk) with a typed tool protocol and a bounded 2-round tool loop.
- 19 registered tools (search_evidence BM25, list/get investigations, table schema/query, EDA,
  equation search/calculate, variable dictionary, FLEX + CFI-G guarded scorers, model metrics,
  gaps, sources, media, equipment, atmospheres, findings, typed graph, chart generation,
  navigation/save/compare UI actions).
- Verified behaviours (spec experience tests): small talk → natural reply, NO tools; pO2
  comparison → exact calculation with provenance (21.1 vs 21.3 kPa); lunar 0.166 g FLEX request →
  **refusal with evidence-gap citation, no extrapolated probability**; chart request → real
  268-row scatter with sample size; self-correction on a failed tool call (wrong column name).
- Tool trace + citations displayed in the dock; LLM output is orchestration, never measurement.

### M7 — Scientific RAG (BM25 done; dense leg honestly absent)
- BM25 over investigation metadata, findings, gaps and tables with snippets + source links.
- Dense retrieval/vector store: **not configured** (no embedding credentials/eval set in this
  environment) — labelled honestly in the AI-role separation panel; hybrid is the documented next
  step (spec M7), not a claimed capability.

### M8 — Equation, material & scenario intelligence (done)
- 51 verified equations across the spec's 12 categories, each with statement, units, assumptions,
  deterministic calculator, reference tests (54/54 pass) and textbook citations.
- Slider + numeric two-way synced inputs with range warnings; missing inputs refused, never guessed.
- Fuel property table (9 fuels, NIST-sourced) pre-fills calculators; changing fuel prefills inputs
  only — historical data never altered. Registry count generated dynamically (R002 resolved).

### M9 — Data platform & gap engine (done, local scope)
- Corpus recomputed from recovered CSVs: 22 tables, 2,009 rows, 231 columns, 50 duplicate rows
  (matches spec), 620 numeric-parse failures (spec recorded 623 under a near-identical rule —
  both counted and displayed).
- Typed knowledge graph (53 nodes, 70 typed edges with evidence, confidence, review status;
  honesty note: co-recorded links, not causal claims).
- Gap registry with explicit statuses (absent / not-indexed / inaccessible / no-evidence-found).
- Prisma scientific schema (sessions, scenario runs, ingest batches/files, sources, equation
  drafts, gaps) — SQLite locally, Postgres as documented deployment target.

### M10 — Scenario fire-safety assistant (done)
- Shared scenario context (environment, gravity, atmosphere readouts incl. computed pO2) drives
  all four pillars; calculators prefilled from context; session shelf persists (localStorage).
- Prediction playground: FLEX v2 (guarded, gravity from selected environment — Moon/Mars/Earth
  trigger visible refusals) and CFI-G (exploratory warning shown); SPICE shown as negative result
  with no predictor; AI-role separation panel; "suppressants are not ranked" honesty note.

### M11 — Models & multimodal research (done to eligible scope)
- Model Studio: registry with verified-reproduction / exploratory / negative-result / absent
  statuses; full model cards (data, validation, metrics recomputed + historical, limitations);
  guarded playgrounds; honest CV/PINN/LLM absence reasons.
- No neural network, CV model or PINN trained or claimed (no labelled masks / field data — per
  spec deep-learning policy). No synthetic rows added to NASA data.
- Optional astronaut avatar: text input + browser TTS voice output with AI-voice disclosure and
  mute control implemented; a full VRM avatar character was **not** implemented (optional per
  spec; noted as future work).

### M12 — Verification (this run)
- `eslint` clean; `tsc --noEmit` 0 errors in src/; 54/54 equation reference tests pass.
- Browser-verified at 1440/768/390: mission hero, atlas, workspace (overview + data tabs with 3
  real charts), compare (matrix + warnings + graph slice), scenarios, 3D Lab (model viewer with
  projected part labels + photo carousel), ingestion, diagnostics; copilot small-talk and
  tool-driven paths; no page errors after the R3F unmount-race fix; mobile has no horizontal
  overflow (scrollWidth = 390).
- Production `next build` intentionally NOT run in this sandbox (documented environment
  constraint: it corrupts the running dev-server preview, as also recorded in the prior
  repository's M8 report). Type-check + lint + runtime + browser evidence stand in its place.

## Honest limitations (current state)
1. 2,393 historical media binaries remain unrecovered (source archives unavailable) — replaced by
   authentic NASA Images API media; the gap is displayed, never hidden.
2. Dense/hybrid retrieval not configured (M7 next step) — BM25 only.
3. FLEX v1 exact coefficients were not preserved in the spec; v2 retrained from recovered data
   (both metric sets shown).
4. VRM astronaut avatar not implemented (optional feature).
5. Historical 4-batch ingestion ledger is displayed as recorded history, clearly separated from
   the live filesystem state.
6. FLEX group count 188 vs recorded 110 (grouping protocol not fully preserved in spec; reported
   as a protocol difference, both numbers shown).
