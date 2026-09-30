import type { Response } from 'express';
import { env } from '../config/env';

const REFRESH_COOKIE = 'vera_refresh_token';

export function setRefreshCookie(res: Response, refreshToken: string) {
  res.cookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    domain: env.cookieDomain || undefined,
    maxAge: env.jwtRefreshExpiresDays * 24 * 60 * 60 * 1000,
    path: '/auth',
  });
}

export function clearRefreshCookie(res: Response) {
  res.clearCookie(REFRESH_COOKIE, {
    httpOnly: true,
    secure: env.cookieSecure,
    sameSite: env.cookieSameSite,
    domain: env.cookieDomain || undefined,
    path: '/auth',
  });
}

export function readRefreshCookie(cookies: Record<string, string | undefined>): string | undefined {
  return cookies[REFRESH_COOKIE];
}

export { REFRESH_COOKIE };
