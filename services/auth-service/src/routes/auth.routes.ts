import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { requireAuth } from '../middleware/auth.middleware';
import { handleValidation } from '../middleware/error-handler';
import {
  registerValidators,
  loginValidators,
  refreshValidators,
  validateTokenValidators,
} from '../validators/auth.validators';

export const authRouter = Router();

authRouter.post('/register', registerValidators, handleValidation, authController.register);
authRouter.post('/login', loginValidators, handleValidation, authController.login);
authRouter.post('/refresh', refreshValidators, handleValidation, authController.refresh);
authRouter.post('/logout', authController.logout);
authRouter.get('/me', requireAuth, authController.me);
authRouter.get(
  '/validate-token',
  validateTokenValidators,
  handleValidation,
  authController.validateToken,
);
