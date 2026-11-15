// Throwaway: live verification of the two equation improvements on production.
import { chromium } from "@playwright/test";

const BASE = "https://zero-flare.yousuf-aways.workers.dev";
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const out = [];
const check = (name, ok, detail = "") => out.push(`${ok ? "PASS" : "FAIL"} ${name}${detail ? " — " + detail : ""}`);

await p.goto(`${BASE}/`, { waitUntil: "load" });
await p.waitForTimeout(2500);

// 1 — registry: typeset + no parse errors
await p.getByRole("button", { name: /research tools/i }).first().click();
await p.getByRole("button", { name: /equation registry/i }).first().click();
await p.waitForTimeout(2000);
const regKatex = await p.evaluate(() => document.querySelectorAll(".katex").length);
const regErrors = await p.evaluate(() => document.querySelectorAll(".katex-error").length);
check("registry typeset (KaTeX nodes)", regKatex > 0, `${regKatex} nodes`);
check("registry zero KaTeX parse errors", regErrors === 0, `${regErrors} errors`);

// 2 — expand every CLOSED category (default-open ones must not be toggled shut),
// verify constrained scroll + no footer overlap
const n = await p.getByRole("button", { name: /equations$/ }).count();
for (let i = 0; i < n; i++) {
  const t = p.getByRole("button", { name: /equations$/ }).nth(i);
  if ((await t.getAttribute("aria-expanded")) === "false") await t.click().catch(() => {});
}
await p.waitForTimeout(800);
const geo = await p.evaluate(() => {
  const vp = document.querySelector('[data-radix-scroll-area-viewport]');
  if (vp) vp.scrollTop = vp.scrollHeight;
  return new Promise((res) => setTimeout(() => {
    const footer = document.querySelector("footer");
    const footerTop = footer ? footer.getBoundingClientRect().top : null;
    const items = [...document.querySelectorAll('[aria-label="Equation registry"] li')];
    const lastRect = items[items.length - 1]?.getBoundingClientRect() ?? null;
    res({
      items: items.length,
      viewportClientH: vp ? Math.round(vp.clientHeight) : null,
      viewportScrollH: vp ? Math.round(vp.scrollHeight) : null,
      lastBottom: lastRect ? Math.round(lastRect.bottom) : null,
      footerTop: footerTop !== null ? Math.round(footerTop) : null,
    });
  }, 400));
});
check("registry scrolls internally (viewport clamped)", geo.viewportScrollH > geo.viewportClientH && geo.viewportClientH <= 640, JSON.stringify(geo));
check("no footer overlap after expanding all categories", geo.lastBottom < geo.footerTop, `last item bottom ${geo.lastBottom} < footer top ${geo.footerTop}`);

// 3 — detail dialog typeset (scroll the registry viewport back to the top first)
await p.evaluate(() => {
  const vp = document.querySelector('[data-radix-scroll-area-viewport]');
  if (vp) vp.scrollTop = 0;
});
await p.waitForTimeout(400);
await p.getByRole("button", { name: /Ideal gas law/i }).first().click();
await p.waitForTimeout(600);
const dialogKatex = await p.locator('[role="alertdialog"], [data-slot="dialog-content"]').first().locator(".katex").count().catch(() => 0);
check("detail dialog typeset", dialogKatex > 0, `${dialogKatex} katex nodes`);
await p.keyboard.press("Escape");

// 4 — scenarios resolver typeset
await p.evaluate(() => { location.hash = "#/scenarios"; });
await p.waitForTimeout(1800);
const scenKatex = await p.evaluate(() => document.querySelectorAll(".katex").length);
check("scenarios resolver typeset", scenKatex > 0, `${scenKatex} katex nodes`);

// 5 — selftest unchanged (calculations untouched)
const self = await fetch(`${BASE}/api/selftest`).then((r) => r.json()).catch(() => null);
check("selftest still green", Boolean(self?.ok), `ranAt ${self?.ranAt ?? "n/a"}`);

await b.close();
console.log(out.join("\n"));
const fails = out.filter((l) => l.startsWith("FAIL")).length;
console.log(`\nEQUATIONS LIVE: ${out.length - fails}/${out.length} passed`);
process.exit(fails ? 1 : 0);
