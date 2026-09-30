import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import {
  DEVELOPER_JWT_AUDIENCE,
  DEVELOPER_JWT_NS,
} from '../rbac/developer-permissions';
import type { DeveloperJwtPayload } from '../types/developer';

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

export class DeveloperJwtService {
  private readonly keys = parseKeys();

  signAccess(payload: Omit<DeveloperJwtPayload, 'iat' | 'exp' | 'ns'>): string {
    const current = this.keys[0]!;
    const body: DeveloperJwtPayload = {
      ...payload,
      ns: DEVELOPER_JWT_NS,
    };
    return jwt.sign(body, current.secret, {
      expiresIn: env.jwtAccessExpiresIn,
      algorithm: 'HS256',
      keyid: current.kid,
      issuer: env.jwtIssuer,
      audience: DEVELOPER_JWT_AUDIENCE,
    } as jwt.SignOptions);
  }

  verifyAccess(token: string): { valid: boolean; payload?: DeveloperJwtPayload } {
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
            audience: DEVELOPER_JWT_AUDIENCE,
          }) as DeveloperJwtPayload;
          if (
            payload.ns !== DEVELOPER_JWT_NS ||
            !payload.developer_id ||
            !payload.email
          ) {
            return { valid: false };
          }
          return { valid: true, payload };
        } catch {
          // next key
        }
      }
      return { valid: false };
    } catch {
      return { valid: false };
    }
  }
}

export const developerJwtService = new DeveloperJwtService();
