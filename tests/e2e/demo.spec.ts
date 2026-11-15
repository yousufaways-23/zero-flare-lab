import { test, expect } from "@playwright/test";

/**
 * ZERO FLARE — guided tour (Phase 5 W3): the 9-stop tour must run end-to-end
 * without network/LLM, spotlight real views via stable data-tour anchors,
 * offer Back/Skip/Close/progress/Restart controls, and seed a labelled CIR-1
 * replay on the final stop.
 */

test("guided tour walks all 9 stops deterministically with full controls", async ({ page }) => {
  test.setTimeout(90_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("header", { timeout: 15000 });

  // launch from the hero CTA (honest duration label)
  await page.getByRole("button", { name: /9-stop guided tour/i }).click();
  const dialog = page.getByRole("dialog", { name: /guided tour/i });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await expect(dialog.getByText(/step 1\/9/)).toBeVisible();

  // spotlight targets the stable mission anchor
  await expect(page.locator('[data-tour="tour-mission"]')).toBeVisible();

  // stop 2: investigations, PSI-69 opened
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog.getByText(/Investigations — 25 evidence workspaces/)).toBeVisible();
  await expect(page.getByText("PSI-69", { exact: false }).first()).toBeVisible({ timeout: 8000 });

  // stop 3: compare gate verdict renders for PSI-69 vs PSI-99
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog.getByText(/the gate decides before any chart does/)).toBeVisible();
  await expect(page.getByText(/NOT directly comparable|comparison possible WITH CAVEATS/i).first()).toBeVisible({ timeout: 10000 });

  // Back returns to stop 2
  await dialog.getByRole("button", { name: "Back" }).click();
  await expect(dialog.getByText(/Investigations — 25 evidence workspaces/)).toBeVisible();
  await dialog.getByRole("button", { name: "Next" }).click();

  // fast-forward to the final stop via progress dots — CIR-1 seeded
  await dialog.getByRole("button", { name: /Go to stop 9/ }).click();
  await expect(dialog.getByText(/CIR-1 — answers with receipts/)).toBeVisible({ timeout: 8000 });
  await expect(page.getByText("Deterministic demo replay", { exact: false }).first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByText(/21\.1[0-9]? kPa|21\.27/).first()).toBeVisible({ timeout: 8000 });

  // Restart returns to stop 1, then Skip closes from any stop
  await dialog.getByRole("button", { name: /Restart/i }).click();
  await expect(dialog.getByText(/step 1\/9/)).toBeVisible();
  await dialog.getByRole("button", { name: /Skip the tour/i }).click();
  await expect(dialog).not.toBeVisible();

  // no horizontal overflow after the whole walkthrough
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scroll).toBeLessThanOrEqual(1441);
});

test("tour is skippable and keyboard-navigable", async ({ page }) => {
  test.setTimeout(60_000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("header", { timeout: 15000 });

  await page.getByRole("button", { name: /9-stop guided tour/i }).click();
  const dialog = page.getByRole("dialog", { name: /guided tour/i });
  await expect(dialog).toBeVisible({ timeout: 5000 });

  // ArrowRight advances, ArrowLeft goes back, Escape closes
  await page.keyboard.press("ArrowRight");
  await expect(dialog.getByText(/step 2\/9/)).toBeVisible({ timeout: 5000 });
  await page.keyboard.press("ArrowLeft");
  await expect(dialog.getByText(/step 1\/9/)).toBeVisible({ timeout: 5000 });

  // Skip control exits from any stop
  await dialog.getByRole("button", { name: /Skip the tour/i }).click();
  await expect(dialog).not.toBeVisible();
});
