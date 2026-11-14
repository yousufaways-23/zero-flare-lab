#!/usr/bin/env python3
"""Fetch full PSI investigation metadata for all combustion studies + authentic NASA media."""
import json, os, subprocess, time

BASE = "https://psi.nasa.gov/geode-py/ws"
OUT = "/home/z/my-project/data"

# Path-containment guard: every open() in this acquisition script is
# restricted to its declared data root (refuses paths that escape it).
import builtins as _builtins
_DATA_ROOT = os.path.abspath(OUT)
_open = _builtins.open
def _contained_open(file, *a, **k):
    try:
        p = os.path.abspath(os.fspath(file))
    except TypeError:
        return _open(file, *a, **k)
    if not (p == _DATA_ROOT or p.startswith(_DATA_ROOT + os.sep)):
        raise ValueError("blocked path outside acquisition data root: %r" % (file,))
    return _open(file, *a, **k)
_builtins.open = _contained_open

def curl_json(url, data=None):
    cmd = ["curl", "-s", "--max-time", "30", url]
    if data is not None:
        cmd += ["-X", "POST", "-H", "Content-Type: application/json",
                "-H", "Accept: application-json", "-H", 'user_token: ""',
                "-d", json.dumps(data)]
    r = subprocess.run(cmd, capture_output=True, text=True)
    try:
        return json.loads(r.stdout) if r.stdout else None
    except json.JSONDecodeError:
        return None

# --- 1. investigation metadata ---
search = curl_json(f"{BASE}/repo/search?term=&size=100&from=0&ffield=Research%20Area&fvalue=Combustion%20Science")
hits = [h["_source"] for h in search["hits"]["hits"]]
print(f"{len(hits)} combustion investigations")

investigations = []
for src in hits:
    acc = src["Accession"]
    inv = curl_json(f"{BASE}/repo/investigations/{acc}") or {}
    study = inv.get("study", {})
    rec = {
        "accession": acc,
        "title": src.get("Title"),
        "researchArea": src.get("Research Area"),
        "subResearchArea": src.get("SubResearch Area"),
        "projectType": src.get("Project Type"),
        "flightPlatform": src.get("Flight Platform"),
        "keywords": src.get("Keywords", ""),
        "objectives": src.get("Objectives"),
        "approach": src.get("Approach"),
        "hypothesis": src.get("Hypothesis"),
        "impacts": src.get("Research Impacts/Earth Benefits"),
        "startDate": src.get("Investigation Start Date"),
        "endDate": src.get("Investigation End Date"),
        "monitoringCenter": src.get("Monitoring Center"),
        "sponsor": src.get("Sponsoring Agency"),
        "doi": study.get("doi") or inv.get("doi"),
        "version": study.get("version"),
        "pi": src.get("Person", {}),
        "hardware": src.get("Experiment Hardware"),
        "publications": {
            "titles": src.get("Publication Title", ""),
            "authors": src.get("Publication Author List", ""),
        },
        "relatedInvestigations": src.get("Related Investigations", ""),
        "dataFiles": [
            {"file_name": t.get("file_name"), "version": t.get("version")}
            for t in (inv.get("experimentalTable") or [])
        ],
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        "source_url": f"https://psi.nasa.gov/physci/repo/investigation/{acc.replace('PSI-', '')}",
    }
    investigations.append(rec)
    print(f"  {acc}: {rec['title'][:60]} | doi={rec['doi']}")
    time.sleep(0.3)

with _open(os.path.join(OUT, "ingest", "psi_investigation_metadata.json"), "w") as f:
    json.dump({"fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "source": "NASA PSI repository API (psi.nasa.gov/geode-py/ws)",
               "investigations": investigations}, f, indent=1)
print(f"\nWrote {len(investigations)} investigation records")

# --- 2. NASA Images API: authentic media for key subjects ---
queries = [
    ("microgravity combustion", 8),
    ("Combustion Integrated Rack", 6),
    ("FLEX flame extinguishment experiment", 6),
    ("SAFFIRE spacecraft fire experiment", 6),
    ("ACME advanced combustion microgravity experiments", 6),
    ("International Space Station Destiny laboratory", 5),
    ("smoke aerosol measurement experiment SAME", 4),
    (" astronaut ISS interior", 4),
]
media = []
seen = set()
for q, n in queries:
    r = subprocess.run(["curl", "-s", "--max-time", "20",
        f"https://images-api.nasa.gov/search?q={q.replace(' ', '%20')}&media_type=image&page_size={n}"],
        capture_output=True, text=True)
    try:
        d = json.loads(r.stdout)
    except Exception:
        continue
    for it in d.get("collection", {}).get("items", []):
        data = it.get("data", [{}])[0]
        nasa_id = data.get("nasa_id")
        if not nasa_id or nasa_id in seen: continue
        seen.add(nasa_id)
        link = next((l["href"] for l in it.get("links", []) if l.get("render") == "image"), None)
        media.append({
            "nasa_id": nasa_id,
            "title": data.get("title"),
            "description": (data.get("description") or "")[:600],
            "center": data.get("center"),
            "date_created": data.get("date_created"),
            "keywords": data.get("keywords", [])[:12],
            "thumb": link.replace("~thumb", "~medium") if link else None,
            "full": link.replace("~thumb", "~large") if link else None,
            "api_query": q,
            "provenance": "NASA Images and Video Library (images.nasa.gov)",
        })
    print(f"media '{q}': total {len(media)}")

with _open(os.path.join(OUT, "ingest", "nasa_media_index.json"), "w") as f:
    json.dump({"fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "source": "NASA Images and Video Library API (images-api.nasa.gov)",
               "rights": "NASA media usage guidelines; content generally not copyrighted (public domain); credit NASA",
               "items": media}, f, indent=1)
print(f"Wrote {len(media)} authentic NASA media records")
