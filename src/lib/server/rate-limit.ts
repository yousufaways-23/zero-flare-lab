/**
 * ZERO FLARE — minimal fixed-window rate limiter for API routes.
 *
 * Challenge-demo posture: in-memory, per-IP, per-route budgets that protect
 * the external NASA endpoints and the LLM route from runaway loops or naive
 * hammering. Not a substitute for an edge gateway in production deployment
 * (documented in SECURITY_AND_PERFORMANCE_REPORT.md).
 */

const buckets = new Map<string, { count: number; resetAt: number }>();

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function rateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
  }
  bucket.count += 1;
  if (bucket.count > limit) {
    return { ok: false, remaining: 0, retryAfterSec: Math.ceil((bucket.resetAt - now) / 1000) };
  }
  return { ok: true, remaining: limit - 1, retryAfterSec: 0 };
}

/** Best-effort client IP (behind the platform proxy: x-forwarded-for first hop). */
export function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return req.headers.get("x-real-ip") ?? "local";
}

/** Periodic sweep so idle buckets do not accumulate (called opportunistically). */
export function pruneRateBuckets(): void {
  const now = Date.now();
  for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
}

export const RATE_LIMITS = {
  copilot: { limit: 10, windowMs: 60_000 }, // LLM route — bounded tool loops cost real compute
  ingest: { limit: 6, windowMs: 60_000 }, // heavy pipeline batches
  external: { limit: 20, windowMs: 60_000 }, // NASA endpoints — respect their infrastructure
  selftest: { limit: 5, windowMs: 60_000 },
} as const;
