import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { UnauthorizedError } from '../utils/errors';
import type { JwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      auth?: JwtPayload;
      userId?: string;
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  const token =
    header?.startsWith('Bearer ') ? header.slice(7) : (req.query.token as string | undefined);

  if (!token) {
    return next(new UnauthorizedError('Access token required'));
  }

  const result = authService.validateAccessToken(token);
  if (!result.valid || !result.payload) {
    return next(new UnauthorizedError('Invalid or expired access token'));
  }

  req.auth = result.payload;
  req.userId = result.payload.user_id;
  next();
}
