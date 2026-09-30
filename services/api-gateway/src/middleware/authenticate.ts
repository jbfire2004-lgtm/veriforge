import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';
import { authIntrospection } from '../services/auth-introspection.service';
import { UnauthorizedError } from '../utils/errors';
import { isPublicPath } from './match-route';

function extractBearer(req: Request): string | undefined {
  const header = req.headers.authorization;
  if (header?.startsWith('Bearer ')) return header.slice(7);
  return undefined;
}

function hasAuditServiceKey(req: Request): boolean {
  if (!env.auditServiceKey) return false;
  return req.headers['x-audit-service-key'] === env.auditServiceKey;
}

export async function authenticate(req: Request, _res: Response, next: NextFunction) {
  const route = req.matchedRoute;
  if (!route || route.auth === 'none') {
    return next();
  }

  const path = req.path;

  if (route.auth === 'public' && isPublicPath(route, path)) {
    return next();
  }

  const token = extractBearer(req);

  if (route.auth === 'optional') {
    if (!token && hasAuditServiceKey(req)) {
      return next();
    }
    if (!token) {
      return next(new UnauthorizedError('Bearer token or service key required'));
    }
  } else if (!token) {
    return next(new UnauthorizedError('Bearer token required'));
  }

  try {
    const payload = await authIntrospection.validateToken(token!);
    req.auth = payload;
    req.accessToken = token;
    return next();
  } catch (err) {
    return next(err);
  }
}
