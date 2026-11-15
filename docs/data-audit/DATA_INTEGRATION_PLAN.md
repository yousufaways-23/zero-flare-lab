# Data Integration Plan

Generated 2026-11-15T16:18:14.078Z (research doc §2.8/§4.6 — controlled flow, human review for
ambiguous items, immutable raw layer).

## Keep separate (authority layers — never merged)
1. Official NASA PSI experimental observations (deployed corpus).
2. Official NASA reports/standards (linked context: NTRS 20170000230 etc.).
3. Independent peer-reviewed research (37 PDFs — cited, labeled independent).
4. Property references (NIST) — model inputs only, never observations.
5. Media (NASA Images API) — context imagery, never numeric evidence.

## Integrate next (highest value, schema-safe)
1. **Time-series layer** — selected `group_*.csv` splits (start with
   Experiment_4 1.6GB series behind an on-demand loader, not the main bundle).
2. **Per-investigation coverage upgrades** — map the 533 raw PSI CSVs to the
   variable dictionary; surface per-variable coverage in the Data & Sources matrix.
3. **Paper→investigation links** — attach the 37 archived PDFs as
   downloadable citations on their investigation pages (provenance chain, no numbers).

## Rules (unchanged)
- Raw layer immutable; transforms versioned; every derived field carries
  equation id + inputs + version; external items pass authority/license/unit/
  compatibility review before staging; CIR-1 never writes to the corpus.
