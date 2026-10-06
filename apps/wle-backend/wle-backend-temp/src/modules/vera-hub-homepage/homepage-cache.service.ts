import { Injectable } from '@nestjs/common';
import type { HomepagePayload } from './hub-homepage.types';

type CacheEntry = {
  payload: HomepagePayload;
  expiresAt: number;
};

const DEFAULT_TTL_MS = 60_000;

@Injectable()
export class HomepageCacheService {
  private readonly store = new Map<string, CacheEntry>();

  private key(userId: number, hubRole: string, companyId?: number): string {
    return `${userId}:${hubRole}:${companyId ?? 'none'}`;
  }

  get(
    userId: number,
    hubRole: string,
    companyId?: number,
  ): HomepagePayload | null {
    const entry = this.store.get(this.key(userId, hubRole, companyId));
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(this.key(userId, hubRole, companyId));
      return null;
    }
    return entry.payload;
  }

  set(
    userId: number,
    hubRole: string,
    companyId: number | undefined,
    payload: HomepagePayload,
    ttlMs = DEFAULT_TTL_MS,
  ): void {
    this.store.set(this.key(userId, hubRole, companyId), {
      payload,
      expiresAt: Date.now() + ttlMs,
    });
  }

  invalidateUser(userId: number): void {
    for (const k of this.store.keys()) {
      if (k.startsWith(`${userId}:`)) this.store.delete(k);
    }
  }

  clear(): void {
    this.store.clear();
  }
}
