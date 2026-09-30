import { Router } from 'express';
import { query } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { handleValidation } from '../middleware/error-handler';
import {
  requireAuth,
  refreshPermissions,
} from '../middleware/auth.middleware';
import { requirePlatformAdmin } from '../middleware/auth.middleware';
import {
  requireHiringClientAuth,
} from '../middleware/hiring-client-auth.middleware';
import { hiringClientAuthService } from '../services/hiring-client-auth.service';
import { authService } from '../services/auth.service';
import { analyticsDashboardService } from '../services/analytics-dashboard.service';
import { UnauthorizedError, BadRequestError } from '../utils/errors';

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

function dateQuery(name: string) {
  return query(name)
    .optional()
    .isISO8601()
    .withMessage(`${name} must be ISO8601`);
}

export const analyticsRouter = Router();

/**
 * GET /analytics/dashboard
 * Role inferred from token + optional scope override:
 * - contractor (org token) → own data
 * - client (hiring-client token) → connected contractors
 * - admin (platform admin) → global
 */
analyticsRouter.get(
  '/dashboard',
  requireOrgOrHiringClient,
  dateQuery('from'),
  dateQuery('to'),
  query('skip').optional().isInt({ min: 0 }),
  query('take').optional().isInt({ min: 1, max: 100 }),
  query('scope').optional().isIn(['contractor', 'client', 'admin']),
  query('contractorId').optional().isUUID(),
  query('region').optional().isString(),
  query('q').optional().isString(),
  handleValidation,
  asyncHandler(async (req, res) => {
    const from = req.query.from
      ? new Date(String(req.query.from))
      : undefined;
    const to = req.query.to ? new Date(String(req.query.to)) : undefined;
    const skip = Number(req.query.skip ?? 0);
    const take = Number(req.query.take ?? 20);

    let scope =
      (req.query.scope as 'contractor' | 'client' | 'admin' | undefined) ||
      (req.hiringClientId ? 'client' : 'contractor');

    if (scope === 'admin') {
      await new Promise<void>((resolve, reject) => {
        requirePlatformAdmin(req, res, (err?: unknown) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    if (scope === 'contractor') {
      const contractorId =
        (typeof req.query.contractorId === 'string'
          ? req.query.contractorId
          : undefined) || req.orgId;
      if (!contractorId) {
        throw new BadRequestError('contractorId required');
      }
      if (req.orgId && req.orgId !== contractorId && !req.hiringClientId) {
        analyticsDashboardService.assertContractorAccess(
          req.orgId,
          contractorId,
        );
      }
      const data = await analyticsDashboardService.getDashboard({
        scope: 'contractor',
        contractorId,
        from,
        to,
        skip,
        take,
      });
      res.json(data);
      return;
    }

    if (scope === 'client') {
      if (!req.hiringClientId) {
        throw new BadRequestError('Hiring client session required');
      }
      const data = await analyticsDashboardService.getDashboard({
        scope: 'client',
        hiringClientId: req.hiringClientId,
        contractorId:
          typeof req.query.contractorId === 'string'
            ? req.query.contractorId
            : undefined,
        from,
        to,
        skip,
        take,
        region:
          typeof req.query.region === 'string' ? req.query.region : undefined,
        q: typeof req.query.q === 'string' ? req.query.q : undefined,
      });
      res.json(data);
      return;
    }

    // admin
    const data = await analyticsDashboardService.getDashboard({
      scope: 'admin',
      contractorId:
        typeof req.query.contractorId === 'string'
          ? req.query.contractorId
          : undefined,
      from,
      to,
      skip,
      take,
      region:
        typeof req.query.region === 'string' ? req.query.region : undefined,
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
    });
    res.json(data);
  }),
);

/** Explicit role endpoints */
analyticsRouter.get(
  '/contractor',
  requireAuth,
  refreshPermissions(),
  dateQuery('from'),
  dateQuery('to'),
  handleValidation,
  asyncHandler(async (req, res) => {
    const data = await analyticsDashboardService.getDashboard({
      scope: 'contractor',
      contractorId: req.orgId!,
      from: req.query.from ? new Date(String(req.query.from)) : undefined,
      to: req.query.to ? new Date(String(req.query.to)) : undefined,
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 20),
    });
    res.json(data);
  }),
);

analyticsRouter.get(
  '/client',
  requireHiringClientAuth,
  dateQuery('from'),
  dateQuery('to'),
  query('skip').optional().isInt({ min: 0 }),
  query('take').optional().isInt({ min: 1, max: 100 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const data = await analyticsDashboardService.getDashboard({
      scope: 'client',
      hiringClientId: req.hiringClientId!,
      from: req.query.from ? new Date(String(req.query.from)) : undefined,
      to: req.query.to ? new Date(String(req.query.to)) : undefined,
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 20),
      region:
        typeof req.query.region === 'string' ? req.query.region : undefined,
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      contractorId:
        typeof req.query.contractorId === 'string'
          ? req.query.contractorId
          : undefined,
    });
    res.json(data);
  }),
);

analyticsRouter.get(
  '/admin',
  requireAuth,
  requirePlatformAdmin,
  dateQuery('from'),
  dateQuery('to'),
  query('skip').optional().isInt({ min: 0 }),
  query('take').optional().isInt({ min: 1, max: 100 }),
  handleValidation,
  asyncHandler(async (req, res) => {
    const data = await analyticsDashboardService.getDashboard({
      scope: 'admin',
      from: req.query.from ? new Date(String(req.query.from)) : undefined,
      to: req.query.to ? new Date(String(req.query.to)) : undefined,
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 20),
      region:
        typeof req.query.region === 'string' ? req.query.region : undefined,
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
      contractorId:
        typeof req.query.contractorId === 'string'
          ? req.query.contractorId
          : undefined,
    });
    res.json(data);
  }),
);
