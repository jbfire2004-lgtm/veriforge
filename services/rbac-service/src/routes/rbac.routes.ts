import { Router } from 'express';
import { rbacController } from '../controllers/rbac.controller';
import { requireAuth, requireHookSecret } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createRoleValidators,
  createPermissionValidators,
  assignPermissionValidators,
  assignRoleValidators,
  evaluateValidators,
  hookRegisterValidators,
} from '../validators/rbac.validators';

export const rbacRouter = Router();

rbacRouter.post(
  '/hooks/user-registered',
  requireHookSecret,
  hookRegisterValidators,
  handleValidation,
  rbacController.hookUserRegistered,
);

rbacRouter.use(requireAuth);

rbacRouter.post('/role', createRoleValidators, handleValidation, rbacController.createRole);
rbacRouter.post(
  '/permission',
  createPermissionValidators,
  handleValidation,
  rbacController.createPermission,
);
rbacRouter.post(
  '/role/:id/assign-permission',
  assignPermissionValidators,
  handleValidation,
  rbacController.assignPermission,
);
rbacRouter.post(
  '/user/:id/assign-role',
  assignRoleValidators,
  handleValidation,
  rbacController.assignRoleToUser,
);
rbacRouter.get('/user/:id/permissions', rbacController.getUserPermissions);
rbacRouter.post('/evaluate', evaluateValidators, handleValidation, rbacController.evaluate);
