import { Injectable } from '@nestjs/common';
import type { FeedPage } from '@vera/api-contract';

type CacheEntry = { payload: FeedPage; expiresAt: number };

const TTL_MS = 60_000;

@Injectable()
export class FeedCacheService {
  private readonly store = new Map<string, CacheEntry>();

  private key(userId: number, companyId?: number, sources?: string): string {
    return `${userId}:${companyId ?? 'global'}:${sources ?? 'all'}`;
  }

  get(userId: number, companyId?: number, sources?: string): FeedPage | null {
    const entry = this.store.get(this.key(userId, companyId, sources));
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(this.key(userId, companyId, sources));
      return null;
    }
    return entry.payload;
  }

  set(
    userId: number,
    companyId: number | undefined,
    payload: FeedPage,
    sources?: string,
  ): void {
    this.store.set(this.key(userId, companyId, sources), {
      payload,
      expiresAt: Date.now() + TTL_MS,
    });
  }

  invalidateUser(userId: number): void {
    for (const k of this.store.keys()) {
      if (k.startsWith(`${userId}:`)) this.store.delete(k);
    }
  }
}
