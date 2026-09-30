/**
 * Server-side TTL cache for VeriSuite aggregate dashboard payloads.
 * Survives hot reloads via globalThis; invalidated by namespace or revision.
 */

import { NextResponse } from "next/server";

type CacheEntry<T> = {
  value: T;
  expiresAt: number;
  revision: number | string | undefined;
};

type CacheStore = Map<string, CacheEntry<unknown>>;

const GLOBAL_KEY = "__verisuite_aggregate_cache__";

function store(): CacheStore {
  const g = globalThis as typeof globalThis & { [GLOBAL_KEY]?: CacheStore };
  if (!g[GLOBAL_KEY]) g[GLOBAL_KEY] = new Map();
  return g[GLOBAL_KEY];
}

/** Default TTL — short enough for simulated live refresh, long enough to hit. */
export const AGGREGATE_TTL_MS = 60_000;

export function cacheKey(
  namespace: string,
  parts: Record<string, string | number | boolean | null | undefined>,
): string {
  const sorted = Object.keys(parts)
    .sort()
    .map((k) => `${k}=${parts[k] ?? ""}`)
    .join("&");
  return `${namespace}?${sorted}`;
}

export function getCachedAggregate<T>(
  key: string,
  ttlMs: number,
  compute: () => T,
  revision?: number | string,
): T {
  const s = store();
  const now = Date.now();
  const hit = s.get(key) as CacheEntry<T> | undefined;
  if (
    hit &&
    hit.expiresAt > now &&
    (revision === undefined || hit.revision === revision)
  ) {
    return hit.value;
  }
  const value = compute();
  s.set(key, {
    value,
    expiresAt: now + ttlMs,
    revision,
  });
  return value;
}

/** Drop all entries for a namespace (e.g. after POST ingest). */
export function invalidateAggregateNamespace(namespace: string): void {
  const s = store();
  const prefix = `${namespace}?`;
  for (const k of s.keys()) {
    if (k === namespace || k.startsWith(prefix)) s.delete(k);
  }
}

export function invalidateAllAggregates(): void {
  store().clear();
}

/** JSON response with TTL cache + Cache-Control headers. */
export function cachedJsonResponse<T>(
  namespace: string,
  parts: Record<string, string | number | boolean | null | undefined>,
  compute: () => T,
  opts?: { ttlMs?: number; revision?: number | string },
): NextResponse {
  const key = cacheKey(namespace, parts);
  const ttl = opts?.ttlMs ?? AGGREGATE_TTL_MS;
  const value = getCachedAggregate(key, ttl, compute, opts?.revision);
  const res = NextResponse.json(value);
  res.headers.set(
    "Cache-Control",
    `private, max-age=${Math.floor(ttl / 1000)}, stale-while-revalidate=30`,
  );
  res.headers.set("X-VeriSuite-Cache-Key", key);
  return res;
}
