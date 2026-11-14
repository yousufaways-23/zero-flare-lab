# FLAME EVIDENCE LAB — Origin ⇄ Current UI/UX Merge Report

**Date:** 2026-11-12 · **Scope:** merge the origin version's design language (from the Chat-session
archive screenshots + M1–M8 reports) into the current M0–M12 platform, keeping every current
capability intact.

---

## What the origin version did best (ported)

| Origin signature | Where it now lives |
|---|---|
| Blueprint engineering-grid backdrop over deep navy | `globals.css` — `.space-deep::before` page layer + `.blueprint-overlay` above the 3D hero scene |
| Gradient headline (white → cornflower → nebula violet) | `.hero-gradient-text` on the mission H1 second line (ember eyebrow + CTAs kept as the warm accent) |
| Glow-bloom CTAs | `.cta-glow` (ember, hero CTA + nav Copilot) / `.cta-glow-cool` (teal, secondary CTA) |
| Teal monospace instrument readouts | `.mono-readout` — stat numerals, environment-card spec values, atlas rows line, journey-card spec line |
| Glassy pill chips over imagery | `.glass-chip` — gravity + O₂ chips over each environment-card photo |
| Cinematic photo cards with gradient blend (no hard image/text cut) | Mission "Research environments" journey cards — gradient blend into `#0a1030` body, unified colour-grade overlay, hover lift, per-card description, "Select environment →" hover affordance |
| Header instrument chips — environment selector + data badge | MegaNav right cluster: `ISS · ~10⁻⁶ g` env chip (click → Mission) + `2,009 rows · 22 tables` badge (widest screens) |
| Resizable Copilot drawer (drag handle + presets, persisted) | CopilotDock — left-edge drag handle (double-click resets), S/M/L presets, `copilot-dock-width` in localStorage; collapse keeps the conversation |
| Evidence-lab card rhythm | Investigations atlas — data-rich cards (≥100 rows) earn a glowing blue left accent bar + `data-rich` tag; metadata-only note restyled muted amber; hover lift + "View investigation →"; keyword `+N` overflow chips; `1 table` grammar; "In compare" selected state |

## What the current version kept (its strengths)

- Full-viewport 3D mission scene (Earth/Moon/Mars/ISS) — now with a boosted 3-point light rig
  (ambient 0.55, warm key 2.0, cool rim fill) so hardware no longer reads as a flat gray blob.
- Consolidated IA: Mission / Investigations / Scenarios / Compare / 3D Lab / Data & Sources /
  Research Tools + global Copilot — unchanged, plus mega menus and command palette.
- Evidence-grade provenance everywhere (SHA strips, honesty notes, gap statuses) — untouched.
- The four-pillar Scenarios lifecycle, Fire Safety Assistant, Gap Explorer, AI Evaluation panel,
  animated 3D demos — untouched functionally.

## Fixes made during the merge (found by verification)

1. **Header crowding (the V7-audit defect, re-introduced then properly fixed):** adding the origin
   nav chips squeezed the brand block into one-word-per-line wrapping. Root fix per the audit
   contract — `whrink-0`/`whitespace-nowrap` three-region header, nav labels collapse to icon-only
   below `xl`, `Ingestion & Sources` renamed **Data & Sources** (origin IA name), env chip at
   ≥1536px, data badge + search text at ≥1728px. Geometry test now passes at all 10 viewports
   (360→1920, zero overflow, zero collisions).
2. **Breadcrumb clipping:** the hero's negative top margin overlapped it — breadcrumb now hidden on
   Mission (full-bleed hero sits flush under the header).
3. **Research-panel table headers invisible** (light `text-foreground` on light panel): global CSS
   `.research-panel [data-slot="table-head"]` forces dark text.
4. **Mobile 3D-label collision:** DOM-projected scene labels ("ISS (CIR/ACME era)") landed on the
   headline at ≤640px — labels now hidden on mobile (destination chips select the same
   environments).
5. **Mobile honesty caption:** "Schematic scene" note now static below the hero on mobile instead
   of overlapping CTAs.
6. **Mobile atlas overflow (148px):** bottom gaps section's implicit grid column was content-sized —
   explicit `grid-cols-1 min-w-0` fixes it.
7. **Floating Copilot FAB clearance:** all view roots given `pb-24` so trailing content can scroll
   clear of the fixed button.
8. Mobile nav scroll affordance: stronger right-edge fade mask + scrollbar styling.

## Verification

- `eslint` clean; `tsc --noEmit` — 0 errors in `src/` (scripts/skills pre-existing only).
- Header geometry matrix (360/390/430/768/1024/1280/1366/1440/1600/1920): **0 overflow, 0 clipped,
  0 collisions** (`scripts/check_header_geometry.sh`, re-runnable).
- Browser-verified with agent-browser: hero, environments, atlas, workspace detail, copilot dock
  (width presets 440→620 + drag 620→680, persisted), scenarios, 3D Lab, compare, Data & Sources,
  mobile 390px across all views (0 overflow).
- VLM design-QA rounds: round-1 issues (grid, glow, breadcrumb, stat legibility) all confirmed
  fixed in round 2/3; final delivery set 5/6 OK (the one flag is the inherent fixed-FAB/scroll
  coincidence, not a layout defect).
- No page errors in `dev.log`.
- Screenshots: `download/screenshots/merge-01…06`.

## Honest limitations

- The 3D scene remains a schematic reconstruction (labelled as such); the light-rig change is
  presentation only.
- The env chip / data badge are informative (not a dropdown selector) — environment switching stays
  on the Mission page, where the full context lives.
- Copilot drawer resizing is desktop-only (sm+); mobile keeps the full-width bottom sheet.
