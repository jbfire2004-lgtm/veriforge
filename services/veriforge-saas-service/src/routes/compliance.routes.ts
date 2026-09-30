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
import { validateBody } from '../middleware/validate';
import {
  complianceUploadSchema,
  complianceReviewSchema,
  complianceUpdateSchema,
} from '../validators/schemas';
import { complianceService } from '../services/compliance.service';
import { hiringClientAuthService } from '../services/hiring-client-auth.service';
import { authService } from '../services/auth.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { requireSubscriptionModule } from '../middleware/module-access.middleware';
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

export const complianceRouter = Router();

complianceRouter.post(
  '/upload',
  requireAuth,
  refreshPermissions(),
  requireSubscriptionModule('compliance'),
  requirePermission(
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.VERICORE_COMPLIANCE_MANAGE,
    PERMISSIONS.ORG_PROFILE_UPDATE,
  ),
  validateBody(complianceUploadSchema),
  asyncHandler(async (req, res) => {
    const result = await complianceService.upload({
      orgId: req.auth!.org_id,
      uploadedById: req.auth!.user_id,
      type: req.body.type,
      fileUrl: req.body.fileUrl,
      expiryDate: req.body.expiryDate,
      label: req.body.label,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.status(201).json(result);
  }),
);

complianceRouter.get(
  '/pending',
  requireHiringClientAuth,
  requireHiringClientPermission(
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_COMPLIANCE_VIEW,
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_COMPLIANCE_REVIEW,
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_DOCUMENTS_VIEW,
  ),
  asyncHandler(async (req, res) => {
    const result = await complianceService.listPendingReview({
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 50),
    });
    res.json(result);
  }),
);

complianceRouter.get(
  '/:orgId',
  param('orgId').isUUID(),
  handleValidation,
  requireOrgOrHiringClient,
  asyncHandler(async (req, res) => {
    const orgId = req.params.orgId;
    if (req.auth) {
      if (req.auth.org_id !== orgId) {
        throw new ForbiddenError('Cross-tenant access denied');
      }
      const { subscriptionService } = await import('../services/subscription.service');
      const enabled = await subscriptionService.isModuleEnabled(orgId, 'compliance');
      if (!enabled) {
        const { ModuleAccessDeniedError } = await import('../utils/errors');
        throw new ModuleAccessDeniedError('compliance', 'Compliance');
      }
    } else if (req.hiringClientAuth) {
      const ok = hiringClientAuthService.canAny(req.hiringClientAuth, [
        HIRING_CLIENT_PERMISSIONS.CONTRACTOR_COMPLIANCE_VIEW,
        HIRING_CLIENT_PERMISSIONS.CONTRACTOR_DOCUMENTS_VIEW,
        HIRING_CLIENT_PERMISSIONS.CONTRACTOR_SCORECARDS_VIEW,
      ]);
      if (!ok) throw new ForbiddenError('Missing compliance view permission');
    } else {
      throw new UnauthorizedError();
    }

    const result = await complianceService.listForOrg(orgId);
    res.json(result);
  }),
);

complianceRouter.post(
  '/:id/review',
  param('id').isUUID(),
  handleValidation,
  requireHiringClientAuth,
  requireHiringClientPermission(
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_COMPLIANCE_REVIEW,
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_COMPLIANCE_VIEW,
  ),
  validateBody(complianceReviewSchema),
  asyncHandler(async (req, res) => {
    const result = await complianceService.review({
      artifactId: req.params.id,
      reviewerId: req.hiringClientUserId!,
      decision: req.body.decision,
      notes: req.body.notes,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.json(result);
  }),
);

complianceRouter.post(
  '/:id/update',
  param('id').isUUID(),
  handleValidation,
  requireAuth,
  refreshPermissions(),
  requireSubscriptionModule('compliance'),
  requirePermission(
    PERMISSIONS.COMPLIANCE_VIEW,
    PERMISSIONS.VERICORE_COMPLIANCE_MANAGE,
    PERMISSIONS.ORG_PROFILE_UPDATE,
  ),
  validateBody(complianceUpdateSchema),
  asyncHandler(async (req, res) => {
    const result = await complianceService.update({
      artifactId: req.params.id,
      orgId: req.auth!.org_id,
      actorId: req.auth!.user_id,
      fileUrl: req.body.fileUrl,
      expiryDate: req.body.expiryDate,
      label: req.body.label,
      type: req.body.type,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.json(result);
  }),
);
