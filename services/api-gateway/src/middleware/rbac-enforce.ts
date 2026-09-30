import type { Request, Response, NextFunction } from 'express';
import { rbacEvaluation } from '../services/rbac-evaluation.service';
import { isPublicPath } from './match-route';

export async function enforceRbac(req: Request, _res: Response, next: NextFunction) {
  const route = req.matchedRoute;

  if (!route?.rbac || !req.auth || !req.accessToken) {
    return next();
  }

  if (route.auth === 'public' && isPublicPath(route, req.path)) {
    return next();
  }

  try {
    await rbacEvaluation.evaluateFromRequest(
      req.accessToken,
      req.auth.user_id,
      req.auth.company_id,
      route.rbac.resource,
      req.method,
    );
    return next();
  } catch (err) {
    return next(err);
  }
}
