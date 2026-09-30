import { Router } from 'express';
import { param, query, body } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { handleValidation } from '../middleware/error-handler';
import { hiringClientAuthService } from '../services/hiring-client-auth.service';
import { authService } from '../services/auth.service';
import { quickCheckService } from '../services/quickcheck.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';

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

function assertAccess(req: Request, contractorId: string) {
  if (req.orgId && req.orgId !== contractorId && !req.hiringClientId) {
    throw new ForbiddenError('Access denied');
  }
}

export const quickcheckRouter = Router();

/**
 * POST /quickcheck
 * Body: { contractorId, source? }
 * → compliance score, missing items, risk level (+ logs run)
 */
quickcheckRouter.post(
  '/',
  requireOrgOrHiringClient,
  body('contractorId').isUUID(),
  body('source').optional().isString().isLength({ max: 64 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.body.contractorId as string;
    assertAccess(req, contractorId);
    const result = await quickCheckService.run({
      contractorId,
      triggeredById: req.userId || req.hiringClientUserId,
      hiringClientId: req.hiringClientId,
      source: req.body.source || 'api',
    });
    res.status(201).json(result);
  }),
);

/** GET /quickcheck/:contractorId — run + return (source=page default) */
quickcheckRouter.get(
  '/:contractorId',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  query('source').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    assertAccess(req, contractorId);
    const result = await quickCheckService.run({
      contractorId,
      triggeredById: req.userId || req.hiringClientUserId,
      hiringClientId: req.hiringClientId,
      source:
        typeof req.query.source === 'string' ? req.query.source : 'page',
    });
    res.json(result);
  }),
);

quickcheckRouter.get(
  '/:contractorId/runs',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  query('skip').optional().isInt({ min: 0 }),
  query('take').optional().isInt({ min: 1, max: 100 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    assertAccess(req, contractorId);
    res.json(
      await quickCheckService.listRuns(contractorId, {
        skip: Number(req.query.skip ?? 0),
        take: Number(req.query.take ?? 20),
      }),
    );
  }),
);

quickcheckRouter.get(
  '/:contractorId/analytics',
  requireOrgOrHiringClient,
  param('contractorId').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const contractorId = req.params.contractorId as string;
    assertAccess(req, contractorId);
    res.json(await quickCheckService.analytics(contractorId));
  }),
);
