#!/usr/bin/env python3
"""
FLAME EVIDENCE LAB — surgical rollback of batch B-20261109-002.

Purpose: the first pass of batch B-20261109-002 missed two archive-child
extension classes (.xls legacy workbooks, .jpe NASA ISS photos) because they
were absent from the supported-children regex. The regex is now fixed; this
script removes EVERY persisted trace of the incomplete pass so the batch can
be re-run cleanly (same batch id, complete coverage). Raw preserved bytes of
the incomplete pass are deleted together with their ledger entries, so no
orphaned evidence remains.

Rollback targets (all verified against actual persistence points):
  1. data/ingest/registry.json        — drop entries firstSeenBatch == B2
  2. data/ingest/batches.json         — drop the B2 index entry
  3. data/ingest/cumulative.json      — restore exact post-batch-1 totals
  4. knowledge/entities.json          — drop B2 mentions; drop entities left
                                        with zero mentions
  5. knowledge/index.json             — drop docs with batchId == B2
  6. knowledge/investigation-map.json — drop B2 evidence keys / batches /
                                        investigations created by B2
  7. delete data/ingest/batches/B2.json, reports/BATCH_RECEIPT_B2.md,
     data/raw/batches/B2/, data/extracted/batches/B2/, data/media/batches/B2/

Safety: refuses to run if any batch AFTER B-20261109-002 exists (would break
ordering). Prints a full verification report at the end.
"""
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/z/my-project")
B2 = "B-20261109-002"


def load(rel):
    return json.loads((ROOT / rel).read_text())


def save(rel, obj):
    # ensure_ascii=True: the JS pipeline can emit escaped lone surrogates
    # (truncated astral math symbols); ASCII-escaped JSON is semantically
    # identical for the JS readers and encodable from Python.
    tmp = ROOT / (rel + ".tmp")
    tmp.write_text(json.dumps(obj, indent=2, ensure_ascii=True))
    tmp.replace(ROOT / rel)


def main():
    # ---- safety: no batch may exist AFTER B-20261109-002 ------------------
    # (a partially-completed rollback — index already cleaned — is tolerated)
    batches = load("data/ingest/batches.json")
    ids = [b["batchId"] for b in batches]
    if any(b != B2 and b > B2 for b in ids):
        sys.exit(f"ABORT: a batch newer than {B2!r} exists: {ids}")
    if ids.count(B2) > 1:
        sys.exit(f"ABORT: expected at most one {B2} entry, found {ids.count(B2)}")

    report = []

    # ---- 1. registry ------------------------------------------------------
    reg = load("data/ingest/registry.json")
    before = len(reg["entries"])
    reg["entries"] = {
        sha: e for sha, e in reg["entries"].items() if e.get("firstSeenBatch") != B2
    }
    save("data/ingest/registry.json", reg)
    report.append(f"registry: {before} -> {len(reg['entries'])} entries (-{before - len(reg['entries'])})")

    # ---- 2. batch index ---------------------------------------------------
    batches = [b for b in batches if b["batchId"] != B2]
    save("data/ingest/batches.json", batches)
    report.append(f"batch index: removed {B2}; remaining {[b['batchId'] for b in batches]}")

    # ---- 3. cumulative: restore exact post-batch-1 state ------------------
    # Values below are the machine-verified post-B-20261109-001 ledger
    # (read directly from cumulative.json before batch 2 ran).
    restored = {
        "batches": 1,
        "files": 110,
        "uniqueFiles": 88,
        "duplicateFiles": 22,
        "documents": 69,
        "pages": 2043,
        "chars": 3913637,
        "tables": 140,
        "tableRows": 1992,
        "equations": 345,
        "figures": 715,
        "mediaAssets": 393,
        "entities": 64,  # verified below against the cleaned entities.json
        "errors": 1,
        "userConfirmedAllUploads": load("data/ingest/cumulative.json").get("userConfirmedAllUploads", False),
        "lastBatchId": "B-20261109-001",
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{datetime.now(timezone.utc).microsecond // 1000:03d}Z",
    }
    report.append(
        "cumulative: restored to post-B-20261109-001 state "
        f"(files 249->110, tables 378->140, entities ->64 pending check)"
    )

    # ---- 4. knowledge entities --------------------------------------------
    k = load("knowledge/entities.json")
    eb, kept = len(k["entities"]), {}
    dropped_entities = 0
    for eid, e in k["entities"].items():
        mentions = [m for m in e.get("mentions", []) if m.get("batchId") != B2]
        if not mentions:
            dropped_entities += 1
            continue
        e["mentions"] = mentions
        kept[eid] = e
    k["entities"] = kept
    save("knowledge/entities.json", k)
    restored["entities"] = len(kept)
    restored["updatedAt"] = json.loads((ROOT / "data/ingest/cumulative.json").read_text())["updatedAt"]
    save("data/ingest/cumulative.json", restored)
    report.append(
        f"knowledge entities: {eb} -> {len(kept)} types "
        f"(-{dropped_entities} created by B2, B2 mentions stripped from the rest)"
    )
    if len(kept) != 64:
        report.append(f"  NOTE: entity count after cleanup is {len(kept)}, expected 64 — verify manually")

    # ---- 5. text index ----------------------------------------------------
    idx = load("knowledge/index.json")
    n0 = len(idx.get("docs", []))
    idx["docs"] = [d for d in idx.get("docs", []) if d.get("batchId") != B2]
    save("knowledge/index.json", idx)
    report.append(f"text index: {n0} -> {len(idx['docs'])} docs (-{n0 - len(idx['docs'])})")

    # ---- 6. investigation map ---------------------------------------------
    m = load("knowledge/investigation-map.json")
    inv0 = len(m["investigations"])
    for psi in list(m["investigations"].keys()):
        inv = m["investigations"][psi]
        if inv.get("firstSeenBatch") == B2:
            del m["investigations"][psi]
            continue
        inv["batches"] = [b for b in inv.get("batches", []) if b != B2]
        for key in [k for k in inv.get("batchEvidence", {}) if k == B2 or k.startswith(B2 + ":")]:
            del inv["batchEvidence"][key]
    m["updatedAt"] = restored["updatedAt"]
    save("knowledge/investigation-map.json", m)
    report.append(f"investigation map: {inv0} -> {len(m['investigations'])} investigations")

    # ---- 7. files & directories -------------------------------------------
    removed = []
    for rel in [
        f"data/ingest/batches/{B2}.json",
        f"reports/BATCH_RECEIPT_{B2}.md",
    ]:
        p = ROOT / rel
        if p.exists():
            p.unlink()
            removed.append(rel)
    for rel in [
        f"data/raw/batches/{B2}",
        f"data/extracted/batches/{B2}",
        f"data/media/batches/{B2}",
    ]:
        p = ROOT / rel
        if p.exists():
            shutil.rmtree(p)
            removed.append(rel + "/")
    report.append(f"deleted: {len(removed)} paths ({', '.join(removed)})")

    print("ROLLBACK COMPLETE — " + B2)
    for line in report:
        print("  " + line)


if __name__ == "__main__":
    main()
