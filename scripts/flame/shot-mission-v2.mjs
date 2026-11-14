import { chromium } from "@playwright/test";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto("http://localhost:3000/");
await p.waitForLoadState("domcontentloaded");
await p.waitForTimeout(5500); // allow textures + GLB to load
await p.screenshot({ path: "docs/screenshots/t4-mission-v2-1440.png" });
// click a destination label (ISS) then capture
const iss = p.getByText("ISS · ≈10⁻⁶ g", { exact: false }).first();
if (await iss.count()) { await iss.click(); await p.waitForTimeout(2600); }
await p.screenshot({ path: "docs/screenshots/t4-mission-v2-iss.png" });
console.log("mission captures done");
await b.close();
process.exit(0);
