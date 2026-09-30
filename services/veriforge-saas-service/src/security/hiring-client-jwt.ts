import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import {
  HIRING_CLIENT_JWT_AUDIENCE,
  HIRING_CLIENT_JWT_NS,
} from '../rbac/hiring-client-permissions';
import type { HiringClientJwtPayload } from '../types/hiring-client';

function parseKeys(): { kid: string; secret: string }[] {
  if (env.jwtAccessSecrets) {
    return env.jwtAccessSecrets.split(',').map((pair) => {
      const [kid, ...rest] = pair.trim().split(':');
      const secret = rest.join(':');
      if (!kid || !secret) throw new Error('Invalid JWT_ACCESS_SECRETS entry');
      return { kid, secret };
    });
  }
  return [{ kid: 'v1', secret: env.jwtAccessSecret }];
}

/**
 * Separate auth namespace for hiring clients (EPCs / owners / GCs).
 * Audience differs from org SaaS JWTs so tokens cannot be mixed.
 */
export class HiringClientJwtService {
  private readonly keys = parseKeys();

  signAccess(payload: Omit<HiringClientJwtPayload, 'iat' | 'exp' | 'ns'>): string {
    const current = this.keys[0]!;
    const body: HiringClientJwtPayload = {
      ...payload,
      ns: HIRING_CLIENT_JWT_NS,
    };
    return jwt.sign(body, current.secret, {
      expiresIn: env.jwtAccessExpiresIn,
      algorithm: 'HS256',
      keyid: current.kid,
      issuer: env.jwtIssuer,
      audience: HIRING_CLIENT_JWT_AUDIENCE,
    } as jwt.SignOptions);
  }

  verifyAccess(token: string): { valid: boolean; payload?: HiringClientJwtPayload } {
    try {
      const decoded = jwt.decode(token, { complete: true });
      const kid = decoded?.header?.kid;
      const candidates = kid
        ? this.keys.filter((k) => k.kid === kid).concat(this.keys)
        : this.keys;

      for (const key of candidates) {
        try {
          const payload = jwt.verify(token, key.secret, {
            algorithms: ['HS256'],
            issuer: env.jwtIssuer,
            audience: HIRING_CLIENT_JWT_AUDIENCE,
          }) as HiringClientJwtPayload;
          if (
            payload.ns !== HIRING_CLIENT_JWT_NS ||
            !payload.user_id ||
            !payload.hiring_client_id
          ) {
            return { valid: false };
          }
          return { valid: true, payload };
        } catch {
          // try next key
        }
      }
      return { valid: false };
    } catch {
      return { valid: false };
    }
  }
}

export const hiringClientJwtService = new HiringClientJwtService();
