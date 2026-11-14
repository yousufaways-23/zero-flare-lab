/**
 * ZERO FLARE — SSRF-safe outbound fetch guard.
 *
 * Server-side code must only reach the public internet over http/https, and
 * never hosts that are loopback, private or reserved. Every server fetch of a
 * runtime-computed URL goes through `guardPublicHttpUrl` before the request;
 * compile-time-literal endpoints (the Gemini SDK, the NASA API hosts) are
 * additionally passed through the same guard as defense in depth.
 */

const FORBIDDEN_HOSTNAMES = new Set([
  "localhost",
  "metadata.google.internal",
  "metadata.goog",
  "instance-data",
  "metadata.svc.cluster.local",
]);

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split(".");
  if (parts.length !== 4) return null;
  let n = 0;
  for (const p of parts) {
    if (!/^\d{1,3}$/.test(p)) return null;
    const v = Number(p);
    if (v > 255) return null;
    n = n * 256 + v;
  }
  return n >>> 0;
}

/** Throws when the URL is not a plain http/https URL to a public host. */
export function guardPublicHttpUrl(rawUrl: string, label = "url"): void {
  let u: URL;
  try {
    u = new URL(rawUrl);
  } catch {
    throw new Error(`blocked ${label}: not a valid URL`);
  }
  if (u.protocol !== "https:" && u.protocol !== "http:") {
    throw new Error(`blocked ${label}: scheme must be http/https`);
  }
  const host = u.hostname.toLowerCase().replace(/\.$/, "");
  if (!host || FORBIDDEN_HOSTNAMES.has(host) || host.endsWith(".localhost") || host.endsWith(".local") || host.endsWith(".internal")) {
    throw new Error(`blocked ${label}: forbidden host`);
  }
  // Bare IPv4 literals — reject loopback / private / reserved ranges.
  const v4 = ipv4ToInt(host);
  if (v4 !== null) {
    // [o1, o2, o3, prefixBits] — IPv4 CIDR blocks that must never be fetched.
    const blocked: [number, number, number, number][] = [
      [0, 0, 0, 8], // this-network
      [10, 0, 0, 8], // private
      [100, 64, 0, 10], // CGNAT
      [127, 0, 0, 8], // loopback
      [169, 254, 0, 16], // link-local
      [172, 16, 0, 12], // private
      [192, 0, 0, 24], // IETF protocol assignments
      [192, 0, 2, 24], // TEST-NET-1
      [192, 168, 0, 16], // private
      [198, 18, 0, 15], // benchmarking
      [198, 51, 100, 24], // TEST-NET-2
      [203, 0, 113, 24], // TEST-NET-3
      [224, 0, 0, 4], // multicast
      [240, 0, 0, 4], // reserved
    ];
    for (const [o1, o2, o3, bits] of blocked) {
      const shift = 32 - bits;
      const baseInt = (((o1 << 24) | (o2 << 16) | (o3 << 8)) >>> 0) & (bits === 0 ? 0 : 0xffffffff);
      if ((v4 >>> shift) === (baseInt >>> shift)) {
        throw new Error(`blocked ${label}: private/reserved address`);
      }
    }
  }
  // Bare IPv6 literals: reject loopback, link-local, unique-local, unspecified.
  if (host.includes(":")) {
    const h = host.replace(/^\[|\]$/g, "");
    if (
      h === "::" ||
      h === "::1" ||
      /^f[cd]/i.test(h) || // fc00::/7 unique-local
      /^fe[89ab]/i.test(h) // fe80::/10 link-local
    ) {
      throw new Error(`blocked ${label}: private/reserved IPv6 address`);
    }
  }
}

/** fetch() wrapper that refuses non-public http/https URLs. */
export async function safeFetch(url: string, init?: RequestInit): Promise<Response> {
  guardPublicHttpUrl(url, "outbound request");
  return fetch(url, init);
}
