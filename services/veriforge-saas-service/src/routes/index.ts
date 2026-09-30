import { Router } from 'express';
import { body, param } from 'express-validator';
import { handleValidation } from '../middleware/error-handler';
import {
  requireAuth,
  requireTenant,
  requirePermission,
  requirePlatformAdmin,
  refreshPermissions,
} from '../middleware/auth.middleware';
import {
  loginRateLimiter,
  signupRateLimiter,
} from '../middleware/rate-limit';
import { validateBody } from '../middleware/validate';
import { loginSchema, pricingQuoteSchema, signupSchema, inviteSchema, subscriptionModulesUpdateSchema, subscriptionBillingUpdateSchema } from '../validators/schemas';
import {
  authController,
  pricingController,
  organizationController,
  moduleController,
  adminController,
} from '../controllers';
import { subscriptionController } from '../controllers/subscription.controller';
import { PERMISSIONS } from '../types';

export const authRouter = Router();
authRouter.post(
  '/signup',
  signupRateLimiter,
  validateBody(signupSchema),
  authController.signup,
);
authRouter.post(
  '/login',
  loginRateLimiter,
  validateBody(loginSchema),
  authController.login,
);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, refreshPermissions(), authController.me);
authRouter.post('/mfa/enable', requireAuth, authController.enableMfa);

export const pricingRouter = Router();
pricingRouter.post(
  '/quote',
  validateBody(pricingQuoteSchema),
  pricingController.quote,
);

export const modulesRouter = Router();
modulesRouter.get('/catalog', moduleController.catalog);
modulesRouter.get('/', requireAuth, refreshPermissions(), subscriptionController.getModules);
modulesRouter.post(
  '/update',
  requireAuth,
  refreshPermissions(),
  requirePermission(PERMISSIONS.ORG_MODULES_MANAGE),
  validateBody(subscriptionModulesUpdateSchema),
  subscriptionController.updateModules,
);

export const billingRouter = Router();
billingRouter.use(requireAuth, refreshPermissions());
billingRouter.get('/', subscriptionController.getBilling);
billingRouter.post(
  '/update',
  requirePermission(PERMISSIONS.ORG_BILLING_MANAGE),
  validateBody(subscriptionBillingUpdateSchema),
  subscriptionController.updateBilling,
);

export const organizationsRouter = Router({ mergeParams: true });
organizationsRouter.use(requireAuth, requireTenant('orgId'), refreshPermissions());

organizationsRouter.patch(
  '/',
  requirePermission(PERMISSIONS.ORG_PROFILE_UPDATE, PERMISSIONS.ORG_BILLING_MANAGE),
  body('name').optional().isString().isLength({ min: 2 }),
  body('status').optional().isIn(['active', 'suspended', 'closed']),
  body('billingCycle').optional().isIn(['monthly', 'annual']),
  body('billingEmail').optional().isEmail(),
  handleValidation,
  organizationController.update,
);

organizationsRouter.post(
  '/users/invite',
  requirePermission(PERMISSIONS.ORG_USERS_MANAGE),
  validateBody(inviteSchema),
  organizationController.inviteUser,
);

organizationsRouter.get('/trial', organizationController.getTrial);
organizationsRouter.get('/modules', organizationController.listModules);
organizationsRouter.post(
  '/trial/extend',
  requirePermission(PERMISSIONS.ORG_TRIAL_EXTEND),
  body('extraDays').optional().isInt({ min: 1, max: 90 }),
  handleValidation,
  organizationController.extendTrial,
);

organizationsRouter.post(
  '/billing/convert',
  requirePermission(PERMISSIONS.ORG_BILLING_MANAGE),
  body('paymentMethodId').optional().isString(),
  body('billingCycle').optional().isIn(['monthly', 'annual']),
  handleValidation,
  organizationController.convertBilling,
);

export const adminRouter = Router();
adminRouter.use(requireAuth, requirePlatformAdmin);
adminRouter.get('/organizations', adminController.listOrganizations);
adminRouter.get(
  '/organizations/:orgId',
  param('orgId').isUUID(),
  handleValidation,
  adminController.getOrganization,
);
adminRouter.patch(
  '/organizations/:orgId/modules',
  param('orgId').isUUID(),
  body('modules').isArray({ min: 1 }),
  handleValidation,
  adminController.patchModules,
);
adminRouter.patch(
  '/organizations/:orgId/subscription',
  param('orgId').isUUID(),
  handleValidation,
  adminController.patchSubscription,
);
adminRouter.post(
  '/organizations/:orgId/trial/extend',
  param('orgId').isUUID(),
  body('extraDays').optional().isInt({ min: 1, max: 90 }),
  handleValidation,
  adminController.extendTrial,
);
adminRouter.patch(
  '/organizations/:orgId/onboarding',
  param('orgId').isUUID(),
  handleValidation,
  adminController.patchOnboarding,
);
adminRouter.get('/onboarding', adminController.onboarding);
adminRouter.patch(
  '/onboarding/:orgId',
  param('orgId').isUUID(),
  body('status').optional().isIn(['not_started', 'in_progress', 'completed']),
  handleValidation,
  adminController.patchOnboardingByOrg,
);
adminRouter.get('/pricing', adminController.getPricing);
adminRouter.patch(
  '/pricing',
  body('annualDiscountPercent').optional().isFloat({ min: 0, max: 80 }),
  body('modulePrices').optional().isArray(),
  handleValidation,
  adminController.patchPricing,
);

export { healthRouter } from './health.routes';
