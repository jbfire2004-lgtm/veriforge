import { Router } from 'express';
import { projectSafetyController } from '../controllers/project-safety.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  profileValidators,
  hazardValidators,
  controlValidators,
  zoneValidators,
  equipmentValidators,
  trainingValidators,
  emergencyValidators,
  scoreValidators,
} from '../validators/project-safety.validators';

export const projectSafetyRouter = Router();

projectSafetyRouter.use(requireAuth);

projectSafetyRouter.post('/profile', profileValidators, handleValidation, projectSafetyController.profile);
projectSafetyRouter.post('/hazards', hazardValidators, handleValidation, projectSafetyController.hazards);
projectSafetyRouter.post('/controls', controlValidators, handleValidation, projectSafetyController.controls);
projectSafetyRouter.post('/zones', zoneValidators, handleValidation, projectSafetyController.zones);
projectSafetyRouter.post('/equipment', equipmentValidators, handleValidation, projectSafetyController.equipment);
projectSafetyRouter.post('/training', trainingValidators, handleValidation, projectSafetyController.training);
projectSafetyRouter.post('/emergency', emergencyValidators, handleValidation, projectSafetyController.emergency);
projectSafetyRouter.get(
  '/:project_id/score',
  scoreValidators,
  handleValidation,
  projectSafetyController.score,
);
