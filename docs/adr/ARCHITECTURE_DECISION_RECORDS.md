# Architecture Decision Records — ZERO FLARE / FLAME EVIDENCE LAB

Status: live engineering record of the merged build (supersedes informal decisions from the four legacy codebases). Format per brief §7.2. Each ADR: Problem → Options → Criteria → Decision → Reasons → Trade-offs → Risks → Testing → Reconsider when.

---

## ADR-001 — Modular monolith on Next.js 16 App Router (no microservices)

- **Problem:** What runtime architecture hosts 8 UI sections, ~30 API routes, scientific computation, an AI agent and 3D, for a judge-facing product with one small team and a 512 MB cloud instance?
- **Options:** (a) Next.js full-stack monolith; (b) separate Nest/Express API + Next frontend; (c) microservices per domain.
- **Criteria:** deployability to a single 0.5-vCPU instance, dev speed on Windows, type-sharing between UI and science layers, cold-start, review effort.
- **Decision:** (a) modular monolith — App Router pages + route handlers, science/agent/data as `src/lib/*` modules with explicit boundaries.
- **Reasons:** one deploy artifact, shared TypeScript contracts (`src/lib/agent/contracts.ts`), no cross-service latency for tool loops that make 3–5 round trips per request.
- **Trade-offs:** no independent scaling of AI routes (acceptable: rate-limited 10/min/IP, quota-honouring adapter).
- **Risks:** accidental coupling — mitigated by layer rules (UI never imports corpora; science never imports React; LLM never computes physics).
- **Testing:** Playwright 30/30, selftest 9/9, qa-eval 14/14 run on every release checkpoint.
- **Reconsider when:** concurrent multi-tenant load or heavy batch ingestion exceeds a single instance.

## ADR-002 — V2 measured design system as the UI base

- **Problem:** Which visual language for the merged product?
- **Options:** V1 deep-space theme, V2 Sora/navy/plasma system, V3 utilitarian, V4 grouped-nav neutral.
- **Decision:** V2 as base (Sora/Inter/JetBrains Mono; #030b26 navy, #4784d9 plasma blue, flame-scale gradients), upgraded with V1's identity (emblem, starfield) and V4's grouped navigation.
- **Reasons:** V2's system had the most complete token set and AA-verified contrast fixes (CTA gradient #b45a2b→#a34d28 for white text).
- **Trade-offs:** migration cost from V1 components — paid during the merge with structural class names preserved.
- **Testing:** axe scans (6 viewports) in quality.spec; header overlap matrix 360→1920.

## ADR-003 — Static build-time data registries for the scientific corpus

- **Problem:** How does the app access 20 experiment datasets, 63-equation registry, 11 math models, 392-doc knowledge index without bloating the client bundle or a live DB?
- **Options:** runtime DB reads; runtime JSON reads from disk; build-time imported JSON registries.
- **Decision:** generated registries under `src/data/generated/*.json`, statically imported into server modules; knowledge index bundled into the server chunk; team CSVs stay on disk and are read per query from `data/experiments/` (`query_experiment_dataset`).
- **Reasons:** immutable evidence corpus (honesty contract: SHA-256-tracked, never overwritten), fast deterministic queries, no DB migration burden for read-only science, and the cloud stage needs no database server.
- **Trade-offs:** rebuild step (`node scripts/flame/rebuild-all.mjs`) on corpus change — acceptable (corpus is immutable during a cycle).
- **Risks:** large-corpora bundle growth — mitigated: client bundles never import corpora (verified in deployment pruning).
- **Testing:** qa-eval q10 corpus-total marker; selftest dataset integrity.

## ADR-004 — Provider-independent AI adapter with three routes

- **Problem:** Which LLM integration survives free-tier volatility, provider retirement and platform constraints?
- **Options:** hardcode one provider; platform SDK only; adapter with routes.
- **Decision:** Route 0 = Gemini Developer API native tool-calling (`@google/genai`); Route 1 = any OpenAI-compatible endpoint via `LLM_BASE_URL/LLM_API_KEY/LLM_MODEL`; Route 2 = platform SDK. Keys server-side only; model chain fallback [primary → 3.5-flash → 3.6-flash]; retry/backoff on 503/504/429; 50 s wall-clock budget per request.
- **Reasons:** live-verified 2026-11-13/14 — Google retired gemini-2.0-flash/2.5-flash for new keys mid-cycle, proving the adapter's value; flash-lite ≈3 s/round vs flash ≈25 s.
- **Trade-offs:** adapter complexity — contained in `src/lib/agent/gemini.ts` (~230 lines).
- **Testing:** 4 live journeys (data query, d²-law self-correction, navigation, small talk); honest-degradation path verified.
- **Reconsider when:** a provider offers stable free-tier streaming + identical tool semantics.

## ADR-005 — Curated native tool subset (18 of 42) with mirrored prompt

- **Problem:** Gemini 3.x thinking exceeded all deadlines with the full 42-tool catalogue + research system prompt (>32 s before round 1).
- **Options:** trim system prompt; shrink declarations; curated subset; disable thinking.
- **Decision:** `GEMINI_TOOL_ALLOWLIST` of 18 core tools declared natively; system prompt mirrors the subset via `buildSystemPrompt(ctx, {nativeToolCalling:true})`; all 42 tools remain available to the deterministic layer and text-protocol routes; `thinkingLevel:"low"`.
- **Reasons:** measured 21.6 s → ~3 s per round; the subset covers the evidence→analysis→navigation journeys.
- **Trade-offs:** some niche tools (media search, gap registry) not natively callable by the LLM — they remain reachable through the UI sections; documented.
- **Testing:** live journeys pass; qa-eval unchanged 14/14.

## ADR-006 — Honest degradation ladder (never fabricate availability)

- **Problem:** what does CIR-1 say when the provider is down/rate-limited?
- **Decision:** live → deterministic notice listing the UI sections that keep computing; tool-trace-only → honest trace summary (introduced 2026-11-14); never a fabricated answer; `/api/copilot` marks `llm:"live"|"unavailable"` and `mode:"natural"|"tool-driven"`.
- **Testing:** verified by killing provider access; qa-eval q04-style refusals.

## ADR-007 — Group-aware ML validation + pre-declared selection policy

- **Problem:** how are ML models compared fairly on 262 rows with strong condition clustering?
- **Options:** random KFold; group KFold; nested CV; single holdout.
- **Decision:** condition-group K=4 (primary) + test-date group K=8 (secondary); replacement bar ≥ +0.01 AUC declared before running; ties → simpler interpretable model; negative results retained (`data/ml/experiment_log.json`).
- **Reasons:** same-condition rows correlate (chamber calibrations); random splits leak.
- **Trade-offs:** no nested CV (262 rows, small grids) — documented as mild optimism, mitigated by bootstrap CI.
- **Testing:** selftest check 9 (`ml-experiment-registry`) asserts artifact↔log consistency.

## ADR-008 — Physics stays deterministic; the LLM orchestrates, never measures

- **Problem:** should the LLM compute results or call tools?
- **Decision:** every number in a reply comes from a tool (equations, model runners, dataset stats, d²-law runner); the agent plans/interprets only; refusal paths preserved (FLEX refuses >0.02 g; missing inputs refused; DOCUMENTED_ONLY models refuse execution).
- **Testing:** qa-eval q04/q06/q11; selftest 1–8; live journey 2 (self-corrected tool call returned the exact deterministic value 11.25 s).

## ADR-009 — RAG as measured BM25 + metadata-filtered legs (not embeddings yet)

- **Problem:** retrieval architecture for 392 docs + PSI corpus + figures?
- **Options:** BM25; embeddings; hybrid; reranking.
- **Decision:** leg 1 BM25 over evidence catalog, leg 2 knowledge-retrieval over the bundled 392-doc index (entities + investigation map), leg 3 external NTRS for corpus-absence questions. Provenance (doc id, page, batch) preserved per chunk.
- **Reasons:** deterministic, auditable, zero-infra; embedding leg adds infra without a measured need yet — documented as the next upgrade, gated on a measured retrieval-quality gap.
- **Testing:** qa-eval citation checks; NTRS 200 probes.

## ADR-010 — React Three Fiber + drei with official NASA assets and honesty labels

- **Problem:** 3D strategy for Mission map, CIR, apparatus.
- **Decision:** R3F/drei; official NASA ISS + Perseverance GLBs (meshopt-optimised) labelled "Official NASA 3D model (optimised)"; reconstructed/scenario assets labelled "conceptual illustration"; scene labelled NOT-to-scale, NOT-a-simulator; drei `<Html>` avoided (React 19 race) in favour of the DOM LabelProjector.
- **Trade-offs:** bundle weight — mitigated with suspense prelude, lazy GLB loads, mobile fallbacks.
- **Testing:** header/overlap matrix, axe on mission viewports, live GLB 200 probes.

## ADR-011 — Recharts for data-driven charts (Plotly deferred)

- **Problem:** charting library for agent-generated + UI charts.
- **Decision:** Recharts via the AgentChart pipeline (bar/line/scatter/histogram + heatmaps/correlation components) with units/sample-size/provenance preserved; Plotly not added for MVP chart types.
- **Reconsider when:** 3D surface/contour scientific plots become a measured need.

## ADR-012 — ZCode Sites deployment with strict stage pruning + runtime-secrets sourcing

- **Problem:** 200 MB package cap, linux-only binaries, no secret injection on the platform.
- **Decision:** standalone-build stage pruned to runtime essentials (78.6 MB, 2067 files: .next+node_modules+public+data/{experiments,extracted,ingest,sync}+package.json+server.js+start.sh); linux sharp binaries overlaid at `node_modules/@img` (win32 excluded — package check enforces); `start.sh` sources an optional user-created `runtime-secrets.sh` for the AI key (platform has no secret store; .env* never packaged; the security tool correctly blocks credential writes by the agent).
- **Testing:** local standalone boot (200 + selftest 9/9 on port 3100), cloud health check, live selftest/qa-eval probes post-deploy.

## ADR-013 — Release gate battery (must stay green before any checkpoint)

- **Decision:** `npx tsc --noEmit` · `npx eslint src` (0 errors/0 warnings) · Playwright 30/30 (header overlap matrix, flows, console monitors, axe) · `/api/selftest` (now 9 checks incl. ML registry) · `/api/scientific-qa-eval` (14 checks) · `next build` standalone · live-site probes after deploy.
- **Reasons:** every past regression (nav overlap, stale corpus marker, deploy blockers) was caught or would have been caught by this battery.

## ADR-014 — Workspace persistence layer (activated this round)

- **Problem:** the brief forbids an unused DB schema; My Work currently persists to localStorage (zustand persist), which does not survive devices and is not server-verifiable.
- **Decision:** activate the Prisma/SQLite layer for durable research artefacts (saved items, sessions, copilot conversations, scenario snapshots) behind typed route handlers with parameterized queries; localStorage remains the offline mirror.
- **Status:** implemented this round — see `src/app/api/workspace/*` and `docs/IMPLEMENTATION_STATUS.md` M10 section.
- **Testing:** API integration tests + UI round-trip; selftest persistence check.
