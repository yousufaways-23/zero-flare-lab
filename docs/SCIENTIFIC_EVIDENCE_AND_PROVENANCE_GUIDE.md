# SCIENTIFIC EVIDENCE AND PROVENANCE GUIDE — ZERO FLARE

## The evidence chain (implemented)

```
SOURCE → RAW DATA → VALIDATION → NORMALIZATION → ANALYSIS → CALCULATION/MODEL → FINDING → LIMITATION → RESEARCH GAP → NEXT INVESTIGATION
```

Concretely, in the running app:

1. **SOURCE** — NASA PSI public download endpoint; every table carries `sha256`, `bytes`, `source`, fetch ledger reference (data/ingest/psi_fetch_ledger.json).
2. **RAW DATA** — `data/raw/*.csv` immutable; never edited; 19/19 byte-identical to the project manifest + 3 ledger-recorded extras.
3. **VALIDATION** — corpus builder counts duplicate rows (50), parse failures (620), per-column fill rates, types, min/max/mean. Missing stays missing (never zero-filled).
4. **NORMALIZATION/GENERATED** — `src/data/generated/*.json` rebuilt by documented scripts; each records `generatedAt` + `method`.
5. **ANALYSIS** — EDA in the investigation Data tab: histograms/scatters computed live from recovered rows with sample size.
6. **CALCULATION/MODEL** — equation registry (63 equations, 68/68 tests) and guarded models (FLEX refuses >0.02 g).
7. **FINDING** — findings registry with tier labels (verified / negative-result / source-reported).
8. **LIMITATION** — per-investigation integrity cases surfaced as amber panels; model cards carry limitations.
9. **RESEARCH GAP** — gap registry with explicit statuses.
10. **NEXT INVESTIGATION** — gap shelf in My Work; CIR-1 external triage links NTRS leads.

## Evidence classes (permanent labels in the UI)

| Class | Meaning | Where enforced |
|---|---|---|
| OBSERVED | value from a NASA source row | charts/tables show source + sha256 |
| DERIVED | computed by the registry/engine (pO₂, Ri, scores) | calculators + FacilityAnalysisPanel |
| REPORTED | metadata recorded by PSI (objectives, hardware) | investigation records |
| ASSUMED | user scenario inputs (geometry, flows) | scenario builder labels |
| SIMULATED | none shipped (no synthetic rows presented as data) | policy |
| PREDICTED | guarded model output (FLEX, labelled UNCALIBRATED relative score) | model playgrounds |
| AI-INTERPRETED | CIR-1 narrative | tool trace + citations always shown |
| EXTERNAL LEAD NOT INGESTED | NTRS results | labelled in copilot answers + gaps view |
| ROADMAP / NOT IMPLEMENTED | dense retrieval, server sessions, astronaut avatar | README + reports |

## Rules enforced in code

- A numerical score is never presented as a probability (scenario engine + FLEX).
- "No data" is differentiated: absent / not-indexed / inaccessible / no-evidence-found.
- External search failure is never rendered as "no evidence exists".
- Co-recorded graph edges are labelled non-causal.
- Negative model results stay visible and are never promoted.
- Every chart shows sample size, filters, units, and source.
