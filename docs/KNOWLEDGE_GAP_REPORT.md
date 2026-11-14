# KNOWLEDGE GAP REPORT — ZERO FLARE (M12)

## Gap registry (implemented statuses)

The gap engine distinguishes: **absent** (no data exists in PSI) · **not-indexed** (exists in the field, not in our corpus) · **inaccessible** (source unreachable) · **no-evidence-found** (searched, nothing found — one source, not proof of absence). Key registry entries:

1. **Partial-gravity combustion (0.02–0.65 g)** — no combustion outcome data exists in PSI; microgravity and 1-g evidence only bound the answer. Surfaced wherever gravity is partial (facility engine caveats, FLEX refusal, coverage strip).
2. **Suppressant comparability** — tests are not condition-matched; no suppressant ranking offered anywhere.
3. **Historical media batch** — 2,393 recorded binaries inaccessible; replaced by verifiable NASA Images API media, gap displayed in Data & Sources.
4. **SAFFIRE-I (PSI-98), STDCE-2 (PSI-47), DAFT/DAFT-2, LUCI** — recorded table/metadata coverage gaps from the corpus build.
5. **Outcome coverage** — only 4 of 22 tables carry outcome labels; the rest are condition inventories (badged, excluded from effect claims).

## Evidence Coverage Map (implemented, review round 2)

The **Evidence Coverage Map** now ships as a real matrix on the Mission section (`src/components/flame/mission/EvidenceCoverageMap.tsx` + `src/lib/science/coverage.ts`): **24 investigations × 8 dimensions** (gravity, O₂, pressure, fuel/material, scale, hardware, outcome, measurement context), every cell derived from the canonical catalog:

- **observed** (green) — outcome-bearing records exist (e.g., PSI-159 CFI-G: observed gravity + O₂ + outcome);
- **reported** (blue) — PSI metadata/conditions recorded;
- **conditions-only** (amber) — table columns exist but no outcome labels (e.g., PSI-100 SAFFIRE-III, PSI-98 SAFFIRE-I inventories);
- **not-in-corpus / not recorded** — with the standing honesty note: corpus status ≠ field-wide absence; use CIR-1's NTRS check before citing a gap.

Live summary counts render under the matrix; cells are tooltips carrying the derivation note per investigation × dimension.

## Historical dimensions reference

gravity · oxygen · pressure · fuel/material class · geometry/scale · hardware/facility · outcome · measurement method — each cell distinguishes observed / derived / modelled / no-outcome-data / not-indexed / inaccessible / not-found / planned.

## External gap discovery (implemented)

`check_gap_externally` runs local corpus search + LIVE NTRS search and classifies:
- literature EXISTS externally → "gap is in OUR index, not the field" (with NTRS links),
- nothing found externally → "consistent with a genuine research gap (still not proof of absence)",
- NTRS unavailable → "external check unavailable; local status stands; no claim made".
`search_external_literature` provides live NTRS results as labelled leads. Saved gaps in My Work store the external-hit count at save time.

## Evidence-to-gap transition (implemented)

Data-quality weaknesses become explicit outputs: a gap can be saved from any investigation's Gaps tab, from CIR-1, or from Compare's gap discovery into the My Work gap shelf with notes and external context — turning missingness into a next research action rather than a dead end.
