import { LRUCache } from 'lru-cache';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { AuthJwtPayload } from '../types';
import { UnauthorizedError } from '../utils/errors';
import { logger } from '../utils/logger';

interface CacheEntry {
  payload: AuthJwtPayload;
  expiresAt: number;
}

const cache = new LRUCache<string, CacheEntry>({
  max: env.tokenCacheMax,
  ttl: env.tokenCacheTtlMs,
});

export const authIntrospection = {
  async validateToken(token: string): Promise<AuthJwtPayload> {
    const cached = cache.get(token);
    if (cached && cached.expiresAt > Date.now() / 1000) {
      return cached.payload;
    }

    const payload = await this.introspectRemote(token);
    const exp = payload.exp ?? Math.floor(Date.now() / 1000) + 900;
    cache.set(token, { payload, expiresAt: exp });
    return payload;
  },

  async introspectRemote(token: string): Promise<AuthJwtPayload> {
    const url = `${env.authServiceUrl}${env.authValidatePath}?token=${encodeURIComponent(token)}`;

    try {
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(5000),
      });
      const body = (await res.json()) as {
        valid?: boolean;
        payload?: AuthJwtPayload;
      };

      if (body.valid && body.payload?.user_id && body.payload?.company_id) {
        return body.payload;
      }
    } catch (err) {
      logger.warn('auth introspection failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    }

    if (env.jwtAccessSecret) {
      try {
        const decoded = jwt.verify(token, env.jwtAccessSecret) as AuthJwtPayload & {
          sub?: string;
        };
        return {
          user_id: decoded.user_id ?? decoded.sub!,
          company_id: decoded.company_id,
          email: decoded.email,
          roles: decoded.roles,
          exp: decoded.exp,
        };
      } catch {
        /* fall through */
      }
    }

    throw new UnauthorizedError('Invalid or expired token');
  },
};
