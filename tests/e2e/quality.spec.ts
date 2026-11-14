import { test, expect } from "@playwright/test";
import { AxeBuilder } from "@axe-core/playwright";

/**
 * ZERO FLARE — quality extension (review round 2):
 * console-error monitoring + axe-core accessibility scans on the core routes.
 * Fails on: uncaught page errors, console errors (excluding the dev overlay's
 * own noise), and critical/serious axe violations.
 */

type ConsoleIssue = { type: string; text: string };

const ROUTES: { name: string; hash: string }[] = [
  { name: "mission", hash: "" },
  { name: "investigations", hash: "#investigations" },
  { name: "investigation-detail", hash: "#investigation/PSI-69" },
  { name: "compare", hash: "#compare" },
  { name: "scenarios", hash: "#scenarios" },
  { name: "lab3d", hash: "#lab3d" },
  { name: "data-sources", hash: "#data-sources" },
  { name: "my-work", hash: "#my-work" },
];

for (const route of ROUTES) {
  test(`no console/page errors on ${route.name}`, async ({ page }) => {
    const issues: ConsoleIssue[] = [];
    page.on("pageerror", (err) => issues.push({ type: "pageerror", text: String(err) }));
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // known dev-mode noise (turbopack/HMR), never runtime logic failures
        if (/Download the React DevTools|\[Fast Refresh\]|hot-update/i.test(text)) return;
        issues.push({ type: "console-error", text });
      }
    });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(`/${route.hash}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2500);
    expect(issues, `${route.name}: ${JSON.stringify(issues.slice(0, 4))}`).toHaveLength(0);
  });
}

const A11Y_ROUTES: { name: string; hash: string; width: number }[] = [
  { name: "mission-desktop", hash: "", width: 1440 },
  { name: "mission-mobile", hash: "", width: 390 },
  { name: "investigations-desktop", hash: "#investigations", width: 1440 },
  { name: "compare-desktop", hash: "#compare", width: 1440 },
  { name: "scenarios-desktop", hash: "#scenarios", width: 1440 },
  { name: "my-work-mobile", hash: "#my-work", width: 390 },
];

for (const route of A11Y_ROUTES) {
  test(`axe: no critical/serious violations on ${route.name}`, async ({ page }) => {
    await page.setViewportSize({ width: route.width, height: 900 });
    await page.goto(`/${route.hash}`);
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(2200);
    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();
    const serious = results.violations.filter((v) => v.impact === "critical" || v.impact === "serious");
    const summary = serious
      .map((v) => `${v.id}(${v.impact}): ${v.nodes.slice(0, 2).map((n) => n.target.join(" ")).join(" | ")}`)
      .join("; ");
    expect(serious, `${route.name}: ${summary}`).toHaveLength(0);
  });
}
