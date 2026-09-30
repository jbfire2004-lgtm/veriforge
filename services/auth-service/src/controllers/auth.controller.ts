import type { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { setRefreshCookie, clearRefreshCookie, readRefreshCookie } from '../middleware/cookie.helper';

function sessionResponse(
  res: Response,
  user: Awaited<ReturnType<typeof authService.register>>['user'],
  tokens: Awaited<ReturnType<typeof authService.register>>['tokens'],
  status = 200,
) {
  setRefreshCookie(res, tokens.refreshToken);
  return res.status(status).json({
    user: {
      id: user.id,
      company_id: user.companyId,
      email: user.email,
      first_name: user.firstName,
      last_name: user.lastName,
      status: user.status,
      roles: user.roles,
    },
    access_token: tokens.accessToken,
    refresh_token: tokens.refreshToken,
    expires_in: tokens.expiresIn,
    token_type: tokens.tokenType,
  });
}

export const authController = {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.register({
        companyId: req.body.company_id,
        email: req.body.email,
        password: req.body.password,
        firstName: req.body.first_name,
        lastName: req.body.last_name,
        roles: req.body.roles,
      });
      return sessionResponse(res, result.user, result.tokens, 201);
    } catch (e) {
      next(e);
    }
  },

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.login({
        companyId: req.body.company_id,
        email: req.body.email,
        password: req.body.password,
      });
      return sessionResponse(res, result.user, result.tokens);
    } catch (e) {
      next(e);
    }
  },

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const raw =
        req.body.refresh_token ??
        readRefreshCookie(req.cookies as Record<string, string | undefined>);
      const result = await authService.refresh(raw ?? '');
      return sessionResponse(res, result.user, result.tokens);
    } catch (e) {
      next(e);
    }
  },

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const raw =
        req.body.refresh_token ??
        readRefreshCookie(req.cookies as Record<string, string | undefined>);
      const header = req.headers.authorization;
      const accessUserId = header?.startsWith('Bearer ')
        ? authService.validateAccessToken(header.slice(7)).payload?.user_id
        : undefined;
      await authService.logout(raw, accessUserId);
      clearRefreshCookie(res);
      return res.status(200).json({ ok: true });
    } catch (e) {
      next(e);
    }
  },

  async me(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await authService.me(req.userId!);
      return res.json({
        id: user.id,
        company_id: user.companyId,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        status: user.status,
        roles: user.roles,
        created_at: user.createdAt,
        updated_at: user.updatedAt,
      });
    } catch (e) {
      next(e);
    }
  },

  async validateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const header = req.headers.authorization;
      const token =
        (req.query.token as string | undefined) ??
        (header?.startsWith('Bearer ') ? header.slice(7) : undefined);

      if (!token) {
        return res.status(400).json({
          valid: false,
          error: 'Token required via Authorization header or ?token=',
        });
      }

      const result = authService.validateAccessToken(token);
      if (!result.valid) {
        return res.json({ valid: false });
      }

      return res.json({
        valid: true,
        payload: {
          user_id: result.payload!.user_id,
          company_id: result.payload!.company_id,
          email: result.payload!.email,
          roles: result.payload!.roles,
          exp: result.payload!.exp,
        },
      });
    } catch (e) {
      next(e);
    }
  },
};
