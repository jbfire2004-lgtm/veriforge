import { Router } from 'express';
import { routeParam } from '../utils/route-param';
import { param } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { handleValidation } from '../middleware/error-handler';
import {
  requireHiringClientAuth,
  requireHiringClientPermission,
} from '../middleware/hiring-client-auth.middleware';
import {
  loginRateLimiter,
  signupRateLimiter,
} from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate';
import {
  hiringClientSignupSchema,
  hiringClientLoginSchema,
  hiringClientAwardSchema,
} from '../validators/schemas';
import { hiringClientAuthService } from '../services/hiring-client-auth.service';
import { hiringClientReviewService } from '../services/hiring-client-review.service';
import { HIRING_CLIENT_PERMISSIONS } from '../rbac/hiring-client-permissions';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export const clientRouter = Router();

/** Separate auth namespace: /client/auth/* */
clientRouter.post(
  '/auth/signup',
  signupRateLimiter,
  validateBody(hiringClientSignupSchema),
  asyncHandler(async (req, res) => {
    const result = await hiringClientAuthService.provision(
      {
        companyName: req.body.companyName,
        contactName: req.body.contactName,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
        password: req.body.password,
        adminFullName: req.body.adminFullName,
      },
      { ip: req.ip, userAgent: req.get('user-agent') ?? undefined },
    );
    res.status(201).json(result);
  }),
);

clientRouter.post(
  '/auth/login',
  loginRateLimiter,
  validateBody(hiringClientLoginSchema),
  asyncHandler(async (req, res) => {
    const result = await hiringClientAuthService.login(req.body.email, req.body.password, {
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.json(result);
  }),
);

clientRouter.get(
  '/auth/me',
  requireHiringClientAuth,
  asyncHandler(async (req, res) => {
    res.json({
      user: {
        id: req.hiringClientAuth!.user_id,
        hiringClientId: req.hiringClientAuth!.hiring_client_id,
        email: req.hiringClientAuth!.email,
        role: req.hiringClientAuth!.role,
        permissions: req.hiringClientAuth!.permissions,
      },
    });
  }),
);

/** Authenticated review APIs */
const review = Router();
review.use(requireHiringClientAuth);

review.get(
  '/contractors',
  requireHiringClientPermission(
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_SCORECARDS_VIEW,
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_COMPLIANCE_VIEW,
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_PROJECTS_VIEW,
  ),
  asyncHandler(async (req, res) => {
    const result = await hiringClientReviewService.listContractors({
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 50),
    });
    res.json(result);
  }),
);

review.get(
  '/contractor/:id/scorecard',
  param('id').isUUID(),
  handleValidation,
  requireHiringClientPermission(HIRING_CLIENT_PERMISSIONS.CONTRACTOR_SCORECARDS_VIEW),
  asyncHandler(async (req, res) => {
    const scorecard = await hiringClientReviewService.getScorecard(routeParam(req.params.id));
    res.json(scorecard);
  }),
);

review.get(
  '/contractor/:id/compliance',
  param('id').isUUID(),
  handleValidation,
  requireHiringClientPermission(
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_COMPLIANCE_VIEW,
    HIRING_CLIENT_PERMISSIONS.CONTRACTOR_DOCUMENTS_VIEW,
  ),
  asyncHandler(async (req, res) => {
    const compliance = await hiringClientReviewService.getCompliance(routeParam(req.params.id));
    res.json(compliance);
  }),
);

review.post(
  '/contractor/:id/award',
  param('id').isUUID(),
  handleValidation,
  requireHiringClientPermission(HIRING_CLIENT_PERMISSIONS.CONTRACTOR_AWARD_MANAGE),
  validateBody(hiringClientAwardSchema),
  asyncHandler(async (req, res) => {
    const result = await hiringClientReviewService.awardContract({
      hiringClientId: req.hiringClientId!,
      contractorOrgId: routeParam(req.params.id),
      awardedByUserId: req.hiringClientUserId!,
      projectName: req.body.projectName,
      notes: req.body.notes,
    });
    res.status(201).json(result);
  }),
);

clientRouter.use(review);
