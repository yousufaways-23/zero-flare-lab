# Competition Benchmark — 2026 Rules Verification & Global-Winners Study

Researched 2026-11-14 against official pages (challenge page, Judging & Awards Guide, Project Submission Guide, winner pages, NASA.gov announcements). Facts verified from 2026 official sources unless marked otherwise.

---

## 1. VERIFIED 2026 challenge facts

### 1.1 Title correction (material)
The official 2026 challenge title is **"Flame in Freefall: SI-Powered Fire Safety Insights from Microgravity Combustion Data"** — *SI-Powered*, not "AI-Powered". In 2026 Space Apps rebranded AI usage as **"Super Intelligence (SI)"** (following the Sept 29, 2026 U.S. executive order) with mandatory disclosure rules. All project copy must use SI framing.

### 1.2 What the challenge asks (official statement)
"Create an interactive, **super intelligence (SI) powered dashboard** that **summarizes, ranks, and interprets** NASA's low-gravity combustion findings to deliver fire safety insights for human space exploration."

- Data source mandated: **NASA PSI — Combustion Science repository** (psi.nasa.gov) — "the source of the data upon which the NASA Space App is to be based".
- Users may be enabled to: (1) identify investigations most relevant to fire safety of habitable crew environments; (2) extract data supporting **predictive modeling of flammability/fire scenarios**; (3) highlight research informing next-generation fire-safety controls.
- Named investigations to cover: BASS/BASS-II, SAFFIRE-I/-II/-III, SAME/SAME-R, FLEX/FLEX-2, CFI/CFI-G (up to 85% O₂), ACME's six gaseous experiments (incl. BRE, E-FIELD), SPICE/SLICE (MSG), DAFT/DAFT-2 (dust).
- **No partial-gravity data exists in PSI yet** (future LUCI/FM2) — the challenge suggests **bounding partial-g between micro-g and 1g** — exactly our applicability-gate approach.
- Hardware context given: CIR, MDCA, MSG. Rocket/propellant fire safety is **out of scope**.
- Attributes suggested for display: objectives, fuel shapes/sizes, O₂ concentration, airflow, inter-test variables, sensor types, cross-investigation comparisons.
- Target users: professors, grad/undergrad students, aerospace researchers and engineers.

### 1.3 Judging (verified 2026)
- Five global criteria, each 1–5 at every level: **Impact, Creativity, Validity** ("grounded in scientific principles, feasible, usable"), **Relevance** ("NASA data … a core component rather than a superficial addition"), **Presentation**. The guide explicitly warns to invest in pitch/storytelling.
- Funnel: Global Nominees Dec 3, 2026 → Finalists + HM Dec 17, 2026 → **10 Global Winners Jan 26, 2027**.
- Ten Global Awards; our targets: **Best Use of Science** — "the best and most valid use of the scientific method"; **Best Use of Data** — "best makes space data accessible or leverages it to a unique application".

### 1.4 Submission requirements (verified 2026, Project Submission Guide)
- Project page fields: name, summary, **demo link**, **final-project link (public, no login)**, detailed description, **Use of Super Intelligence (SI)** field, **NASA Data field** (Global Award eligibility requires ≥1 NASA data/resource), Space Agency Partner Data + **all references** (code/text/images even open-source).
- **Demo limits: video ≤30 s OR slide deck ≤7 slides — exceeding either disqualifies from Global Judging.** Hosted externally, public. English.
- **SI disclosure (NEW 2026):** SI permitted as a tool, not to generate the idea; SI-generated images/video need a **visible watermark**; SI-generated audio/code/data acknowledged in text + metadata; judges see SI indicators and evaluate originality/intent/execution; SI-generated content may not use NASA branding.
- Two attestations: original work; all external resources listed. Deadline: **Nov 15, 2026, 11:59 p.m. local event time** (only last saved submission judged).
- Official demo structure: 0:00 intro → 0:02 challenge → 0:05 name/tagline → 0:10 how it works + credit "NASA's free and open data" → 0:20–0:30 future vision.

---

## 2. Global-winners benchmark

### SpaceGenes+ — Best Use of Science 2025 (VERIFIED: official pages)
One real NASA GeneLab dataset (GLDS-288) + one explicitly defined scientific metric (radiation×microgravity **synergy scores** from expression fold-changes; TP53/ATM interaction findings). Solo UX-designer founder. Judges cited "thoughtful design and data visualization … make complex space biology accessible".
**Learn:** a single dataset used deeply with a checkable formula beats breadth. **Don't copy:** AI-drafted science logic — ours is team-authored and reproducible by scripts.

### Resonant Exoplanets — Best Use of Data 2025 (VERIFIED)
End-to-end pipeline over NASA archives (MAST/Lightkurve) → transit detection → ML classification → validation step → web app + **auto-generated PDF scientific reports**. Framing: "make signals more transparent and trustworthy".
**Learn:** full visible pipeline + machine-checkable outputs win trust. **Don't copy:** unverifiable exotic claims (community questioned their custom "exact arithmetic transformer").

### WMPGang / SkyShield (NEO-Orrery) — Best Use of Science 2024 (VERIFIED: NASA.gov + repo)
Physically grounded orrery: real orbital elements at correct epochs, 1,669 ESA NEOs, IAU meteor streams, sporadic-meteoroid model; open GitHub repo.
**Learn:** every visual traceable to a named dataset + real computation; clean public repo. **Don't copy:** assuming domain authority we don't have — compensate with explicit citations (we already do via provenance strips).

### GaamaRamma / WaterWise — Best Use of Data 2024 (VERIFIED: NASA.gov)
NASA OpenET + Worldview data → **action-oriented UI** ("Hydrated/Dehydrated"), FAO crop-water formulas → 7-day irrigation schedules.
**Learn:** make opaque NASA data **decision-ready for non-experts**; physical formulas bridging data → answers is a replicable winning pattern (our oxygen-limit/flammability relations play exactly this role). **Don't copy:** a bolted-on general chatbot as the "AI" (2026 SI rules require disclosure; the core claim must be the data system).

---

## 3. Lessons → ZERO FLARE actions (mapping)

| # | Lesson | ZERO FLARE status / action |
|---|---|---|
| 1 | One dataset deeply used wins science | PSI-69 FLEX fully worked (274 tests → classifier + d²-law validation); BASS-II, CFI-G, SAME covered; expand gradually — never shallow-broad |
| 2 | State the scientific method explicitly | Comparability gate, applicability gate, d²-law PARTIALLY_VALIDATED, screening arithmetic documented; keep every ranking transparent |
| 3 | Accessible + trustworthy = Best Use of Data | Challenge wording "hard to find, harder to compare, harder to interpret" mirrors our product thesis — say this in the submission |
| 4 | Mirror the challenge's own checklist | Investigation pages carry objectives/fuels/O₂/airflow/sensors; add explicit cross-investigation comparison affordances in submission copy |
| 5 | Machine-checkable outputs | Reproducible reports + selftest/qa-eval gates public in repo; add per-investigation export |
| 6 | Full pipeline visible | PSI acquisition → ingestion → registries → agent → UI, all scripted in scripts/flame/ |
| 7 | Physical realism | Equations registry (63, 68/68 tests), d²-law, Buoyancy/Ri relations — real physics, honest limits |
| 8 | Decision-ready UX for non-experts | Mission env chips, screening 0–100 with declared weights, CIR-1 plain-language answers with provenance |
| 9 | Respect SI regime | Fill "Use of SI" field: SI = CIR-1 assistant + coding assistance; app science deterministic; watermark any SI-generated media; NASA branding untouched |
| 10 | 30-second demo discipline | Cut demo to the official template; script attached to submission |
| 11 | Fill NASA Data field richly | List PSI accessions + experiment_names.csv + NASA 3D resources + images.nasa.gov with links |
| 12 | Claim only what judges can click | Every feature in the submission is live-verified (selftest/qa-eval/Playwright evidence) |

## 4. Submission checklist (owner: team, due Nov 15 2026 11:59 PM local)
1. Project name + tagline; summary ≤ concise; demo link (≤30 s video per official template or ≤7 slides); final-project link = https://zero-flare-lab-vp48.zai-ai.site (public, no login — verified).
2. Detailed description: chain NASA evidence → analysis → models → SI agent → scenario → report; include evidence tables from docs/.
3. "Use of SI" field: disclose CIR-1 (Gemini via server-side API) + SI-assisted code; state that all scientific computations are deterministic tools, never generated numbers; SI-generated media watermarked (none currently in product).
4. NASA Data field: PSI accessions (PSI-23, PSI-102, PSI-20, PSI-22, PSI-10, PSI-159, PSI-25, PSI-26, PSI-39, PSI-47, PSI-117, PSI-68, PSI-69, PSI-107, PSI-99, PSI-100, PSI-98, PSI-106, PSI-101), NASA 3D resources (ISS, Perseverance GLBs), images.nasa.gov catalogue, NTRS external leg.
5. References: NASA PSI, NTRS, 2015 Researcher's Guide, science facilities pages, gipoc.grc.nasa.gov FCF/CIR, NASA YouTube sources of the 6 verified videos, three.js/R3F/Next.js credits.
6. Attestations checked; local-judging deadlines confirmed with Local Lead.
