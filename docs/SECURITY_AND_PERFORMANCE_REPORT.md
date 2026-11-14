# SECURITY AND PERFORMANCE REPORT — ZERO FLARE (M12)

## Implemented protections (verified in code + live probes)

### Upload / ingestion
- ≤10 files per batch, ≤300 MB per file (oversize preserved-raw but marked unsupported, never parsed).
- Raw bytes persisted BEFORE parsing — a parse failure never loses the file; failures quarantined with honest statuses.
- Magic-byte sniffing overrides lying extensions (OLE binary renamed .csv → unsupported).
- Archive extraction depth cap (3); nested archives tracked as children.
- Batch-id regex `^B-\d{8}-\d{3}$`; receipt filename sanitization.
- PDF extraction in a crash-isolated child process with bounded memory (pages ≤15, images ≤8/page, ≤16 MP/image, ≤30/file).

### Media serving (`/api/ingest/media`)
- `path.resolve()` + separator-aware allowlist roots (`data/media`, `data/raw/batches`, `data/extracted/batches`) — traversal and `data/media-evil` prefix tricks defeated (verified live: forbidden_path).
- MIME whitelist (415 otherwise); SVG/PDF forced `Content-Disposition: attachment` (no same-origin script execution); `X-Content-Type-Options: nosniff`; sanitized filenames.

### External fetches
- Fixed endpoints (NTRS/PSI/Images); `AbortController` timeouts (10–15 s); honest failure taxonomy (unavailable ≠ no evidence); no user-controlled URL fetching (no SSRF surface); cache TTLs to bound repeat calls.

### Secrets & data
- No API keys in the repo or client bundles; LLM credentials are platform-managed server-side (z-ai-web-dev-sdk), voice/vision likewise.
- `.env` carries only DATABASE_URL (SQLite). Raw PSI CSVs immutable; model artifacts immutable under the version policy.
- SQL exposure: Prisma with parameterized queries only; no raw string-assembled SQL anywhere in the codebase.

### Known gaps (documented, not hidden)
1. **Rate limiting (review round 2): IMPLEMENTED for the heavy routes** — fixed-window per-IP limiter (`src/lib/server/rate-limit.ts`): /api/copilot 10/min, /api/ingest 6/min, /api/external 20/min, /api/selftest 5/min; 429 responses carry `Retry-After` and honest messages. In-memory buckets are per-instance (edge-gateway rate limiting still recommended for multi-instance production).
2. No authentication/authorization on API routes — challenge-demo posture; required before any public deployment.
3. No CSRF token on state-changing routes (same-origin demo assumption).
4. Malware scanning of uploads not integrated.
5. Database migrations: `prisma db push` used in dev; formal migration discipline required for Postgres deployment.

## Performance measures (implemented)

- Client corpus loaded once from bundled generated JSON; charts computed on demand; heavy 3D behind `next/dynamic ssr:false` + Deferred3D + `frameloop` discipline; OrbitControls damping; GLBs pre-compressed (meshopt + WebP textures — ISS 44.5 MB→4.8 MB, Perseverance 11.7 MB→2.3 MB) loaded lazily via useGLTF with in-bundle decoder (no CDN dependency).
- Code splitting: view components are lazy where heavy; NTRS results cached (10-min TTL).
- Image budget: media thumbs from NASA Images API; lightbox loads full-size on demand only.
- Known cost: client corpus.json ≈ 2 MB (rows embedded) — acceptable for the demo; server-side DuckDB/Parquet path documented for scale-up.

## Release verification

`tsc` 0 errors · eslint 0/0 · Playwright 15/15 · `/api/selftest` 4/4 · `next build` succeeds (only standalone-tracing warnings from the ingest layer's dynamic FS access — expected and documented).
