import { defineCloudflareConfig } from "@opennextjs/cloudflare";

/**
 * ZERO FLARE — FLAME EVIDENCE LAB · OpenNext → Cloudflare config.
 *
 * The app is a single client-rendered route plus dynamic API routes — no ISR,
 * no image optimization (images.unoptimized in next.config.ts) — so the default
 * no-op incremental cache is correct. D1 + Workers AI bindings are declared in
 * wrangler.jsonc and consumed via src/lib/server/bindings.ts.
 */
export default defineCloudflareConfig({});
