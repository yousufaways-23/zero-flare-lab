// ZERO FLARE — screenshot matrix (M10): captures the 8 core sections at
// desktop/tablet/mobile widths for visual review and the release report.
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const BASE = "http://localhost:3000";
const OUT = "docs/screenshots";
mkdirSync(OUT, { recursive: true });

const SHOTS = [
  { name: "01-mission-1440", w: 1440, hash: "" },
  { name: "02-investigations-1440", w: 1440, hash: "#investigations" },
  { name: "03-investigation-detail-1440", w: 1440, hash: "#investigation/PSI-69" },
  { name: "04-compare-gate-1440", w: 1440, hash: "#compare" },
  { name: "05-scenarios-1440", w: 1440, hash: "#scenarios" },
  { name: "06-lab3d-1440", w: 1440, hash: "#lab3d" },
  { name: "07-data-sources-1440", w: 1440, hash: "#data-sources" },
  { name: "08-my-work-1440", w: 1440, hash: "#my-work" },
  { name: "09-mission-768", w: 768, hash: "" },
  { name: "10-scenarios-768", w: 768, hash: "#scenarios" },
  { name: "11-mission-390", w: 390, hash: "" },
  { name: "12-investigations-390", w: 390, hash: "#investigations" },
  { name: "13-cir1-copilot-1440", w: 1440, hash: "", copilot: true },
];

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

for (const s of SHOTS) {
  await page.setViewportSize({ width: s.w, height: 900 });
  await page.goto(`${BASE}/${s.hash}`);
  await page.waitForLoadState("domcontentloaded");
  await page.waitForTimeout(2200);
  if (s.copilot) {
    const btn = page.getByRole("button", { name: /CIR-1/i }).first();
    if (await btn.count()) {
      await btn.click();
      await page.waitForTimeout(1200);
    }
  }
  await page.screenshot({ path: `${OUT}/${s.name}.png`, fullPage: false });
  console.log("saved", s.name);
}

await browser.close();
console.log("screenshot matrix complete");
