/**
 * ZERO FLARE — Cloudflare bindings accessor (OpenNext runtime).
 *
 * Returns the Worker bindings when running inside Cloudflare (Workers /
 * `opennextjs-cloudflare preview`), and null everywhere else (`next dev`,
 * `next build` prerender, Node standalone). Every consumer must treat null as
 * "not on the edge" and use the local fallback — the honesty contract applies
 * to infrastructure too.
 */
import { getCloudflareContext } from "@opennextjs/cloudflare";

export interface D1Result {
  results?: unknown[];
  meta?: unknown;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  all<T = unknown>(): Promise<D1Result & { results?: T[] }>;
  run(): Promise<D1Result>;
  first<T = unknown>(): Promise<T | null>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  batch<T = unknown>(statements: D1PreparedStatement[]):
    Promise<D1Result[]>;
}

/** Minimal Workers AI binding surface (text-generation models). */
export interface WorkersAiBinding {
  run(model: string, inputs: Record<string, unknown>): Promise<unknown>;
}

export interface AssetFetcher {
  fetch(input: Request | string): Promise<Response>;
}

export interface CloudflareBindings {
  DB?: D1Database;
  AI?: WorkersAiBinding;
  ASSETS?: AssetFetcher;
}

let cached: CloudflareBindings | null | undefined;

/**
 * Snapshot of the current request's bindings. Safe to call anywhere: outside
 * the Workers runtime `getCloudflareContext()` throws and we return null.
 */
export function getBindings(): CloudflareBindings | null {
  if (cached !== undefined) return cached;
  try {
    const ctx = getCloudflareContext();
    cached = (ctx?.env ?? null) as CloudflareBindings | null;
  } catch {
    cached = null;
  }
  return cached;
}

/** True when running on the Cloudflare edge (any binding with assets present). */
export function isEdgeRuntime(): boolean {
  const b = getBindings();
  return b !== null && (b.DB !== undefined || b.ASSETS !== undefined);
}
