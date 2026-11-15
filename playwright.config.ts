import { defineConfig } from "@playwright/test";

/**
 * ZERO FLARE — Playwright config.
 * Targets the production URL by default (PROD smoke); set ZERO_FLARE_E2E_URL
 * to run against a local dev/preview server instead.
 */
export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 45_000,
  retries: 1,
  use: {
    baseURL: process.env.ZERO_FLARE_E2E_URL || "https://zero-flare.yousuf-aways.workers.dev",
    screenshot: "only-on-failure",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 } } },
  ],
});
