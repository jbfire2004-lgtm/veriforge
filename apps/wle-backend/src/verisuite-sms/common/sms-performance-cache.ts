import { Injectable } from '@nestjs/common';
import { SMS_AGGREGATE_CACHE_TTL_MS } from '../constants';

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

/**
 * In-process TTL cache for SMS aggregates (30–60s).
 * Keeps warm analytics GETs under p95 ≤400ms without Redis dependency.
 */
@Injectable()
export class SmsPerformanceCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly ttlMs = SMS_AGGREGATE_CACHE_TTL_MS;

  get<T>(key: string): T | undefined {
    const hit = this.store.get(key);
    if (!hit) return undefined;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(key);
      return undefined;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs = this.ttlMs): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  invalidatePrefix(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }

  /** Current in-process entry count (ops / monitoring). */
  size(): number {
    return this.store.size;
  }

  wrap<T>(key: string, factory: () => Promise<T>, ttlMs?: number): Promise<{
    data: T;
    cached: boolean;
  }> {
    const existing = this.get<T>(key);
    if (existing !== undefined) {
      return Promise.resolve({ data: existing, cached: true });
    }
    return factory().then((data) => {
      this.set(key, data, ttlMs);
      return { data, cached: false };
    });
  }
}
