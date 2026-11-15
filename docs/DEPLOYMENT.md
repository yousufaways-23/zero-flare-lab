# Deployment — ZERO FLARE / FLAME EVIDENCE LAB

## Live site

- **URL (production):** https://zero-flare.yousuf-aways.workers.dev — Cloudflare Workers via
  @opennextjs/cloudflare (Worker `zero-flare`, D1 database `zero-flare-lab`, Static Assets for
  /corpus). This is the canonical owner production URL per the release manifest
  (docs/data-audit/release-manifest.json → productionUrl).
- **Historical note:** an earlier ZCode Sites sandbox host (`zero-flare-lab.zcode.site`) existed
  during development; it is retired and NOT the production deployment.

## What was packaged (and what was not)

**Included:** Next.js standalone build (`.next/standalone` + `.next/static`), `public/` (brand emblem/art, planet textures, official NASA ISS + Perseverance GLBs), minimal `data/ingest` JSONs (recovery ledger, PSI metadata, acquisition manifest).

**Excluded by policy:** `node_modules` (traced + linux sharp cross-installed), `.env` (never packaged), `data/` heavy trees (raw batches PDFs, extracted figures, validation CSVs), `knowledge/` (the 392-doc index is **statically imported at build** — bundled into the server chunk, so `search_knowledge_base` works in the cloud), docs/tests.

## What changed for the cloud (minimal, documented)

1. **Pruned the traced stage**: removed `data/` (146 MB of ingestion batches traced by outputFileTracing), nested `public/public` + `knowledge/knowledge` duplicates, `docs/`, `upload/`, `src/`, sourcemaps, route-cache — 266 MB → **72 MB unpacked** (~30-45 MB compressed).
2. **sharp cross-installed for linux x64** (`@img/sharp-linux-x64@0.34.3` + `@img/sharp-libvips-linux-x64@1.2.0` via npm pack) — the Windows binary from the local trace crashes on Debian.
3. **start.sh** (new): standalone start template with `PORT`/`HOSTNAME`/`DATA_DIR` and an optional, clearly-marked LLM key block (see below).
4. **No other application changes** — the honest-degradation path covers the cloud by design.

## CIR-1 in the cloud — enabling LLM synthesis with a FREE API key

CIR-1 ships in **deterministic mode**: all 42 tools compute and answer without any LLM. To add LLM *synthesis* (phrasing, multi-step planning), get a free key from any of:

| Provider | Free tier | Base URL | Model | Get key at |
|---|---|---|---|---|
| **Google AI Studio** | generous free tier | `https://generativelanguage.googleapis.com/v1beta/openai` | `gemini-2.0-flash` | aistudio.google.com/apikey |
| **Groq** | free tier | `https://api.groq.com/openai/v1` | `llama-3.3-70b-versatile` | console.groq.com/keys |
| **Z.ai open platform** | free tier | `https://api.z.ai/api/paas/v4` | `glm-4.5-air` | open.bigmodel.cn |

Then edit **one file** — `.zcode-site/stage/start.sh` — and un-comment the three export lines for your provider, pasting your key:

```bash
export LLM_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai"
export LLM_API_KEY="your-key-here"     # server-side only; browser never sees it
export LLM_MODEL="gemini-2.0-flash"
```

The app's `callLLM` adapter routes to any OpenAI-compatible endpoint via these env vars (`src/lib/agent/core.ts`), falling back to the platform SDK and then to deterministic mode. Keys stay **server-side** — the browser bundle never contains them. Free-tier per-minute quotas are honoured by the in-app rate limiter (10/min per IP).

After editing, redeploy: `zcode-site deploy .zcode-site/stage`

## Cloud limitations (documented, by design)

- **Without a key**, CIR-1 answers via the deterministic tool layer — no synthesis, no invented content.
- **Ephemeral writes**: ingestion uploads/scenario DB go to `/app/data` (or `$DATA_DIR`) and recycle with the instance; the corpus is immutable and ships in the package.
- **216 extracted source figures** live in `data/media/batches` (excluded for size) — investigation galleries show the honest availability note; the 41-record NASA Images catalogue is fully functional.
- **429 rate limits** and ingest caps apply per client as configured.

## Redeploying

Rebuild the stage from scratch (never patch the old one):

```
npm run build                                    # fresh standalone
# assemble stage: standalone + .next/static + public + data/ingest JSONs
# prune: .env, docs, upload, src, data/raw+media+validation, *.map, route-cache
# swap sharp → linux binaries (npm pack @img/sharp-linux-x64@0.34.3 + libvips@1.2.0)
zcode-site deploy .zcode-site/stage
```

## Local development

```
npm install
npm run dev          # http://localhost:3000
```

Data-pipeline rebuilds: `node scripts/flame/rebuild-all.mjs` (corpus → data layer → manifests → index-currency check).
