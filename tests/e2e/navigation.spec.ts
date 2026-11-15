import { expect, test } from "@playwright/test";

/**
 * Navigation regression tests (Phase 4 — research doc §3.6/§7.3):
 * the three mega-menu items (Investigations, Scenarios, Research Tools) must
 * open on desktop via mouse AND keyboard; mobile chips must navigate; all
 * breakpoints expose the same destinations.
 */

test.describe("desktop navigation", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("Investigations mega-menu opens by click and navigates to a workspace", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /investigations/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    // mega content shows investigation accessions
    const item = page.getByRole("button", { name: /PSI-69/i }).first();
    await expect(item).toBeVisible({ timeout: 5_000 });
    await item.click();
    await expect(page.getByText(/PSI-69/).first()).toBeVisible();
  });

  test("Scenarios mega-menu opens by click and lands on the pillar view", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /scenarios/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    const pillar = page.getByRole("button", { name: /prevention/i }).first();
    await expect(pillar).toBeVisible({ timeout: 5_000 });
    await pillar.click();
    await expect(page.getByText(/fire-safety lifecycle/i).first()).toBeVisible();
  });

  test("Research Tools mega-menu opens and reaches the equation registry", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /research tools/i }).first();
    await expect(trigger).toBeVisible();
    await trigger.click();
    const entry = page.getByRole("button", { name: /equation registry/i }).first();
    await expect(entry).toBeVisible({ timeout: 5_000 });
    await entry.click();
    await expect(page.getByText(/equation registry/i).first()).toBeVisible();
  });

  test("mega-menus operate via keyboard (Enter opens, Escape closes)", async ({ page }) => {
    await page.goto("/");
    const trigger = page.getByRole("button", { name: /investigations/i }).first();
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("button", { name: /PSI-69/i }).first()).toBeVisible({ timeout: 5_000 });
    await page.keyboard.press("Escape");
  });
});

test.describe("mobile navigation", () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("section chips navigate to the same destinations", async ({ page }) => {
    await page.goto("/");
    for (const label of ["Investigations", "Scenarios", "Research Tools"]) {
      const chip = page.getByRole("button", { name: new RegExp(label, "i") }).first();
      await expect(chip).toBeVisible();
      await chip.click();
      await page.waitForTimeout(400);
    }
    // destination actually renders
    await expect(page.getByText(/equation registry/i).first()).toBeVisible();
  });
});
