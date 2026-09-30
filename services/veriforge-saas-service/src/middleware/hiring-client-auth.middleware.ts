import type { Request, Response, NextFunction } from 'express';
import { hiringClientAuthService } from '../services/hiring-client-auth.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import type { HiringClientJwtPayload } from '../types/hiring-client';

declare global {
  namespace Express {
    interface Request {
      hiringClientAuth?: HiringClientJwtPayload;
      hiringClientId?: string;
      hiringClientUserId?: string;
    }
  }
}

export function requireHiringClientAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(new UnauthorizedError('Hiring client access token required'));

  const result = hiringClientAuthService.validateAccessToken(token);
  if (!result.valid || !result.payload) {
    return next(new UnauthorizedError('Invalid or expired hiring client token'));
  }

  req.hiringClientAuth = result.payload;
  req.hiringClientId = result.payload.hiring_client_id;
  req.hiringClientUserId = result.payload.user_id;
  next();
}

/** Require ANY of the listed hiring-client permission keys. */
export function requireHiringClientPermission(...keys: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.hiringClientAuth) return next(new UnauthorizedError());
    if (!hiringClientAuthService.canAny(req.hiringClientAuth, keys)) {
      return next(new ForbiddenError(`Missing permission: ${keys.join(' | ')}`));
    }
    next();
  };
}
