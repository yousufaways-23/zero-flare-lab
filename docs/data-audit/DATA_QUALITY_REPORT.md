# Data Quality Report — Fold Data archive audit

Generated 2026-11-15T16:18:14.072Z from AUDIT_PROGRESS.json (818 files, 13.28 GB).
Counts below are recomputed from the actual files — see ARCHIVE_INVENTORY.csv for per-file provenance.

## Duplicate-row taxonomy (corpus)

The corpus records **50 exact duplicate rows** across 24 tables
(retained and displayed, never silently dropped). Per the audit rules these are
*exact duplicates within a recovered table* — they are NOT independent repeated
trials; per-condition replicates are preserved as separate rows wherever the
source distinguishes them. No row was deleted: deduplication is a documented,
reversible transform left to the analysis layer.

## Parse failures (corpus)

**656 parse failures** are counted and shown in Data & Sources.
Classification per research doc §2.3: encoding/delimiter, decimal/locale,
multi-row headers, unit strings mixed into numerics, unexpected NA tokens,
malformed records, and format limitations. The raw tokens stay in the
recovery ledger (data/ingest/receipts) for every failure — nothing is
dropped without a record.

## Missingness semantics

The platform distinguishes not_measured / not_reported / not_recovered /
parse_failed / not_applicable / unknown. Missing is NEVER zero-filled:
charts show missing counts, and the comparability gate treats "not recorded"
as unknown — never as a match (see comparability.ts, research doc §6.2).

## Archive-level quality signals (this audit)

| Signal | Value |
|---|---|
| Files inventoried | 818 (100% of the extracted archive) |
| Files with SHA-256 | 818 |
| Files profiled | 818 |
| Unreadable | 0 |
| Profiler errors (recorded, file intact) | 0 |
| CSV/tabular files | 669 |
