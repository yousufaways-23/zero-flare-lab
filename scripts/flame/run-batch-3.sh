#!/bin/bash
# FLAME EVIDENCE LAB — batch C (2026-11-09, third upload wave) launcher.
#
# The pipeline checkpoints after every file (data/ingest/batches/<id>.state.json),
# so an interrupted pass loses at most the file in flight. This launcher runs the
# batch in resumable foreground chunks of ~4.5 minutes; if a chunk is cut short
# (sandbox process recycling), simply invoke this script again — it resumes
# exactly where the previous pass stopped and reuses all completed records.
# When the batch completes, the pipeline prints the receipt and this script
# exits 0.
cd /home/z/my-project || exit 1

U=/home/z/my-project/upload

CMD=(bun scripts/flame/batch-run.mjs
  "$U/Smoke and Aerosol Measurement Experiment(SAME) - PSI-102 (part 1).zip"
  "$U/Smoke and Aerosol Measurement Experiment(SAME) - PSI-102 (part 2).zip"
  "$U/paper 1.zip"
  "$U/paper 2.zip"
  "$U/Important Documents 1.zip"
  "$U/Important Documents 2.zip"
  "$U/Flame_in_Freefall_Scientific_Reference_Notebook (1).pdf"
  "$U/Nasa Space Apps Chat GPT 2.pdf"
  "$U/image_catalog.html"
  "$U/References & some PDFs.zip"
  --note "Third upload wave (10 files declared 2026-11-09 after batch B-20261109-002): SAME PSI-102 parts 1-2 (hardware drawings + ICES papers + progress decks), paper 1.zip (23 peer-reviewed journal PDFs), paper 2.zip (14 peer-reviewed journal PDFs), Important Documents 1+2 (29 NASA technical reports, fact sheets and standards incl. NASA-STD-3001 Vol 2 and OCHMO-TB-008), Flame in Freefall Scientific Reference Notebook PDF, NASA Space Apps ChatGPT challenge-analysis PDF, image_catalog.html (media catalog with 1043 embedded base64 figure thumbnails — new HTML data-URI media extraction), References & some PDFs.zip (team reference compendia, LaTeX source, full inventory CSV, Ross and Turns textbooks)."
)

CHUNK_SECONDS="${CHUNK_SECONDS:-265}"
ATTEMPTS="${ATTEMPTS:-2}"

for attempt in $(seq 1 "$ATTEMPTS"); do
  timeout "$CHUNK_SECONDS" "${CMD[@]}" && exit 0
  rc=$?
  # clear any orphaned pdf extraction children before the next pass
  pkill -f "pdf-child.mjs" 2>/dev/null || true
  sleep 2
  if [ "$rc" = "124" ]; then
    echo "[run-batch-3] chunk $attempt reached the ${CHUNK_SECONDS}s guard (checkpoint saved) — resumable"
  else
    echo "[run-batch-3] chunk $attempt exited rc=$rc (checkpoint saved) — retrying from checkpoint"
  fi
done
exit 124
