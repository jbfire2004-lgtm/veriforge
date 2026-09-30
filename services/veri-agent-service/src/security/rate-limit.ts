import type Redis from "ioredis";
import type { RateLimitDecision, SecurityConfig } from "./types";
import { resolveTenantSecurity } from "./load-config";

export interface RateLimitStore {
  /** Increment key and return count within TTL window. */
  incr(key: string, windowMs: number): Promise<number>;
}

/** In-memory sliding/fixed window counter. */
export class MemoryRateLimitStore implements RateLimitStore {
  private readonly buckets = new Map<string, { count: number; resetAt: number }>();

  async incr(key: string, windowMs: number): Promise<number> {
    const now = Date.now();
    const cur = this.buckets.get(key);
    if (!cur || cur.resetAt <= now) {
      const next = { count: 1, resetAt: now + windowMs };
      this.buckets.set(key, next);
      return 1;
    }
    cur.count += 1;
    return cur.count;
  }

  /** Test helper */
  clear(): void {
    this.buckets.clear();
  }
}

/** Redis fixed-window counter (INCR + EXPIRE). */
export class RedisRateLimitStore implements RateLimitStore {
  constructor(private readonly redis: Redis) {}

  async incr(key: string, windowMs: number): Promise<number> {
    const ttlSec = Math.max(1, Math.ceil(windowMs / 1000));
    const count = await this.redis.incr(key);
    if (count === 1) {
      await this.redis.pexpire(key, windowMs);
    } else {
      // Ensure TTL exists even if prior expire failed
      const ttl = await this.redis.pttl(key);
      if (ttl < 0) await this.redis.pexpire(key, windowMs);
    }
    void ttlSec;
    return count;
  }
}

export class RateLimiter {
  constructor(
    private readonly config: SecurityConfig,
    private readonly store: RateLimitStore,
  ) {}

  async check(identity: {
    companyId?: number;
    userId?: number;
    ip?: string;
  }): Promise<RateLimitDecision> {
    const { rateLimit } = resolveTenantSecurity(
      this.config,
      identity.companyId,
    );
    const windowMs = rateLimit.windowMs;
    const windowBucket = Math.floor(Date.now() / windowMs);

    const tenantKey = `rl:t:${identity.companyId ?? "anon"}:${windowBucket}`;
    const userKey = `rl:u:${identity.companyId ?? "anon"}:${identity.userId ?? "anon"}:${windowBucket}`;
    const ipKey = `rl:ip:${identity.ip ?? "unknown"}:${windowBucket}`;

    const [tenantCount, userCount, ipCount] = await Promise.all([
      this.store.incr(tenantKey, windowMs),
      this.store.incr(userKey, windowMs),
      this.store.incr(ipKey, windowMs),
    ]);

    const resetMs = (windowBucket + 1) * windowMs - Date.now();
    const retryAfterSec = Math.max(1, Math.ceil(resetMs / 1000));

    if (identity.companyId != null && tenantCount > rateLimit.perTenant) {
      return {
        allowed: false,
        scope: "tenant",
        retryAfterSec,
        limit: rateLimit.perTenant,
        remaining: 0,
      };
    }
    if (identity.userId != null && userCount > rateLimit.perUser) {
      return {
        allowed: false,
        scope: "user",
        retryAfterSec,
        limit: rateLimit.perUser,
        remaining: 0,
      };
    }
    if (ipCount > rateLimit.perIp) {
      return {
        allowed: false,
        scope: "ip",
        retryAfterSec,
        limit: rateLimit.perIp,
        remaining: 0,
      };
    }

    return {
      allowed: true,
      remaining: {
        tenant: Math.max(0, rateLimit.perTenant - tenantCount),
        user: Math.max(0, rateLimit.perUser - userCount),
        ip: Math.max(0, rateLimit.perIp - ipCount),
      },
      limit: {
        tenant: rateLimit.perTenant,
        user: rateLimit.perUser,
        ip: rateLimit.perIp,
      },
      resetMs,
    };
  }
}

export function createRateLimitStore(redis: Redis | null): RateLimitStore {
  if (redis) return new RedisRateLimitStore(redis);
  return new MemoryRateLimitStore();
}
