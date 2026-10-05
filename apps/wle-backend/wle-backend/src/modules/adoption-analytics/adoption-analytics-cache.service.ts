import { Injectable } from '@nestjs/common';
import { ADOPTION_CACHE_TTL_MS } from './adoption-analytics.constants';

type CacheEntry<T> = { value: T; expiresAt: number };

@Injectable()
export class AdoptionAnalyticsCacheService {
  private readonly store = new Map<string, CacheEntry<unknown>>();

  get<T>(key: string): T | null {
    const hit = this.store.get(key);
    if (!hit) return null;
    if (Date.now() > hit.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return hit.value as T;
  }

  set<T>(key: string, value: T, ttlMs = ADOPTION_CACHE_TTL_MS): void {
    this.store.set(key, { value, expiresAt: Date.now() + ttlMs });
  }

  async wrap<T>(key: string, fn: () => Promise<T>): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) return cached;
    const value = await fn();
    this.set(key, value);
    return value;
  }

  invalidate(prefix: string): void {
    for (const key of this.store.keys()) {
      if (key.startsWith(prefix)) this.store.delete(key);
    }
  }
}
