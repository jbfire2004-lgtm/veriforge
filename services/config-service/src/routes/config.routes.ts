import { Router } from 'express';
import { configController } from '../controllers/config.controller';
import { requireAdmin, requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  deleteValidators,
  getEntryValidators,
  listNamespaceValidators,
  upsertValidators,
} from '../validators/config.validators';

export const configRouter = Router();

configRouter.use(requireAuth);

configRouter.get('/namespaces', configController.listNamespaces);

configRouter.get(
  '/:namespace/:key',
  getEntryValidators,
  handleValidation,
  configController.getEntry,
);

configRouter.get(
  '/:namespace',
  listNamespaceValidators,
  handleValidation,
  configController.listNamespace,
);

configRouter.put(
  '/:namespace/:key',
  requireAdmin,
  upsertValidators,
  handleValidation,
  configController.upsert,
);

configRouter.delete(
  '/:namespace/:key',
  requireAdmin,
  deleteValidators,
  handleValidation,
  configController.remove,
);
