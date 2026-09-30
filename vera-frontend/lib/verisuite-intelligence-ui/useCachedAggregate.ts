"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CacheEntry = {
  data: unknown;
  expiresAt: number;
};

const memory = new Map<string, CacheEntry>();
const inflight = new Map<string, Promise<unknown>>();

const CLIENT_TTL_MS = 45_000;

function readCache<T>(key: string): T | null {
  const hit = memory.get(key);
  if (!hit) return null;
  if (hit.expiresAt < Date.now()) {
    memory.delete(key);
    return null;
  }
  return hit.data as T;
}

function writeCache(key: string, data: unknown, ttlMs = CLIENT_TTL_MS) {
  memory.set(key, { data, expiresAt: Date.now() + ttlMs });
}

export function invalidateClientAggregate(prefix?: string) {
  if (!prefix) {
    memory.clear();
    return;
  }
  for (const k of memory.keys()) {
    if (k.startsWith(prefix)) memory.delete(k);
  }
}

type Options = {
  /** When false, skip fetch until true */
  enabled?: boolean;
  /** Bust cache on every load (e.g. after POST) */
  bust?: boolean;
};

/**
 * Client aggregate fetch with in-memory TTL cache + request dedupe.
 * Keeps last good data while revalidating for snappy filter switches.
 */
export function useCachedAggregate<T>(
  url: string | null,
  options: Options = {},
): {
  data: T | null;
  loading: boolean;
  error: string | null;
  fromCache: boolean;
  reload: (opts?: { bust?: boolean }) => Promise<T | null>;
} {
  const { enabled = true, bust = false } = options;
  const [data, setData] = useState<T | null>(() =>
    url && !bust ? readCache<T>(url) : null,
  );
  const [loading, setLoading] = useState(() => Boolean(url && enabled && !readCache(url)));
  const [error, setError] = useState<string | null>(null);
  const [fromCache, setFromCache] = useState(() => Boolean(url && readCache(url)));
  const gen = useRef(0);

  const reload = useCallback(
    async (opts?: { bust?: boolean }) => {
      if (!url || !enabled) return null;
      const myGen = ++gen.current;
      const doBust = opts?.bust ?? bust;

      if (!doBust) {
        const cached = readCache<T>(url);
        if (cached) {
          setData(cached);
          setFromCache(true);
          setLoading(false);
          setError(null);
          // Background revalidate
          void (async () => {
            try {
              let p = inflight.get(url);
              if (!p) {
                p = fetch(url).then(async (res) => {
                  if (!res.ok) throw new Error(await res.text());
                  return res.json();
                });
                inflight.set(url, p);
              }
              const fresh = (await p) as T;
              writeCache(url, fresh);
              if (gen.current === myGen) {
                setData(fresh);
                setFromCache(false);
              }
            } catch {
              /* keep cached */
            } finally {
              inflight.delete(url);
            }
          })();
          return cached;
        }
      } else {
        memory.delete(url);
      }

      setLoading(true);
      setError(null);
      try {
        let p = inflight.get(url);
        if (!p) {
          p = fetch(url).then(async (res) => {
            if (!res.ok) throw new Error(await res.text());
            return res.json();
          });
          inflight.set(url, p);
        }
        const fresh = (await p) as T;
        writeCache(url, fresh);
        if (gen.current === myGen) {
          setData(fresh);
          setFromCache(false);
          setLoading(false);
        }
        return fresh;
      } catch (e) {
        if (gen.current === myGen) {
          setError(e instanceof Error ? e.message : "Failed to load");
          setLoading(false);
        }
        return null;
      } finally {
        inflight.delete(url);
      }
    },
    [url, enabled, bust],
  );

  useEffect(() => {
    void reload();
  }, [reload]);

  return { data, loading, error, fromCache, reload };
}
