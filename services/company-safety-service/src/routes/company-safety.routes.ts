import { Router } from 'express';
import { companySafetyController } from '../controllers/company-safety.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  profileValidators,
  hazardValidators,
  controlValidators,
  trainingValidators,
  policyValidators,
  sdsValidators,
  emergencyValidators,
  equipmentValidators,
  zoneValidators,
  companyIdParamValidators,
} from '../validators/company-safety.validators';

export const companySafetyRouter = Router();

companySafetyRouter.use(requireAuth);

companySafetyRouter.post('/profile', profileValidators, handleValidation, companySafetyController.profile);
companySafetyRouter.post('/hazards', hazardValidators, handleValidation, companySafetyController.hazards);
companySafetyRouter.post('/controls', controlValidators, handleValidation, companySafetyController.controls);
companySafetyRouter.post('/training', trainingValidators, handleValidation, companySafetyController.training);
companySafetyRouter.post('/policy', policyValidators, handleValidation, companySafetyController.policy);
companySafetyRouter.post('/sds', sdsValidators, handleValidation, companySafetyController.sds);
companySafetyRouter.post('/emergency', emergencyValidators, handleValidation, companySafetyController.emergency);
companySafetyRouter.post('/equipment', equipmentValidators, handleValidation, companySafetyController.equipment);
companySafetyRouter.post('/zones', zoneValidators, handleValidation, companySafetyController.zones);
companySafetyRouter.get(
  '/:company_id',
  companyIdParamValidators,
  handleValidation,
  companySafetyController.getByCompanyId,
);
