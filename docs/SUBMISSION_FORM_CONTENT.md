# Space Apps 2026 Submission — Form Content

Ready-to-paste text for the official NASA Space Apps submission form:
project summary (short + extended) and per-screenshot captions/details for
the UI/UX section. Screenshot files live in `docs/screenshots/`.

---

## Project Summary (short)

**ZERO FLARE — FLAME EVIDENCE LAB** turns NASA's underused
microgravity-combustion archive into a live, evidence-grounded research
environment for the Artemis generation. We ingested 24 NASA PSI combustion
investigations — recovering 22 experimental tables (2,009 rows, SHA-256-verified
against the acquisition manifest), 63 verified equations, and honest model
cards — and built an AI research copilot, **CIR-1**, that answers every factual
claim through 26 deterministic tools with visible provenance, never inventing
data. Researchers explore investigations, run a **comparability gate** that
refuses invalid cross-study claims, screen lunar/ISS/Mars habitats with a
transparent facility-risk engine, walk a 3D equipment lab built from public
NASA descriptions (plus official NASA ISS & Perseverance 3D assets), and export
reproducible evidence packets. Missing data stays missing; negative results
stay visible.

## Project Summary (extended)

The NASA Space Apps 2026 challenge "Flame in Freefall" asks teams to mine
NASA's Physical Sciences Informatics (PSI) combustion archive and deliver
AI-powered insights for spacecraft fire safety. Our answer is FLAME EVIDENCE
LAB — a single-page research platform with a strict **honesty contract**: every
number is recomputed from recovered NASA PSI tables (SHA-256-verified) or
produced by a 63-equation registry that passes 68/68 reference tests
(`/api/selftest`).

What makes it winnable on **Best Use of Science**: the FLEX droplet-extinction
model (grouped AUC 0.882) refuses predictions outside its verified microgravity
domain; the comparability gate refuses cross-study plots when gravity, scale or
hardware differ and states exactly why; the fire-safety facility engine shows
its six visible drivers and labels itself advisory — never a certified fire
model. The **partial-gravity data gap** (no PSI dataset at 0.165 g) is a
first-class, explorable finding.

What makes it winnable on **Best Use of Data**: a real acquisition pipeline
(22/22 tables recovered directly from the PSI endpoint; 19/19 byte-identical to
the manifest), a public recovery ledger with per-file SHA-256, duplicate and
parse-failure counts shown in the UI (never silently dropped), authentic NASA
media via the official Images API, live NTRS literature search with citations,
and a reproducible evidence-packet export.

---

## Screenshots (docs/screenshots/)

### 01-mission-1440.png — Mission (desktop)
**Caption:** Landing view: the evidence base in one glance, with six selectable research environments.
**Details:** The Mission section opens on the platform's headline numbers — 24 PSI investigations, 22 SHA-256-verified recovered tables, 2,009 experimental rows and 41 authentic NASA media items — over a schematic Earth–ISS–Mars scene. The right-hand environment panel shows the currently selected research atmosphere (ISS: 14.7 psi, 21% O₂, N₂ 79%) with a "flight-proven vs concept" badge system, and an honesty note stating that lunar/Mars values are challenge-brief concept references because no validated partial-gravity combustion data exists. CTAs lead into Investigations, a 90-second guided tour, or the CIR-1 copilot.

### 02-investigations-1440.png — Investigations catalog (desktop)
**Caption:** All 24 NASA PSI investigations as searchable workspaces with real data counts and DOIs.
**Details:** Every card is a real PSI record: accession, title, sub-research area, project type, recovered table/row counts (e.g., BASS: 1 table · 122 rows · DATA-RICH), keyword tags and the official 10.60555/ DOI. Cards with no bundled experimental table say so explicitly ("metadata record — no bundled experimental table") instead of pretending. Search and two filters (sub-research area, project type) operate over the full 24-investigation corpus.

### 03-investigation-detail-1440.png — Investigation detail workspace (desktop)
**Caption:** An embedded evidence workspace per investigation: data studio, equipment, media, equations, graph, gaps.
**Details:** Opening a card (e.g., PSI-69 FLEX) reveals the full research context for that investigation: embedded exploratory data analysis recomputed in-browser from the recovered table, the flight equipment used, authentic NASA media, the equations that apply, a typed mini knowledge-graph, and documented evidence gaps. Every tab carries provenance (source file, DOI, SHA-256 status) so a judge can trace any number back to NASA's primary record.

### 04-compare-gate-1440.png — Compare with the comparability gate (desktop)
**Caption:** Cross-investigation comparison — guarded by a comparability gate that refuses invalid pairings.
**Details:** Compare lines up to four investigations to audit flight conditions, hardware, fuels and documented gaps side by side. The deterministic comparability gate audits every pairing first: when gravity regime, physical scale or hardware differ, it returns an explicit "not directly comparable" verdict with reasons — scientific caution is a product feature, not a footnote. Curated quick-picks (FLEX vs CFI-G, SAFFIRE I/II/III, SAME vs SAME-R) demonstrate the gate in one click, and missing matrix cells stay as em-dashes — never zero.

### 05-scenarios-1440.png — Scenarios: the fire-safety lifecycle (desktop)
**Caption:** Prevention → Detection → Prediction → Suppression, driven by one shared scenario context and a transparent facility-screening engine.
**Details:** One shared environment context (gravity, pressure, O₂ — live readouts shown) powers the four pillars. The facility-screening panel lets researchers define compartments (area, materials, ignition sources, ventilation, detection) and produces a deterministic risk ranking with a schematic heat map — with an explicit disclaimer that it is a transparent screening index over documented factors, not a validated fire-growth/CFD model. Verified calculators come from the equation registry; models refuse out-of-domain inputs; sessions save to the shelf below.

### 06-lab3d-1440.png — 3D Lab: spacecraft combustion hardware (desktop)
**Caption:** A hardware catalogue with honest fidelity labels — official NASA 3D assets vs source-based schematic reconstructions.
**Details:** Nine hardware records (CIR, FCF, MDCA, ACME insert, MSG, SPICE burner, …) each carry a color-coded fidelity label: "official 3D model — NASA ISS + Perseverance GLBs (geometry unchanged)", "source-based reconstruction/schematic — what every apparatus model is", "recorded data replay" or "scientific simulation — guarded calculators only". Records list the investigations that used the hardware (PSI accessions), link the registered NASA source, and attach authentic NASA photography wherever the recovered media index has it.

### 07-data-sources-1440.png — Data & Sources: the evidence supply chain (desktop)
**Caption:** The full provenance ledger — 22 tables, 2,009 rows, per-file SHA-256 verification, duplicates and parse failures counted openly.
**Details:** The supply-chain header states the dataset totals including the unflattering ones (50 duplicate rows, 620 parse failures). The recovery ledger lists every recovered CSV with its investigation, row/column counts, byte size and SHA-256, verified 19/19 identical to the project manifest — hashes recomputed at build time from raw data. A "critical honesty note" records that the 2,393 historical media binaries are NOT present (source archives unavailable) and that the platform therefore uses the verified NASA Images API catalogue instead.

### 08-my-work-1440.png — My Work: the researcher's shelf (desktop)
**Caption:** Saved investigations, gaps, charts and scenario sessions — exportable as a reproducible evidence packet.
**Details:** My Work aggregates everything a researcher saved across the platform: saved items, a gap shelf, CIR-1 research sessions and scenario snapshots. The evidence-packet export bundles the selections with their provenance and limitations included, so a finding can be handed to a colleague or reviewer as a reproducible research artifact rather than a screenshot.

### 09-mission-768.png — Mission (tablet)
**Caption:** Fully responsive — the mission view reflows for tablet.
**Details:** The landing hierarchy (stats → environments → CTAs) survives the 768px breakpoint with no loss of information; the environment panel and destination picker stack cleanly, and the 3D scene degrades gracefully.

### 10-scenarios-768.png — Scenarios (tablet)
**Caption:** The fire-safety lifecycle remains fully operable at tablet width.
**Details:** Pillar tabs, live environment readouts and the facility-screening form adapt to two-column layouts; risk cards keep their scores and class labels readable.

### 11-mission-390.png — Mission (mobile)
**Caption:** Mobile-first honesty — the same evidence, one column.
**Details:** At 390px the mission view keeps the four stat cards, environment badges and honesty notes fully legible; nothing about the evidence base is hidden on small screens.

### 12-investigations-390.png — Investigations (mobile)
**Caption:** The investigations catalog stays searchable on mobile.
**Details:** Cards collapse to essential facts (accession, title, data richness, DOI) with filter chips; the comparability actions remain reachable.

### 13-cir1-copilot-1440.png — CIR-1 research copilot (desktop)
**Caption:** The AI copilot dock — 26 typed tools, citations on every answer, "never invents data".
**Details:** CIR-1 is available on every screen as a dock. Its header states the contract ("36 tools + citations · never invents data"), its welcome message suggests real research prompts, and answer sizes are tunable (S/M/L). Every factual reply is produced by deterministic tools with an inspectable tool trace — the LLM orchestrates and phrases, it never measures. A footer reminder: research decision support only, not certified fire-safety guidance.

### 14-coverage-map-1440.png — Evidence coverage map (desktop)
**Caption:** Where NASA's combustion evidence exists — and where it doesn't.
**Details:** The coverage map crosses research environments (Earth, ISS, lunar, Mars, spacecraft, spacesuit) against the 24 investigations to show evidence density at a glance — and exposes the platform's central scientific finding: the **partial-gravity gap**. No PSI dataset exists at 0.165 g or 0.378 g, and the map makes that absence visible instead of papering over it.

### 15-demo-step1-1440.png — Guided demo, step 1 (desktop)
**Caption:** The 90-second judge journey, step by step.
**Details:** A built-in walkthrough escorts a first-time visitor through the core loop — open a real investigation, compare with the gate, ask CIR-1, run a scenario — with each step highlighting exactly what to click and what honest behavior to expect.

### 16-demo-copilot-step-1440.png — Guided demo, copilot step (desktop)
**Caption:** The demo's copilot step: a real deterministic tool round, citations included.
**Details:** During the walkthrough the copilot executes live tool calls (evidence search, equation calculation, atmosphere comparison) and shows the tool trace and provenance next to the answer — demonstrating the "every number comes from tool output" contract rather than just claiming it.
