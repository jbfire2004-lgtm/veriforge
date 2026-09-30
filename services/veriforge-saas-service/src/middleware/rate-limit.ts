import type { Request, Response, NextFunction } from 'express';
import rateLimit, { type Store, type Options, type IncrementalResponse } from 'express-rate-limit';
import { TooManyRequestsError } from '../utils/errors';
import { getRedis } from '../lib/redis';

function clientIp(req: Request): string {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0]!.trim();
  return req.ip || req.socket.remoteAddress || 'unknown';
}

const mem = new Map<string, { count: number; resetAt: number }>();

function memoryIncrement(key: string, windowMs: number): IncrementalResponse {
  const now = Date.now();
  const cur = mem.get(key);
  if (!cur || cur.resetAt <= now) {
    const resetAt = now + windowMs;
    mem.set(key, { count: 1, resetAt });
    return { totalHits: 1, resetTime: new Date(resetAt) };
  }
  cur.count += 1;
  return { totalHits: cur.count, resetTime: new Date(cur.resetAt) };
}

/** Redis-backed rate limit store for multi-pod deploys; falls back to in-memory. */
class RedisRateLimitStore implements Store {
  prefix: string;
  windowMs = 60_000;

  constructor(prefix: string) {
    this.prefix = prefix;
  }

  init(options: Options): void {
    this.windowMs = options.windowMs;
  }

  async increment(key: string): Promise<IncrementalResponse> {
    const redis = await getRedis();
    if (!redis) {
      return memoryIncrement(`${this.prefix}:${key}`, this.windowMs);
    }
    const rkey = `vf:rl:${this.prefix}:${key}`;
    const count = await redis.incr(rkey);
    if (count === 1) {
      await redis.pExpire(rkey, this.windowMs);
    }
    const ttl = await redis.pTTL(rkey);
    return {
      totalHits: count,
      resetTime: new Date(Date.now() + (ttl > 0 ? ttl : this.windowMs)),
    };
  }

  async decrement(key: string): Promise<void> {
    const redis = await getRedis();
    if (!redis) {
      const cur = mem.get(`${this.prefix}:${key}`);
      if (cur && cur.count > 0) cur.count -= 1;
      return;
    }
    await redis.decr(`vf:rl:${this.prefix}:${key}`);
  }

  async resetKey(key: string): Promise<void> {
    const redis = await getRedis();
    if (!redis) {
      mem.delete(`${this.prefix}:${key}`);
      return;
    }
    await redis.del(`vf:rl:${this.prefix}:${key}`);
  }
}

export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore('login'),
  keyGenerator: (req) => {
    const email =
      typeof req.body?.email === 'string'
        ? req.body.email.toLowerCase()
        : typeof req.body?.ownerEmail === 'string'
          ? req.body.ownerEmail.toLowerCase()
          : '';
    return `${clientIp(req)}:${email}`;
  },
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many auth attempts — try again later'));
  },
});

export const signupRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore('signup'),
  keyGenerator: (req) => clientIp(req),
  handler: (_req, _res, next) => {
    next(new TooManyRequestsError('Too many signup attempts from this IP'));
  },
});

export const apiRateLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
  store: new RedisRateLimitStore('api'),
  keyGenerator: (req) => clientIp(req),
});

export function attachClientIp(req: Request, _res: Response, next: NextFunction) {
  (req as Request & { clientIp?: string }).clientIp = clientIp(req);
  next();
}
