import jwt, { type SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';
import type { JwtPayload } from '../types';

type UserForToken = {
  id: string;
  companyId: string;
  email: string;
  roles: string[];
};

function parseExpiresIn(raw: string): number {
  if (raw.endsWith('m')) return parseInt(raw, 10) * 60;
  if (raw.endsWith('h')) return parseInt(raw, 10) * 3600;
  if (raw.endsWith('d')) return parseInt(raw, 10) * 86400;
  const n = parseInt(raw, 10);
  return Number.isFinite(n) ? n : 900;
}

const accessExpiresSeconds = parseExpiresIn(env.jwtAccessExpiresIn);

export const jwtService = {
  signAccessToken(user: UserForToken): { token: string; expiresIn: number } {
    const options: SignOptions = { expiresIn: accessExpiresSeconds };
    const token = jwt.sign(
      {
        sub: user.id,
        user_id: user.id,
        company_id: user.companyId,
        email: user.email,
        roles: user.roles,
      },
      env.jwtAccessSecret,
      options,
    );
    return { token, expiresIn: accessExpiresSeconds };
  },

  verifyAccessToken(token: string): JwtPayload {
    const payload = jwt.verify(token, env.jwtAccessSecret) as JwtPayload;
    return payload;
  },

  signRefreshToken(userId: string): string {
    return jwt.sign({ sub: userId, type: 'refresh' }, env.jwtRefreshSecret, {
      expiresIn: `${env.jwtRefreshExpiresDays}d`,
    });
  },
};
