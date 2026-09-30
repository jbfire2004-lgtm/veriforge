import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import type { AuthJwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthJwtPayload;
      companyId?: string;
      userId?: string;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Bearer token required'));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AuthJwtPayload;
    req.auth = payload;
    req.userId = payload.user_id;
    req.companyId = payload.company_id;
    return next();
  } catch {
    if (env.authValidateUrl) {
      try {
        const res = await fetch(
          `${env.authValidateUrl}?token=${encodeURIComponent(token)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const body = (await res.json()) as {
          valid?: boolean;
          payload?: AuthJwtPayload;
        };
        if (body.valid && body.payload) {
          req.auth = body.payload;
          req.userId = body.payload.user_id;
          req.companyId = body.payload.company_id;
          return next();
        }
      } catch {
        /* fall through */
      }
    }
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

/** Auth-service registration hook — shared secret header, no end-user JWT. */
export function requireHookSecret(req: Request, _res: Response, next: NextFunction) {
  const expected = process.env.RBAC_SERVICE_KEY;
  if (!expected && process.env.NODE_ENV !== 'production') {
    return next();
  }
  const provided = req.headers['x-rbac-service-key'];
  if (provided && provided === expected) {
    return next();
  }
  return next(new UnauthorizedError('Invalid RBAC service key'));
}
