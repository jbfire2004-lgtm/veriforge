import { Router } from 'express';
import { routeParam } from '../utils/route-param';
import { param } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { handleValidation } from '../middleware/error-handler';
import {
  requireAuth,
  requirePermission,
  requireModule,
  refreshPermissions,
} from '../middleware/auth.middleware';
import { signupRateLimiter } from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate';
import {
  orgCreateSchema,
  orgUserCreateSchema,
  orgRoleCreateSchema,
  orgModulesUpdateSchema,
} from '../validators/schemas';
import { authService } from '../services/auth.service';
import { orgProvisioningService } from '../services/org-provisioning.service';
import { orgService } from '../services/org.service';
import { PERMISSIONS } from '../types';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export const orgRouter = Router();

orgRouter.post(
  '/create',
  signupRateLimiter,
  validateBody(orgCreateSchema),
  asyncHandler(async (req, res) => {
    const provisioned = await orgProvisioningService.provision(
      {
        companyName: req.body.companyName,
        ownerEmail: req.body.ownerEmail,
        password: req.body.password,
        ownerFullName: req.body.ownerFullName,
        ownerFirstName: req.body.ownerFirstName,
        ownerLastName: req.body.ownerLastName,
        selectedModules: req.body.selectedModules ?? ['verihub'],
        billingCycle: req.body.billingCycle ?? 'monthly',
        timezone: req.body.timezone,
        industry: req.body.industry,
        address: req.body.address,
        contactEmail: req.body.contactEmail,
        contactPhone: req.body.contactPhone,
      },
      { ip: req.ip, userAgent: req.get('user-agent') ?? undefined },
    );
    const tokens = await authService.issueSession(provisioned.user);
    res.status(201).json({ ...provisioned, tokens });
  }),
);

const gated = Router();
gated.use(requireAuth, refreshPermissions(), requireModule('verihub'));

gated.post(
  '/user/create',
  requirePermission(PERMISSIONS.ORG_USERS_MANAGE),
  validateBody(orgUserCreateSchema),
  asyncHandler(async (req, res) => {
    const result = await orgService.createUser(req.auth!, {
      email: req.body.email,
      fullName: req.body.fullName,
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      password: req.body.password,
      role: req.body.role,
      orgRoleName: req.body.orgRoleName,
    });
    res.status(201).json(result);
  }),
);

gated.post(
  '/role/create',
  requirePermission(PERMISSIONS.ORG_ROLES_MANAGE),
  validateBody(orgRoleCreateSchema),
  asyncHandler(async (req, res) => {
    const result = await orgService.createRole(req.auth!, {
      name: req.body.name,
      description: req.body.description,
      permissions: req.body.permissions ?? [],
      systemCode: req.body.systemCode,
    });
    res.status(201).json(result);
  }),
);

gated.post(
  '/modules/update',
  requirePermission(PERMISSIONS.ORG_MODULES_MANAGE),
  validateBody(orgModulesUpdateSchema),
  asyncHandler(async (req, res) => {
    const result = await orgService.updateModules(
      req.auth!.org_id,
      req.body.modules,
      req.auth!.user_id,
    );
    res.json(result);
  }),
);

gated.get(
  '/:id',
  param('id').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    orgService.assertSameOrg(req.auth!, routeParam(req.params.id));
    const detail = await orgService.getDetail(routeParam(req.params.id));
    res.json(detail);
  }),
);

gated.get(
  '/:id/users',
  param('id').isUUID(),
  handleValidation,
  requirePermission(PERMISSIONS.ORG_USERS_VIEW, PERMISSIONS.ORG_USERS_MANAGE),
  asyncHandler(async (req, res) => {
    orgService.assertSameOrg(req.auth!, routeParam(req.params.id));
    const users = await orgService.listUsers(routeParam(req.params.id));
    res.json(users);
  }),
);

gated.get(
  '/:id/modules',
  param('id').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    orgService.assertSameOrg(req.auth!, routeParam(req.params.id));
    const modules = await orgService.listModules(routeParam(req.params.id));
    res.json({ modules });
  }),
);

gated.get(
  '/:id/roles',
  param('id').isUUID(),
  handleValidation,
  asyncHandler(async (req, res) => {
    orgService.assertSameOrg(req.auth!, routeParam(req.params.id));
    const roles = await orgService.listRoles(routeParam(req.params.id));
    res.json({ roles });
  }),
);

orgRouter.use(gated);
