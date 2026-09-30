import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import type { AuthJwtPayload } from '../types';

const ADMIN_ROLES = ['company_admin', 'admin'];

declare global {
  namespace Express {
    interface Request {
      auth?: AuthJwtPayload;
      companyId?: string;
      userId?: string;
    }
  }
}

export function hasAdminRole(roles: string[] | undefined): boolean {
  return (roles ?? []).some((r) => ADMIN_ROLES.includes(r.toLowerCase()));
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

export function requireAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!hasAdminRole(req.auth?.roles)) {
    return next(new ForbiddenError('Admin role required'));
  }
  return next();
}
