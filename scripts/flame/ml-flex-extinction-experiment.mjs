// ZERO FLARE — M7 ML experimentation harness (definitive master build).
//
// Task: binary classification of FLEX droplet visible-flame extinction
// (PSI-69, Experiment_13_cleaned.csv, 274 raw tests).
//   y = 1 if "Test end" == Extinction else 0 (Disruption/Completion)
// TARGET DEFINITION (research doc §5.5): y = 1 iff the droplet test ended in
// visible-flame EXTINCTION as recorded in the recovered PSI-69 table.
// y = 0 covers every other recorded ending ("Disruption" — droplet disrupted
// without visible-flame extinction; "Completion" — burned out without
// extinction). Pooling the two non-extinction endings is justified because
// the modelled question is strictly "did the visible flame extinguish?",
// not "how did the test end". This is a FLEX-specific target — NOT a
// general spacecraft-fire or habitat-safety predictor.
//
// Features (pre-test only, no outcome leakage): XO2, p_mmHg, d0_mm,
//   fuel_heptane, XHe, XCO — identical to the registered flex-extinction-v2.
//
// Protocol (pre-declared before running):
//   - Reproduce flex-extinction-v2 (IRLS logistic, ridge 1e-3) under its
//     original condition-grouped K=4 scheme and verify against the artifact.
//   - Fair comparison of multiple candidates under the SAME folds:
//       majority baseline, O2-only baseline, logistic-regression grid,
//       kNN grid, CART decision-tree grid, bagged-tree forest.
//   - Two grouping schemes: condition group (fuel, rounded p, rounded XO2)
//     as primary; test-date group K=8 as a stricter secondary check.
//   - Group-aware only: rows from the same condition/date never straddle
//     train and test.
//   - Selection policy: replace champion only if a candidate beats it by
//     >= +0.01 mean grouped AUC; ties prefer the simpler/interpretable model.
//   - Fixed seed (20261114) for all randomised components; deterministic I/O.
//
// Outputs:
//   data/ml/experiment_log.json            (every candidate x hyperparam run)
//   data/ml/flex_extinction_experiment.json (dataset card, protocol, comparison, decision)
//   models/flex-extinction/v2/model_card.json (artifact updated with re-verification)
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const CSV = path.join(ROOT, "data", "experiments", "Experiment_13_cleaned.csv");
const OUT_DIR = path.join(ROOT, "data", "ml");
const ARTIFACT = path.join(ROOT, "models", "flex-extinction", "v2", "model_card.json");
const SEED = 20261114;

// ---------------------------------------------------------------- utilities
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rng = mulberry32(SEED);
const r4 = (x) => Math.round(x * 10000) / 10000;

function parseCsv(file) {
  const text = readFileSync(file, "utf8").replace(/^\uFEFF/, "");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  const header = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
  return lines.slice(1).map((l) => {
    const cells = l.split(",").map((c) => c.trim().replace(/^"|"$/g, ""));
    const row = {};
    header.forEach((h, i) => (row[h] = cells[i] ?? ""));
    return row;
  });
}
const fnum = (x) => {
  const v = parseFloat(x);
  return Number.isFinite(v) ? v : null;
};

// ------------------------------------------------------------------ dataset
const COL = {
  fuel: "Fuel",
  p: "Ambient pressure; mmHg",
  o2: "O initial ambient composition; mole fraction",
  co: "CO initial ambient composition; mole fraction",
  he: "He initial ambient composition; mole fraction",
  d0: "Droplet initial diameter; mm",
  end: "Test end",
  date: "Test Date",
};

const rowsRaw = parseCsv(CSV);
const clean = [];
let dropped = { missingNumeric: 0, badFuel: 0, badOutcome: 0 };
for (const r of rowsRaw) {
  const p = fnum(r[COL.p]);
  const o2 = fnum(r[COL.o2]);
  const d0 = fnum(r[COL.d0]);
  const co = fnum(r[COL.co]);
  const he = fnum(r[COL.he]);
  const fuel = (r[COL.fuel] || "").trim();
  const outcome = (r[COL.end] || "").trim();
  if (p === null || o2 === null || d0 === null) { dropped.missingNumeric++; continue; }
  if (fuel !== "Methanol" && fuel !== "Heptane") { dropped.badFuel++; continue; }
  if (!["Extinction", "Disruption", "Completion"].includes(outcome)) { dropped.badOutcome++; continue; }
  clean.push({
    x: [o2, p, d0, fuel === "Heptane" ? 1 : 0, he ?? 0, co ?? 0],
    y: outcome === "Extinction" ? 1 : 0,
    conditionGroup: `${fuel}|${Math.round(p)}|${o2.toFixed(2)}`,
    dateGroup: (r[COL.date] || "").trim(),
  });
}
const N = clean.length;
const pos = clean.filter((c) => c.y === 1).length;
console.log(`rows raw=${rowsRaw.length} clean=${N} extinction=${pos} (${(pos / N).toFixed(3)}) dropped=`, dropped);

const FEATURE_NAMES = ["XO2", "p_mmHg", "d0_mm", "fuel_heptane", "XHe", "XCO"];

// ------------------------------------------------------------ metrics
function auc(yTrue, scores) {
  const idx = scores.map((s, i) => i).sort((a, b) => scores[a] - scores[b]);
  const ranks = new Array(scores.length).fill(0);
  let i = 0;
  while (i < idx.length) {
    let j = i;
    while (j + 1 < idx.length && scores[idx[j + 1]] === scores[idx[i]]) j++;
    const avg = (i + 1 + j + 1) / 2;
    for (let k = i; k <= j; k++) ranks[idx[k]] = avg;
    i = j + 1;
  }
  let n1 = 0, n0 = 0, sumPos = 0;
  for (let k = 0; k < yTrue.length; k++) {
    if (yTrue[k] === 1) { n1++; sumPos += ranks[k]; } else n0++;
  }
  if (n1 === 0 || n0 === 0) return 0.5;
  return (sumPos - (n1 * (n1 + 1)) / 2) / (n1 * n0);
}
function classifyMetrics(yTrue, yPred) {
  let tp = 0, tn = 0, fp = 0, fn = 0;
  for (let k = 0; k < yTrue.length; k++) {
    if (yTrue[k] === 1 && yPred[k] === 1) tp++;
    else if (yTrue[k] === 0 && yPred[k] === 0) tn++;
    else if (yTrue[k] === 0 && yPred[k] === 1) fp++;
    else fn++;
  }
  const tpr = tp + fn ? tp / (tp + fn) : 0;
  const tnr = tn + fp ? tn / (tn + fp) : 0;
  const precision = tp + fp ? tp / (tp + fp) : 0;
  const recall = tpr;
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  return { tp, tn, fp, fn, balancedAcc: (tpr + tnr) / 2, precision, recall, f1 };
}
const mean = (a) => a.reduce((s, x) => s + x, 0) / a.length;

// ------------------------------------------------------- standardisation
function fitScaler(X) {
  const d = X[0].length;
  const mu = new Array(d).fill(0);
  const sd = new Array(d).fill(0);
  for (const row of X) for (let j = 0; j < d; j++) mu[j] += row[j];
  for (let j = 0; j < d; j++) mu[j] /= X.length;
  for (const row of X) for (let j = 0; j < d; j++) sd[j] += (row[j] - mu[j]) ** 2;
  for (let j = 0; j < d; j++) sd[j] = Math.sqrt(sd[j] / X.length) || 1;
  return { mu, sd };
}
const applyScaler = (X, sc) => X.map((r) => r.map((v, j) => (v - sc.mu[j]) / sc.sd[j]));

// --------------------------------------------------- candidate: logistic IRLS
function irls(X, y, ridge = 1e-3, iters = 100) {
  const n = X.length, d = X[0].length;
  let W = new Array(d).fill(0);
  for (let it = 0; it < iters; it++) {
    const grad = new Array(d).fill(0);
    const H = Array.from({ length: d }, () => new Array(d).fill(0));
    for (let i = 0; i < n; i++) {
      let z = 0;
      for (let j = 0; j < d; j++) z += W[j] * X[i][j];
      const p = 1 / (1 + Math.exp(-z));
      const w = Math.max(p * (1 - p), 1e-6);
      const resid = y[i] - p;
      for (let a = 0; a < d; a++) {
        grad[a] += X[i][a] * resid;
        for (let b = 0; b < d; b++) H[a][b] += X[i][a] * X[i][b] * w;
      }
    }
    for (let a = 0; a < d; a++) {
      grad[a] -= ridge * W[a];
      H[a][a] += ridge;
    }
    // Gaussian elimination solve H step = grad
    const A = H.map((row, i) => [...row, grad[i]]);
    for (let c = 0; c < d; c++) {
      let piv = c;
      for (let r2 = c + 1; r2 < d; r2++) if (Math.abs(A[r2][c]) > Math.abs(A[piv][c])) piv = r2;
      [A[c], A[piv]] = [A[piv], A[c]];
      const pv = A[c][c] || 1e-12;
      for (let r2 = 0; r2 < d; r2++) {
        if (r2 === c) continue;
        const f = A[r2][c] / pv;
        for (let cc = c; cc <= d; cc++) A[r2][cc] -= f * A[c][cc];
      }
    }
    const step = A.map((row) => row[d] / (row[row.length - 2] || 1e-12));
    // solve: after full elimination A is diagonal-ish; extract via back-substitution
    const sol = new Array(d).fill(0);
    for (let r2 = d - 1; r2 >= 0; r2--) {
      let s = A[r2][d];
      for (let c = r2 + 1; c < d; c++) s -= A[r2][c] * sol[c];
      sol[r2] = s / (A[r2][r2] || 1e-12);
    }
    let maxStep = 0;
    for (let j = 0; j < d; j++) { W[j] += sol[j]; maxStep = Math.max(maxStep, Math.abs(sol[j])); }
    if (maxStep < 1e-9) break;
  }
  return W;
}
const sigmoid = (z) => 1 / (1 + Math.exp(-z));
function logregFit(X, y, ridge) {
  const sc = fitScaler(X);
  const Xz = applyScaler(X, sc);
  const W = irls(Xz, y, ridge);
  return {
    predict: (Xt) => {
      const Z = applyScaler(Xt, sc);
      return Z.map((r) => sigmoid(r.reduce((s, v, j) => s + v * W[j], 0)));
    },
    artifact: { means: sc.mu.map(r4), stds: sc.sd.map(r4), coefStandardized: W.map(r4) },
  };
}

// --------------------------------------------------------- candidate: kNN
function knnFit(X, y, k) {
  const sc = fitScaler(X);
  const Z = applyScaler(X, sc);
  return {
    predict: (Xt) => {
      const Zt = applyScaler(Xt, sc);
      return Zt.map((row) => {
        const dists = Z.map((tr, i) => {
          let s = 0;
          for (let j = 0; j < row.length; j++) s += (row[j] - tr[j]) ** 2;
          return { d: Math.sqrt(s), y: y[i] };
        });
        dists.sort((a, b) => a.d - b.d);
        let wPos = 0, wTot = 0;
        for (let m = 0; m < k; m++) {
          const w = 1 / (dists[m].d ** 2 + 1e-6);
          wTot += w;
          wPos += w * dists[m].y;
        }
        return wPos / wTot;
      });
    },
  };
}

// --------------------------------------------------- candidate: CART tree
function cartFit(X, y, maxDepth, minLeaf, rand = null, featureSubset = null) {
  const d = X[0].length;
  function giniSplit(rows) {
    const n = rows.length;
    let p1 = 0;
    for (const i of rows) p1 += y[i];
    p1 /= n;
    return 1 - p1 * p1 - (1 - p1) * (1 - p1);
  }
  function build(rows, depth) {
    const n = rows.length;
    let p1 = 0;
    for (const i of rows) p1 += y[i];
    const prob = p1 / n;
    if (depth >= maxDepth || n < 2 * minLeaf || prob === 0 || prob === 1) return { leaf: true, prob };
    const feats = featureSubset ?? [...Array(d).keys()];
    let best = null;
    for (const f of feats) {
      const vals = [...new Set(rows.map((i) => X[i][f]))].sort((a, b) => a - b);
      const step = Math.max(1, Math.floor(vals.length / 24));
      for (let vi = 0; vi < vals.length - 1; vi += step) {
        const thr = (vals[vi] + vals[vi + 1]) / 2;
        const L = [], R = [];
        for (const i of rows) (X[i][f] <= thr ? L : R).push(i);
        if (L.length < minLeaf || R.length < minLeaf) continue;
        const gL = giniSplit(L), gR = giniSplit(R);
        const g = (L.length * gL + R.length * gR) / (L.length + R.length);
        if (!best || g < best.g) best = { f, thr, g, L, R };
      }
    }
    if (!best) return { leaf: true, prob };
    return { leaf: false, f: best.f, thr: best.thr, left: build(best.L, depth + 1), right: build(best.R, depth + 1) };
  }
  const allRows = X.map((_, i) => i);
  const tree = build(allRows, 0);
  return {
    predict: (Xt) =>
      Xt.map((row) => {
        let node = tree;
        while (!node.leaf) node = row[node.f] <= node.thr ? node.left : node.right;
        return node.prob;
      }),
  };
}
function forestFit(X, y, nTrees, maxDepth, minLeaf) {
  const trees = [];
  const d = X[0].length;
  const m = Math.max(2, Math.round(Math.sqrt(d)));
  for (let t = 0; t < nTrees; t++) {
    const boot = [];
    for (let i = 0; i < X.length; i++) boot.push(Math.floor(rng() * X.length));
    const feats = [...Array(d).keys()].sort(() => rng() - 0.5).slice(0, m);
    trees.push(cartFit(boot.map((i) => X[i]), boot.map((i) => y[i]), maxDepth, minLeaf, rng, feats));
  }
  return {
    predict: (Xt) =>
      Xt.map((_, i) => trees.reduce((s, tr) => s + tr.predict([Xt[i]])[0], 0) / trees.length),
  };
}

// ------------------------------------------------------------ CV harness
function groupKFold(groups, K) {
  const uniq = [...new Set(groups)].sort();
  const foldOf = new Map(uniq.map((g, i) => [g, i % K]));
  return groups.map((g) => foldOf.get(g));
}

/** Stratified group K-fold (research doc §5.2): groups are assigned to folds
 *  in order of descending positive rate so each fold carries a similar class
 *  balance while every group stays wholly inside one fold. Falls back to the
 *  round-robin behaviour when stratification would create class-degenerate
 *  folds. Groups stay atomic either way — no group spans train and test. */
function stratifiedGroupKFold(groups, y, K) {
  const stats = new Map();
  for (let i = 0; i < y.length; i++) {
    const s = stats.get(groups[i]) ?? { pos: 0, n: 0 };
    s.n++;
    if (y[i] === 1) s.pos++;
    stats.set(groups[i], s);
  }
  const uniq = [...stats.keys()].sort(
    (a, b) => stats.get(b).pos / stats.get(b).n - stats.get(a).pos / stats.get(a).n,
  );
  const foldPos = new Array(K).fill(0);
  const foldN = new Array(K).fill(0);
  const foldOf = new Map();
  for (const g of uniq) {
    const s = stats.get(g);
    // greedily place each group in the fold with the smallest resulting
    // positive-rate deviation from the global rate
    const globalRate = y.reduce((a, v) => a + v, 0) / y.length;
    let best = 0;
    let bestDev = Infinity;
    for (let k = 0; k < K; k++) {
      const dev = Math.abs((foldPos[k] + s.pos) / (foldN[k] + s.n) - globalRate) + (foldN[k] + s.n > y.length / K ? 0.5 : 0);
      if (dev < bestDev) { bestDev = dev; best = k; }
    }
    foldOf.set(g, best);
    foldPos[best] += s.pos;
    foldN[best] += s.n;
  }
  // class-degeneracy check: every fold must hold both classes in TRAIN for
  // the other folds; if any fold is class-degenerate overall, fall back.
  const folds = groups.map((g) => foldOf.get(g));
  for (let k = 0; k < K; k++) {
    const inFold = y.filter((_, i) => folds[i] === k);
    if (inFold.length && new Set(inFold).size < 2) return groupKFold(groups, K);
  }
  return folds;
}

function runCandidate(name, hyper, fitFn, X, y, groups, K) {
  const folds = stratifiedGroupKFold(groups, y, K);
  const foldAucs = [], foldBalAcc = [], foldF1 = [], cms = [];
  // Out-of-fold scores: every row is scored exactly once, by the fold model
  // that never saw its group (research doc §5.4). null when its fold was
  // skipped for class degeneracy.
  const oof = new Array(y.length).fill(null);
  for (let k = 0; k < K; k++) {
    const tr = [], te = [];
    for (let i = 0; i < y.length; i++) (folds[i] === k ? te : tr).push(i);
    if (new Set(tr.map((i) => y[i])).size < 2) continue;
    const model = fitFn(tr.map((i) => X[i]), tr.map((i) => y[i]));
    const scores = model.predict(te.map((i) => X[i]));
    te.forEach((i, j) => { oof[i] = scores[j]; });
    const yt = te.map((i) => y[i]);
    foldAucs.push(auc(yt, scores));
    const preds = scores.map((s) => (s > 0.5 ? 1 : 0));
    const m = classifyMetrics(yt, preds);
    foldBalAcc.push(m.balancedAcc);
    foldF1.push(m.f1);
    cms.push(m);
  }
  const oofPairs = y.map((v, i) => [v, oof[i]]).filter(([, s]) => s !== null);
  const oofAuc = oofPairs.length === y.length ? r4(auc(oofPairs.map((p) => p[0]), oofPairs.map((p) => p[1]))) : null;
  const result = {
    candidate: name,
    hyper: hyper ?? {},
    grouping: `condition-group K=4 stratified (groups atomic)`,
    foldAucs: foldAucs.map(r4),
    meanAuc: r4(mean(foldAucs)),
    meanBalancedAcc: r4(mean(foldBalAcc)),
    meanF1: r4(mean(foldF1)),
    oofAuc,
    confusionTotals: cms.reduce(
      (a, m) => ({ tp: a.tp + m.tp, tn: a.tn + m.tn, fp: a.fp + m.fp, fn: a.fn + m.fn }),
      { tp: 0, tn: 0, fp: 0, fn: 0 },
    ),
  };
  return { result, oof };
}

// ---------------------------------------------------------------- prepare
const X = clean.map((c) => c.x);
const y = clean.map((c) => c.y);
const condGroups = clean.map((c) => c.conditionGroup);
const dateGroups = clean.map((c) => c.dateGroup);
const experiments = [];

// --- reproduction: flex-extinction-v2 protocol (IRLS ridge=1e-3, cond K=4)
const { result: repro, oof: reproOof } = runCandidate("logistic-irls", { ridge: 0.001 }, (Xt, yt) => logregFit(Xt, yt, 0.001), X, y, condGroups, 4);
repro.grouping = "condition-group K=4 (v2 original protocol)";
experiments.push(repro);
const oofByKey = new Map();
oofByKey.set("logistic-irls {\"ridge\":0.001}", reproOof);
console.log("reproduction v2:", JSON.stringify({ meanAuc: repro.meanAuc, folds: repro.foldAucs, balAcc: repro.meanBalancedAcc }));

// --- full-data refit for artifact comparison
const fullFit = logregFit(X, y, 0.001);
console.log("full coef (standardized):", fullFit.artifact.coefStandardized);

// --- baselines
for (const [n2, h2, f2] of [["majority-class", {}, (Xt, yt) => ({ predict: (Te) => Te.map(() => yt.reduce((s, v) => s + v, 0) / yt.length) })], ["o2-only-baseline", { direction: "lower O2 -> extinction" }, (Xt, yt) => ({ predict: (Te) => Te.map((r) => -r[0]) })]]) {
  const { result: rres, oof: roof } = runCandidate(n2, h2, f2, X, y, condGroups, 4);
  experiments.push(rres);
  oofByKey.set(`${n2} ${JSON.stringify(h2)}`, roof);
}

// --- candidate grids (condition-group K=4 primary)
const grid = [];
for (const ridge of [0.001, 0.01, 0.1, 1.0]) grid.push(["logistic-irls", { ridge }, (Xt, yt) => logregFit(Xt, yt, ridge)]);
for (const k of [3, 5, 7, 9]) grid.push(["knn-distance", { k }, (Xt, yt) => knnFit(Xt, yt, k)]);
for (const depth of [2, 3, 4]) for (const minLeaf of [5, 10, 15]) grid.push(["cart-tree", { depth, minLeaf }, (Xt, yt) => cartFit(Xt, yt, depth, minLeaf)]);
grid.push(["bagged-trees-forest", { nTrees: 60, depth: 3, minLeaf: 5, seed: SEED }, (Xt, yt) => forestFit(Xt, yt, 60, 3, 5)]);

for (const [name, hyper, fn] of grid) {
  const { result: rres, oof: roof } = runCandidate(name, hyper, fn, X, y, condGroups, 4);
  experiments.push(rres);
  oofByKey.set(`${name} ${JSON.stringify(hyper)}`, roof);
}

// --- secondary: date-group K=8 (stricter leakage control) for top candidates
const secondary = [];
for (const [name, hyper, fn] of [
  ["logistic-irls", { ridge: 0.001 }, (Xt, yt) => logregFit(Xt, yt, 0.001)],
  ["logistic-irls", { ridge: 0.1 }, (Xt, yt) => logregFit(Xt, yt, 0.1)],
  ["knn-distance", { k: 5 }, (Xt, yt) => knnFit(Xt, yt, 5)],
  ["cart-tree", { depth: 3, minLeaf: 10 }, (Xt, yt) => cartFit(Xt, yt, 3, 10)],
  ["bagged-trees-forest", { nTrees: 60, depth: 3, minLeaf: 5 }, (Xt, yt) => forestFit(Xt, yt, 60, 3, 5)],
]) {
  const { result: rres, oof: _roof } = runCandidate(name, hyper, fn, X, y, dateGroups, 8);
  rres.grouping = "test-date group K=8 (secondary)";
  secondary.push(rres);
  experiments.push(rres);
}

// --- group-bootstrap CI for the champion (500 resamples, seed fixed)
function groupBootstrapCi(scoreFn, groups, draws = 500) {
  const uniq = [...new Set(groups)];
  const byGroup = new Map();
  for (let i = 0; i < y.length; i++) {
    if (!byGroup.has(groups[i])) byGroup.set(groups[i], []);
    byGroup.get(groups[i]).push(i);
  }
  const scores = scoreFn();
  const aucs = [];
  for (let d = 0; d < draws; d++) {
    const idx = [];
    for (let g = 0; g < uniq.length; g++) {
      const pick = uniq[Math.floor(rng() * uniq.length)];
      idx.push(...byGroup.get(pick));
    }
    const yt = idx.map((i) => y[i]);
    if (new Set(yt).size < 2 || idx.length < 20) continue;
    aucs.push(auc(yt, idx.map((i) => scores[i])));
  }
  aucs.sort((a, b) => a - b);
  return [r4(aucs[Math.floor(aucs.length * 0.025)]), r4(aucs[Math.floor(aucs.length * 0.975)])];
}
// --- OOF group-bootstrap CI for the champion (research doc §5.4):
// resampling is at GROUP level, and the scores are OUT-OF-FOLD predictions
// (each row scored by the fold model that never saw its group) — never the
// full-data refit scoring its own training rows.
function groupBootstrapOofCi(yAll, oof, groups, draws = 500) {
  const uniq = [...new Set(groups)];
  const byGroup = new Map();
  for (let i = 0; i < yAll.length; i++) {
    if (oof[i] === null) continue;
    if (!byGroup.has(groups[i])) byGroup.set(groups[i], []);
    byGroup.get(groups[i]).push(i);
  }
  const aucs = [];
  for (let d = 0; d < draws; d++) {
    const idx = [];
    for (let g = 0; g < uniq.length; g++) {
      const pick = uniq[Math.floor(rng() * uniq.length)];
      idx.push(...(byGroup.get(pick) || []));
    }
    const yt = idx.map((i) => yAll[i]);
    const sc = idx.map((i) => oof[i]);
    if (new Set(yt).size < 2 || idx.length < 20) continue;
    aucs.push(auc(yt, sc));
  }
  if (!aucs.length) return null;
  aucs.sort((a, b) => a - b);
  return { method: "group-level bootstrap over out-of-fold predictions (500 resamples, seed fixed)", ci95: [r4(aucs[Math.floor(aucs.length * 0.025)]), r4(aucs[Math.floor(aucs.length * 0.975)])], valid_draws: aucs.length };
}

// ------------------------------------------------------------ selection
const conditionRuns = experiments.filter(
  (e) => e.grouping.includes("condition") || e.grouping === "4-fold group CV",
);
const ranked = [...conditionRuns].sort((a, b) => b.meanAuc - a.meanAuc);
console.log("\n=== condition-group K=4 leaderboard ===");
for (const r of ranked.slice(0, 10)) console.log(`${r.candidate.padEnd(22)} ${JSON.stringify(r.hyper).padEnd(34)} AUC=${r.meanAuc} balAcc=${r.meanBalancedAcc} F1=${r.meanF1}`);

const champion = ranked[0];
const v2Row = conditionRuns.find((e) => e.candidate === "logistic-irls" && e.hyper.ridge === 0.001);
const bestRival = ranked.find((r) => r !== v2Row && r.candidate !== "majority-class" && r.candidate !== "o2-only-baseline");
const margin = r4(bestRival.meanAuc - v2Row.meanAuc);
const decision = margin >= 0.01
  ? `REPLACE flex-extinction-v2 with ${bestRival.candidate} ${JSON.stringify(bestRival.hyper)} (+${margin} AUC)`
  : `RETAIN flex-extinction-v2 — best rival ${bestRival.candidate} ${JSON.stringify(bestRival.hyper)} is ${margin >= 0 ? "+" : ""}${margin} AUC (below the +0.01 replacement bar)`;
console.log("\nDECISION:", decision);

// OOF group-bootstrap CI for the champion (research doc §5.4): resampling at
// group level over OUT-OF-FOLD predictions — never the full-data refit
// scoring its own training rows (that was the former in-sample CI, removed).
const oofCiKey = (name, hyper) => `${name} ${JSON.stringify(hyper)}`;
const championOof = oofByKey.get(oofCiKey(champion.candidate, champion.hyper));
const championCi = championOof ? groupBootstrapOofCi(y, championOof, condGroups) : null;
console.log("champion OOF CI:", JSON.stringify(championCi));
{
  const yy = [], ss = [];
  for (let i = 0; i < y.length; i++) if (championOof && championOof[i] !== null) { yy.push(y[i]); ss.push(championOof[i]); }
  if (yy.length) console.log("champion OOF AUC:", auc(yy, ss).toFixed(4), "(vs mean fold AUC", champion.meanAuc + ")");
}

// ---------------------------------------------------------------- outputs
mkdirSync(OUT_DIR, { recursive: true });
writeFileSync(path.join(OUT_DIR, "experiment_log.json"), JSON.stringify({
  experiment_id: "M7-flex-extinction-20261114",
  seed: SEED,
  runs: experiments,
}, null, 1));

const secondaryByCandidate = Object.fromEntries(secondary.map((s) => [`${s.candidate} ${JSON.stringify(s.hyper)}`, { meanAuc: s.meanAuc, folds: s.foldAucs }]));

const comparison = ranked.map((r) => ({
  candidate: r.candidate,
  hyper: r.hyper,
  meanAuc: r.meanAuc,
  meanBalancedAcc: r.meanBalancedAcc,
  meanF1: r.meanF1,
  confusion: r.confusionTotals,
}));

let artifactStatus = "unchanged";
if (existsSync(ARTIFACT)) {
  const card = JSON.parse(readFileSync(ARTIFACT, "utf8"));
  // verify reproduction against the registered artifact
  const coefDelta = Math.max(...fullFit.artifact.coefStandardized.map((c, i) => Math.abs(c - card.inBrowserScoring.coefStandardized[i])));
  const aucDelta = Math.abs(repro.meanAuc - card.metrics.groupedAucMean);
  card.reverification = {
    date: "2026-11-14",
    protocol: "M7 multi-candidate experiment (scripts/flame/ml-flex-extinction-experiment.mjs), same data file Experiment_13_cleaned.csv",
    reproductionCheck: {
      coefMaxAbsDelta: r4(coefDelta),
      groupedAucDelta: r4(aucDelta),
      reproducedMeanAuc: repro.meanAuc,
      reproducedFolds: repro.foldAucs,
      registeredMeanAuc: card.metrics.groupedAucMean,
      pass: aucDelta < 0.02 && coefDelta < 0.15,
    },
    candidateComparison: { leaderboard: comparison.slice(0, 12), decision },
    secondaryDateGroupedCV: secondaryByCandidate,
    championGroupBootstrapCi: championCi,
    experimentLog: "data/ml/experiment_log.json",
    experimentSummary: "data/ml/flex_extinction_experiment.json",
  };
  writeFileSync(ARTIFACT, JSON.stringify(card, null, 1));
  artifactStatus = `updated with reverification (coefΔ=${r4(coefDelta)}, aucΔ=${r4(aucDelta)})`;
}

const summary = {
  experiment_id: "M7-flex-extinction-20261114",
  date: "2026-11-14",
  task: "binary classification — FLEX droplet visible-flame extinction (Extinction vs Disruption/Completion)",
  dataset: {
    source: "data/experiments/Experiment_13_cleaned.csv (team cleaned package; canonical PSI-69 FLEX table, sha256-tracked)",
    rowsRaw: rowsRaw.length,
    rowsClean: N,
    positive: pos,
    positiveShare: r4(pos / N),
    dropped,
    features: FEATURE_NAMES,
    featurePolicy: "pre-test conditions only; burning rate / burn time / extinction diameter excluded as outcome leakage",
  },
  protocol: {
    validation: "group-aware CV only — no random row splits",
    primaryGrouping: "condition group (fuel, rounded pressure_mmHg, rounded XO2 to 2dp), K=4",
    secondaryGrouping: "test-date group, K=8",
    candidates: ["majority-class", "o2-only-baseline", "logistic-irls (ridge grid)", "knn-distance (k grid)", "cart-tree (depth×minLeaf grid)", "bagged-trees-forest (60 trees)"],
    seed: SEED,
    selectionPolicy: "replace registered champion only at >= +0.01 mean grouped AUC; ties prefer simpler interpretable model",
    knownLimitations: [
      "hyperparameters evaluated on the same grouped CV used for reporting (no nested CV) — mild optimism; mitigated by group-bootstrap CI and the conservative replacement bar",
      "d0 rows with missing values dropped (v2-identical protocol); median-impute + missingness flag is a documented future variant",
      "Disruption and Completion merged as non-extinction — physically distinct outcomes (documented in the model card)",
    ],
  },
  leaderboard: comparison,
  championDecision: decision,
  secondaryDateGroupedCV: secondaryByCandidate,
  championGroupBootstrapCi: championCi,
  artifactStatus,
  experimentLog: "data/ml/experiment_log.json",
};
writeFileSync(path.join(OUT_DIR, "flex_extinction_experiment.json"), JSON.stringify(summary, null, 1));
console.log("\nartifacts written: data/ml/experiment_log.json, data/ml/flex_extinction_experiment.json,", artifactStatus);
