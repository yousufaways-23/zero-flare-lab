# EXECUTION REPORT — ADVANCED DATA ACQUISITION, DASHBOARD GENERATION & 3D MISSION INTEGRATION

**Date:** 2026-11-13 · **Project:** ZERO FLARE / FLAME EVIDENCE LAB (merged codebase, V2 design base) · **Scope:** Tasks 1–5 of the advanced acquisition brief, executed live.

---

## 1. Investigations searched and verified

- Live PSI endpoints re-verified before any scraping (the same `psi.nasa.gov/geode-py/ws` search / metadata / download endpoints the project's M0 recovery used, confirmed returning HTTP 200 with Elasticsearch-shaped JSON on 2026-11-13).
- **Discovery**: the Combustion Science research-area filter returns **24 investigations** (all 24 already in our corpus — confirmed complete). Keyword sweeps with 24 search terms (Combustion, Flame, Flammability, Ignition, Extinction, Suppression, Smoke, Aerosols, Soot, Droplet Combustion, Solid Fuels, Oxygen Concentration, Airflow, ACME, BASS, SAFFIRE, SAME, FLEX, CFI, SoFIE, FM2, FLARE, SPICE, SLICE) across the full result set discovered a **union of 52 investigations — 28 beyond our list**, including PSI-108 (STDCE-1), PSI-179 (ASE), PSI-181 (solders), plus cross-area physical-science records.
- SoFIE / FM2 / FLARE keyword hits resolve to existing accessions (PSI-25, PSI-20/23/68/69/98/99/100) — **no separate SoFIE/FM2/FLARE records exist in PSI yet** (consistent with the challenge brief: those datasets are expected in the future).
- Every discovered record verified by title + accession; DOIs captured in the manifest.

## 2. CSV/XLSX datasets discovered, downloaded and imported

- **40 experimental-table CSVs downloaded live** (per-file download endpoint, retries + backoff, sha256 recorded) — plus 2 downloaded in the pre-fix first run (PSI-108).
- **ZIP central-directory Range inspection** implemented and executed on 4 zips per investigation (PSI-108/179/181 etc.): outcomes recorded per zip in the manifest — several report `range requests not supported`, one reports zip64 layout; **no bulk archive was downloaded** (policy honoured).
- **Reconciliation** (the scientific filter):
  - **19 of the downloads are byte-identical (SHA-256) to our canonical corpus** → recorded as *provenance confirmations* — the canonical 22 tables are now independently verified against the LIVE PSI endpoint, not just the team archive. Duplicates removed from data/raw.
  - **2 genuinely new tables adopted**: PSI-108 STDCE-1 (Surface Tension Driven Convection — microgravity thermocapillary fluid physics, directly relevant to airflow/heat-transfer analysis in fire safety) → `data/raw`, corpus rebuilt.
  - **21 non-combustion tables relocated** to `data/acquisition/other-domains/` with reasons (biofilms, protein crystals, solders, magnetorheological fluids…) — *not imported*, per the relevance policy.

## 3. New database tables, measurements and variables added

- Corpus: **22 → 24 tables, 2,009 → 2,085 rows, 231 → 249 columns**; investigations 24 → **25** (PSI-108 appended with full metadata: objectives, approach, hypothesis, DOI 10.60555/…, hardware, keywords — fetched live from PSI).
- `data/ingest/acquisition_manifest.json`: per-investigation discovery paths, table download records (URL, bytes, sha256, status), ZIP inspection notes, image hits, reconciliation record (confirmations / adoptions / relocations).

## 4. Data gaps filled and gaps that remain

- **Filled**: the Combustion Science area is confirmed complete (24/24); PSI-108 (fluid physics) added; canonical-corpus provenance now triple-verified (manifest → team archives → live endpoint).
- **Remain**: PSI-179's 1,932 files live inside ZIPs whose endpoints reject Range inspection (recorded inaccessible — no bulk download per policy); large reference treatises still queued for bounded indexing; partial-gravity combustion data still does not exist in PSI (field-wide gap, correctly displayed).

## 5. Important scientific images and published figures integrated

- **NASA Images API**: 8 targeted queries (FLEX, BASS, SAFFIRE, SAME, ACME, SPICE, MDCA, CIR) → **42 image records with nasa_id/center/date/credit** captured in the acquisition manifest for editorial review (the existing 41-record media catalogue already surfaces authentic NASA imagery per investigation).
- **216 source figures** from the earlier document ingestion continue to render in investigation Media tabs with page/batch provenance (see the previous round's report); no illustrative image is presented as experimental evidence.

## 6. New charts and comparisons generated for each investigation

- **ConditionComparison** (automatic, every investigation): when a table carries a low-cardinality categorical column + numeric columns, the Data tab renders grouped means with observed min–max ranges and per-group n; groups with n < 3 flagged; descriptive-only language enforced. PSI-108's new tables flow through automatically.
- **CrossExperimentCoverage** (Compare view, corpus-wide): observed **oxygen-concentration ranges across 7 investigations** plotted as floating range bars — PSI-10 Flame Design 0–85%, PSI-159 CFI-G 12–85% (the challenge's "up to 85% oxygen"), PSI-39 CFI 17.8–21%; mole-fraction columns normalized ×100 with the **exact scale conversion declared on-panel**; pressure/airflow remain unit-strict — single-unit-class variables show the honest "no comparable coverage" note instead of a forced comparison. Flow-rate columns excluded from concentration ranges.
- **CorrelationHeatmap** (previous round) continues to compute within-table Pearson matrices for every table with ≥3 well-filled numeric columns — now including PSI-108.

## 7. Version 2 3D assets successfully migrated

- `MissionMap.tsx` (854 lines) copied from Version 2 into `src/components/flame/mission/V2MissionMap.tsx` and adapted:
  - V2 `ENVIRONMENTS` inlined (destinations/anchors preserved exactly);
  - imports de-coupled from the V2 store;
  - the file passes typecheck in our tree.
- **Scene contents now live on the Mission hero**: Earth with NASA Blue Marble day/night shader + cloud shell + atmospheric rim, Moon and Mars with real textures, **official NASA ISS 3D model on an inclined orbit** (meshopt GLB), official Perseverance model on Mars, conceptual spacecraft marker with honesty labels, transfer arcs, WebGL-failure fallback.
- **Previous models preserved**: the original `MissionScene.tsx` remains in the tree untouched (documented backup); the static starfield fallback also remains.

## 8. Improvements to Mission 3D interaction

- **Per-body visibility toggles** (Earth / Moon / Mars / ISS / Rover / Craft) in a scene toolbar;
- **Isolate via toggling** (hide everything else) and **"Reset scene"** restoring the complete scene and flying the camera home (`resetSignal` → CameraRig home-lerp);
- V2's existing interactions preserved: camera flight to selected destinations, orbit/zoom controls, projected DOM labels with analytic occlusion, reduced-motion support.

## 9. Tools and libraries installed and retrieval methods used

- **Zero new runtime dependencies** — acquisition implemented in Node 24 with native `fetch` (allowlist-enforced HTTPS, loopback/private-host rejection, credential rejection, error-page sniffing), Range-based ZIP central-directory parsing (native Buffer/struct math), sha256 dedup (node:crypto), Playwright (already installed) for verification.
- Methods: direct metadata/search JSON API; per-file selective download; HTTP-Range ZIP inspection; NASA Images API; content-hash reconciliation. Robots/low-rate policy honoured (0.4 s spacing, backoff).

## 10. Tests performed, failures and remaining limitations

| Gate | Result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `eslint src` | clean |
| Playwright full suite | **30/30** (header matrix, flows, console monitors, axe, demo journey) |
| `/api/selftest` | 4/4 |
| `/api/scientific-qa-eval` | **12/12** (corpus-total marker updated to the new canonical 2,085 — the eval tracks the live corpus) |
| `next build` | BUILD_ID written |
| Visual captures | mission V2 scene (overview + ISS flight), coverage chart, PSI-69 data/correlation, sources |

**Failures encountered and fixed during execution**: PSI-108 metadata shape differences (lowercase keys, `added`/`images` arrays) handled; missing `images` array crash fixed; the spec-path hardcode in `generate_data_layer.py` fixed; first-run download collision resolved by content-hash reconciliation; qa-eval stale marker updated.

**Remaining limitations**: PSI-179 ZIP contents inaccessible without bulk download (recorded, not hidden); non-combustion discovered tables staged but not imported (policy); SoFIE/FM2/FLARE/PSI-179 data do not exist as usable PSI experimental tables yet (future additions, e.g. LUCI/FM2, will flow through the same pipeline); pressure/airflow cross-experiment strips remain single-unit-class (honest refusal, coverage matrix referenced); treatise-scale indexing still queued.
