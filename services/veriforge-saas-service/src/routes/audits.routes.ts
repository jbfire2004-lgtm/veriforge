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
import { auditEvaluationService } from '../services/audit-evaluation.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import { PERMISSIONS } from '../types';

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

export const auditsRouter = Router();

// ── Templates ──────────────────────────────────────────────────────────────

auditsRouter.get(
  '/templates',
  requireOrgOrHiringClient,
  asyncHandler(async (req, res) => {
    const items = await auditEvaluationService.listTemplates({
      orgId: req.orgId,
    });
    res.json({ items });
  }),
);

auditsRouter.get(
  '/templates/:templateId',
  requireOrgOrHiringClient,
  param('templateId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const item = await auditEvaluationService.getTemplate(
      req.params.templateId as string,
    );
    res.json(item);
  }),
);

auditsRouter.post(
  '/templates',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  body('name').isString().isLength({ min: 1 }),
  body('sections').isArray({ min: 1 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const item = await auditEvaluationService.createTemplate(req.orgId!, {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      sections: req.body.sections,
    });
    res.status(201).json(item);
  }),
);

auditsRouter.put(
  '/templates/:templateId',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('templateId').isUUID(),
  body('name').isString().isLength({ min: 1 }),
  body('sections').isArray({ min: 1 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const item = await auditEvaluationService.updateTemplate(
      req.params.templateId as string,
      req.orgId,
      {
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        sections: req.body.sections,
        isActive: req.body.isActive,
      },
    );
    res.json(item);
  }),
);

auditsRouter.post(
  '/templates/:templateId/clone',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('templateId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const item = await auditEvaluationService.cloneTemplate(
      req.params.templateId as string,
      req.orgId!,
      req.body.name,
    );
    res.status(201).json(item);
  }),
);

// ── Corrective actions (contractor scoped, before :auditId) ────────────────

auditsRouter.get(
  '/corrective-actions/:contractorId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    if (req.orgId && req.orgId !== contractorId && !req.hiringClientId) {
      throw new ForbiddenError('Access denied');
    }
    const items = await auditEvaluationService.listCorrectiveActions(
      contractorId,
      {
        status: req.query.status as
          | 'open'
          | 'in_progress'
          | 'completed'
          | 'waived'
          | 'overdue'
          | undefined,
      },
    );
    res.json({ items });
  }),
);

auditsRouter.patch(
  '/corrective-actions/item/:actionId',
  requireOrgOrHiringClient,
  param('actionId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const item = await auditEvaluationService.updateCorrectiveAction(
      req.params.actionId as string,
      {
        title: req.body.title,
        description: req.body.description,
        ownerName: req.body.ownerName,
        status: req.body.status,
        dueDate: req.body.dueDate,
        evidenceUrl: req.body.evidenceUrl,
      },
    );
    res.json(item);
  }),
);

// ── Audits list / create ───────────────────────────────────────────────────

auditsRouter.get(
  '/',
  requireOrgOrHiringClient,
  query('skip').optional().isInt({ min: 0 }),
  query('take').optional().isInt({ min: 1, max: 100 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId =
      typeof req.query.contractorId === 'string'
        ? req.query.contractorId
        : req.orgId;
    if (req.orgId && contractorId && req.orgId !== contractorId && !req.hiringClientId) {
      throw new ForbiddenError('Access denied');
    }
    const result = await auditEvaluationService.listAudits({
      contractorId,
      reviewerId:
        typeof req.query.reviewerId === 'string'
          ? req.query.reviewerId
          : undefined,
      status: req.query.status as
        | 'draft'
        | 'assigned'
        | 'in_review'
        | 'scored'
        | 'closed'
        | 'cancelled'
        | undefined,
      hiringClientId: req.hiringClientId,
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 50),
    });
    res.json(result);
  }),
);

auditsRouter.post(
  '/',
  requireOrgOrHiringClient,
  body('contractorId').isUUID(),
  body('templateId').isUUID(),
  body('title').optional().isString(),
  body('reviewerId').optional().isUUID(),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.body.contractorId as string;
    if (req.orgId && req.orgId !== contractorId && !req.hiringClientId) {
      throw new ForbiddenError('Access denied');
    }
    const audit = await auditEvaluationService.createAudit({
      contractorId,
      templateId: req.body.templateId,
      title: req.body.title,
      createdById: req.userId || req.hiringClientUserId,
      hiringClientId: req.hiringClientId,
      dueDate: req.body.dueDate,
      reviewerId: req.body.reviewerId,
      reviewerName: req.body.reviewerName,
    });
    res.status(201).json(audit);
  }),
);

auditsRouter.get(
  '/:auditId',
  requireOrgOrHiringClient,
  param('auditId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const audit = await auditEvaluationService.getAudit(
      req.params.auditId as string,
    );
    if (
      req.orgId &&
      req.orgId !== audit.contractorId &&
      !req.hiringClientId
    ) {
      throw new ForbiddenError('Access denied');
    }
    res.json(audit);
  }),
);

auditsRouter.post(
  '/:auditId/assign',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('auditId').isUUID(),
  body('reviewerId').isUUID(),
  body('dueDate').optional({ nullable: true }).isISO8601(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const audit = await auditEvaluationService.getAudit(
      req.params.auditId as string,
    );
    auditEvaluationService.assertOwner(req.orgId, audit.contractorId);
    const updated = await auditEvaluationService.assignReviewer(
      req.params.auditId as string,
      {
        reviewerId: req.body.reviewerId,
        reviewerName: req.body.reviewerName,
        dueDate: req.body.dueDate,
      },
    );
    res.json(updated);
  }),
);

auditsRouter.post(
  '/:auditId/start',
  requireAuth,
  param('auditId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const updated = await auditEvaluationService.startReview(
      req.params.auditId as string,
      req.userId,
    );
    res.json(updated);
  }),
);

auditsRouter.post(
  '/:auditId/score',
  requireAuth,
  param('auditId').isUUID(),
  body('answers').isArray({ min: 1 }),
  body('finalize').optional().isBoolean(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const updated = await auditEvaluationService.saveResponses(
      req.params.auditId as string,
      req.body.answers,
      {
        finalize: !!req.body.finalize,
        reviewerId: req.userId,
      },
    );
    res.json(updated);
  }),
);

auditsRouter.post(
  '/:auditId/close',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('auditId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const audit = await auditEvaluationService.getAudit(
      req.params.auditId as string,
    );
    auditEvaluationService.assertOwner(req.orgId, audit.contractorId);
    const updated = await auditEvaluationService.closeAudit(
      req.params.auditId as string,
    );
    res.json(updated);
  }),
);

auditsRouter.post(
  '/:auditId/findings',
  requireAuth,
  param('auditId').isUUID(),
  body('title').isString().isLength({ min: 1 }),
  body('severity')
    .optional()
    .isIn(['critical', 'major', 'minor', 'observation']),
  handleValidation,
  asyncHandler(async (req, res) => {
    const item = await auditEvaluationService.addFinding(
      req.params.auditId as string,
      {
        title: req.body.title,
        description: req.body.description,
        severity: req.body.severity,
        questionId: req.body.questionId,
      },
    );
    res.status(201).json(item);
  }),
);

auditsRouter.patch(
  '/findings/:findingId',
  requireAuth,
  param('findingId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const item = await auditEvaluationService.updateFinding(
      req.params.findingId as string,
      {
        title: req.body.title,
        description: req.body.description,
        severity: req.body.severity,
        status: req.body.status,
      },
    );
    res.json(item);
  }),
);

auditsRouter.post(
  '/:auditId/corrective-actions',
  requireAuth,
  param('auditId').isUUID(),
  body('title').isString().isLength({ min: 1 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const item = await auditEvaluationService.addCorrectiveAction(
      req.params.auditId as string,
      {
        title: req.body.title,
        description: req.body.description,
        findingId: req.body.findingId,
        ownerName: req.body.ownerName,
        ownerId: req.body.ownerId,
        dueDate: req.body.dueDate,
      },
    );
    res.status(201).json(item);
  }),
);
