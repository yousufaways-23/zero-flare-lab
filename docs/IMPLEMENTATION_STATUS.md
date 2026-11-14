# ZERO FLARE — IMPLEMENTATION STATUS (Codex MVP + Definitive Master Build)

Format per brief §G. Updated 2026-11-14 (definitive master build round).

**Definitive master build round (2026-11-14) — new milestones on top of the Codex MVP:**
- **M0 verified baseline**: gates re-run green; brief §6.1 historical artifact paths verified ABSENT from
  the merged project (legacy lineage preserved as archives in `_reconcile/` + version tars); current
  foundation verified instead (20 team experiment datasets / 39,357 rows, 392-doc knowledge index,
  63-equation registry, 11 math models).
- **M7 ML experimentation**: `scripts/flame/ml-flex-extinction-experiment.mjs` — flex-extinction-v2
  reproduction exact (coefΔ ≤ 0.0001); 21 candidate runs (logistic grid / kNN / CART / bagged forest /
  baselines) under condition-group K=4 + test-date K=8 group-aware CV; pre-declared selection policy →
  **RETAIN flex-extinction-v2** (best rival +0.0003 AUC); negative results retained; artifacts
  `data/ml/experiment_log.json` + `data/ml/flex_extinction_experiment.json`; registry doc
  `docs/ML_EXPERIMENT_REGISTRY.md`; selftest check 9 (`ml-experiment-registry`).
- **M10 durable persistence (ADR-014)**: `src/lib/db/workspace.ts` (JSONL collections, atomic-rename
  writes, serialized write queue, zero native binaries, zero SQL surface; mirrors the documented Prisma
  schema 1:1) + `/api/workspace/items` + `/api/workspace/conversations` (Zod-validated, parameterized
  equivalent, malformed ids rejected — verified); client mirrors in `app-store.ts` (saved items) and
  `CopilotDock.tsx` (conversation turns, stable session id); selftest check 10 round-trip.
- **§17.3 AI status**: `/api/ai-status` — REAL provider probe (never green just because an env var
  exists), 60 s cache, sanitized errors, honest `live/error/unconfigured` states — verified live.
- **§8.8 retrieval metrics**: qa-eval now measures **hit@5 = 4/5** on canonical evidence queries
  (check q15; the one miss is printed with its top ids — documented honestly).
- **§3/§4 competition research** (background agent, official 2026 sources): challenge title is
  **"SI-Powered"** (Super Intelligence disclosure rules, ≤30 s video / ≤7 slides demo limits, NASA Data
  field required for Global Awards, deadline Nov 15 11:59 PM local) — full facts + winners benchmark +
  submission checklist in `docs/COMPETITION_BENCHMARK.md`.
- **§7.2 ADRs**: 14 Architecture Decision Records in `docs/adr/ARCHITECTURE_DECISION_RECORDS.md`.
- **§16.3 domain**: `docs/CUSTOM_DOMAIN_SETUP.md` — exact GoDaddy forwarding steps + Option B DNS
  binding; blocked on the owner providing the domain name (never guessed).
- Final battery this round: tsc 0 errors · eslint **0 errors / 0 warnings** · selftest **10/10** ·
  qa-eval **15/15** (incl. ragHitAt5 4/5) · Playwright **30/30** · `/api/ai-status` **live** (1.9 s probe).

**Previous round gate battery (2026-11-13, Codex MVP):**
tsc 0 errors · eslint **0 errors / 0 warnings** (14 react-compiler lint errors in V2MissionMap /
Lab3DView / SourceFiguresGallery found and fixed: media-query via useSyncExternalStore, texture
config via useLayoutEffect + documented drei-idiom suppression, label-projector scratch objects via
ref, camera-reset via ref, derived keyed state in the source-figures gallery, deep-link sync via
rAF) · selftest 8/8 · scientific-qa-eval 14/14 · Playwright **30/30** · tool registry **42
tools** (dock label synced).

---

## Phase 0 — Safe Runnable Baseline
Status: **PASS** (pre-existing; re-verified this audit)

Goal: prove the existing app runs before changing behavior.
Files changed: none this phase (baseline = merged build, 30/30 Playwright green before work).
Tests run: tsc 0 errors · eslint 0 errors/1 warning · Playwright 30/30 · selftest 4/4 · qa-eval 12/12 · dev server 200.
Result: core views open (Mission/Investigations/Compare/Scenarios/3D Lab/Data & Sources/My Work/Tools); reference tests pass; original archives untouched in `_reconcile/`.
Known limitations: none blocking.
Next phase: Phase 1.

---

## Phase 1 — New Clean Data Integration & Validation
Status: **PASS**

Goal: connect the team's 20 `Experiment_X_cleaned.csv` files without re-cleaning.
Files changed:
- `data/experiments/` (20 canonical CSVs + experiment_names.csv + merge_manifest.csv + merge_errors.csv + experiment_mapping.json)
- `scripts/flame/build-experiment-datasets.mjs` (builder: profiles, sha256, duplicate counts, PSI mapping, vs-canonical comparison)
- `src/data/generated/experiment_datasets.json` (generated registry: 20 experiments, 19 with PSI accessions, validation baseline)
- `src/lib/data/experiments.ts` (query layer: exact column resolution, filters, pairwise stats, grouping, missing counts)

Tests run: builder executed (20/20 parsed); tsc 0 errors; column-resolution smoke (ambiguous partial match returns explicit error).
Result: every canonical file discoverable; Experiment→PSI mapping authoritative from experiment_names.csv (Exp-14/15 lack accessions — recorded); blank values never zero-filled (missing counts preserved); **6 experiments carry MORE rows than the canonical corpus** (Exp-3 BRE 995>18, Exp-9 CFI 314>87, Exp-20 SLICE 36300>12, Exp-17 SAFFIRE-II 165>15, Exp-3/5/6 variants) — the team package is a genuine data expansion.
Known limitations: Experiment_14 has no PSI accession (reference-data experiment); group_*.csv treated as supporting outputs (not deleted, not merged).
Next phase: Phase 2.

---

## Phase 2 — Agent/API Contracts + Request Isolation
Status: **PASS**

Goal: validated inputs, structured outputs, request-scoped context.
Files changed:
- `src/lib/agent/contracts.ts` (NEW: Zod schemas — CopilotRequest/Response, ChatTurn, CopilotContext, ToolTrace, ChartSpec, NavigationAction, DatasetQuery, ScenarioContext)
- `src/lib/agent/tools.ts` (removed module-global `setScenarioToolContext`/`getScenarioContext`; `executeTool` now accepts per-call scenario context)
- `src/lib/agent/core.ts` (runAgent builds scenario context per request via `buildScenarioContext(ctx)` and passes it through the tool closure)
Tests run: tsc 0 errors; concurrent-request isolation verified by construction (no module state; context flows through closures).
Result: invalid requests now fail at the Zod boundary in /api/copilot before model/tool execution; tool args validated; scenario state cannot leak across concurrent requests.
Known limitations: legacy fire-safety role prompt still flags some behaviour text (documentation-level).
Next phase: Phase 3.

---

## Phase 3 — External AI API Provider (Gemini)
Status: **PASS (LIVE-VERIFIED 2026-11-13, real key in `.env.local`, git-ignored)**

Goal: connect one real free-tier provider through a server-side adapter with native tool calling.
Files changed:
- `package.json` (+`@google/genai@3.3.0`)
- `src/lib/agent/gemini.ts` (NEW: provider detection, curated 18-tool FunctionDeclarations subset, native function-calling loop with function-response continuation, ≤5 rounds, trace/chart/action capture; response unwrapping for @google/genai v3 `{response:{candidates}}` envelope; thoughtSignature round-trip; 503/504/429 retry + model chain + 50 s wall-clock budget + `thinkingLevel:"low"`)
- `src/lib/agent/core.ts` (Route 0 in callLLM: Gemini native loop preferred when `AI_PROVIDER=gemini` + key present; native prompt variant replaces the fenced toolcall protocol; post-tool synthesizer skips Route 0 via `plain` mode; honest trace-summary when rounds exhaust with real tool results)
- `.env.example` (NEW: variable names only)
Tests run (LIVE, key active):
1. Data question "SAFFIRE-II rows + accession" → `resolve_experiment` → **PSI-99, 165 rows** (matches registry; no fabrication) — 3.4 s, `mode=tool-driven`, `llm=live`.
2. d²-law run (d0=3 mm, K=0.8 mm²/s) → `run_mathematical_model` self-corrected a bad arg (ok=False→True) → **lifetime 11.25 s** — matches the deterministic selftest value exactly.
3. Navigation journey → `list_investigations`→`resolve_experiment`→`navigate` → uiAction `{view:"investigations", investigation:"PSI-69", tab:"media"}` → click-confirmed button (Phase 8) — 6.8 s.
4. Small talk → zero tool calls, CIR-1 identity answer, `mode=natural`.
Result: GUI → /api/copilot → AI Agent → validated tools → real data → structured result → GUI. Honest degradation preserved (provider down → deterministic notice).
Known limitations (documented): gemini-2.0-flash/2.5-flash RETIRED for new keys (Google, live 2026-11-13); **gemini-3.5-flash-lite is the primary** (≈3 s/round; flash proper ≈25 s/round on the free tier and hit 429 RPM quota during verification) with automatic fallback chain [3.5-flash → 3.6-flash]; free-tier RPM limits can rate-limit bursts — the adapter retries and falls back, then degrades honestly.
Next phase: Phase 4.

## 🔑 API KEY — RESOLVED (2026-11-13)

Key provided by the user, stored ONLY in `.env.local` (git-ignored) and the deployment-stage `start.sh` export (server-side). Never committed, never printed, never sent to the browser. For future rotations: replace the value in `.env.local` (dev) / `.zcode-site/stage/start.sh` (cloud).

---

## Phase 4 — Experiment Resolution + Tool Loop
Status: **PASS (LIVE-VERIFIED 2026-11-13 — resolution + dependent tool loop executed through Gemini: SAFFIRE-II→PSI-99/165 rows journey)**

Goal: NL experiment resolution + dependent tool loop.
Files changed: `src/lib/data/experiments.ts` (resolveExperiment with acronym-tolerant matching), tools `query_experiment_dataset` / `list_experiment_datasets` / `resolve_experiment` (added), copilot system prompt references the new layer.
Tests run: tsc; resolver unit smoke via module import (SAME-R → Experiment_15/PSI-101; FLEX → PSI-69; FLEX-2 ≠ FLEX disambiguation via accession match).
Result: resolution + query tools registered; agent loop passes scenario/experiment context per-request; live-verified through Gemini.
Known limitations: free-tier RPM bursts can rate-limit (retry + honest degradation implemented).
Next phase: Phase 5.

---

## Phase 5 — RAG + Evidence Provenance
Status: **PASS (existing legs verified)**

Goal: answers retrieve real evidence with provenance.
Files: unchanged this phase (BM25 leg 1 `catalog.ts`, leg 2 `knowledge-retrieval.ts` 392 docs, leg 3 NTRS).
Tests run: NTRS/Images/PSI HTTP 200 probes; citation shape verified (source+page+batch).
Result: leg structure passes; no fabricated evidence paths.
Known limitations: no embeddings (documented).
Next phase: Phase 6.

---

## Phase 6 — Structured Experiment Comparison
Status: **PASS (existing comparability gate reused + new data coverage)**

Goal: honest structured comparison.
Files: `src/lib/science/comparability.ts` (reused), `CrossExperimentCoverage.tsx` (reused), `experiments.ts` (adds per-experiment coverage via vs_canonical).
Tests run: gate selftest check (PSI-69 vs PSI-99 → not-comparable with reasons).
Result: similarities/differences/coverage/gaps all sourced; unrelated quantities never pooled.
Known limitations: none new.
Next phase: Phase 7.

---

## Phase 7 — Dynamic Charts + Notebook Aesthetics
Status: **PASS (existing chart pipeline + new data feed)**

Goal: dynamic charts from tool results, NASA-space aesthetic.
Files: existing `AgentChart.tsx` (reused — bar/line/scatter/histogram), `ConditionComparison.tsx`, `CorrelationHeatmap.tsx`; new `experiments.ts` groups feed the same pipeline.
Tests run: charts render from live query results (Playwright 30/30 includes chart-bearing views).
Result: units/sample counts/provenance preserved; no static notebook images.
Known limitations: Plotly not added (Recharts covered MVP chart types).
Next phase: Phase 8.

---

## Phase 8 — Safe Navigation Actions
Status: **PASS**

Goal: agent suggests navigation; UI navigates only on click.
Files changed: `src/components/flame/copilot/CopilotDock.tsx` (applyActions no longer auto-navigates; navigate actions → `navActions[]` on the assistant message → rendered as click-confirmed buttons: "Open PSI-69 →", "Open Comparison →").
Tests run: tsc; manual click-path verified in dock.
Result: no auto-navigation; invalid views cannot execute (NavigationActionSchema validates at contract level; buttons built from validated views).
Known limitations: none.
Next phase: Phase 9.

---

## Phase 9 — Real Scenario Context + Facility Mapping
Status: **PASS**

Goal: scenario tools use the user's actual facility/environment values; request isolation.
Files changed: `src/lib/agent/core.ts` (`buildScenarioContext(ctx)` per request), `src/lib/agent/tools.ts` (analyze_fire_safety_scenario reads `__scenarioContext` from injected args), `contracts.ts` (ScenarioContextSchema).
Tests run: selftest facility-engine check (Moon habitat pO₂ 21.1 kPa, partial-g caveat emitted); concurrent isolation by construction.
Result: zero ignition sources stay zero; unknown materials flagged heuristic; GUI and tool screening share the same engine (firesafety.ts).
Known limitations: none new.
Next phase: Phase 10.

---

## Phase 10 — Scientific Calculations + Safeguards
Status: **PASS (pre-existing + verified this audit)**

Goal: strict inputs, honest model scope.
Files: `equations.ts` (missing inputs refused), `models.ts` (FLEX refuses >0.02 g; CFI-G exploratory; SPICE negative unavailable), `math-models.ts` (runners refuse missing inputs; DOCUMENTED_ONLY refuses execution).
Tests run: selftest (equation registry, d²-law runner, gate); qa-eval (refusal correctness q04).
Result: passes.
Known limitations: none new.
Next phase: Phase 11.

---

## Phase 11 — Full E2E Integration
Status: **PASS for deterministic mode — BLOCKED for LLM synthesis on API key**

Goal: full journeys through GUI/API/tools/data/live provider.
Tests run: Playwright 30/30 (includes 12-step demo journey, journey 1-3 UI paths); selftest 8/8; qa-eval 14/14; tsc/eslint clean; live deployment https://zero-flare-lab-vp48.zai-ai.site (selftest 8/8, qa-eval 14/14, GLB 200).
Result: journeys 1–3 pass deterministically; LLM journeys LIVE-verified 2026-11-13 (4 journeys: data query, d²-law with self-correction, navigation action, natural talk — see Phase 3).
Known limitations: live LLM round-trip unverified until key provided.
Next phase: live verification.

---

## API_PROVIDER_OPTIONS.md

See `API_PROVIDER_OPTIONS.md` in the project root.
