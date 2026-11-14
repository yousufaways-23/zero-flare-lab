#!/bin/bash
# FLAME EVIDENCE LAB — batch B (2026-11-09, second upload wave) launcher.
# Runs the production ingestion pipeline on the 9 user-declared archives,
# in the exact order they were declared in the user message.
cd /home/z/my-project || exit 1

U=/home/z/my-project/upload

bun scripts/flame/batch-run.mjs \
  "$U/Burning and Suppression of Solids - II(BASS-II) - PSI-25.zip" \
  "$U/Smoke Point In Co-flow Experiment(SPICE) - PSI-107.zip" \
  "$U/Spacecraft Fire Experiment-II(SAFFIRE-II) - PSI-99.zip" \
  "$U/Spacecraft Fire Experiment-III(SAFFIRE-III) - PSI-100.zip" \
  "$U/Structure and Liftoff In Combustion Experiment(SLICE) - PSI-106.zip" \
  "$U/Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames(ACME s-Flame) - PSI-23 (part 1).zip" \
  "$U/Advanced Combustion via Microgravity Experiments-Structure and Response of Spherical Diffusion Flames(ACME s-Flame) - PSI-23 (part 2).zip" \
  "$U/Smoke Aerosol Measurement Experiment-Reflight(SAME-R) - PSI-101 (part 2).zip" \
  "$U/Smoke Aerosol Measurement Experiment-Reflight(SAME-R) - PSI-101 (part1).zip" \
  --note "Second upload wave (9 archives declared 2026-11-09 after batch B-20261109-001): BASS-II PSI-25, SPICE PSI-107, SAFFIRE-II PSI-99, SAFFIRE-III PSI-100, SLICE PSI-106, ACME s-Flame PSI-23 parts 1-2, SAME-R PSI-101 parts 1-2. Includes previously-held BASS-II archive now explicitly declared. xlsx row-materialization guard and multi-part investigation evidence keys added this batch."
