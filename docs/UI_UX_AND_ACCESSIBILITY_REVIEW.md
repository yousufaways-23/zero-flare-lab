# UI/UX AND ACCESSIBILITY REVIEW — ZERO FLARE (M12)

## Verified layout (visual evidence: docs/screenshots/, 13 captures)

| Viewport | Checks | Result |
|---|---|---|
| 1440px desktop | 8 nav sections + search + CIR-1 + emblem fit; hero stat cards legible; comparison gate banner; scenario lifecycle; 3D lab | pass (01–08, 13) |
| 768px tablet | nav collapse, scenario layout, no overflow | pass (09, 10) |
| 390px mobile | horizontal-scroll chip nav, no overflow (scrollWidth = 390), My Work cards stack | pass (11, 12) |

## Real defect found and fixed during verification

The first 1440px screenshot exposed a genuine collision ("Research Tools" trigger overlapping the environment chip) **and** revealed the inherited header test was vacuous (no `data-header-slot` markers existed). Fixed structurally: three-region header (brand | nav min-w-0 + overflow-hidden | actions), env chip moved to ≥1728px, slot markers added, and the Playwright guard made non-vacuous (asserts the three regions exist and never overlap at all 10 widths). Re-ran: 10/10 pass; re-screenshot confirms clean layout.

## Progressive disclosure (implemented)

- Summary-first finding cards; raw-rows explorers collapsed by default (first 100 rows).
- Scenario facility analysis: ranked band cards; driver breakdown expandable per compartment.
- Research Tools (Model Studio, variables, equations, diagnostics) reachable via grouped nav + Ctrl+K palette rather than competing top-level items.
- Equation/test details under expandable panels; evidence packets export on demand.

## Accessibility measures (implemented and/or verified)

- Keyboard: Ctrl+K palette; all interactive controls are buttons/inputs with focus styles; dialog focus handling via Radix primitives; Escape closes drawers.
- ARIA: nav landmarks + aria-current, aria-pressed on environment options, aria-expanded on disclosure buttons, role=status on gate verdicts, aria-live on processing states, labelled tab groups.
- Reduced motion: `prefers-reduced-motion` respected (CSS + framer-motion `useReducedMotion` + camera-travel snapping); content renders fully visible if animations/observers never fire (transform-only entrances).
- 3D fallback: WebGL failure degrades to static starfield/brand-art hero and schematic fallback panels; GLB failures degrade to NASA source links (error boundary).
- Colour semantics: ember/emission palette with non-colour-duplicated status (text labels accompany bands and badges).
- **axe-core automated sweep (review round 2, now in CI)**: `tests/e2e/quality.spec.ts` runs axe (wcag2a/2aa/21a/21aa) on mission/investigations/compare/scenarios at 1440px and mission/my-work at 390px — **6/6 pass, zero critical/serious violations** after fixes:
  - Radix Slider thumbs received `aria-label` (the primitive now forwards aria labelling props from Root to every thumb — the accessible `role="slider"` lives on the thumb, not the root);
  - brand button accessible name now derives from its visible text (label-content-name-mismatch resolved);
  - atlas compare buttons' accessible names start with their visible text ("Compare —"/"In compare —");
  - scenario heat-map cells: `role="img"` wrapper removed (interactive content cannot nest in a presentational role) and visible text now forms the accessible name, with the schematic-not-CFD caveat in `title`.
- **Console/page-error monitoring (review round 2)**: all 8 core routes verified with zero uncaught page errors and zero console errors.

## Motion and honesty in visuals

Meaningful motion only: page/card entrances, chart transitions, orbit controls, reduced-motion-aware auto-rotate. Decorative effects never carry scientific meaning; 3D scenes carry fidelity badges ("schematic — source-based reconstruction" vs "official NASA 3D model — geometry unchanged"); every medium links its source and credit.
