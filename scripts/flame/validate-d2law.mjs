// Compute d2-law partial-validation statistics from the canonical PSI-69 FLEX table.
// Writes data/validation/d2law_validation.json (validation evidence for the model registry).
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const c = JSON.parse(readFileSync(path.join(ROOT, "src", "data", "generated", "corpus.json"), "utf8"));
const t = c.tables.find((x) => x.id === "PSI-69_FLEX");
const cols = Object.fromEntries(t.columns.map((col, i) => [col.name, i]));
const iD0 = cols["Droplet initial diameter"];
const iK = cols["Burning rate"];
const iT = cols["Burn time"];
const iFuel = cols["Fuel"];

const num = (v) => {
  const x = parseFloat((v ?? "").trim());
  return Number.isFinite(x) && x > 0 ? x : null;
};

const rows = [];
for (const r of t.rows) {
  const d0 = num(r[iD0]);
  const k = num(r[iK]);
  const tb = num(r[iT]);
  const fuel = (r[iFuel] ?? "").trim();
  if (d0 && tb) rows.push({ fuel, d0, k, tb });
}

const median = (arr) => {
  const s = [...arr].sort((a, b) => a - b);
  return s.length % 2 ? s[(s.length - 1) / 2] : (s[s.length / 2 - 1] + s[s.length / 2]) / 2;
};

const kByFuel = {};
const res = [];
for (const r of rows) {
  if (r.k) {
    const tPred = r.d0 ** 2 / r.k;
    res.push(Math.abs(tPred - r.tb));
    (kByFuel[r.fuel] ??= []).push(r.k);
  }
}

const out = {
  source: "PSI-69_FLEX (canonical corpus, SHA-256-verified)",
  computedAt: new Date().toISOString(),
  note: "d2-law: d(t) = d0*sqrt(1 - t/t_life), t_life = d0^2/K; K reported directly in the recovered table as 'Burning rate' (mm^2/s)",
  usable_rows: rows.length,
  internal_consistency: {},
  burning_rate_by_fuel: {},
  lifetime_prediction: {},
  limitations: [
    "Quasi-steady d2-law is an idealisation: real FLEX droplets show time-varying K, disruption events and radiative effects",
    "Internal consistency checks the table against itself (t = d0^2/K); it is NOT independent validation",
    "K-by-fuel medians are compared against published literature order-of-magnitude ranges as PARTIAL validation only",
  ],
  validation_class: "partially_validated (internal consistency + literature order-of-magnitude; no independent campaign)",
};

if (res.length) {
  out.internal_consistency = {
    n: res.length,
    mae_s: +(res.reduce((a, b) => a + b, 0) / res.length).toFixed(3),
    rmse_s: +Math.sqrt(res.reduce((a, b) => a + b * b, 0) / res.length).toFixed(3),
    median_s: +median(res).toFixed(3),
  };
}

for (const [f, ks] of Object.entries(kByFuel).sort()) {
  const med = median(ks);
  out.burning_rate_by_fuel[f] = {
    n: ks.length,
    median_mm2_s: +med.toFixed(3),
    min: +Math.min(...ks).toFixed(3),
    max: +Math.max(...ks).toFixed(3),
    lit_range_note: "classical microgravity droplet-burning K is commonly O(0.5-1.5) mm^2/s for methanol/heptane at these conditions",
    within_lit_order_of_magnitude: Math.min(...ks) > 0.1 && Math.max(...ks) < 5,
  };
}

const pred = {};
for (const [f, ks] of Object.entries(kByFuel).sort()) {
  const km = median(ks);
  let tps = rows.filter((r) => r.fuel === f).map((r) => ({ pred: r.d0 ** 2 / km, meas: r.tb }));
  if (tps.length >= 5) {
    const mae = tps.reduce((a, b) => a + Math.abs(b.pred - b.meas), 0) / tps.length;
    const rmse = Math.sqrt(tps.reduce((a, b) => a + (b.pred - b.meas) ** 2, 0) / tps.length);
    pred[f] = { n: tps.length, K_used: +km.toFixed(3), mae_s: +mae.toFixed(2), rmse_s: +rmse.toFixed(2) };
  }
}
out.lifetime_prediction = pred;

const dest = path.join(ROOT, "data", "validation", "d2law_validation.json");
mkdirSync(path.dirname(dest), { recursive: true });
writeFileSync(dest, JSON.stringify(out, null, 1), "utf8");
console.log(JSON.stringify({ usable_rows: rows.length, internal_consistency: out.internal_consistency, lifetime_prediction: pred }, null, 1));
console.log("written:", dest);
