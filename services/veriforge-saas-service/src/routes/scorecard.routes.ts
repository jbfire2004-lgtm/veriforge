import { Router } from 'express';
import { param } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { handleValidation } from '../middleware/error-handler';
import {
  requireAuth,
  requirePermission,
  refreshPermissions,
} from '../middleware/auth.middleware';
import {
  requireHiringClientAuth,
  requireHiringClientPermission,
} from '../middleware/hiring-client-auth.middleware';
import { requireSubscriptionModule } from '../middleware/module-access.middleware';
import { hiringClientAuthService } from '../services/hiring-client-auth.service';
import { authService } from '../services/auth.service';
import { scorecardService } from '../services/scorecard.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { PERMISSIONS } from '../types';
import { HIRING_CLIENT_PERMISSIONS } from '../rbac/hiring-client-permissions';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

function requireOrgOrHiringClient(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(new UnauthorizedError('Access token required'));

  const hc = hiringClientAuthService.validateAccessToken(token);
  if (hc.valid && hc.payload) {
    req.hiringClientAuth = hc.payload;
    req.hiringClientId = hc.payload.hiring_client_id;
    req.hiringClientUserId = hc.payload.user_id;
    return next();
  }

  const org = authService.validateAccessToken(token);
  if (org.valid && org.payload) {
    req.auth = org.payload;
    req.userId = org.payload.user_id;
    req.orgId = org.payload.org_id;
    return next();
  }

  return next(new UnauthorizedError('Invalid or expired access token'));
}

export const scorecardRouter = Router();

scorecardRouter.post(
  '/recalculate',
  requireAuth,
  refreshPermissions(),
  requireSubscriptionModule('scorecards'),
  requirePermission(
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.VERICORE_COMPLIANCE_MANAGE,
    PERMISSIONS.ORG_PROFILE_UPDATE,
  ),
  asyncHandler(async (req, res) => {
    const orgId = (req.body?.orgId as string | undefined) ?? req.auth!.org_id;
    if (orgId !== req.auth!.org_id) {
      throw new ForbiddenError('Cross-tenant scorecard recalculation denied');
    }
    const result = await scorecardService.recalculate(orgId, req.auth!.user_id);
    res.json(result);
  }),
);

scorecardRouter.get(
  '/:orgId',
  param('orgId').isUUID(),
  handleValidation,
  requireOrgOrHiringClient,
  asyncHandler(async (req, res) => {
    const orgId = req.params.orgId as string;

    if (req.auth) {
      if (req.auth.org_id !== orgId) {
        throw new ForbiddenError('Cross-tenant access denied');
      }
      const { subscriptionService } = await import('../services/subscription.service');
      const enabled = await subscriptionService.isModuleEnabled(orgId, 'scorecards');
      if (!enabled) {
        const { ModuleAccessDeniedError } = await import('../utils/errors');
        throw new ModuleAccessDeniedError('scorecards', 'Scorecards');
      }
    } else if (req.hiringClientAuth) {
      const ok = hiringClientAuthService.canAny(req.hiringClientAuth, [
        HIRING_CLIENT_PERMISSIONS.CONTRACTOR_SCORECARDS_VIEW,
        HIRING_CLIENT_PERMISSIONS.CONTRACTOR_COMPLIANCE_VIEW,
      ]);
      if (!ok) throw new ForbiddenError('Missing scorecard view permission');
    } else {
      throw new UnauthorizedError();
    }

    const result = await scorecardService.get(orgId);
    res.json(result);
  }),
);
