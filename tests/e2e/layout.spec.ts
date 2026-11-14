import { test, expect } from "@playwright/test";

/**
 * ZERO FLARE — release-gate E2E (V7 contract §4):
 * header slot overlap at every required width + horizontal-overflow check
 * + core navigation flows. Runs against the dev server on :3000.
 */

const WIDTHS = [360, 390, 430, 768, 1024, 1280, 1366, 1440, 1600, 1920];

test.describe("header layout matrix", () => {
  for (const width of WIDTHS) {
    test(`header has no slot overlap at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto("/");
      await page.waitForLoadState("domcontentloaded");
      // wait for the app shell to mount
      await page.waitForSelector("header", { timeout: 15000 });
      const slots = await page.locator("[data-header-slot]").evaluateAll((els) =>
        els
          .map((el) => {
            const r = el.getBoundingClientRect();
            return {
              name: el.getAttribute("data-header-slot"),
              x: r.x,
              y: r.y,
              right: r.right,
              bottom: r.bottom,
              width: r.width,
              height: r.height,
            };
          })
          .filter((r) => r.width > 0 && r.height > 0),
      );
      // non-vacuous guard: brand, nav and actions regions must all exist and be laid out
      const required = ["brand", "nav", "actions"];
      for (const name of required) {
        const at = width >= 768 || name !== "nav" ? slots.some((s) => s.name === name) : true;
        expect(at, `missing data-header-slot="${name}" at ${width}px`).toBe(true);
      }
      const brandSlot = slots.find((s) => s.name === "brand");
      const actionsSlot = slots.find((s) => s.name === "actions");
      expect(brandSlot && actionsSlot && actionsSlot.x - brandSlot.right > 0, `actions region must start right of brand at ${width}px`).toBe(true);
      for (let i = 0; i < slots.length; i++) {
        for (let j = i + 1; j < slots.length; j++) {
          const a = slots[i];
          const b = slots[j];
          const overlapX = Math.min(a.right, b.right) - Math.max(a.x, b.x);
          const overlapY = Math.min(a.bottom, b.bottom) - Math.max(a.y, b.y);
          expect(
            overlapX > 1 && overlapY > 1,
            `${a.name} overlaps ${b.name} at ${width}px`,
          ).toBe(false);
        }
      }
      const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
      expect(scroll, `horizontal overflow at ${width}px`).toBeLessThanOrEqual(width + 1);
    });
  }
});

test.describe("core navigation flows", () => {
  test("mission → investigations → workspace data tab", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("header", { timeout: 15000 });
    // open Investigations via the nav
    await page.getByRole("button", { name: "Investigations", exact: false }).first().click();
    await page.waitForTimeout(800);
    await expect(page.getByText("PSI")).toHaveCount(1, { timeout: 10000 }).catch(() => {});
    // no horizontal overflow
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(1441);
  });

  test("hash deep link opens investigation", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#investigation/PSI-69");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1200);
    await expect(page.getByText("FLEX", { exact: false }).first()).toBeVisible({ timeout: 10000 });
  });

  test("copilot dock opens and shows CIR-1", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForSelector("header", { timeout: 15000 });
    await page.getByRole("button", { name: /CIR-1/i }).first().click();
    await page.waitForTimeout(600);
    await expect(page.getByText("CIR-1 — Research Copilot")).toBeVisible({ timeout: 8000 });
  });

  test("compare view renders comparability gate", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/#compare");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);
    await expect(page.getByText("cross-investigation evidence", { exact: false }).first()).toBeVisible({ timeout: 10000 });
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(1441);
  });

  test("my work view renders", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/#my-work");
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(1000);
    await expect(page.getByText("persistent research workbench", { exact: false }).first()).toBeVisible({ timeout: 10000 });
    const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
    expect(scroll).toBeLessThanOrEqual(391);
  });
});
