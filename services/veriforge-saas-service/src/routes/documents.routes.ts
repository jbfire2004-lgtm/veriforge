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
import { documentCenterService } from '../services/document-center.service';
import { ForbiddenError, UnauthorizedError, BadRequestError } from '../utils/errors';
import { PERMISSIONS } from '../types';
import { DOCUMENT_CATEGORIES } from '../document-center/category-rules';

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

function decodeFileBody(body: {
  fileUrl?: string;
  contentBase64?: string;
  fileName?: string;
  mimeType?: string;
}): { fileUrl?: string; buffer: Buffer; fileName: string; mimeType: string } {
  const fileName = body.fileName?.trim() || 'document.bin';
  const mimeType = body.mimeType?.trim() || 'application/octet-stream';
  if (body.fileUrl?.trim()) {
    return { fileUrl: body.fileUrl.trim(), buffer: Buffer.alloc(0), fileName, mimeType };
  }
  if (body.contentBase64) {
    const raw = body.contentBase64.replace(/^data:[^;]+;base64,/, '');
    const buffer = Buffer.from(raw, 'base64');
    if (!buffer.length) throw new BadRequestError('Invalid contentBase64');
    return { buffer, fileName, mimeType };
  }
  throw new BadRequestError('fileUrl or contentBase64 required');
}

export const documentsRouter = Router();

/** GET /documents/rules — category rules */
documentsRouter.get(
  '/rules',
  requireOrgOrHiringClient,
  asyncHandler(async (_req, res) => {
    res.json({ rules: documentCenterService.listCategoryRules() });
  }),
);

/** GET /documents/dashboard/:contractorId */
documentsRouter.get(
  '/dashboard/:contractorId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    if (req.orgId && req.orgId !== contractorId && !req.hiringClientId) {
      throw new ForbiddenError('Access denied');
    }
    const data = await documentCenterService.dashboard(contractorId);
    res.json(data);
  }),
);

/** GET /documents/:contractorId — list */
documentsRouter.get(
  '/:contractorId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  query('category').optional().isIn([...DOCUMENT_CATEGORIES]),
  query('status').optional().isString(),
  query('skip').optional().isInt({ min: 0 }),
  query('take').optional().isInt({ min: 1, max: 100 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    if (req.orgId && req.orgId !== contractorId && !req.hiringClientId) {
      throw new ForbiddenError('Access denied');
    }
    const result = await documentCenterService.list(contractorId, {
      category: req.query.category as
        | 'insurance'
        | 'safety_program'
        | 'license'
        | 'training'
        | undefined,
      status: req.query.status as
        | 'valid'
        | 'expiring'
        | 'expired'
        | 'pending_review'
        | 'rejected'
        | 'exempt'
        | 'missing'
        | undefined,
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 50),
    });
    res.json(result);
  }),
);

/** GET /documents/:contractorId/:documentId */
documentsRouter.get(
  '/:contractorId/:documentId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  param('documentId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    if (req.orgId && req.orgId !== contractorId && !req.hiringClientId) {
      throw new ForbiddenError('Access denied');
    }
    const doc = await documentCenterService.get(
      req.params.documentId as string,
      contractorId,
    );
    res.json(doc);
  }),
);

/** POST /documents/:contractorId/upload */
documentsRouter.post(
  '/:contractorId/upload',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  body('category').isIn([...DOCUMENT_CATEGORIES]),
  body('title').isString().isLength({ min: 1, max: 500 }),
  body('expiryDate').optional({ nullable: true }).isISO8601(),
  body('fileUrl').optional().isString(),
  body('contentBase64').optional().isString(),
  body('fileName').optional().isString(),
  body('mimeType').optional().isString(),
  body('changeNote').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    documentCenterService.assertOwner(req.orgId, contractorId);
    const file = decodeFileBody(req.body);
    const doc = await documentCenterService.upload({
      contractorId,
      category: req.body.category,
      title: req.body.title,
      expiryDate: req.body.expiryDate,
      fileName: file.fileName,
      mimeType: file.mimeType,
      buffer: file.buffer,
      fileUrl: file.fileUrl,
      uploadedById: req.userId,
      changeNote: req.body.changeNote,
    });
    res.status(201).json(doc);
  }),
);

/** POST /documents/:contractorId/:documentId/replace */
documentsRouter.post(
  '/:contractorId/:documentId/replace',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('documentId').isUUID(),
  body('expiryDate').optional({ nullable: true }).isISO8601(),
  body('fileUrl').optional().isString(),
  body('contentBase64').optional().isString(),
  body('fileName').optional().isString(),
  body('mimeType').optional().isString(),
  body('title').optional().isString(),
  body('changeNote').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    documentCenterService.assertOwner(req.orgId, contractorId);
    const file = decodeFileBody(req.body);
    const doc = await documentCenterService.replace(
      req.params.documentId as string,
      {
        contractorId,
        fileName: file.fileName,
        mimeType: file.mimeType,
        buffer: file.buffer,
        fileUrl: file.fileUrl,
        uploadedById: req.userId,
        changeNote: req.body.changeNote,
        expiryDate: req.body.expiryDate,
        title: req.body.title,
      },
    );
    res.json(doc);
  }),
);

/** POST /documents/:contractorId/:documentId/expire */
documentsRouter.post(
  '/:contractorId/:documentId/expire',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('documentId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    documentCenterService.assertOwner(req.orgId, contractorId);
    const doc = await documentCenterService.expire(
      req.params.documentId as string,
      contractorId,
    );
    res.json(doc);
  }),
);

/** POST /documents/:contractorId/:documentId/exempt */
documentsRouter.post(
  '/:contractorId/:documentId/exempt',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('documentId').isUUID(),
  body('reason').isString().isLength({ min: 1, max: 2000 }),
  body('exemptionExpiresAt').optional({ nullable: true }).isISO8601(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    documentCenterService.assertOwner(req.orgId, contractorId);
    const doc = await documentCenterService.exempt(
      req.params.documentId as string,
      {
        contractorId,
        reason: req.body.reason,
        exemptionExpiresAt: req.body.exemptionExpiresAt,
      },
    );
    res.json(doc);
  }),
);

/** POST /documents/:contractorId/:documentId/clear-exemption */
documentsRouter.post(
  '/:contractorId/:documentId/clear-exemption',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE),
  param('contractorId').isUUID(),
  param('documentId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    documentCenterService.assertOwner(req.orgId, contractorId);
    const doc = await documentCenterService.clearExemption(
      req.params.documentId as string,
      contractorId,
    );
    res.json(doc);
  }),
);
