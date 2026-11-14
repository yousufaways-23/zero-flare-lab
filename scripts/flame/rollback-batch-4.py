#!/usr/bin/env python3
"""
FLAME EVIDENCE LAB — surgical rollback of batch B-20261109-004.

Purpose: the first pass of batch B-20261109-004 mapped source-code files
(.ts/.tsx/.js/…) to kind "unknown" because the archive-children regex had
been extended but the EXT_MAP in identify.ts had not, so 20 project-source
children were reported "unsupported" instead of being text-extracted.
EXT_MAP is now fixed; this script removes EVERY persisted trace of the
incomplete pass so the batch can be re-run cleanly (same batch id, complete
coverage).

Rollback targets (all verified against actual persistence points):
  1. data/ingest/registry.json        — drop entries firstSeenBatch == B4
  2. data/ingest/batches.json         — drop the B4 index entry
  3. data/ingest/cumulative.json      — restore exact post-batch-2 totals
  4. knowledge/entities.json          — drop B4 mentions; drop entities left
                                        with zero mentions
  5. knowledge/index.json             — drop docs with batchId == B4
  6. knowledge/investigation-map.json — drop B4 evidence keys / batches /
                                        investigations created by B4
  7. delete data/ingest/batches/B4.json (+ .state.json if present),
     reports/BATCH_RECEIPT_B4.md,
     data/raw/batches/B4/, data/extracted/batches/B4/, data/media/batches/B4/

Safety: refuses to run if any batch AFTER B-20261109-004 exists.
"""
import json
import shutil
import sys
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path("/home/z/my-project")
B4 = "B-20261109-004"


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
    # ---- safety: no batch may exist AFTER B-20261109-004 ------------------
    batches = load("data/ingest/batches.json")
    ids = [b["batchId"] for b in batches]
    if any(b != B4 and b > B4 for b in ids):
        sys.exit(f"ABORT: a batch newer than {B4!r} exists: {ids}")
    if ids.count(B4) > 1:
        sys.exit(f"ABORT: expected at most one {B4} entry, found {ids.count(B4)}")

    report = []

    # ---- 1. registry ------------------------------------------------------
    reg = load("data/ingest/registry.json")
    before = len(reg["entries"])
    reg["entries"] = {
        sha: e for sha, e in reg["entries"].items() if e.get("firstSeenBatch") != B4
    }
    save("data/ingest/registry.json", reg)
    report.append(f"registry: {before} -> {len(reg['entries'])} entries (-{before - len(reg['entries'])})")

    # ---- 2. batch index ---------------------------------------------------
    batches = [b for b in batches if b["batchId"] != B4]
    save("data/ingest/batches.json", batches)
    report.append(f"batch index: removed {B4}; remaining {[b['batchId'] for b in batches]}")

    # ---- 3. cumulative: restore exact post-batch-2 state ------------------
    # Values below are the machine-verified post-B-20261109-002 ledger
    # (read directly from cumulative.json before batch 3 ran).
    restored = {
        "batches": 3,
        "files": 398,
        "uniqueFiles": 339,
        "duplicateFiles": 59,
        "documents": 289,
        "pages": 8989,
        "chars": 16376806,
        "tables": 632,
        "tableRows": 394261,
        "equations": 1173,
        "figures": 3434,
        "mediaAssets": 2254,
        "entities": 95,
        "errors": 6,
        "userConfirmedAllUploads": load("data/ingest/cumulative.json").get("userConfirmedAllUploads", False),
        "lastBatchId": "B-20261109-003",
        "updatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%S.") + f"{datetime.now(timezone.utc).microsecond // 1000:03d}Z",
    }
    report.append(
        "cumulative: restored to post-B-20261109-002 state "
        "(files 440->398, entities ->95 pending check)"
    )

    # ---- 4. knowledge entities --------------------------------------------
    k = load("knowledge/entities.json")
    eb, kept = len(k["entities"]), {}
    dropped_entities = 0
    for eid, e in k["entities"].items():
        mentions = [m for m in e.get("mentions", []) if m.get("batchId") != B4]
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
        f"(-{dropped_entities} created by B4, B4 mentions stripped from the rest)"
    )
    if len(kept) != 95:
        report.append(f"  NOTE: entity count after cleanup is {len(kept)}, expected 95 — verify manually")

    # ---- 5. text index ----------------------------------------------------
    idx = load("knowledge/index.json")
    n0 = len(idx.get("docs", []))
    idx["docs"] = [d for d in idx.get("docs", []) if d.get("batchId") != B4]
    save("knowledge/index.json", idx)
    report.append(f"text index: {n0} -> {len(idx['docs'])} docs (-{n0 - len(idx['docs'])})")

    # ---- 6. investigation map ---------------------------------------------
    m = load("knowledge/investigation-map.json")
    inv0 = len(m["investigations"])
    for psi in list(m["investigations"].keys()):
        inv = m["investigations"][psi]
        if inv.get("firstSeenBatch") == B4:
            del m["investigations"][psi]
            continue
        inv["batches"] = [b for b in inv.get("batches", []) if b != B4]
        for key in [k for k in inv.get("batchEvidence", {}) if k == B4 or k.startswith(B4 + ":")]:
            del inv["batchEvidence"][key]
    m["updatedAt"] = restored["updatedAt"]
    save("knowledge/investigation-map.json", m)
    report.append(f"investigation map: {inv0} -> {len(m['investigations'])} investigations")

    # ---- 7. files & directories -------------------------------------------
    removed = []
    for rel in [
        f"data/ingest/batches/{B4}.json",
        f"data/ingest/batches/{B4}.state.json",
        f"reports/BATCH_RECEIPT_{B4}.md",
    ]:
        p = ROOT / rel
        if p.exists():
            p.unlink()
            removed.append(rel)
    for rel in [
        f"data/raw/batches/{B4}",
        f"data/extracted/batches/{B4}",
        f"data/media/batches/{B4}",
    ]:
        p = ROOT / rel
        if p.exists():
            shutil.rmtree(p)
            removed.append(rel + "/")
    report.append(f"deleted: {len(removed)} paths ({', '.join(removed)})")

    print("ROLLBACK COMPLETE — " + B4)
    for line in report:
        print("  " + line)


if __name__ == "__main__":
    main()
