import type { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';
import { isPublicPath } from './match-route';

function collectCompanyIds(req: Request): string[] {
  const ids: string[] = [];
  const queryId = req.query.company_id;
  if (typeof queryId === 'string') ids.push(queryId);

  const headerId = req.headers['x-company-id'];
  if (typeof headerId === 'string') ids.push(headerId);

  // Body is not parsed at the gateway (streamed to upstream) — scope via query/header only.
  return ids;
}

export function enforceCompanyScope(req: Request, _res: Response, next: NextFunction) {
  const route = req.matchedRoute;
  if (!route?.companyScope || !req.auth) {
    return next();
  }

  if (route.auth === 'public' && isPublicPath(route, req.path)) {
    return next();
  }

  const tokenCompanyId = req.auth.company_id;
  const requested = collectCompanyIds(req);

  if (requested.length === 0) {
    return next();
  }

  const mismatch = requested.some((id) => id !== tokenCompanyId);
  if (mismatch) {
    return next(new ForbiddenError('Cross-company access denied'));
  }

  return next();
}
