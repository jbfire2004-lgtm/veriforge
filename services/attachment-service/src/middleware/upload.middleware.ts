import multer from 'multer';
import { env } from '../config/env';

export const uploadMiddleware = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: env.maxFileSizeBytes },
});
