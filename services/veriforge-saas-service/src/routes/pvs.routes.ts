import { Router } from 'express';
import { body, param, query } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { handleValidation } from '../middleware/error-handler';
import {
  requireAuth,
  requirePermission,
  refreshPermissions,
} from '../middleware/auth.middleware';
import { hiringClientAuthService } from '../services/hiring-client-auth.service';
import { authService } from '../services/auth.service';
import { programVerificationService } from '../services/program-verification.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { PERMISSIONS } from '../types';
import { PVS_CATEGORIES } from '../pvs/safety-matrix';

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

function assertContractorAccess(req: Request, contractorId: string) {
  if (req.orgId && req.orgId !== contractorId && !req.hiringClientId) {
    throw new ForbiddenError('Access denied');
  }
}

export const pvsRouter = Router();

pvsRouter.get(
  '/matrix',
  requireOrgOrHiringClient,
  asyncHandler(async (_req, res) => {
    res.json({
      categories: programVerificationService.listMatrixDefinitions(),
    });
  }),
);

pvsRouter.get(
  '/dashboard/:contractorId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    assertContractorAccess(req, contractorId);
    res.json(await programVerificationService.dashboard(contractorId));
  }),
);

pvsRouter.get(
  '/analytics/:contractorId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    assertContractorAccess(req, contractorId);
    res.json(await programVerificationService.analytics(contractorId));
  }),
);

pvsRouter.get(
  '/quickcheck/:contractorId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    assertContractorAccess(req, contractorId);
    // Delegate to QuickCheck module (logs run; source=pvs_legacy)
    const { quickCheckService } = await import(
      '../services/quickcheck.service'
    );
    res.json(
      await quickCheckService.run({
        contractorId,
        triggeredById: req.userId || req.hiringClientUserId,
        hiringClientId: req.hiringClientId,
        source: 'pvs_legacy',
      }),
    );
  }),
);

pvsRouter.get(
  '/:contractorId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  query('status').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    assertContractorAccess(req, contractorId);
    res.json(
      await programVerificationService.list(contractorId, {
        status: req.query.status as
          | 'draft'
          | 'submitted'
          | 'in_review'
          | 'verified'
          | 'rejected'
          | 'exempt'
          | 'missing'
          | undefined,
      }),
    );
  }),
);

pvsRouter.post(
  '/:contractorId/ensure-required',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    programVerificationService.assertOwner(req.orgId, contractorId);
    res.json(
      await programVerificationService.ensureRequiredPrograms(contractorId),
    );
  }),
);

pvsRouter.post(
  '/:contractorId',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  body('programCategory').isIn([...PVS_CATEGORIES]),
  body('title').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    programVerificationService.assertOwner(req.orgId, contractorId);
    const row = await programVerificationService.create({
      contractorId,
      programCategory: req.body.programCategory,
      title: req.body.title,
      programBody: req.body.programBody,
      fileUrl: req.body.fileUrl,
    });
    res.status(201).json(row);
  }),
);

pvsRouter.get(
  '/:contractorId/:pvsId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  param('pvsId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    assertContractorAccess(req, contractorId);
    res.json(
      await programVerificationService.get(
        req.params.pvsId as string,
        contractorId,
      ),
    );
  }),
);

pvsRouter.patch(
  '/:contractorId/:pvsId',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('pvsId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    programVerificationService.assertOwner(req.orgId, contractorId);
    res.json(
      await programVerificationService.updateProgram(
        req.params.pvsId as string,
        {
          contractorId,
          title: req.body.title,
          programBody: req.body.programBody,
          fileUrl: req.body.fileUrl,
        },
      ),
    );
  }),
);

pvsRouter.post(
  '/:contractorId/:pvsId/submit',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('pvsId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    programVerificationService.assertOwner(req.orgId, contractorId);
    res.json(
      await programVerificationService.submitForReview(
        req.params.pvsId as string,
        contractorId,
      ),
    );
  }),
);

pvsRouter.post(
  '/:contractorId/:pvsId/assign',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('pvsId').isUUID(),
  body('reviewerId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    programVerificationService.assertOwner(req.orgId, contractorId);
    res.json(
      await programVerificationService.assignReviewer(
        req.params.pvsId as string,
        {
          contractorId,
          reviewerId: req.body.reviewerId,
          reviewerName: req.body.reviewerName,
        },
      ),
    );
  }),
);

pvsRouter.post(
  '/:contractorId/:pvsId/matrix',
  requireAuth,
  param('contractorId').isUUID(),
  param('pvsId').isUUID(),
  body('elements').isArray({ min: 1 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    if (req.orgId && req.orgId !== contractorId) {
      throw new ForbiddenError('Access denied');
    }
    res.json(
      await programVerificationService.updateMatrixElements(
        req.params.pvsId as string,
        contractorId,
        req.body.elements,
      ),
    );
  }),
);

pvsRouter.post(
  '/:contractorId/:pvsId/verify',
  requireAuth,
  param('contractorId').isUUID(),
  param('pvsId').isUUID(),
  body('decision').isIn(['verified', 'rejected']),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    if (req.orgId && req.orgId !== contractorId) {
      throw new ForbiddenError('Access denied');
    }
    res.json(
      await programVerificationService.verify(req.params.pvsId as string, {
        contractorId,
        decision: req.body.decision,
        notes: req.body.notes,
        reviewerId: req.userId,
        reviewerName: req.body.reviewerName,
        elements: req.body.elements,
      }),
    );
  }),
);

pvsRouter.post(
  '/:contractorId/:pvsId/exempt',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('pvsId').isUUID(),
  body('reason').isString().isLength({ min: 1 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    programVerificationService.assertOwner(req.orgId, contractorId);
    res.json(
      await programVerificationService.requestExemption(
        req.params.pvsId as string,
        { contractorId, reason: req.body.reason },
      ),
    );
  }),
);

pvsRouter.post(
  '/:contractorId/:pvsId/exempt/decide',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('pvsId').isUUID(),
  body('decision').isIn(['approved', 'rejected']),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    programVerificationService.assertOwner(req.orgId, contractorId);
    res.json(
      await programVerificationService.decideExemption(
        req.params.pvsId as string,
        {
          contractorId,
          decision: req.body.decision,
          reviewedBy: req.userId,
        },
      ),
    );
  }),
);

pvsRouter.post(
  '/:contractorId/:pvsId/exempt/clear',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('pvsId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    programVerificationService.assertOwner(req.orgId, contractorId);
    res.json(
      await programVerificationService.clearExemption(
        req.params.pvsId as string,
        contractorId,
      ),
    );
  }),
);
