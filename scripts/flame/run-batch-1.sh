#!/bin/bash
# FLAME EVIDENCE LAB — batch A (2026-11-09, first upload wave) launcher.
# Re-run with the upgraded pipeline (legacy .doc/.ppt LibreOffice fallback,
# LaTeX/BibTeX + source-code text registration, HTML data-URI media extraction)
# after the full ledger reset, so every file extracts instead of failing.
cd /home/z/my-project || exit 1

U=/home/z/my-project/upload

CMD=(bun scripts/flame/batch-run.mjs
  "$U/Advanced Combustion via Microgravity Experiments - Burning Rate Emulator(ACME BRE) - PSI-20.zip"
  "$U/Advanced Combustion via Microgravity Experiments  Coflow Laminar Diffusion Flame(ACME CLD Flame) - PSI-21.zip"
  "$U/Advanced Combustion via Microgravity Experiments  Cool Flames Investigation with Gases(ACME CFI-G) - PSI-159.zip"
  "$U/Advanced Combustion via Microgravity Experiments  Flame Design(ACMEFlame Design) - PSI-10.zip"
  "$U/Advanced Combustion via Microgravity Experiments Electric-Field Effects on Laminar Diffusion Flames(ACME E-FIELD Flames) - PSI-22.zip"
  "$U/Burning and Suppression of Solids(BASS) - PSI-26.zip"
  "$U/Cool Flames Investigation(CFI) - PSI-39.zip"
  "$U/Flame Extinguishment Experiment - 2(FLEX-2) - PSI-68.zip"
  "$U/Flame Extinguishment Experiment(FLEX) - PSI-69.zip"
  --note "First upload wave (9 PSI investigation archives, re-processed with the upgraded pipeline after full ledger reset): ACME BRE PSI-20, ACME CLD Flame PSI-21, ACME CFI-G PSI-159, ACME Flame Design PSI-10, ACME E-FIELD Flames PSI-22, BASS PSI-26, CFI PSI-39, FLEX-2 PSI-68, FLEX PSI-69."
)

CHUNK_SECONDS="${CHUNK_SECONDS:-265}"
ATTEMPTS="${ATTEMPTS:-2}"

for attempt in $(seq 1 "$ATTEMPTS"); do
  timeout "$CHUNK_SECONDS" "${CMD[@]}" && exit 0
  rc=$?
  pkill -f "pdf-child.mjs" 2>/dev/null || true
  sleep 2
  if [ "$rc" = "124" ]; then
    echo "[run-batch-1] chunk $attempt reached the ${CHUNK_SECONDS}s guard (checkpoint saved) — resumable"
  else
    echo "[run-batch-1] chunk $attempt exited rc=$rc (checkpoint saved) — retrying from checkpoint"
  fi
done
exit 124
