# FLAME EVIDENCE LAB — Enhancement Brief Implementation Report
**Date:** 2026-11-12 · **Base:** M0–M12 rebuild (V6 spec) + Project Implementation & Enhancement Brief · **Run:** enhancement pass

## Scope of this run

The M0–M12 rebuild (previous session) already delivered the consolidated IA, Investigations
workspace with 7 embedded tabs, Compare with graph slices, the four-pillar Scenarios lifecycle,
the 3D Lab with 6 apparatus models and photo carousels, Knowledge Gap Explorer with live NTRS
verification, Ingestion & Sources, the 29-tool contextual Copilot, and the verified equation /
model registries.

This run closed the remaining gaps against the **Project Implementation & Enhancement Brief**:

| Brief § | Requirement | Status after this run |
|---|---|---|
| §7.1 | Facility layout upload | **Done** — image attached as visual reference, explicitly NOT parsed; structured JSON import/export of compartments |
| §8 | Fire Safety Assistant in Scenarios | **Done** — full AI assistant with facility context, evidence-grounded analysis, follow-up questions, save-to-shelf |
| §9.4 | Animated 3D experiment demonstrations | **Done** — stage-timeline animated demos for burner / droplet / duct apparatus, honest "illustrative animation" labelling |
| §15 | Evaluation framework | **Done** — real computed metrics (P@K, nDCG, data quality, model cards) + honest absences panel |
| §11.1 | Copilot typed context completeness | **Done** — facility, scenario pillar and equipment context now flow into the agent |

## What was built

### 1. Shared facility state (§7.1/§8/§11.1)
- `app-store.ts`: new `FacilityState` slice (name, compartments, layout image reference) with
  persistence (image bytes stay in-memory only); `selectedEquipment` and `scenarioPillar` context.
- `lib/science/screening.ts` (new): the material-evidence table, ventilation options and the
  deterministic screening arithmetic extracted into ONE shared module — the screening panel and
  the AI assistant compute identical scores from identical inputs.

### 2. Facility screening upgrades (§7.1)
- State lifted into the store (config survives navigation; defaults seeded SSR-safely).
- **Layout reference upload**: PNG/JPEG/WebP/GIF up to 4 MB, click-to-enlarge, explicit
  "not parsed — no automatic extraction claimed" honesty note.
- **JSON import/export** of the compartment configuration (real round-trip, validated).
- "Ask the Fire Safety Assistant" CTA that seeds the assistant with the analysis request.
- Mobile header-wrap fix (was causing 62px horizontal overflow at 390px).

### 3. Fire Safety Assistant (§8) — `scenarios/FireSafetyAssistant.tsx`
- Embedded in the Scenarios experience below the facility screening; shares the scenario
  environment and facility configuration.
- Server side (`agent/core.ts`): new `role: "fire-safety"` prompt section — structures analyses as
  (1) risk assessment → (2) compartment ranking review with deterministic-score comparison and
  divergence notes → (3) prevention → (4) detection + sensor placement → (5) suppression context
  → (6) integrated system notes → (7) evidence gaps; **asks follow-up questions instead of
  inventing missing parameters**; distinguishes validated findings / engineering judgement /
  AI interpretation; refuses certified-procedure framing.
- `/api/copilot` route validates a compact typed facility context (numbers/ids only — no image
  bytes, max 12 compartments).
- UI: reliability-bands banner, facility summary chips with live screening scores, suggested
  follow-up questions, inspectable evidence trace, save-report-to-session-shelf.
- **Browser-verified live run**: produced a structured analysis citing PSI-99/PSI-26/PSI-25,
  flagged unspecified materials as evidence gaps, and compared its ranking with the
  deterministic screening scores.

### 4. Animated 3D experiment demonstrations (§9.4) — `lab3d/ExperimentDemo.tsx`
- Stage-timeline demos driven by a shared mutable progress ref (rAF loop outside React;
  canvas reads it in `useFrame` — no per-frame re-renders).
  - **Burner family** (ACME, SPICE): chamber prep → fuel+co-flow (tracer particles) → ignition
    (spark flash + light) → flame growth → quasi-steady burn with diagnostic ping rings → flow
    termination → radiative extinction.
  - **Droplet family** (MDCA): deployment → needle retraction → hot-flame ignition → spherical
    burn with droplet regression → hot-extinction → **cool-flame regime** (faint blue shell —
    the FLEX discovery) → burnout.
  - **Duct family** (SAFFIRE): flow establishment → upstream ignition → card-to-card flame
    spread front → steady spread with instrumentation → burnout.
- Play/pause/reset, timeline scrubber, clickable stage list with per-stage explanations and
  progress windows; reduced-motion disables continuous playback (stage stepping only).
- Apparatus models gained a `hideFlame` demo mode so the static flame proxies don't fight the
  animation; support facilities (CIR rack, MSG) show an honest "no standalone flame test
  documented" notice instead of a fake demo.
- Labelled everywhere as **illustrative animation — NOT a physical simulation**.

### 5. Evaluation framework (§15) — `scripts/build_evaluation.ts` + AI Evaluation panel
- Re-runnable script computing REAL metrics from the actual data layer:
  - **§15.1 search**: 14-query labeled judgement set (documented as platform-authored) over the
    same BM25 the agent uses → **P@1 = 1.000, P@3 = 0.571, R@3 = 0.810, nDCG@5 = 0.889**,
    per-query table included.
  - **§15.2–15.3 extraction/normalization**: 22 tables · 2,009 rows · SHA-256 provenance
    coverage 100% · unit coverage 3.9% (only where source headers carried units — never guessed)
    · mean fill rate 89.4% · 620 numeric-parse failures and 50 duplicate rows counted and shown.
  - **§15.4 evidence reliability**: findings with basis+caveat 100%, gaps with spec reference
    100%, investigations with source URL 100%.
  - **§15.6 models**: FLEX v2 (grouped AUC 0.882 + bootstrap CI), CFI-G (exploratory), SPICE
    (negative result) — from the model cards.
  - **§15.7–15.9 honest absences**: CV (IoU/Dice), uncertainty (PICP), dense retrieval, CFD
    validation — declared not-implemented with reasons, never faked.
- New **AI Evaluation** panel in Research Tools (nav, mega-menu, command palette, breadcrumbs).

### 6. Copilot context completeness (§11.1)
- Copilot dock now passes scenario pillar, selected equipment and (on the Scenarios view) the
  compact facility configuration; the system prompt renders them as typed context lines.
- 3D Lab gained an "Ask the Copilot about this apparatus" button; equipment selection updates
  the shared context.

## Verification (this run)
- `eslint` clean (old `flame_src/` snapshot excluded from linting — it is archived source, not
  the live app); `tsc --noEmit` **0 errors in src/**; 54/54 equation reference tests pass.
- Browser-verified with agent-browser at 1440×900 and 390×844:
  - Scenarios renders facility screening + Fire Safety Assistant; the "Ask…" CTA produced a
    live evidence-grounded analysis (tool trace + citations + follow-ups present).
  - 3D Lab: animated demonstration renders and **plays** (progress advanced to 56% during the
    test), scrubbing and stage jumping work, support-facility honest notice verified.
  - Research Tools → AI Evaluation panel shows all §15 sections with the real metrics.
  - Mobile 390px: no horizontal overflow (fixed the one defect found — screening header wrap).
  - No page errors in `dev.log` (only benign THREE.Clock deprecation warnings from three.js).
- Screenshots: `download/screenshots/{scenarios-fsa, scenarios-fsa-reply, lab3d-demo,
  eval-panel, mobile-scenarios, final-scenarios-desktop}.png`.

## Honest limitations (unchanged or newly scoped)
1. The Fire Safety Assistant's analyses are AI-generated research decision support; the
   deterministic screening arithmetic remains the auditable baseline the assistant is compared
   against.
2. The 3D demonstrations are keyframe animations over schematic reconstructions — no combustion
   solver runs; stage descriptions paraphrase documented NASA PSI experiment flow.
3. Retrieval evaluation uses a 14-query platform-authored judgement set — small and
   self-labeled, reported as such; dense/hybrid retrieval remains unconfigured.
4. Layout images are attached as visual references only; no OCR/CAD parsing is claimed.
5. All pre-existing M0–M12 limitations (unrecovered historical media binaries, BM25-only
   retrieval, no VRM avatar) still apply and remain displayed in-app.
