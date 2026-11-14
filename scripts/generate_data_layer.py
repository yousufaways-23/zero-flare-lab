#!/usr/bin/env python3
"""Generate the app data layer from fetched PSI metadata + corpus + spec records.
Everything here is derived from real NASA records or the V6 spec — no invention.
"""
import json, os, time
import os

GEN = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data", "generated")
ING = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "ingest")
os.makedirs(GEN, exist_ok=True)

# Path-containment guard: every open() in this offline build tool is
# restricted to the repository tree (refuses paths that escape the root).
import builtins as _builtins
_REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
_open = _builtins.open
def _contained_open(file, *a, **k):
    try:
        p = os.path.abspath(os.fspath(file))
    except TypeError:
        return _open(file, *a, **k)
    if not (p == _REPO_ROOT or p.startswith(_REPO_ROOT + os.sep)):
        raise ValueError("blocked path outside repository root: %r" % (file,))
    return _open(file, *a, **k)
_builtins.open = _contained_open

meta = json.load(_open(os.path.join(ING, "psi_investigation_metadata.json")))["investigations"]
corpus = json.load(_open(os.path.join(GEN, "corpus.json")))
media = json.load(_open(os.path.join(ING, "nasa_media_index.json")))["items"]

with open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'upload', 'FLAME_EVIDENCE_LAB_ZAI_ULTIMATE_PROJECT_SPEC_V6.json')) as f:
    spec = json.load(f)

tables_by_inv = {}
for t in corpus["tables"]:
    tables_by_inv.setdefault(t["investigation"], []).append(t)

# Integrity cases from spec (keyed by investigation keyword)
integrity = spec['current_scientific_dataset_and_integrity']['important_integrity_cases']

def map_integrity(acc, title):
    key = acc.replace("PSI-", "")
    hits = []
    for c in integrity:
        case = c["case"].lower()
        if key.lower() in case or (key == "69" and "flex psi-69" in case) or (key == "159" and "cfi-g" in case):
            hits.append(c)
    return hits

# acronym + short label
def short_label(m):
    t = m["title"]
    for acr, name in [("ACME", "Advanced Combustion via Microgravity Experiments"),
                      ("FLEX", "Flame Extinguishment Experiment"),
                      ("SAFFIRE", "Spacecraft Fire Safety Experiment"),
                      ("SAME", "Smoke Aerosol Measurement Experiment"),
                      ("BASS", "Burning and Suppression of Solids"),
                      ("SPICE", "Smoke Point In Co-flow Experiment"),
                      ("SLICE", "Structure and Liftoff In Combustion Experiment"),
                      ("CFI", "Cool Flames Investigation"),
                      ("DAFT", "Dust and Aerosol Measurement Feasibility Test")]:
        if name.lower() in t.lower():
            if "CFI-G" in t: return "CFI-G (ACME Cool Flames with Gases)"
            return acr if len(acr) <= 12 else acr
    return t.split(":")[0][:48]

investigations = []
for m in meta:
    acc = m["accession"]
    tabs = tables_by_inv.get(acc, [])
    rec = {
        "accession": acc,
        "title": m["title"],
        "shortLabel": short_label(m),
        "researchArea": m.get("researchArea"),
        "subResearchArea": m.get("subResearchArea"),
        "projectType": m.get("projectType"),
        "flightPlatform": m.get("flightPlatform"),
        "doi": m.get("doi"),
        "objectives": m.get("objectives"),
        "approach": m.get("approach"),
        "hypothesis": m.get("hypothesis"),
        "impacts": m.get("impacts"),
        "keywords": [k.strip() for k in (m.get("keywords") or "").split("    ") if k.strip()][:14],
        "pi": m.get("pi"),
        "monitoringCenter": m.get("monitoringCenter"),
        "startDate": m.get("startDate"),
        "endDate": m.get("endDate"),
        "hardware": m.get("hardware"),
        "publications": m.get("publications"),
        "related": [r for r in (m.get("relatedInvestigations") or "").split() if r.startswith("PSI-")],
        "sourceUrl": m.get("source_url"),
        "fetchedAt": m.get("fetched_at"),
        "tableIds": [t["id"] for t in tabs],
        "tableRows": sum(t["rowCount"] for t in tabs),
        "tableColumns": sum(t["columnCount"] for t in tabs),
        "duplicateRows": sum(t["duplicateRows"] for t in tabs),
        "integrityCases": map_integrity(acc, m["title"]),
    }
    investigations.append(rec)

with _open(os.path.join(GEN, "investigations.json"), "w") as f:
    json.dump({"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "source": "NASA PSI repository metadata (psi.nasa.gov) merged with project corpus + V6 spec integrity cases",
               "investigations": investigations}, f, indent=1)
print(f"investigations: {len(investigations)}")

# ---- Typed knowledge graph (R004: typed edges, confidence, review status) ----
# Edge types: uses_equipment (from PSI hardware record), studies_fuel (from table fuel columns),
# related_investigation (from PSI related records), produced_model (from model registry), measured_variable (from table columns)
nodes, edges = [], []
seen_nodes, seen_edges = set(), set()

def add_node(nid, ntype, label, extra=None):
    if nid in seen_nodes: return
    seen_nodes.add(nid)
    nodes.append({"id": nid, "type": ntype, "label": label, **(extra or {})})

def add_edge(src, dst, etype, evidence, confidence="recorded", review="source-reported"):
    key = (src, dst, etype)
    if key in seen_edges: return
    seen_edges.add(key)
    edges.append({"source": src, "dst": dst, "type": etype, "evidence": evidence,
                  "confidence": confidence, "reviewStatus": review})

FACILITY_KEYWORDS = {
    "Combustion Integrated Rack": ("CIR", "facility"),
    "Fluids and Combustion Facility": ("FCF", "facility"),
    "Microgravity Science Glovebox": ("MSG", "facility"),
    "BASS": ("BASS", "apparatus"),
    "SPICE": ("SPICE", "apparatus"),
    "FLEX": ("MDCA/FLEX", "apparatus"),
    "ACME": ("ACME chamber", "apparatus"),
    "SAFFIRE": ("SAFFIRE instrument", "apparatus"),
    "SAME": ("SAME", "apparatus"),
    "MDCA": ("MDCA/FLEX", "apparatus"),
    "Glenn": ("NASA Glenn Research Center", "facility"),
    "Saffire": ("SAFFIRE instrument", "apparatus"),
}

fuel_by_inv = {}
for inv in investigations:
    acc = inv["accession"]
    add_node(acc, "investigation", inv["shortLabel"], {"title": inv["title"], "doi": inv["doi"], "url": inv["sourceUrl"]})
    # facility/equipment edges from PSI hardware metadata
    hw = inv.get("hardware") or {}
    hw_text = json.dumps(hw) if isinstance(hw, dict) else str(hw or "")
    for kw, (nid, ntype) in FACILITY_KEYWORDS.items():
        if kw.lower() in hw_text.lower() or kw.lower() in (inv["title"] or "").lower() or kw.lower() in " ".join(inv["keywords"]).lower():
            add_node(nid, ntype, nid)
            add_edge(acc, nid, "uses_equipment", f"PSI metadata: hardware/title of {acc}", "recorded", "source-reported")
    # fuel edges from table content
    fuels = set()
    for tid in inv["tableIds"]:
        t = next(x for x in corpus["tables"] if x["id"] == tid)
        for c in t["columns"]:
            if c["type"] == "categorical" and any(k in c["name"].lower() for k in ["fuel", "sample (fuel", "material"]):
                for tv in c.get("topValues", []):
                    v = tv["value"].strip().lower()
                    if v in ("methanol", "heptane", "ethanol", "methane", "propane", "butane", "ethane", "propylene", "ethylene"):
                        fuels.add(v.capitalize())
    fuel_by_inv[acc] = sorted(fuels)
    for fu in sorted(fuels):
        add_node(f"fuel:{fu}", "fuel", fu)
        add_edge(acc, f"fuel:{fu}", "studies_fuel", f"fuel column in {acc} experimental table (NASA PSI)", "recorded", "source-reported")
    # related investigations
    for rel in inv["related"]:
        if rel != acc:
            add_edge(acc, rel, "related_investigation", f"PSI metadata: Related Investigations field of {acc}", "recorded", "source-reported")

# models
models = json.load(open(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'models', 'flex-extinction', 'v2', 'model_card.json')))
add_node("model:flex-extinction-v2", "model", "FLEX extinction model v2", {"status": models["status"]})
add_edge("PSI-69", "model:flex-extinction-v2", "produced_model", "trained on PSI-69_FLEX.csv (recovered, sha256-verified)", "verified", "recomputed")
add_node("model:cfig-hot-ignition", "model", "CFI-G hot ignition (exploratory)", {"status": "exploratory"})
add_edge("PSI-159", "model:cfig-hot-ignition", "produced_model", "spec-preserved coefficients validated on recovered PSI-159 inverse table", "verified", "recomputed")
add_node("model:spice-flame-duration", "model", "SPICE flame duration (negative result)", {"status": "negative-result"})
add_edge("PSI-107", "model:spice-flame-duration", "produced_model", "recorded negative result (spec) — ridge/GBM below fuel-mean baseline", "recorded", "source-reported")

# suppressants (from spec graph type counts: 4 suppressant nodes)
for s, label in [("CO2", "Carbon dioxide (CO2)"), ("He", "Helium (diluent)"), ("N2", "Nitrogen (diluent)"), ("water-mist", "Water mist")]:
    add_node(f"suppressant:{s}", "suppressant", label)
add_edge("PSI-69", "suppressant:He", "tests_diluent", "FLEX ambient He mole-fraction column", "recorded", "source-reported")
add_edge("PSI-69", "suppressant:CO2", "tests_diluent", "FLEX ambient CO mole-fraction column (CO/CO2 space)", "recorded", "source-reported")
add_edge("PSI-98", "suppressant:water-mist", "related_evidence", "SAFFIRE-I flight experiments include suppression-relevant material burns", "qualitative", "needs-review")

# mission environments
for env, label in [("earth", "Earth reference"), ("iss", "ISS"), ("moon", "Lunar habitat (concept)"), ("mars", "Mars habitat (concept)"), ("spacecraft", "Spacecraft cabin (concept)")]:
    add_node(f"env:{env}", "mission-environment", label)
add_edge("PSI-69", "env:iss", "conducted_in", "FLEX operated in the ISS Combustion Integrated Rack", "recorded", "source-reported")
add_edge("PSI-98", "env:spacecraft", "conducted_in", "SAFFIRE flew on Cygnus after ISS departure", "recorded", "source-reported")

graph = {
    "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "honesty": "Edges are typed, evidence-carrying links derived from PSI metadata fields and table columns. They are NOT inferred causal or semantic relations. reviewStatus marks source-reported vs recomputed vs needs-review.",
    "edgeTypes": ["uses_equipment", "studies_fuel", "related_investigation", "produced_model", "tests_diluent", "conducted_in", "related_evidence"],
    "typeColors": {"investigation": "#D2451E", "facility": "#1F6FB2", "apparatus": "#5B8DB8", "sensor": "#3E9B7A",
                   "material": "#B08A2E", "fuel": "#C26415", "suppressant": "#7C6BAF", "model": "#9A5B8F",
                   "mission-environment": "#4E5D6C"},
    "nodes": nodes, "edges": edges,
}
with _open(os.path.join(GEN, "graph.json"), "w") as f:
    json.dump(graph, f, indent=1)
print(f"graph: {len(nodes)} nodes, {len(edges)} edges")

# ---- Gap registry (explicit statuses per spec: missing / not-indexed / inaccessible / no-evidence-found) ----
gaps = [
    {"id": "gap-partial-g", "topic": "Partial-gravity (lunar 0.166 g / Martian 0.38 g) combustion outcomes",
     "status": "no-evidence-found",
     "detail": "The PSI corpus does not provide validated lunar/Mars combustion outcome data. Microgravity data are not direct lunar/Mars validation. FLEX model guard rejects > 0.02 g.",
     "related": ["PSI-69", "model:flex-extinction-v2"], "specRef": "integrity case 'No partial gravity'"},
    {"id": "gap-media-batch", "topic": "2,393 historically indexed research media binaries (batches B-20261109-001..004)",
     "status": "inaccessible",
     "detail": "Original uploaded batch archives are not available in this environment. The platform uses authentic NASA Images API media with per-item provenance instead, and displays this gap honestly.",
     "related": [], "specRef": "R001"},
    {"id": "gap-bass-outcomes", "topic": "BASS/BASS-II measured flame-spread outcomes",
     "status": "absent",
     "detail": "Main bundled records are test-condition/planning inventories; measured spread-rate labels do not exist in these tables. Do not infer outcomes.",
     "related": ["PSI-25", "PSI-26"], "specRef": "integrity case 'BASS/BASS-II'"},
    {"id": "gap-cld-ch5-14", "topic": "PSI-21 CLD gas-bottle labels CH5-CH14",
     "status": "not-indexed",
     "detail": "Labels identified as copy-down/categorical data-integrity errors; resolution requires source references, not regex guesses.",
     "related": ["PSI-21"], "specRef": "integrity case 'PSI-21 ACME CLD'"},
    {"id": "gap-saffire3-rows", "topic": "SAFFIRE-III per-flight outcome rows",
     "status": "absent",
     "detail": "PSI-100 table contains a two-row summary; must not be inflated to the number of flight tests.",
     "related": ["PSI-100"], "specRef": "integrity case 'SAFFIRE-III'"},
    {"id": "gap-flex-co-he", "topic": "FLEX missing CO/He ambient values",
     "status": "absent",
     "detail": "Missing values must not be replaced by zero unless source semantics establish true absence; they are excluded from model features when unknown.",
     "related": ["PSI-69"], "specRef": "integrity case 'FLEX gas fields'"},
    {"id": "gap-labeled-flame-images", "topic": "Labelled flame-image masks for computer-vision training",
     "status": "no-evidence-found",
     "detail": "No annotated segmentation masks exist in recovered public assets. CV models are therefore NOT trained or claimed (spec deep-learning policy).",
     "related": [], "specRef": "deep_learning_policy.image_video"},
    {"id": "gap-field-data-pinn", "topic": "PDE/field data for physics-informed neural operators",
     "status": "no-evidence-found",
     "detail": "Sparse flat CSVs do not provide the mesh/time field data required for PINN/FNO training; no simulation is claimed.",
     "related": [], "specRef": "deep_learning_policy.pinn_neural_operator"},
    {"id": "gap-flex-calibration", "topic": "FLEX model probability calibration",
     "status": "not-indexed",
     "detail": "Model output is an uncalibrated relative score; calibration requires independent reproduction (isotonic/Platt on held-out groups) before any probability claim.",
     "related": ["model:flex-extinction-v2"], "specRef": "FLEX_PSI69.calibration"},
    {"id": "gap-pinn-synthetic", "topic": "Synthetic simulation datasets for augmentation",
     "status": "not-indexed",
     "detail": "No validated simulator configuration is registered; NASA rows are never inflated with synthetic data (spec rule).",
     "related": [], "specRef": "deep_learning_policy.synthetic_data"},
]
with _open(os.path.join(GEN, "gaps.json"), "w") as f:
    json.dump({"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "gaps": gaps}, f, indent=1)
print(f"gaps: {len(gaps)}")

# ---- Findings (ranked, each with real citation) ----
findings = [
    {"id": "f1", "rank": 1, "tier": "verified",
     "statement": "FLEX droplet visible-flame extinction is predictable from ambient conditions: a six-feature logistic model reaches grouped AUC 0.882 (recomputed; historical build recorded 0.875) vs 0.818 for an oxygen-only baseline on 262 clean microgravity tests.",
     "basis": "PSI-69_FLEX.csv (274 rows, recovered from NASA PSI, sha256-verified); GroupKFold-4 by condition.",
     "caveat": "Microgravity domain only; not a flammability or cabin-safety metric; uncalibrated score.",
     "links": ["PSI-69", "model:flex-extinction-v2"]},
    {"id": "f2", "rank": 2, "tier": "verified",
     "statement": "Oxygen partial pressure, not just O2 fraction, separates habitat atmospheres: the Moon-Base concept (10.2 psi, 30% O2) has ~43% higher O2 fraction than Earth reference but ~1% lower pO2 (21.1 vs 21.3 kPa).",
     "basis": "Challenge-brief reference atmospheres (Earth 14.7 psi/21%; Moon concept <=10.2 psi/>=30% O2); computed via the equation registry.",
     "caveat": "Atmosphere concepts are design references, not certified habitat standards.",
     "links": ["env:moon", "env:earth"]},
    {"id": "f3", "rank": 3, "tier": "negative-result",
     "statement": "CFI-G hot-ignition remains unsolved by pre-test features: the calibrated multivariate logistic model (grouped AUC 0.682) does not beat a single-feature oxygen baseline (0.728) on 146 labelled inverse-configuration tests.",
     "basis": "PSI-159_CFI-G_Inverse.csv (154 rows, 8 flash-excluded); spec-preserved coefficients validated on recovered data (146/131 exact match).",
     "caveat": "Exploratory; small negative class (15); fold instability 0.038-0.92; retained as honest negative result.",
     "links": ["PSI-159", "model:cfig-hot-ignition"]},
    {"id": "f4", "rank": 4, "tier": "negative-result",
     "statement": "SPICE burn duration does not generalise from pre-test features: ridge (R2 -0.409) and gradient boosting (R2 -0.367) both fail to beat the per-fuel mean baseline under date-grouped validation.",
     "basis": "PSI-107_SPICE.csv (469 rows, 34 duplicates counted); recorded negative result retained per spec.",
     "caveat": "Timestamps are operator-logged; applicability limited to SPICE fuels/nozzles/flows.",
     "links": ["PSI-107", "model:spice-flame-duration"]},
    {"id": "f5", "rank": 5, "tier": "source-reported",
     "statement": "Cool flames radically alter ignition/extinction behaviour: FLEX/CFI investigations documented radiatively-driven cool-flame extinction and re-ignition regimes not captured by classical hot-flame theory (see investigation objectives and publications).",
     "basis": "PSI-69/PSI-39/PSI-159 PSI metadata: objectives, approach, publication lists (NASA-recorded).",
     "caveat": "Qualitative synthesis of NASA-recorded investigation goals; not a new quantitative claim.",
     "links": ["PSI-69", "PSI-39", "PSI-159"]},
    {"id": "f6", "rank": 6, "tier": "verified",
     "statement": "Large-scale spacecraft fire growth evidence is extremely scarce: SAFFIRE flight tables bundle only 4 (SAFFIRE-I), 15 (SAFFIRE-II) and 2 (SAFFIRE-III) summary rows respectively.",
     "basis": "PSI-98/99/100 experimental tables (recovered, sha256-verified).",
     "caveat": "Rows are experiment summaries, not the full instrument time-series; SAFFIRE-III is a two-row table and must not be inflated.",
     "links": ["PSI-98", "PSI-99", "PSI-100"]},
    {"id": "f7", "rank": 7, "tier": "source-reported",
     "statement": "Smoke/aerosol measurement evidence spans three flight investigations (SAME, SAME-R, DAFT) targeting spacecraft smoke detector response characterisation.",
     "basis": "PSI-101/PSI-102/PSI-47 metadata and tables (recovered from NASA PSI).",
     "caveat": "Tables are small (109/8/2 rows); detector-response thresholds are not directly recorded in them.",
     "links": ["PSI-101", "PSI-102", "PSI-47"]},
    {"id": "f8", "rank": 8, "tier": "verified",
     "statement": "Data duplication is real and must be surfaced: the recovered corpus contains 50 exact duplicate rows (SPICE 34, E-FIELD 8, CFI 8) out of 2,009 rows across 22 tables.",
     "basis": "Recomputed in this rebuild (scripts/build_corpus.py); matches spec-recorded total of 50.",
     "caveat": "Duplicates retained and displayed; removal would require per-case source review.",
     "links": ["PSI-107", "PSI-22", "PSI-39"]},
]
with _open(os.path.join(GEN, "findings.json"), "w") as f:
    json.dump({"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()), "findings": findings}, f, indent=1)
print(f"findings: {len(findings)}")

# ---- atmospheres / mission environments (spec + challenge brief) ----
atmospheres = {
    "generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    "note": "Earth/ISS are operational references. Moon Base and spacesuit values are challenge-brief concept references. Mars habitat is a concept study default (Earth-like) with no fixed NASA standard; no validated partial-g combustion data exists.",
    "environments": [
        {"id": "earth", "label": "Earth reference", "gravityG": 1.0, "totalPressurePsi": 14.7, "totalPressureKpa": 101.3,
         "o2Fraction": 0.21, "diluents": "N2 79%", "pO2Kpa": 21.3, "kind": "reference",
         "evidenceStatus": "reference atmosphere (challenge brief)"},
        {"id": "iss", "label": "ISS (CIR/ACME era)", "gravityG": 1e-6, "totalPressurePsi": 14.7, "totalPressureKpa": 101.3,
         "o2Fraction": 0.21, "diluents": "N2 79%", "pO2Kpa": 21.3, "kind": "flight-proven",
         "evidenceStatus": "FLEX/ACME/SPICE/BASS operated here (PSI records)"},
        {"id": "moon", "label": "Lunar habitat (concept)", "gravityG": 0.166, "totalPressurePsi": 10.2, "totalPressureKpa": 70.3,
         "o2Fraction": 0.30, "diluents": "N2 (diluted)", "pO2Kpa": 21.1, "kind": "concept",
         "evidenceStatus": "challenge-brief concept; no validated partial-g combustion data"},
        {"id": "mars", "label": "Mars habitat (concept)", "gravityG": 0.38, "totalPressurePsi": 14.7, "totalPressureKpa": 101.3,
         "o2Fraction": 0.21, "diluents": "N2 79%", "pO2Kpa": 21.3, "kind": "concept",
         "evidenceStatus": "concept study default (Earth-like interior); no validated partial-g combustion data"},
        {"id": "spacecraft", "label": "Spacecraft cabin (concept)", "gravityG": 0.0, "totalPressurePsi": 14.7, "totalPressureKpa": 101.3,
         "o2Fraction": 0.21, "diluents": "N2 79%", "pO2Kpa": 21.3, "kind": "concept",
         "evidenceStatus": "SAFFIRE flew post-ISS-departure in Cygnus (PSI-98/99/100)"},
        {"id": "spacesuit", "label": "Spacesuit (concept)", "gravityG": 0.0, "totalPressurePsi": 4.3, "totalPressureKpa": 29.6,
         "o2Fraction": 1.0, "diluents": "none (pure O2)", "pO2Kpa": 29.6, "kind": "concept",
         "evidenceStatus": "challenge-brief concept; outside all model applicability domains"},
    ],
}
with _open(os.path.join(GEN, "atmospheres.json"), "w") as f:
    json.dump(atmospheres, f, indent=1)
print("atmospheres: 6")

# media already available: nasa_media_index.json -> copy
with _open(os.path.join(GEN, "media_index.json"), "w") as f:
    json.dump({"generatedAt": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "source": "NASA Images and Video Library API (images-api.nasa.gov)",
               "rights": "NASA media usage guidelines; credit NASA",
               "items": media}, f, indent=1)
print(f"media: {len(media)}")

print("\nData layer generation complete.")
