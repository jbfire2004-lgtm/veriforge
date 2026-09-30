import { Router } from 'express';
import { workPackageController } from '../controllers/work-package.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createValidators,
  getValidators,
  listValidators,
  requirementsValidators,
} from '../validators/work-package.validators';

export const workPackageRouter = Router();

workPackageRouter.use(requireAuth);

workPackageRouter.post('/', createValidators, handleValidation, workPackageController.create);
workPackageRouter.get(
  '/project/:project_id',
  listValidators,
  handleValidation,
  workPackageController.listByProject,
);
workPackageRouter.get('/:id', getValidators, handleValidation, workPackageController.getById);
workPackageRouter.post(
  '/:id/requirements',
  requirementsValidators,
  handleValidation,
  workPackageController.updateRequirements,
);
