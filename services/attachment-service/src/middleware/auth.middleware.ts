import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { UnauthorizedError } from '../utils/errors';
import { verifySecureDownloadToken } from '../utils/secure-token';
import type { AuthJwtPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      auth?: AuthJwtPayload;
      companyId?: string;
      userId?: string;
      downloadToken?: ReturnType<typeof verifySecureDownloadToken>;
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Bearer token required'));
  }

  const token = header.slice(7);

  try {
    const payload = jwt.verify(token, env.jwtAccessSecret) as AuthJwtPayload;
    req.auth = payload;
    req.userId = payload.user_id;
    req.companyId = payload.company_id;
    return next();
  } catch {
    if (env.authValidateUrl) {
      try {
        const res = await fetch(
          `${env.authValidateUrl}?token=${encodeURIComponent(token)}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        const body = (await res.json()) as {
          valid?: boolean;
          payload?: AuthJwtPayload;
        };
        if (body.valid && body.payload) {
          req.auth = body.payload;
          req.userId = body.payload.user_id;
          req.companyId = body.payload.company_id;
          return next();
        }
      } catch {
        /* fall through */
      }
    }
    return next(new UnauthorizedError('Invalid or expired token'));
  }
}

export function requireAuthOrDownloadToken(expectedKind: 'file' | 'thumbnail') {
  return (req: Request, _res: Response, next: NextFunction) => {
    const token = req.query.token as string | undefined;
    if (token) {
      try {
        const payload = verifySecureDownloadToken(token);
        if (payload.kind !== expectedKind) {
          return next(new UnauthorizedError('Invalid download token type'));
        }
        req.downloadToken = payload;
        req.companyId = payload.companyId;
        return next();
      } catch {
        return next(new UnauthorizedError('Invalid or expired download token'));
      }
    }
    return requireAuth(req, _res, next);
  };
}
