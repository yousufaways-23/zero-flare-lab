#!/usr/bin/env python3
"""Register the user-supplied reference links from the 2026-11-09 batch-2 message.

Diffes the URL list against scripts/context/42_user_supplied_nasa_links_2026_11_09.json
and writes scripts/context/54_user_supplied_tech_science_and_psi_links_2026_11_09.json.
Already-known URLs are recorded with a pointer to their existing registry id;
new URLs get full records. Nothing is dropped.
"""
import json
from pathlib import Path

ROOT = Path("/home/z/my-project")

# URLs exactly as supplied in the user message, in order (one appears twice).
SUPPLIED = [
    "https://images.nasa.gov/",
    "https://science.nasa.gov/moon/image-galleries/",
    "https://images-api.nasa.gov/",
    "https://threejs.org/",
    "https://r3f.docs.pmnd.rs/getting-started/introduction",
    "https://www.babylonjs.com/",
    "https://kitware.github.io/vtk-js/docs/index.html",
    "https://plotly.com/javascript/",
    "https://echarts.apache.org/en/index.html",
    "https://www.cantera.org/",
    "https://www.openfoam.com/documentation/overview",
    "https://www.nist.gov/el/fire-research-division-73300/fire-dynamics-simulator",
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/#current",
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/science-facilities-on-the-iss/fluids-combustion-facility/",
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/",
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/solid-fuel-ignition-and-extinction-sofie/",
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-limits-at-reduced-g-experiment-flare/",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-159",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-10",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-101",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-98",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-39",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-102",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-106",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-99",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-107",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-100",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-21",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-25",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-20",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-68",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-22",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-23",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-69",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-26",
    "https://psi.nasa.gov/physci/repo/data/investigations/PSI-47",
    "https://gipoc.grc.nasa.gov/wp/fcf-cir/",
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/science-facilities-on-the-iss/fluids-combustion-facility/",
]

META = {
    "https://images.nasa.gov/": ("NASA Image and Video Library (front door)", "nasa_imagery", "critical", "Primary source of real NASA imagery for space-environment experiences and the media library (U3). Every asset used must carry NASA's credit/attribution; no stock or generated imagery may stand in for NASA experiment photos."),
    "https://science.nasa.gov/moon/image-galleries/": ("NASA Science — Moon image galleries", "nasa_imagery", "high", "Curated lunar imagery for the Moon-surface and Moon-habitat environments (U3)."),
    "https://images-api.nasa.gov/": ("NASA Images API (images-api.nasa.gov)", "nasa_imagery", "high", "Developer API for programmatic retrieval from the NASA image library; candidate for the media-library fetch workflow with per-asset metadata (center, photographer, description)."),
    "https://threejs.org/": ("Three.js", "webgl_3d_framework", "high", "Candidate engine for the interactive 3D science lab (U4). Selection research must compare against React Three Fiber, Babylon.js and VTK.js before any commitment."),
    "https://r3f.docs.pmnd.rs/getting-started/introduction": ("React Three Fiber — Getting Started", "webgl_3d_framework", "high", "React renderer for Three.js; leading candidate for U4 because it integrates with the existing React 19 stack without a major-version upgrade. Verify React-version compatibility before adopting."),
    "https://www.babylonjs.com/": ("Babylon.js", "webgl_3d_framework", "medium", "Alternative 3D engine for U4; strong tooling but a separate ecosystem from the React component tree."),
    "https://kitware.github.io/vtk-js/docs/index.html": ("VTK.js documentation", "webgl_3d_framework", "medium", "Scientific-visualization oriented WebGL toolkit; relevant if the 3D lab needs true volumetric/scientific rendering rather than schematic apparatus models."),
    "https://plotly.com/javascript/": ("Plotly.js", "charting_library", "high", "Candidate charting library for U5 advanced scientific graphs (contour, error bars, 3D surface). Selection research vs ECharts required."),
    "https://echarts.apache.org/en/index.html": ("Apache ECharts", "charting_library", "high", "Candidate charting library for U5; strong for large datasets and heatmaps. Selection research vs Plotly required."),
    "https://www.cantera.org/": ("Cantera", "combustion_simulation", "research_only", "Chemical-kinetics/thermo library. REFERENCE ONLY for now: no Cantera integration exists in the project, and none may be claimed until one is actually implemented and validated."),
    "https://www.openfoam.com/documentation/overview": ("OpenFOAM documentation overview", "combustion_simulation", "research_only", "Open-source CFD toolbox. REFERENCE ONLY: the project must never present visualizations as CFD or physics-validated simulation; any future OpenFOAM use requires explicit, validated integration."),
    "https://www.nist.gov/el/fire-research-division-73300/fire-dynamics-simulator": ("NIST Fire Dynamics Simulator (FDS)", "combustion_simulation", "research_only", "NIST's fire dynamics simulator. Same rule as OpenFOAM/Cantera: research reference only, no simulation claims without a real validated integration."),
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/#current": ("NASA Glenn — Combustion Science (current investigations)", "nasa_program_page", "critical", "Canonical program page for current microgravity combustion investigations; already the primary source citation for the bundled corpus."),
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/science-facilities-on-the-iss/fluids-combustion-facility/": ("NASA Glenn — Fluids and Combustion Facility (FCF)", "nasa_program_page", "critical", "Facility page for FCF/CIR, the ISS rack that hosted FLEX/FLEX-2/CFI and the ACME insert; hardware catalogue provenance."),
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-of-materials-on-the-moon-fm2/": ("NASA Glenn — Flammability of Materials on the Moon (FM²)", "nasa_program_page", "high", "Future partial-gravity (lunar) flammability investigation; relevant to the lunar environment experience and partial-gravity gap analysis."),
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/solid-fuel-ignition-and-extinction-sofie/": ("NASA Glenn — Solid Fuel Ignition and Extinction (SoFIE)", "nasa_program_page", "high", "Current ISS solid-fuel fire-safety investigation in the PEARL/CFIR; extends the BASS lineage relevant to the Prevention/Suppression pillars."),
    "https://www.nasa.gov/glenn/glenn-expertise-space-exploration/physical-sciences-program/combustion-science/flammability-limits-at-reduced-g-experiment-flare/": ("NASA Glenn — Flammability Limits at Reduced Gravity (FLARE)", "nasa_program_page", "high", "Planned partial-gravity flammability-limits investigation; relevant to future lunar/Mars fire-safety analysis."),
    "https://gipoc.grc.nasa.gov/wp/fcf-cir/": ("GRC — FCF Combustion Integrated Rack (gipoc.grc.nasa.gov)", "nasa_program_page", "high", "Glenn internal FCF/CIR page; additional facility/hardware provenance for CIR-hosted investigations."),
}

PSI_UPLOADED_THIS_BATCH = {"PSI-20", "PSI-21", "PSI-159", "PSI-10", "PSI-22", "PSI-26", "PSI-39", "PSI-68", "PSI-69"}
PSI_IN_UPLOAD_UNDECLARED = {"PSI-25"}  # BASS-II archive present on storage but not declared in this batch message
PSI_INVESTIGATION_NAMES = {
    "PSI-159": "ACME Cool Flames Investigation with Gases (CFI-G)",
    "PSI-10": "ACME Flame Design",
    "PSI-101": "Smoke Aerosol Measurement Experiment — Reflight (SAME-R)",
    "PSI-98": "Spacecraft Fire Experiment — I (SAFFIRE-I)",
    "PSI-39": "Cool Flames Investigation (CFI)",
    "PSI-102": "Smoke Aerosol Measurement Experiment (SAME)",
    "PSI-106": "Structure and Liftoff in Combustion Experiment (SLICE)",
    "PSI-99": "Spacecraft Fire Experiment — II (SAFFIRE-II)",
    "PSI-107": "Smoke Point in Co-flow Experiment (SPICE)",
    "PSI-100": "Spacecraft Fire Experiment — III (SAFFIRE-III)",
    "PSI-21": "ACME Coflow Laminar Diffusion Flame (CLD Flame)",
    "PSI-25": "Burning and Suppression of Solids — II (BASS-II)",
    "PSI-20": "ACME Burning Rate Emulator (BRE)",
    "PSI-68": "Flame Extinguishment Experiment — 2 (FLEX-2)",
    "PSI-22": "ACME Electric-Field Effects on Laminar Diffusion Flames (E-FIELD Flames)",
    "PSI-23": "ACME Structure and Response of Spherical Diffusion Flames (s-Flame)",
    "PSI-69": "Flame Extinguishment Experiment (FLEX)",
    "PSI-26": "Burning and Suppression of Solids (BASS)",
    "PSI-47": "STDCE-2 (Surface Tension Driven Convection Experiment — 2, fluid physics)",
}

old = json.loads((ROOT / "scripts/context/42_user_supplied_nasa_links_2026_11_09.json").read_text())
known = {l["url"]: l["id"] for l in old["links"]}

records = []
dup_occurrences = []
for url in SUPPLIED:
    if url in known:
        dup_occurrences.append({"url": url, "registry": "42_user_supplied_nasa_links_2026_11_09.json", "existing_id": known[url]})
        continue
    if url in {r["url"] for r in records}:
        dup_occurrences.append({"url": url, "registry": "this file (same message duplicate)", "existing_id": next(r["id"] for r in records if r["url"] == url)})
        continue
    if url in META:
        title, cat, pri, desc = META[url]
        rid = "USR2-" + cat.upper() + "-" + str(len(records) + 1).zfill(2)
        records.append({"id": rid, "title": title, "url": url, "source_owner": url.split("/")[2], "category": cat, "user_supplied": True, "priority": pri, "description": desc, "verification_status_2026_11_09": "registered_from_user_message; not yet retrieved", "usage_in_project": [], "notes": "Supplied with the first real source-data batch (9 PSI investigation archives)."})
    elif "/investigations/PSI-" in url:
        psi = url.rsplit("/", 1)[1]
        title = f"PSI repository — {PSI_INVESTIGATION_NAMES.get(psi, psi)}"
        if psi in PSI_UPLOADED_THIS_BATCH:
            note = "Source-data archive for this investigation was uploaded and processed in batch B-20261109-001; this page is the canonical PSI landing page for provenance."
            pri = "critical"
        elif psi in PSI_IN_UPLOAD_UNDECLARED:
            note = "Archive present in upload storage but NOT declared in the batch-2 message; held for explicit user declaration before ingestion."
            pri = "high"
        else:
            note = "Referenced investigation; no archive uploaded yet. Expected in a future batch."
            pri = "medium"
        records.append({"id": f"USR2-PSI-{psi}", "title": title, "url": url, "source_owner": "psi.nasa.gov (NASA Physical Sciences Informatics)", "category": "psi_investigation_page", "user_supplied": True, "priority": pri, "description": f"PSI investigation landing page for {PSI_INVESTIGATION_NAMES.get(psi, psi)}. Landing page ≠ data download; any future retrieval must record redirects/status/checksums per the standing source-retrieval contract.", "verification_status_2026_11_09": "registered_from_user_message; not yet retrieved", "usage_in_project": [], "notes": note})
    else:
        records.append({"id": f"USR2-OTHER-{len(records)+1:02d}", "title": url, "url": url, "source_owner": url.split("/")[2], "category": "unclassified", "user_supplied": True, "priority": "low", "description": "", "verification_status_2026_11_09": "registered_from_user_message; not yet retrieved", "usage_in_project": [], "notes": ""})

out = {
    "description": "Second user-supplied link set, received with the first real source-data batch (9 PSI investigation ZIP archives) on 2026-11-09. Covers NASA imagery sources, 3D/charting framework research candidates, combustion-simulation references (research-only), NASA Glenn program pages and 19 PSI investigation pages. URLs already present in the 42-registry are recorded below as cross-references, not duplicated.",
    "supplied_occurrence_count": len(SUPPLIED),
    "unique_new_link_count": len(records),
    "already_registered_count": len(dup_occurrences),
    "new_links": records,
    "already_registered_cross_references": dup_occurrences,
    "standing_rules": [
        "Framework pages (threejs/r3f/babylon/vtk-js/plotly/echarts) are SELECTION-RESEARCH references for milestones U4/U5; no library is 'in use' until actually integrated.",
        "Cantera/OpenFOAM/NIST FDS are research-only references; the project never presents animations as CFD or physics-validated simulation.",
        "NASA imagery must be used with attribution; no stock or generated imagery may stand in for NASA experiment photos.",
        "PSI pages are landing pages, not dataset downloads; retrieval contract (status/redirect/checksum/licence) applies.",
    ],
}
target = ROOT / "scripts/context/54_user_supplied_tech_science_and_psi_links_2026_11_09.json"
target.write_text(json.dumps(out, indent=1, ensure_ascii=False) + "\n")
print(f"supplied occurrences : {len(SUPPLIED)}")
print(f"new unique links     : {len(records)}")
print(f"already registered   : {len(dup_occurrences)}")
for d in dup_occurrences:
    print(f"   - {d['url']}  ->  {d['existing_id']}")
print(f"written: {target}")
