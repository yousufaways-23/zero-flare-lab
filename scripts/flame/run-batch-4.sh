#!/bin/bash
# FLAME EVIDENCE LAB — batch D (2026-11-09, FINAL upload wave) launcher.
# The last two uploads: the freebuff project source snapshot and the master
# context JSON. After this batch the user's declaration "all files uploaded"
# is satisfied at the manifest level; the global audit then runs.
cd /home/z/my-project || exit 1

U=/home/z/my-project/upload

CMD=(bun scripts/flame/batch-run.mjs
  "$U/FLAME_EVIDENCE_LAB_MANUS_ULTIMATE_MASTER_CONTEXT_v4.json"
  "$U/freebuff project.zip"
  --note "Final upload wave (2 files): FLAME_EVIDENCE_LAB_MANUS_ULTIMATE_MASTER_CONTEXT_v4.json (project master context — requirements, decisions, source registers; registered as project documentation) and freebuff project.zip (project source snapshot, 2801 entries incl. the bundled PSI CSV corpus which dedupes against PRE-U1-CORPUS; source-code extensions now supported for extraction with the 40-child cap; .env-style files inventoried+hashed only, never text-extracted)."
)

CHUNK_SECONDS="${CHUNK_SECONDS:-500}"
ATTEMPTS="${ATTEMPTS:-1}"

for attempt in $(seq 1 "$ATTEMPTS"); do
  timeout "$CHUNK_SECONDS" "${CMD[@]}" && exit 0
  rc=$?
  pkill -f "pdf-child.mjs" 2>/dev/null || true
  sleep 2
  if [ "$rc" = "124" ]; then
    echo "[run-batch-4] chunk $attempt reached the ${CHUNK_SECONDS}s guard (checkpoint saved) — resumable"
  else
    echo "[run-batch-4] chunk $attempt exited rc=$rc (checkpoint saved) — retrying from checkpoint"
  fi
done
exit 124
