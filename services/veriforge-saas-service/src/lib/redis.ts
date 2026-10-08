import { createClient } from 'redis';
import { env } from '../config/env';
import { logger } from '../utils/logger';

type RedisConn = ReturnType<typeof createClient>;

let client: RedisConn | null = null;

export const CacheKeys = {
  rbacUser: (userId: string) => `vf:rbac:user:${userId}`,
  rbacOrgUsers: (orgId: string) => `vf:rbac:org:${orgId}:users`,
  pricingConfig: (currency: string) => `vf:pricing:config:${currency.toUpperCase()}`,
  moduleCatalog: () => `vf:modules:catalog`,
  orgModules: (orgId: string) => `vf:modules:org:${orgId}`,
  subscriptionProfile: (orgId: string) => `vf:subscription:org:${orgId}`,
} as const;

export const CacheTtl = {
  rbac: Number(process.env.CACHE_TTL_RBAC_SEC ?? 120),
  pricing: Number(process.env.CACHE_TTL_PRICING_SEC ?? 300),
  modules: Number(process.env.CACHE_TTL_MODULES_SEC ?? 300),
} as const;

export async function getRedis(): Promise<RedisConn | null> {
  if (env.nodeEnv === 'test' || process.env.REDIS_DISABLED === 'true') {
    return null;
  }
  if (!env.redisUrl) return null;
  if (client?.isOpen) return client;

  const next = createClient({ url: env.redisUrl, socket: { connectTimeout: 1500 } });
  next.on('error', (err) => {
    logger.error('redis error', { error: err instanceof Error ? err.message : String(err) });
  });
  try {
    await Promise.race([
      next.connect(),
      new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('redis connect timeout')), 1500);
      }),
    ]);
    client = next;
    return client;
  } catch (err) {
    logger.warn('redis connect failed', {
      error: err instanceof Error ? err.message : String(err),
    });
    try {
      await next.disconnect();
    } catch {
      /* ignore */
    }
    client = null;
    return null;
  }
}

export async function redisPing(): Promise<'ok' | 'skipped' | 'down'> {
  if (!env.redisUrl) return 'skipped';
  try {
    const c = await getRedis();
    if (!c) return 'skipped';
    const pong = await c.ping();
    return pong === 'PONG' ? 'ok' : 'down';
  } catch {
    return 'down';
  }
}

export async function cacheGet(key: string): Promise<string | null> {
  try {
    const c = await getRedis();
    if (!c) return null;
    return c.get(key);
  } catch (err) {
    logger.warn('cacheGet failed', { key, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function cacheSet(key: string, value: string, ttlSeconds = 300): Promise<void> {
  try {
    const c = await getRedis();
    if (!c) return;
    await c.set(key, value, { EX: ttlSeconds });
  } catch (err) {
    logger.warn('cacheSet failed', { key, error: err instanceof Error ? err.message : String(err) });
  }
}

export async function cacheDel(...keys: string[]): Promise<void> {
  if (!keys.length) return;
  try {
    const c = await getRedis();
    if (!c) return;
    await c.del(keys);
  } catch (err) {
    logger.warn('cacheDel failed', {
      keys,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

/** Delete keys matching a simple prefix via SCAN (cluster-safe enough for modest keyspaces). */
export async function cacheDelByPrefix(prefix: string): Promise<void> {
  try {
    const c = await getRedis();
    if (!c) return;
    let cursor = 0;
    do {
      const result = await c.scan(cursor, { MATCH: `${prefix}*`, COUNT: 100 });
      cursor = result.cursor;
      if (result.keys.length) await c.del(result.keys);
    } while (cursor !== 0);
  } catch (err) {
    logger.warn('cacheDelByPrefix failed', {
      prefix,
      error: err instanceof Error ? err.message : String(err),
    });
  }
}

export async function cacheGetJson<T>(key: string): Promise<T | null> {
  const raw = await cacheGet(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function cacheSetJson(key: string, value: unknown, ttlSeconds: number): Promise<void> {
  await cacheSet(key, JSON.stringify(value), ttlSeconds);
}
