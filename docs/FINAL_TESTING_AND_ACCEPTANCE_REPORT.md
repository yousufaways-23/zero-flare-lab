# FINAL TESTING AND ACCEPTANCE REPORT — ZERO FLARE (M12)

**Run date:** 2026-11-12 · **Build:** merged final tree · **Server:** Next.js dev :3000 (dev) + production `next build` verified

## 1. Deterministic scientific gate — `/api/selftest`

```
ok: true — 4/4 checks
  equation-registry     63 equations · 68/68 tests pass
  comparability-gate    verdict: not-comparable (PSI-69 droplet vs PSI-99 vehicle-scale) — reasons stated
  facility-engine       pO₂ 21.1 kPa · regime Buoyancy-dominated · top 37/100 · 3 recommendations · partial-g caveat emitted
  physics-ri            Ri(1 g, 5 cm/s) = 261.51 · Ri(µg) = 2.62e-4
```

## 1b. Review round 2 additions (continuous loop)

- **Playwright suite extended to 30 tests, all passing**: the original 15 (header matrix + flows) + 8 console/page-error monitors (all 8 core routes clean) + 6 axe-core a11y scans (zero critical/serious violations after fixing: Slider thumb labelling in the primitive, brand/atlas/heat-map accessible-name mismatches, and a nested-interactive `role="img"` wrapper) + 1 guided-demo journey test (round 3).
- **Functional gap closed**: My Work save affordances (`SaveItemButton`) now wired on investigation headers, gap cards, equation registry rows, equipment records and the media lightbox, plus a new CIR-1 tool `save_research_item` (27 tools) that saves and navigates to My Work — the shelf is reachable from where research actually happens.
- **Evidence Coverage Map shipped** (audit P1 #1): 24×8 matrix on Mission with observed/reported/conditions-only/not-recorded statuses derived from the corpus; verified visually (docs/screenshots/14-coverage-map-1440.png) and consistent with the documented outcome-table definition.
- **Rate limiting implemented** on /api/copilot, /api/ingest, /api/external (per-IP fixed windows, 429 + Retry-After).
- Stale 3D-lab legend corrected (official NASA GLBs now exist); footer no longer obscured by the floating CIR-1 button.

## 1c. Review round 3 additions (continuous loop)

- **Guided demo mode shipped** (audit §39 / P1 #10): 8-step deterministic walkthrough launched from the Mission hero or command palette; the CIR-1 step seeds a runtime-composed, labelled replay from the live registries (registry equation ×2 → 21.10/21.27 kPa; comparability gate verdict; FLEX domain guard; corpus totals). E2E `demo.spec.ts` walks the full journey and validates the numbers and the gate banner — suite now **30/30**.
- **Official-archive provenance verified**: 19 experimental CSVs from the supplied data.zip PSI archives ingested through the governance pipeline (B-20261112-002/003 + confirm-all-uploads + global audit) and **all 19 SHA-256 byte-identical to the canonical corpus**.
- **Latent `model_id` bug fixed**: model cards' JSON field is `model_id`, not `id` — `getFlexCard().id` was `undefined` in the live `model_validation_metrics` tool summary and the demo reply; interface and usages migrated.

## 2. Static analysis

- `npx tsc --noEmit` → 0 errors
- `npx eslint src` → 0 errors, 0 warnings

## 3. E2E suite (Playwright, headless Chromium) — 15/15 pass

- **Header layout matrix (10/10):** brand/nav/actions slots exist (non-vacuous), never overlap, actions right of brand, `scrollWidth ≤ width+1` at 360/390/430/768/1024/1280/1366/1440/1600/1920.
- **Flows (5/5):** mission→investigations; hash deep link `#investigation/PSI-69`; CIR-1 dock opens with identity; `#compare` renders gate; `#my-work` at 390px without overflow.

## 4. Live API verification

| Endpoint | Result |
|---|---|
| POST /api/copilot | graceful deterministic degradation when LLM unconfigured (no fabricated answer) — the honesty contract path |
| POST /api/ingest | receipt B-20261112-001: sha256, extracted dataset (2 rows), 1 entity, model-impact NONE |
| GET /api/ingest/media | path traversal attempt → 403 forbidden_path (allowlist enforcement) |
| GET /api/selftest | ok:true (above) |

## 5. Visual verification (13 screenshots reviewed — docs/screenshots/)

Mission hero (brand art + emblem + 3D journey + env switcher) · investigations atlas · PSI-69 workspace (metadata + integrity cases) · compare gate · scenarios lifecycle (screening + risk ranking + live readouts) · lab3d · data & sources · my work · 768/390 responsive states · CIR-1 dock open.

**Defect found → fixed → re-verified:** real nav overlap at 1440px (Research Tools × env chip) + vacuous legacy test → structural three-region header fix, markers added, env chip repositioned, guard strengthened; re-run 10/10 + fresh screenshots clean.

## 6. Production build

`next build` completes; BUILD_ID written; route table `/` static + 5 API routes; only expected standalone-tracing warnings (ingest dynamic filesystem access — documented in SECURITY_AND_PERFORMANCE_REPORT.md).

## 7. Acceptance criteria scorecard

| Criterion (audit Part VIII) | Status |
|---|---|
| No microgravity result silently presented as lunar/Mars evidence | PASS — gravity classes + gate + refusals |
| Every model has domain, baseline, evaluation, limitations, deployment status | PASS — model cards + registry |
| Every comparison carries a condition audit | PASS — gate banner before matrix |
| Negative results remain visible | PASS — CFI-G, SPICE, absent models |
| Heuristic scores not labelled probabilities | PASS — engine + UI labels |
| Raw corpus verified manifest + SHA-256 | PASS — canonical manifests |
| Every chart shows n, units, source, limitations | PASS — chart specs + provenance strips |
| External sources labelled not-ingested | PASS — copilot + gaps UI |
| All tools one typed contract; deterministic numeric truth | PASS — 26 tools + bounded loop |
| Refusals explain reason + next action | PASS |
| Small talk does not trigger retrieval | PASS |
| Tool budget bounded | PASS (≤6 calls, 2 rounds) |
| 390px no horizontal overflow | PASS (E2E) |
| Keyboard navigation + focus states | PASS (manual + Radix) |
| Reduced motion respected | PASS |
| No critical/serious axe violations on core routes | PASS (round 2: 6/6 scans) |
| Zero console/page errors on core routes | PASS (round 2: 8/8 routes) |
| API rate limiting on heavy routes | PASS (round 2) |
| WebGL failure has usable fallback | PASS (starfield/brand hero + schematic fallbacks) |
| Every 3D model has fidelity badge | PASS (schematic vs official) |
| Clean install + reproducible build | PASS |
| No production secrets in repo | PASS |
| External fetch failures observable | PASS (taxonomy + honest UI states) |
| Demo independent of external network (core path) | PASS — corpus, charts, calculators, gate, engines all local |

## 8. Sign-off

All P0 requirements pass; P1 product-critical requirements pass; remaining items (auth/rate-limit, Postgres deployment, dense retrieval, axe-core CI, LLM provider credentials, full data.zip structured ingestion) are explicitly documented as roadmap with owners' next actions in FINAL_VERSION_MERGE_REPORT.md §5.
