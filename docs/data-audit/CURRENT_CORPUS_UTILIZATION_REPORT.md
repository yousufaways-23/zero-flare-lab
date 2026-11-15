# Current Corpus Utilization Report

Generated 2026-11-15T16:18:14.074Z. Compares the deployed corpus against the full Fold Data archive.

## What the deployed corpus uses

| Asset | Count |
|---|---|
| Bundled experimental tables | 24 |
| Bundled rows | 2085 |
| Investigation metadata records | 25 |
| Experiment datasets (team cleaned package) | 20 |
| Source figures served | 468 (recovered index) |
| Knowledge-index documents (BM25) | 392 |

## What the archive contains beyond the deployed corpus

| Layer | Files | Notes |
|---|---|---|
| Raw per-investigation PSI packages (unpacked) | 591 files | 18 investigations incl. imagery, docs, raw instruments |
| Team cleaned/group CSVs (processed_data) | 136 | the 20 cleaned tables FEED the deployed corpus; group_* splits are additional |
| Research papers (PDF) | 37 | bibliography sources — linked, not numerically ingested |
| Colab notebook (pipeline provenance) | 1 | experiments_colab_from_scratch.ipynb — the origin of processed_data |
| Analysis JSON | 1 | NASA_All_Experiments_Analysis.json — visualization requests + recommendations |

## Utilization verdict

The deployed corpus ingests the **team-cleaned tabular layer completely**
(all 20 cleaned CSVs → 24 canonical tables). The **raw PSI
packages** (533 CSVs among 591 files, incl. instrument binaries,
imagery and per-run docs) are present in the archive but only partially
represented — their tabular extracts largely overlap the cleaned package,
while imagery/docs/media remain linked-context, not numeric evidence
(consistent with the platform rule: media is never merged as measurements).
The largest unexploited numeric asset is the per-group split CSV
`Experiment_4/group_fab1cf220de8c0.csv` (~1.6 GB — time-series level data
beyond the per-test summaries; candidate for a future time-series view).
