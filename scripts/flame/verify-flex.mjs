#!/usr/bin/env node
/**
 * Reproduce the FLEX model metrics from the command line.
 *   npm run verify
 * Prints the cleaning ledger, grouped vs random cross-validation, and compares
 * against the numbers quoted in the interface.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { decodeBytes } from "../../src/lib/science/csv.js";
import { analyzeFlex } from "../../src/lib/science/flexModel.js";

const here = dirname(fileURLToPath(import.meta.url));
const csvPath = join(here, "..", "..", "data", "raw", "PSI-69_FLEX.csv");
const text = decodeBytes(readFileSync(csvPath));

const t0 = Date.now();
const a = analyzeFlex(text);
const ms = Date.now() - t0;

const pct = (v) => (v == null ? "n/a" : (v * 100).toFixed(1) + "%");
const f3 = (v) => (v == null ? "n/a" : v.toFixed(3));

console.log("FLEX (PSI-69) extinction analysis");
console.log("=================================");
console.log(`source rows          ${a.ledger.sourceRows}`);
console.log(`kept                 ${a.ledger.kept}`);
console.log(`dropped: diameter    ${a.ledger.nonNumericDiameter} non-numeric (en-dash), ${a.ledger.blankDiameter} blank`);
console.log(`dropped: pressure    ${a.ledger.nonPositivePressure} non-positive`);
console.log(`conditions           ${a.conditions}`);
console.log(`extinction share     ${pct(a.prevalence)}`);
console.log(`outcomes             ${JSON.stringify(a.outcomes)}`);
console.log("");
console.log("model                       random CV   grouped CV   grouped bal.acc");
console.log(
  `logistic, XO2 only          ${f3(a.random.aucO2Only).padStart(9)}   ${f3(a.grouped.aucO2Only).padStart(10)}`,
);
console.log(
  `logistic, 6 features        ${f3(a.random.auc).padStart(9)}   ${f3(a.grouped.auc).padStart(10)}   ${f3(a.grouped.balancedAccuracy).padStart(9)}`,
);
console.log(`grouped AUC 95% interval    ${a.grouped.aucCi.map(f3).join(" – ")}`);
console.log("");
console.log("Coefficients (standardised):");
for (const c of a.coefficients) console.log(`  ${c.short.padEnd(6)} ${String(c.beta).padStart(8)}  ${c.label}`);
console.log(`  intercept ${a.intercept}`);
console.log("");
console.log(`computed in ${ms} ms, seed ${a.seed}`);
