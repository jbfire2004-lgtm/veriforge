import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { rbacService } from '../services/rbac.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { env } from '../config/env';
import type { JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
      userId?: string;
      orgId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(new UnauthorizedError('Access token required'));

  const result = authService.validateAccessToken(token);
  if (!result.valid || !result.payload) {
    return next(new UnauthorizedError('Invalid or expired access token'));
  }

  req.auth = result.payload;
  req.userId = result.payload.user_id;
  req.orgId = result.payload.org_id;
  next();
}

/**
 * Optionally refresh permissions from DB (module enablement may have changed since JWT issued).
 */
export function refreshPermissions() {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth?.user_id) return next(new UnauthorizedError());
    try {
      const access = await rbacService.loadUserAccess(req.auth.user_id);
      req.auth = {
        ...req.auth,
        role: access.role ?? req.auth.role,
        permissions: access.permissions,
      };
      next();
    } catch (err) {
      next(err);
    }
  };
}

/** Resolve tenant from JWT and block cross-org path params. */
export function requireTenant(paramName = 'orgId') {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new UnauthorizedError());
    const pathOrgId = req.params[paramName];
    if (pathOrgId && pathOrgId !== req.auth.org_id) {
      return next(new ForbiddenError('Cross-tenant access denied'));
    }
    req.orgId = req.auth.org_id;
    next();
  };
}

/** Require ANY of the listed permission keys. */
export function requirePermission(...keys: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new UnauthorizedError());
    const ok = rbacService.canAny(req.auth, keys);
    if (!ok) {
      return next(new ForbiddenError(`Missing permission: ${keys.join(' | ')}`));
    }
    next();
  };
}

/** Require ALL listed permission keys. */
export function requireAllPermissions(...keys: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth) return next(new UnauthorizedError());
    if (!rbacService.canAll(req.auth, keys)) {
      return next(new ForbiddenError(`Missing permissions: ${keys.join(' & ')}`));
    }
    next();
  };
}

/** Gate routes on an enabled organization module (e.g. verihub). */
export function requireModule(moduleCode: string) {
  return async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.auth?.org_id) return next(new UnauthorizedError());
    try {
      const { moduleService } = await import('../services/module.service');
      const enabled = await moduleService.listEnabled(req.auth.org_id);
      const ok = (enabled as { module?: { code: string }; enabled?: boolean }[]).some(
        (row) => row.module?.code === moduleCode && row.enabled !== false,
      );
      if (!ok) {
        return next(new ForbiddenError(`Module required: ${moduleCode}`));
      }
      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requirePlatformAdmin(req: Request, _res: Response, next: NextFunction) {
  if (!req.auth) return next(new UnauthorizedError());
  const email = req.auth.email.toLowerCase();
  if (
    !env.platformAdminEmails.includes(email) &&
    !req.auth.permissions.includes('platform.admin')
  ) {
    return next(new ForbiddenError('Platform admin only'));
  }
  next();
}
