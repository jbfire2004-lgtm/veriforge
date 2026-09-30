import type { Request, Response, NextFunction } from 'express';
import { developerAuthService } from '../services/developer-auth.service';
import { ForbiddenError, UnauthorizedError } from '../utils/errors';
import type { DeveloperJwtPayload } from '../types/developer';

declare global {
  namespace Express {
    interface Request {
      developerAuth?: DeveloperJwtPayload;
      developerId?: string;
    }
  }
}

export function requireDeveloperAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;
  if (!token) return next(new UnauthorizedError('Developer access token required'));

  const result = developerAuthService.validateAccessToken(token);
  if (!result.valid || !result.payload) {
    return next(new UnauthorizedError('Invalid or expired developer token'));
  }

  req.developerAuth = result.payload;
  req.developerId = result.payload.developer_id;
  next();
}

export function requireDeveloperPermission(...keys: string[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.developerAuth) return next(new UnauthorizedError());
    if (!developerAuthService.canAny(req.developerAuth, keys)) {
      return next(new ForbiddenError(`Missing permission: ${keys.join(' | ')}`));
    }
    next();
  };
}
