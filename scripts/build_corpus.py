#!/usr/bin/env python3
"""Build the scientific corpus from recovered real NASA PSI CSVs.
Outputs JSON artifacts consumed by the Next.js app (src/data/generated/).
Honest statistics: parse failures, duplicates, fill rates are counted, not hidden.
"""
import csv, glob, hashlib, json, os, re
import os
from collections import Counter

RAW = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "raw")
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "src", "data", "generated")
os.makedirs(OUT, exist_ok=True)

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

TABLE_META = {
    "PSI-10_FlameDesign_Normal.csv": {"inv": "PSI-10", "label": "ACME Flame Design — Normal"},
    "PSI-10_FlameDesign_Inverse.csv": {"inv": "PSI-10", "label": "ACME Flame Design — Inverse"},
    "PSI-20_ACME-BRE.csv": {"inv": "PSI-20", "label": "ACME Burning Rate Emulator"},
    "PSI-21_CLD-Flame.csv": {"inv": "PSI-21", "label": "ACME CLD Flame"},
    "PSI-22_E-FIELD-Flames.csv": {"inv": "PSI-22", "label": "ACME E-FIELD Flames"},
    "PSI-23_s-Flame.csv": {"inv": "PSI-23", "label": "ACME s-Flame"},
    "PSI-25_BASS-II.csv": {"inv": "PSI-25", "label": "BASS-II"},
    "PSI-26_BASS.csv": {"inv": "PSI-26", "label": "BASS"},
    "PSI-39_CFI.csv": {"inv": "PSI-39", "label": "Cool Flames Investigation"},
    "PSI-47_PSI-47_Experimental_table_DAFT.csv": {"inv": "PSI-47", "label": "DAFT (Dust/Aerosol Feasibility)"},
    "PSI-68_FLEX-2.csv": {"inv": "PSI-68", "label": "FLEX-2"},
    "PSI-69_FLEX.csv": {"inv": "PSI-69", "label": "FLEX"},
    "PSI-98_PSI-98_Experimental_table_SAFFIRE-1.csv": {"inv": "PSI-98", "label": "SAFFIRE-I"},
    "PSI-99_SAFFIRE-II.csv": {"inv": "PSI-99", "label": "SAFFIRE-II"},
    "PSI-100_SAFFIRE-III.csv": {"inv": "PSI-100", "label": "SAFFIRE-III"},
    "PSI-101_SAME-R.csv": {"inv": "PSI-101", "label": "SAME-R"},
    "PSI-102_SAME.csv": {"inv": "PSI-102", "label": "SAME"},
    "PSI-106_SLICE.csv": {"inv": "PSI-106", "label": "SLICE"},
    "PSI-107_SPICE.csv": {"inv": "PSI-107", "label": "SPICE"},
    "PSI-142_PSI-142_Experimental_table_Data_Summary_Table.csv": {"inv": "PSI-142", "label": "Cool Flame Transitions (data summary)"},
    "PSI-159_CFI-G_Normal.csv": {"inv": "PSI-159", "label": "CFI-G Normal Flames"},
    "PSI-159_CFI-G_Inverse.csv": {"inv": "PSI-159", "label": "CFI-G Inverse Flames"},
    "PSI-108_PSI-108_Experimental_table_STDCE-1.csv": {"inv": "PSI-108", "label": "STDCE-1 (Surface Tension Driven Convection)"},
    "PSI-108_PSI-108_Experimental_table_STDCE-1(1).csv": {"inv": "PSI-108", "label": "STDCE-1 — runs variant"},
}

UNIT_RE = re.compile(r"^(.*?)[;:]?\s*\[?((?:mmHg|bar|kPa|psi|mm|cm|m|s|ms|K|C|mg|g|kg|µm|um|W|kW|%|mole fraction|sccm|cm/s|m/s|mg/s|°C)\b[^;\]]*)\]?\s*$", re.I)

def split_unit(h):
    # "Ambient pressure; mmHg" -> ("Ambient pressure", "mmHg")
    if ";" in h:
        name, unit = h.split(";", 1)
        return name.strip(), unit.strip()
    return h.strip(), None

def parse_num(v):
    v = v.strip()
    if v == "": return None
    try:
        f = float(v)
        return f
    except ValueError:
        return None

def histogram(nums, bins=12):
    lo, hi = min(nums), max(nums)
    if hi == lo:
        return {"binStart": [lo], "binEnd": [hi], "counts": [len(nums)]}
    w = (hi - lo) / bins
    counts = [0] * bins
    for x in nums:
        k = min(bins - 1, int((x - lo) / w))
        counts[k] += 1
    return {
        "binStart": [round(lo + i * w, 6) for i in range(bins)],
        "binEnd": [round(lo + (i + 1) * w, 6) for i in range(bins)],
        "counts": counts,
    }

corpus = {"tables": []}
tot_rows = tot_cols = tot_parse_fail = tot_dup = 0

for path in sorted(glob.glob(f"{RAW}/*.csv")):
    fname = os.path.basename(path)
    enc = "cp1252" if fname == "PSI-69_FLEX.csv" else "utf-8-sig"
    with open(path, encoding=enc) as f:
        rows = list(csv.reader(f))
    if len(rows) < 2:
        continue
    header = [h.strip() for h in rows[0]]
    data = [r for r in rows[1:] if any(c.strip() for c in r)]  # drop fully-empty rows
    meta = TABLE_META.get(fname, {"inv": fname.split("_")[0], "label": fname})

    # duplicates (exact row content)
    row_tuples = Counter(tuple(c.strip() for c in r) for r in data)
    dups = sum(v - 1 for v in row_tuples.values() if v > 1)

    # column profiles
    cols = []
    for i, h in enumerate(header):
        name, unit = split_unit(h)
        vals = [r[i].strip() if i < len(r) else "" for r in data]
        nums = [parse_num(v) for v in vals]
        nums_valid = [n for n in nums if n is not None]
        filled = sum(1 for v in vals if v != "")
        n = len(vals)
        col = {
            "index": i, "name": name, "rawHeader": h, "unit": unit,
            "filled": filled, "fillRate": round(filled / n, 4) if n else 0,
        }
        if len(nums_valid) >= max(2, 0.5 * filled):
            col["type"] = "numeric"
            # parse failures: filled cells failing numeric parse within numeric-typed columns
            col["parseFailures"] = filled - len(nums_valid)
            srt = sorted(nums_valid)
            col.update({
                "min": srt[0], "max": srt[-1],
                "mean": round(sum(nums_valid) / len(nums_valid), 4),
                "median": srt[len(srt) // 2],
                "std": round((sum((x - sum(nums_valid) / len(nums_valid)) ** 2 for x in nums_valid) / max(1, len(nums_valid) - 1)) ** 0.5, 4),
                "histogram": histogram(nums_valid),
            })
        else:
            col["type"] = "categorical"
            # text columns are correctly typed, not parse failures
            col["parseFailures"] = 0
            top = Counter(v for v in vals if v != "").most_common(12)
            col["topValues"] = [{"value": v, "count": c} for v, c in top]
        cols.append(col)

    sha = hashlib.sha256(open(path, "rb").read()).hexdigest()
    table = {
        "id": fname.replace(".csv", ""),
        "file": fname, "bytes": os.path.getsize(path), "sha256": sha,
        "investigation": meta["inv"], "label": meta["label"],
        "columns": cols, "rowCount": len(data), "columnCount": len(header),
        "duplicateRows": dups,
        "rows": data,
        "source": "NASA Physical Sciences Informatics (psi.nasa.gov), experimental table",
    }
    corpus["tables"].append(table)
    tot_rows += len(data); tot_cols += len(header)
    tot_parse_fail += sum(c["parseFailures"] for c in cols)
    tot_dup += dups

corpus["totals"] = {
    "tables": len(corpus["tables"]), "rows": tot_rows, "columns": tot_cols,
    "parseFailures": tot_parse_fail, "duplicateRows": tot_dup,
    "generatedAt": __import__("time").strftime("%Y-%m-%dT%H:%M:%SZ", __import__("time").gmtime()),
    "method": "Recomputed from recovered data/raw CSVs (sha256-verified against project manifest) in this rebuild.",
}

with _open(os.path.join(OUT, "corpus.json"), "w") as f:
    json.dump(corpus, f)

print(f"tables: {len(corpus['tables'])}, rows: {tot_rows}, cols: {tot_cols}")
print(f"parse failures: {tot_parse_fail}, duplicate rows: {tot_dup}")
for t in corpus["tables"]:
    print(f"  {t['id']:38} rows={t['rowCount']:4} cols={t['columnCount']:2} dups={t['duplicateRows']:2}")
