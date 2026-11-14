#!/usr/bin/env python3
"""Fetch real NASA PSI combustion investigation experimental tables.
Records provenance (URL, bytes, sha256, fetched_at) for every file.
"""
import json, hashlib, os, subprocess, sys, time
from urllib.parse import quote as requests_quote

OUT = "/home/z/my-project/data/raw"
META = "/home/z/my-project/data/ingest"
os.makedirs(OUT, exist_ok=True)
os.makedirs(META, exist_ok=True)

# Path-containment guard: every open() in this acquisition script is
# restricted to its declared data roots (refuses paths that escape them).
import builtins as _builtins
_DATA_ROOTS = [os.path.abspath(OUT), os.path.abspath(META)]
_open = _builtins.open
def _contained_open(file, *a, **k):
    try:
        p = os.path.abspath(os.fspath(file))
    except TypeError:
        return _open(file, *a, **k)
    if not any(p == r or p.startswith(r + os.sep) for r in _DATA_ROOTS):
        raise ValueError("blocked path outside acquisition data roots: %r" % (file,))
    return _open(file, *a, **k)
_builtins.open = _contained_open

BASE = "https://psi.nasa.gov/geode-py/ws"

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

# 1. Get combustion investigations
search = curl_json(f"{BASE}/repo/search?term=&size=100&from=0&ffield=Research%20Area&fvalue=Combustion%20Science")
comb = [h for h in search.get("hits", {}).get("hits", []) if h.get("_source")]
print(f"combustion investigations found: {len(comb)}")

ledger = []
for hit in comb:
    src = hit["_source"]
    acc = src.get("Accession") or src.get("accession") or src.get("study_id") or hit.get("_id")
    title = src.get("Title") or src.get("title") or ""
    print(f"\n=== {acc}: {title[:80]}")
    inv = curl_json(f"{BASE}/repo/investigations/{acc}")
    if not inv:
        print("  no metadata"); continue
    version = inv.get("study", {}).get("version") or inv.get("version")
    etables = inv.get("experimentalTable") or inv.get("experimental_table") or []
    doi = inv.get("study", {}).get("doi") or inv.get("doi")
    etables = etables if isinstance(etables, list) else []
    entry = {"accession": acc, "title": title, "version": version, "doi": doi,
             "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
             "files": []}
    for et in etables:
        fname = et.get("file_name") or et.get("filename")
        fver = et.get("version")
        if not fname: continue
        safe = fname.replace("/", "_").replace(" ", "_")
        url = f"{BASE}/studies/{acc}/download?file={requests_quote(fname)}&version={fver}"
        dest = os.path.join(OUT, f"{acc}_{safe}")
        if not os.path.splitext(dest)[1]:
            dest += ".csv"
        r = subprocess.run(["curl", "-sL", "--max-time", "90", "-o", dest, "-w", "%{http_code} %{size_download} %{content_type}", url],
                           capture_output=True, text=True)
        status = r.stdout.strip()
        ok = False
        if os.path.exists(dest) and os.path.getsize(dest) > 50:
            with open(dest, "rb") as f:
                head = f.read(16)
            ok = not head.lstrip().startswith(b"<!DOCTYPE") and not head.lstrip().startswith(b"<html")
        rec = {"file_name": fname, "version": fver, "url": url,
               "status": status.split()[0] if status else "?",
               "bytes": os.path.getsize(dest) if os.path.exists(dest) else 0, "download_ok": ok}
        if ok:
            with open(dest, "rb") as f:
                rec["sha256"] = hashlib.sha256(f.read()).hexdigest()
        entry["files"].append(rec)
        print(f"  {fname} v{fver}: {status} ok={ok}")
    ledger.append(entry)
    time.sleep(0.4)

with _open(os.path.join(META, "psi_fetch_ledger.json"), "w") as f:
    json.dump({"fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
               "source": "NASA Physical Sciences Informatics (psi.nasa.gov) public download endpoint",
               "license_note": "NASA public data; cite DOI per investigation",
               "investigations": ledger}, f, indent=1)
print("\nLedger written. OK files:", sum(1 for e in ledger for x in e["files"] if x["download_ok"]))
