import { Router } from 'express';
import { projectController } from '../controllers/project.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  createValidators,
  getValidators,
  companyIdParam,
  riskValidators,
  safetyGateValidators,
} from '../validators/project.validators';

export const projectRouter = Router();

projectRouter.use(requireAuth);

projectRouter.post('/', createValidators, handleValidation, projectController.create);
projectRouter.get('/company/:company_id', companyIdParam, handleValidation, projectController.listByCompany);
projectRouter.get('/:id', getValidators, handleValidation, projectController.getById);
projectRouter.post('/:id/risk', riskValidators, handleValidation, projectController.updateRisk);
projectRouter.post(
  '/:id/safety-gate/check',
  safetyGateValidators,
  handleValidation,
  projectController.safetyGateCheck,
);
