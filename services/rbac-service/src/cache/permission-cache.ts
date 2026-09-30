import { LRUCache } from 'lru-cache';
import { env } from '../config/env';
import type { PermissionRecord } from '../types';

type CacheEntry = {
  permissions: PermissionRecord[];
  loadedAt: number;
};

const cache = new LRUCache<string, CacheEntry>({
  max: env.permissionCacheMaxEntries,
  ttl: env.permissionCacheTtlMs,
});

function cacheKey(companyId: string, userId: string): string {
  return `${companyId}:${userId}`;
}

export const permissionCache = {
  get(companyId: string, userId: string): PermissionRecord[] | undefined {
    return cache.get(cacheKey(companyId, userId))?.permissions;
  },

  set(companyId: string, userId: string, permissions: PermissionRecord[]) {
    cache.set(cacheKey(companyId, userId), {
      permissions,
      loadedAt: Date.now(),
    });
  },

  invalidateUser(companyId: string, userId: string) {
    cache.delete(cacheKey(companyId, userId));
  },

  invalidateCompany(companyId: string) {
    for (const key of cache.keys()) {
      if (key.startsWith(`${companyId}:`)) {
        cache.delete(key);
      }
    }
  },

  clear() {
    cache.clear();
  },
};
