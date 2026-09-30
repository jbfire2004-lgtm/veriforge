import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import type { JwtPayload } from '../types';

/**
 * Short-lived access JWTs with signing-key rotation.
 * JWT_ACCESS_SECRETS="kid1:secret1,kid2:secret2" (first = current signer)
 * Falls back to JWT_ACCESS_SECRET with kid "v1".
 */
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

export class JwtService {
  private readonly keys = parseKeys();

  signAccess(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
    const current = this.keys[0]!;
    return jwt.sign(payload, current.secret, {
      expiresIn: env.jwtAccessExpiresIn,
      algorithm: 'HS256',
      keyid: current.kid,
      issuer: env.jwtIssuer,
      audience: env.jwtAudience,
    } as jwt.SignOptions);
  }

  verifyAccess(token: string): { valid: boolean; payload?: JwtPayload } {
    try {
      const decoded = jwt.decode(token, { complete: true });
      const kid = decoded?.header?.kid;
      const candidates = kid
        ? this.keys.filter((k) => k.kid === kid).concat(this.keys)
        : this.keys;

      let lastErr: unknown;
      for (const key of candidates) {
        try {
          const payload = jwt.verify(token, key.secret, {
            algorithms: ['HS256'],
            issuer: env.jwtIssuer,
            audience: env.jwtAudience,
          }) as JwtPayload;
          if (!payload.user_id || !payload.org_id) return { valid: false };
          return { valid: true, payload };
        } catch (err) {
          lastErr = err;
        }
      }
      void lastErr;
      return { valid: false };
    } catch {
      return { valid: false };
    }
  }
}

export const jwtService = new JwtService();
