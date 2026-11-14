# SCIENTIFIC UPGRADE TECHNICAL REPORT — ZERO FLARE / FLAME EVIDENCE LAB

**Date:** 2026-11-12 · **Scope:** comprehensive scientific upgrade per the project brief, executed on the merged codebase (V2 design base) with all working features preserved.

---

## 1. What was inspected and extracted

### Archives audited (beyond the previously integrated corpus)
| Source | Contents | Disposition |
|---|---|---|
| `Important Documents.zip` (13 PDFs) | Official NASA facility/investigation documents: CIR Operations, Fluids & Combustion Facility, MSG, ACME, BASS, DAFT, FLEX, SAME, SPICE, SAFFIRE, SLICE, Combustion Science overview, NTRS 20050215648 | **Fully ingested** (batches B-20261112-004/005) |
| `paper/` (35 journal PDFs) | Combustion and Flame / Fire Safety Journal peer-reviewed papers tied to the investigations | 17 most relevant **fully ingested** (batches B-20261112-006/007); remainder registered for batch ingestion |
| `References & some PDFs.zip` | Ross *Microgravity Combustion* treatise, Turns *Introduction to Combustion*, project knowledge-base PDFs, full_inventory.csv, image_catalog.html | Extracted and staged; treatises registered as reference corpus (large-scale ingestion queued behind the same pipeline) |
| 22 PSI investigation archives | Metadata zips, experimental tables, reports, representative images | Experimental-table CSVs previously extracted; **all 19 verified SHA-256 byte-identical to the canonical corpus** |

### Extraction results (through the governance pipeline — nothing bypasses receipts)
- **Text**: page-level extracts indexed for retrieval — knowledge index grew 317 → **367 documents** across 307 source documents.
- **Figures**: **216 source figures** extracted to `data/media/batches/` with per-figure provenance (source document, page, batch, dimensions).
- **Entities**: knowledge entities 109 → **115**; batch entities detected 247 + 43 + 405 + 163 across the four document batches.
- **Equations**: 155 equation *candidates* detected in the papers (flagged as candidates — never auto-promoted to the verified registry, per model-governance policy).
- **Integrity**: global audit after explicit `confirm-all-uploads` — 0 cross-batch duplicate conflicts.

## 2. New datasets, figures and scientific assets integrated

1. **Source-figure gallery** (`/api/source-media` + `SourceFiguresGallery`): every investigation's Media tab now renders figures extracted from its original source documents — e.g., PSI-69 renders the FLEX facility PDF pages — with citations (source file, page, ingestion batch) and the AI-description labelling rule ("AI-described" badges are AI-INTERPRETED; page context is the scientific caption).
2. **Knowledge-base retrieval leg**: `knowledge/index.json` (367 extracts) is now a first-class retrieval corpus.
3. **Canonical-corpus provenance confirmed twice**: PSI endpoint → corpus (manifest) and team archives → corpus (byte-identity), independently.

## 3. Visualization improvements per investigation

- **Correlation analysis matrix** (`src/lib/science/correlation.ts` + `CorrelationHeatmap`): within-experiment Pearson matrices computed client-side from recovered rows — pairwise n shown per cell, pairs below n=8 declined (never imputed), sparse columns (<60% fill) excluded, and an explicit exploratory-association-only disclaimer (no cross-investigation pooling). Verified on PSI-69: O₂-initial × extinction-diameter r = 0.41; N₂-initial × He-initial r = −0.79 (physically consistent — diluent fractions are complementary).
- The existing column profiles, histograms, scatters, raw-row explorer and quality strips carry over onto the new design base.
- **Honesty boundary maintained**: investigations without usable numeric datasets present their metadata/media evidence instead — no decorative charts.

## 4. 3D models and interaction improvements

- **CIR rebuilt** (`ApparatusModels.tsx`): from a 4-part shell to an **8-component assembly** — chassis, instrument panel grid, ≈100 L combustion chamber (end caps + optical window + cradle), diagnostics package (camera + radiometer aimed at the window), gas delivery module (bottles + feed line), avionics/power bay, thermal duct, handling rails. Part registry now paraphrases the public NASA facility description per component with explicit "approximate reconstruction" notes.
- **New interaction modes** (all apparatus models):
  - **Cutaway** — outer skins render translucent to reveal internals;
  - **Exploded** — assemblies separate along their axes;
  - **Isolate part** — one component highlighted, others faded (0.06 opacity, depth-write off);
  - **Camera presets** — Default / Front / Interior / Top with damped lerped transitions;
  - Auto-rotate pauses automatically in non-default modes.
- **Honesty**: models remain labelled "schematic — source-based reconstruction"; internal geometry is annotated "approximate reconstruction — not engineering CAD". Official NASA ISS/Perseverance GLBs unchanged with provenance.
- Verified visually: cutaway and exploded captures (`docs/screenshots/v2base-cir-cutaway.png`, `v2base-cir-exploded.png`).

## 5. AI and scientific retrieval improvements

- **Hybrid RAG leg 2**: `search_knowledge_base` tool — BM25 (k1=1.4, b=0.72, stopword-filtered, singularised) over the source-document text index with citation-rich results (source file, page, batch, snippet). CIR-1 now runs **28 tools** in two retrieval layers: corpus records (leg 1) + source documents (leg 2) + live NTRS (external).
- **Scientific QA evaluation** (`/api/scientific-qa-eval`): **12 questions with known evidence-based answers across 11 domains** (gas laws, investigation discovery, corpus integrity, model applicability/refusal semantics, cross-study validity, combustion theory, model validation, hardware provenance, detection science) executed against the deterministic tool layer — **12/12 pass**, including the FLEX lunar-gravity refusal asserted as the *correct* outcome (`expectOk: false`).
- **Honesty preserved**: the eval evaluates the deterministic layer the LLM composes from; LLM synthesis quality is provider-dependent and explicitly not claimed. No fine-tuning claims anywhere.
- V2 retrieval/typography base: results also verified through the interactive paths (correlation tooltips, figure captions).

## 6. Tests performed and remaining limitations

### Tests
| Gate | Result |
|---|---|
| `tsc --noEmit` | 0 errors |
| `eslint src` | 0 errors, 0 warnings |
| Playwright full suite | **30/30** (header matrix 360→1920, flows, console-error monitors ×8, axe a11y ×6, guided-demo journey) |
| `/api/selftest` | 4/4 (63 equations · 68/68 tests; gate; engine; physics) |
| `/api/scientific-qa-eval` | **12/12** |
| `next build` | BUILD_ID written |
| Visual captures | mission / data / sources / correlation / CIR cutaway+exploded on the V2 base |

### Design-base migration (V2 UI/UX)
- Second version's measured design system is now the base: Sora/Inter/JetBrains Mono type system, logo-measured cosmic palette (#030b26 navy, #4784d9 plasma primary, nebula accents), NASA-flame-scale gradients, deterministic starfield layer, glass panel system (`.panel`/`.panel-glass`/`.tag`/`.journey-chip`/`.fidelity-badge`).
- All merged-app structural classes re-anchored onto V2 tokens; every light-panel hardcode audited and converted (Compare matrix, raw-rows tables, Lab3D links, media placeholders).

### Remaining limitations (documented, not hidden)
1. LLM synthesis layer requires the platform provider; the deterministic layer (all 28 tools, equations, gate, engines) is fully verified locally.
2. Large reference treatises (Ross, Turns) are staged but not yet text-indexed — queued behind the same ingestion policy (bounded pages).
3. Dense embeddings for RAG remain unconfigured; the BM25 hybrid is the current measured baseline.
4. Equations detected in papers (155 candidates) require human review before any registry promotion — by policy.
5. CIR internal geometry is an approximate reconstruction from public descriptions, explicitly not NASA CAD.
