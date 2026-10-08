import { Router } from 'express';
import { routeParam } from '../utils/route-param';
import { param } from 'express-validator';
import type { Request, Response, NextFunction } from 'express';
import { handleValidation } from '../middleware/error-handler';
import {
  requireDeveloperAuth,
  requireDeveloperPermission,
} from '../middleware/developer-auth.middleware';
import {
  loginRateLimiter,
  signupRateLimiter,
} from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate';
import {
  developerBootstrapSchema,
  developerLoginSchema,
  developerImpersonateSchema,
  developerModuleCreateSchema,
  developerModuleUpdateSchema,
  developerFeatureFlagSchema,
  developerApiKeyCreateSchema,
  developerBillingOverrideSchema,
} from '../validators/schemas';
import { developerAuthService } from '../services/developer-auth.service';
import { developerConsoleService } from '../services/developer-console.service';
import { developerAudit } from '../services/developer-audit.service';
import { DEVELOPER_PERMISSIONS } from '../rbac/developer-permissions';

function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export const developerRouter = Router();

developerRouter.post(
  '/auth/bootstrap',
  signupRateLimiter,
  validateBody(developerBootstrapSchema),
  asyncHandler(async (req, res) => {
    const result = await developerAuthService.bootstrap(
      {
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
        fullName: req.body.fullName,
        bootstrapSecret: req.body.bootstrapSecret,
      },
      { ip: req.ip, userAgent: req.get('user-agent') ?? undefined },
    );
    res.status(201).json(result);
  }),
);

developerRouter.post(
  '/auth/login',
  loginRateLimiter,
  validateBody(developerLoginSchema),
  asyncHandler(async (req, res) => {
    const result = await developerAuthService.login(req.body.email, req.body.password, {
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.json(result);
  }),
);

developerRouter.get(
  '/auth/me',
  requireDeveloperAuth,
  asyncHandler(async (req, res) => {
    res.json({
      developer: {
        id: req.developerAuth!.developer_id,
        email: req.developerAuth!.email,
        role: req.developerAuth!.role,
        permissions: req.developerAuth!.permissions,
      },
    });
  }),
);

const gated = Router();
gated.use(requireDeveloperAuth);

gated.get(
  '/dashboard',
  asyncHandler(async (_req, res) => {
    const stats = await developerConsoleService.dashboardStats();
    res.json({ stats });
  }),
);

gated.get(
  '/orgs',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.ORG_VIEW,
    DEVELOPER_PERMISSIONS.ORG_IMPERSONATE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  asyncHandler(async (req, res) => {
    const result = await developerConsoleService.listOrganizations({
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 50),
      q: typeof req.query.q === 'string' ? req.query.q : undefined,
    });
    res.json(result);
  }),
);

gated.get(
  '/orgs/:id',
  param('id').isUUID(),
  handleValidation,
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.ORG_VIEW,
    DEVELOPER_PERMISSIONS.ORG_USERS_VIEW,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  asyncHandler(async (req, res) => {
    const org = await developerConsoleService.getOrganizationDetail(routeParam(req.params.id));
    res.json({ organization: org });
  }),
);

gated.post(
  '/impersonate',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.ORG_IMPERSONATE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  validateBody(developerImpersonateSchema),
  asyncHandler(async (req, res) => {
    const result = await developerConsoleService.startImpersonation({
      developerId: req.developerId!,
      targetOrgId: req.body.targetOrgId,
      reason: req.body.reason,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.status(201).json(result);
  }),
);

gated.post(
  '/impersonate/:sessionId/end',
  param('sessionId').isUUID(),
  handleValidation,
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.ORG_IMPERSONATE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  asyncHandler(async (req, res) => {
    const result = await developerConsoleService.endImpersonation({
      developerId: req.developerId!,
      sessionId: routeParam(req.params.sessionId),
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.json(result);
  }),
);

gated.get(
  '/modules',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.MODULES_CREATE,
    DEVELOPER_PERMISSIONS.MODULES_EDIT,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  asyncHandler(async (_req, res) => {
    const modules = await developerConsoleService.listModules();
    res.json({ modules });
  }),
);

gated.post(
  '/modules',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.MODULES_CREATE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  validateBody(developerModuleCreateSchema),
  asyncHandler(async (req, res) => {
    const result = await developerConsoleService.createModule({
      developerId: req.developerId!,
      code: req.body.code,
      name: req.body.name,
      description: req.body.description,
      sortOrder: req.body.sortOrder,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.status(201).json(result);
  }),
);

gated.patch(
  '/modules/:code',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.MODULES_EDIT,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  validateBody(developerModuleUpdateSchema),
  asyncHandler(async (req, res) => {
    const result = await developerConsoleService.updateModule({
      developerId: req.developerId!,
      code: routeParam(req.params.code),
      name: req.body.name,
      description: req.body.description,
      isActive: req.body.isActive,
      sortOrder: req.body.sortOrder,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.json(result);
  }),
);

gated.get(
  '/feature-flags',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.FEATURE_FLAGS_MANAGE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  asyncHandler(async (_req, res) => {
    const flags = await developerConsoleService.listFeatureFlags();
    res.json({ flags });
  }),
);

gated.post(
  '/feature-flags',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.FEATURE_FLAGS_MANAGE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  validateBody(developerFeatureFlagSchema),
  asyncHandler(async (req, res) => {
    const result = await developerConsoleService.upsertFeatureFlag({
      developerId: req.developerId!,
      key: req.body.key,
      description: req.body.description,
      enabled: req.body.enabled,
      payload: req.body.payload,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.json(result);
  }),
);

gated.get(
  '/logs',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.LOGS_VIEW,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  asyncHandler(async (req, res) => {
    const result = await developerAudit.list({
      skip: Number(req.query.skip ?? 0),
      take: Number(req.query.take ?? 100),
      action: typeof req.query.action === 'string' ? req.query.action : undefined,
      developerId:
        typeof req.query.developerId === 'string' ? req.query.developerId : undefined,
    });
    res.json(result);
  }),
);

gated.get(
  '/api-keys',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.API_KEYS_MANAGE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  asyncHandler(async (req, res) => {
    const keys = await developerConsoleService.listApiKeys(req.developerId!);
    res.json({ keys });
  }),
);

gated.post(
  '/api-keys',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.API_KEYS_MANAGE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  validateBody(developerApiKeyCreateSchema),
  asyncHandler(async (req, res) => {
    const result = await developerConsoleService.createApiKey({
      developerId: req.developerId!,
      name: req.body.name,
      scopes: req.body.scopes,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.status(201).json(result);
  }),
);

gated.post(
  '/api-keys/:id/revoke',
  param('id').isUUID(),
  handleValidation,
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.API_KEYS_MANAGE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  asyncHandler(async (req, res) => {
    const result = await developerConsoleService.revokeApiKey({
      developerId: req.developerId!,
      keyId: routeParam(req.params.id),
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.json(result);
  }),
);

gated.post(
  '/billing/override',
  requireDeveloperPermission(
    DEVELOPER_PERMISSIONS.BILLING_OVERRIDE,
    DEVELOPER_PERMISSIONS.SYSTEM_FULL_ACCESS,
  ),
  validateBody(developerBillingOverrideSchema),
  asyncHandler(async (req, res) => {
    const result = await developerConsoleService.billingOverride({
      developerId: req.developerId!,
      orgId: req.body.orgId,
      notes: req.body.notes,
      extendTrialDays: req.body.extendTrialDays,
      ip: req.ip,
      userAgent: req.get('user-agent') ?? undefined,
    });
    res.json(result);
  }),
);

developerRouter.use(gated);
