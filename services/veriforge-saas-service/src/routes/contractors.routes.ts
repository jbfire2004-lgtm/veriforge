import { Router } from 'express';
import { body, param, query } from 'express-validator';
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
import { contractorDirectoryService } from '../services/contractor-directory.service';
import { hiringClientAuthService } from '../services/hiring-client-auth.service';
import { authService } from '../services/auth.service';
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

export const contractorsRouter = Router();

/** GET /contractors — directory list */
contractorsRouter.get(
  '/',
  requireOrgOrHiringClient,
  query('skip').optional().isInt({ min: 0 }),
  query('take').optional().isInt({ min: 1, max: 100 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const result = await contractorDirectoryService.list({
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      insuranceStatus:
        typeof req.query.insuranceStatus === 'string'
          ? (req.query.insuranceStatus as
              | 'valid'
              | 'expiring'
              | 'expired'
              | 'missing'
              | 'unknown')
          : undefined,
      minCompliance:
        req.query.minCompliance != null
          ? Number(req.query.minCompliance)
          : undefined,
      region: typeof req.query.region === 'string' ? req.query.region : undefined,
      connectionStatus:
        typeof req.query.connectionStatus === 'string'
          ? (req.query.connectionStatus as
              | 'pending'
              | 'approved'
              | 'rejected'
              | 'revoked')
          : undefined,
      hiringClientId: req.hiringClientId,
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 20),
    });
    res.json(result);
  }),
);

/** GET /contractors/connections/inbox — before /:id */
contractorsRouter.get(
  '/connections/inbox',
  requireAuth,
  asyncHandler(async (req, res) => {
    const items = await contractorDirectoryService.listConnections({
      contractorId: req.orgId!,
      status:
        typeof req.query.status === 'string'
          ? (req.query.status as 'pending' | 'approved' | 'rejected' | 'revoked')
          : undefined,
    });
    res.json({ items });
  }),
);

/** POST /contractors/connections/:connectionId/respond */
contractorsRouter.post(
  '/connections/:connectionId/respond',
  requireAuth,
  param('connectionId').isUUID(),
  body('decision').isIn(['approved', 'rejected']),
  handleValidation,
  asyncHandler(async (req, res) => {
    const row = await contractorDirectoryService.respondConnection({
      connectionId: req.params.connectionId,
      contractorId: req.orgId!,
      actorUserId: req.userId!,
      decision: req.body.decision,
      responseMessage: req.body.responseMessage,
    });
    res.json({ connection: row });
  }),
);

/** POST /contractors — create profile (Contractor Admin) */
contractorsRouter.post(
  '/',
  requireAuth,
  refreshPermissions(),
  requirePermission(
    PERMISSIONS.ORG_PROFILE_UPDATE,
    PERMISSIONS.ORG_USERS_MANAGE,
  ),
  body('contractorId').optional().isUUID(),
  body('legalName').isString().isLength({ min: 2, max: 200 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = (req.body.contractorId as string) || req.orgId!;
    if (contractorId !== req.orgId) {
      throw new ForbiddenError(
        'Can only create directory profile for your organization',
      );
    }
    const result = await contractorDirectoryService.create(
      {
        contractorId,
        legalName: req.body.legalName,
        tradeName: req.body.tradeName,
        contactInfo: req.body.contactInfo,
        industry: req.body.industry,
        region: req.body.region,
        isListed: req.body.isListed,
        notes: req.body.notes,
      },
      req.userId,
    );
    res.status(201).json(result);
  }),
);

/** GET /contractors/:id */
contractorsRouter.get(
  '/:id',
  requireOrgOrHiringClient,
  param('id').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const result = await contractorDirectoryService.getById(req.params.id, {
      hiringClientId: req.hiringClientId,
    });
    res.json(result);
  }),
);

/** PATCH /contractors/:id */
contractorsRouter.patch(
  '/:id',
  requireAuth,
  refreshPermissions(),
  param('id').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    contractorDirectoryService.assertContractorActor(req.orgId, req.params.id);
    const result = await contractorDirectoryService.update(
      req.params.id,
      {
        legalName: req.body.legalName,
        tradeName: req.body.tradeName,
        contactInfo: req.body.contactInfo,
        industry: req.body.industry,
        region: req.body.region,
        isListed: req.body.isListed,
        notes: req.body.notes,
        insuranceStatus: req.body.insuranceStatus,
      },
      req.userId,
    );
    res.json(result);
  }),
);

/** DELETE /contractors/:id */
contractorsRouter.delete(
  '/:id',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('id').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    contractorDirectoryService.assertContractorActor(req.orgId, req.params.id);
    const result = await contractorDirectoryService.delete(
      req.params.id,
      req.userId,
    );
    res.json(result);
  }),
);

contractorsRouter.post(
  '/:id/documents',
  requireAuth,
  param('id').isUUID(),
  body('kind').isString(),
  body('fileUrl').isString().isLength({ min: 1 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    contractorDirectoryService.assertContractorActor(req.orgId, req.params.id);
    const row = await contractorDirectoryService.addDocument(req.params.id, {
      kind: req.body.kind,
      label: req.body.label,
      fileUrl: req.body.fileUrl,
      expiryDate: req.body.expiryDate,
      status: req.body.status,
    });
    res.status(201).json({ document: row });
  }),
);

contractorsRouter.post(
  '/:id/audits',
  requireAuth,
  param('id').isUUID(),
  body('title').isString().isLength({ min: 1 }),
  body('auditedAt').isISO8601(),
  handleValidation,
  asyncHandler(async (req, res) => {
    contractorDirectoryService.assertContractorActor(req.orgId, req.params.id);
    const row = await contractorDirectoryService.addAudit(req.params.id, {
      title: req.body.title,
      auditor: req.body.auditor,
      auditedAt: req.body.auditedAt,
      result: req.body.result,
      score: req.body.score,
      findings: req.body.findings,
      reportUrl: req.body.reportUrl,
    });
    res.status(201).json({ audit: row });
  }),
);

contractorsRouter.post(
  '/:id/sites',
  requireAuth,
  param('id').isUUID(),
  body('name').isString().isLength({ min: 1 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    contractorDirectoryService.assertContractorActor(req.orgId, req.params.id);
    const row = await contractorDirectoryService.addSite(req.params.id, {
      name: req.body.name,
      address: req.body.address,
      region: req.body.region,
      isActive: req.body.isActive,
    });
    res.status(201).json({ site: row });
  }),
);

contractorsRouter.post(
  '/:id/recalculate',
  requireAuth,
  param('id').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    contractorDirectoryService.assertContractorActor(req.orgId, req.params.id);
    const result = await contractorDirectoryService.recalculateCompliance(
      req.params.id,
    );
    res.json(result);
  }),
);

/** Client → request connection */
contractorsRouter.post(
  '/:id/connect',
  requireHiringClientAuth,
  requireHiringClientPermission(
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_PROJECTS_VIEW,
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_AWARD_MANAGE,
  ),
  param('id').isUUID(),
  body('message').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const row = await contractorDirectoryService.requestConnection({
      hiringClientId: req.hiringClientId!,
      contractorId: req.params.id,
      requestedByUserId: req.hiringClientUserId!,
      message: req.body.message,
    });
    res.status(201).json({ connection: row });
  }),
);
