# DATA QUALITY AND EDA REPORT — ZERO FLARE (M12)

## Canonical corpus integrity (verified at merge)

| Metric | Value | Verification |
|---|---|---|
| Investigations (PSI metadata records) | 24 | PSI repository API + fetch ledger |
| Experimental tables | 22 | data/raw SHA-256 recomputed at build |
| Manifest-identical tables | 19/19 byte-identical | pairwise SHA-256 vs project manifest |
| Additional tables | 3 (PSI-142, PSI-47, PSI-98) | recorded in fetch ledger; badged "+ fetch ledger" in UI |
| Rows | 2,009 | recomputed by build_corpus |
| Columns | 231 | recomputed |
| Duplicate rows | 50 | counted and displayed (never silently dropped) |
| Parse failures | 620 | counted per-column; displayed; S-rule count 623 documented as rule difference |
| Cross-version byte identity | 19 shared CSVs identical O↔S | pairwise SHA-256 during M0 |

## Data layers (implemented)

- **raw** — immutable CSVs + ledgers (hashes in CANONICAL_DATA_MANIFEST.json)
- **generated** — corpus.json, investigations.json, graph.json, gaps.json, findings.json, equipment.json, atmospheres.json, media_index.json, sources.json, evaluation.json (all with generatedAt/method)
- **ingest (live)** — the ported batch pipeline: `data/raw/batches`, `data/extracted/batches`, `data/media/batches`, registry/batches/cumulative/receipts + knowledge entities/index (atomic writes, checkpoint/resume)
- **historical (recorded)** — B-20261109-001…004 receipts displayed as recorded history with the absent-media honesty alert

## EDA capabilities (in-product)

- Per-table column profiles: type inference, fill rate, parse failures, min/max/mean (tools + UI)
- Real charts: histograms and XY scatters computed from recovered rows at render time — sample size shown, provenance strip included
- Duplicate and quality flags per table surfaced in Investigation workspace + Data & Sources ledger
- Missing-data policy: blanks rendered as "—", never zero; planned conditions never presented as measured results

## Live ingestion verification (M12 + review round 3)

- `POST /api/ingest` with a real CSV → receipt `B-20261112-001`: 1 file processed, sha256 recorded, 1 extracted dataset (2 rows), 1 entity detected, model impact: NONE (verbatim policy statement). Cumulative registry, dedup registry, and knowledge index written atomically.
- **Official-archive ingestion (round 3)**: the 19 experimental-table CSVs extracted from the supplied data.zip PSI archives were ingested as batches **B-20261112-002** (10 files, 1,278 rows, 15 entities) and **B-20261112-003** (9 files, 717 rows, 31 entities); `confirm-all-uploads` + global audit completed. **All 19 files are SHA-256 byte-identical to the canonical data/raw corpus** — the provenance chain (PSI public endpoint → recovered corpus → team-supplied official archives) is independently verified end-to-end.

## Known quality boundaries

1. The 2,393 historical media binaries are NOT present in any supplied artifact — the merged build's media registry ships only the 41 verified NASA Images API records.
2. data.zip's PSI archives (22 zips + facility PDFs + reference textbooks + ~30 journal papers) are registered raw sources for batch ingestion; they are not yet counted as structured ingested evidence.
3. Dense-retrieval-ready document index exists (Second's 317-doc knowledge index as reference artifact); production retrieval remains BM25 over the canonical corpus.
