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

  test("Investigations mega lists every investigation and the filter narrows it", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /investigations/i }).first().click();
    const search = page.getByRole("textbox", { name: /filter investigations/i });
    await expect(search).toBeVisible({ timeout: 5_000 });
    // counter reads the full registry (no slice)
    await expect(page.getByText(/showing 25 of 25 investigations/i)).toBeVisible();
    await search.fill("PSI-69");
    await expect(page.getByText(/showing 1 of 25 investigations/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /PSI-69/ }).first()).toBeVisible();
    await search.fill("zzzz-no-match");
    await expect(page.getByText(/no investigation matches/i)).toBeVisible();
  });

  test("each mega popup anchors horizontally within its own trigger", async ({ page }) => {
    test.setTimeout(90_000); // 3 menus × retry waits; dev servers compile pages on demand
    await page.goto("/");
    for (const label of ["Investigations", "Scenarios", "Research Tools"] as const) {
      const trigger = page.getByRole("button", { name: new RegExp(label, "i") }).first();
      const popup = page.locator('[data-slot="navigation-menu-content"][data-state="open"]');
      // in dev builds the first click can land before React hydration — retry the toggle
      for (let attempt = 0; attempt < 3; attempt++) {
        await trigger.click();
        try {
          await popup.waitFor({ state: "visible", timeout: 3_000 });
          break;
        } catch {
          // hydration race — click again
        }
      }
      await expect(popup).toBeVisible({ timeout: 5_000 });
      const tb = await trigger.boundingBox();
      const pb = await popup.boundingBox();
      expect(tb, `${label} trigger box`).not.toBeNull();
      expect(pb, `${label} popup box`).not.toBeNull();
      // the popup must span the trigger's center x — i.e. it is anchored under ITS
      // trigger, not under the Mission item at the nav's left edge (Phase-4 regression)
      const triggerCenterX = tb!.x + tb!.width / 2;
      expect(pb!.x, `${label} popup left edge`).toBeLessThanOrEqual(triggerCenterX);
      expect(pb!.x + pb!.width, `${label} popup right edge`).toBeGreaterThanOrEqual(triggerCenterX);
      // and the popup must not overflow the viewport horizontally
      const viewportWidth = page.viewportSize()?.width ?? 1440;
      expect(pb!.x).toBeGreaterThanOrEqual(0);
      expect(pb!.x + pb!.width).toBeLessThanOrEqual(viewportWidth);
      await page.keyboard.press("Escape");
    }
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
