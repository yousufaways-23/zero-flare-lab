import { test, expect } from "@playwright/test";

/**
 * ZERO FLARE — guided demo flow (audit §39): the deterministic 90-second
 * journey must run end-to-end without network/LLM, land on My Work, and seed
 * a labelled CIR-1 replay.
 */

test("guided demo walks the full journey deterministically", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/");
  await page.waitForLoadState("domcontentloaded");
  await page.waitForSelector("header", { timeout: 15000 });

  // launch from the hero CTA
  await page.getByRole("button", { name: /90-second guided tour/i }).click();
  const dialog = page.getByRole("dialog", { name: /guided demonstration/i });
  await expect(dialog).toBeVisible({ timeout: 5000 });
  await expect(dialog.getByText(/step 1\/12/)).toBeVisible();

  // step 2: investigations, PSI-69 opened
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog.getByText(/PSI-69 FLEX — a real experiment workspace/)).toBeVisible();
  await expect(page.getByText("PSI-69", { exact: false }).first()).toBeVisible({ timeout: 8000 });

  // step 4: copilot seed — labelled deterministic replay must appear in the dock
  await dialog.getByRole("button", { name: "Next" }).click(); // step 3 (data)
  await dialog.getByRole("button", { name: "Next" }).click(); // step 4 (copilot)
  await expect(dialog.getByText(/CIR-1 — deterministic research copilot/)).toBeVisible();
  await expect(page.getByText("Deterministic demo replay", { exact: false }).first()).toBeVisible({ timeout: 8000 });
  await expect(page.getByText(/21\.1[0-9]? kPa|21\.27/).first()).toBeVisible({ timeout: 8000 });

  // step 5: compare gate verdict renders for PSI-69 vs PSI-99
  await dialog.getByRole("button", { name: "Next" }).click();
  await expect(dialog.getByText(/the comparability gate/)).toBeVisible();
  await expect(page.getByText(/NOT directly comparable|comparison possible WITH CAVEATS/i).first()).toBeVisible({ timeout: 10000 });

  // fast-forward to the last step via progress dots, then finish on My Work
  await dialog.getByRole("button", { name: /Go to step 12/ }).click();
  await expect(dialog.getByRole("heading", { name: /Mission map — real NASA assets/ })).toBeVisible();
  await dialog.getByRole("button", { name: /Start researching/i }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("My Work", { exact: false }).first()).toBeVisible();

  // no horizontal overflow after the whole walkthrough
  const scroll = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scroll).toBeLessThanOrEqual(1441);
});
