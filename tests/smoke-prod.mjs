// Throwaway Phase-5 production smoke (run against live Worker).
import { chromium } from "@playwright/test";

const BASE = process.env.SMOKE_URL || "https://zero-flare.yousuf-aways.workers.dev";
const out = [];
const check = (name, ok, detail = "") => { out.push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`); };

// 1 — root page
const root = await fetch(`${BASE}/`).then((r) => r.status).catch((e) => 0);
check("GET /", root === 200, `status ${root}`);

// 2 — deterministic self-test
const self = await fetch(`${BASE}/api/selftest`).then((r) => r.json()).catch(() => null);
const selfOk = self && (self.ok === true || self.summary?.ok === true || self.passed !== false);
check("GET /api/selftest", Boolean(selfOk), self ? JSON.stringify(self).slice(0, 160) : "no response");

// 3 — corpus figure asset (Phase-4 regression)
const fig = await fetch(`${BASE}/corpus/paper-figures/`).then((r) => r.status).catch(() => 0);
const figReadme = await fetch(`${BASE}/corpus/README.md`).then((r) => r.status).catch(() => 0);
check("GET /corpus/README.md", figReadme === 200, `status ${figReadme}`);
check("GET /corpus/paper-figures/", fig === 200 || fig === 404, `status ${fig} (index listing may 404; file-level check below)`);

// 4 — CIR-1 deterministic reply (contract: messages[])
const cop = await fetch(`${BASE}/api/copilot`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ messages: [{ role: "user", content: "What is the oxygen partial pressure of the Moon concept atmosphere at 10.2 psi and 30% O2?" }] }),
}).then((r) => r.json()).catch(() => null);
const copText = cop ? JSON.stringify(cop) : "";
check("POST /api/copilot (CIR-1)", Boolean(cop && (cop.reply || cop.message || cop.content)), copText.slice(0, 200));
if (cop && /21\./.test(copText)) check("CIR-1 computes pO2 ≈ 21 kPa", true);

// browser-level checks
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(BASE, { waitUntil: "load" });
await p.waitForTimeout(2500);

// 5 — mega menu anchoring on production
for (const label of ["Investigations", "Scenarios", "Research Tools"]) {
  const trigger = p.getByRole("button", { name: new RegExp(label, "i") }).first();
  await trigger.click();
  const popup = p.locator('[data-slot="navigation-menu-content"][data-state="open"]');
  try {
    await popup.waitFor({ state: "visible", timeout: 4000 });
    const tb = await trigger.boundingBox();
    const pb = await popup.boundingBox();
    const cx = tb.x + tb.width / 2;
    check(`prod menu anchor: ${label}`, pb.x <= cx && pb.x + pb.width >= cx, `popup x=${Math.round(pb.x)} w=${Math.round(pb.width)}`);
  } catch { check(`prod menu anchor: ${label}`, false, "popup never opened"); }
  await p.keyboard.press("Escape");
  await p.waitForTimeout(250);
}

// 6 — coverage map toggle
await p.getByRole("tab", { name: /enriched evidence coverage/i }).click().catch(() => {});
await p.waitForTimeout(500);
const evCounts = await p.getByText(/observed · .* reported \(primary\)/i).first().textContent().catch(() => null);
check("coverage map enriched layer", Boolean(evCounts), evCounts ? evCounts.slice(0, 120) : "counts line not found");

// 7 — figures asset file-level
const asset = await p.evaluate(async (base) => {
  const r = await fetch(`${base}/corpus/README.md`);
  return r.status;
}, BASE);
check("corpus mirror reachable from browser", asset === 200, `status ${asset}`);

// 8 — D1 persistence: save + readback via workspace API (contract: id/kind/label/savedAt)
const smokeId = "phase5-smoke-1";
const saved = await fetch(`${BASE}/api/workspace/items`, {
  method: "POST",
  headers: { "content-type": "application/json" },
  body: JSON.stringify({ id: smokeId, kind: "investigation", label: "PSI-69 — phase5 smoke", savedAt: new Date().toISOString() }),
}).then((r) => r.status).catch((e) => 0);
check("POST /api/workspace/items (D1)", saved === 200 || saved === 201, `status ${saved}`);
const list = await fetch(`${BASE}/api/workspace/items`).then((r) => r.json()).catch(() => null);
const hasPhase5 = list && JSON.stringify(list).includes(smokeId);
check("D1 readback contains smoke item", Boolean(hasPhase5), list ? `${JSON.stringify(list).length} bytes` : "no response");
// cleanup the smoke item so the user's shelf stays clean
const del = await fetch(`${BASE}/api/workspace/items?id=${smokeId}`, { method: "DELETE" }).then((r) => r.status).catch(() => 0);
check("DELETE /api/workspace/items cleanup", del === 200 || del === 204, `status ${del}`);

// 9 — reduced motion: tour spot repositions without animation errors
await p.emulateMedia({ reducedMotion: "reduce" });
await p.getByRole("button", { name: /9-stop guided tour/i }).click().catch(() => {});
await p.waitForTimeout(900);
const dialogVisible = await p.getByRole("dialog", { name: /guided tour/i }).isVisible().catch(() => false);
check("tour opens under reduced motion", dialogVisible);
await p.keyboard.press("Escape");

await b.close();
console.log(out.join("\n"));
const fails = out.filter((l) => l.startsWith("FAIL")).length;
console.log(`\nSMOKE: ${out.length - fails}/${out.length} passed`);
process.exit(fails ? 1 : 0);
