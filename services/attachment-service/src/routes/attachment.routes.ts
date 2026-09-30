import { Router } from 'express';
import { attachmentController } from '../controllers/attachment.controller';
import { requireAuth, requireAuthOrDownloadToken } from '../middleware/auth.middleware';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  uploadValidators,
  getAttachmentValidators,
  streamValidators,
} from '../validators/attachment.validators';

export const attachmentRouter = Router();

attachmentRouter.post(
  '/upload',
  requireAuth,
  uploadMiddleware.single('file'),
  uploadValidators,
  handleValidation,
  attachmentController.upload,
);

attachmentRouter.get(
  '/:id/thumbnail',
  requireAuthOrDownloadToken('thumbnail'),
  streamValidators,
  handleValidation,
  attachmentController.thumbnail,
);

attachmentRouter.get(
  '/:id/download',
  requireAuthOrDownloadToken('file'),
  streamValidators,
  handleValidation,
  attachmentController.download,
);

attachmentRouter.get(
  '/:id',
  requireAuth,
  getAttachmentValidators,
  handleValidation,
  attachmentController.getById,
);
