import { UserRole } from '@prisma/client';
import type { SecurityActor } from '../security/security.types';

/**
 * Local-only Inspections / PM testing without NextAuth or JWT.
 * Never enable in production — checked against NODE_ENV.
 */
export function isVeraPmDevOpen(): boolean {
  if (process.env.NODE_ENV === 'production') return false;
  const flag = process.env.VERA_PM_DEV_OPEN?.trim().toLowerCase();
  return flag === '1' || flag === 'true' || flag === 'yes';
}

/** Synthetic SUPER_ADMIN used when VERA_PM_DEV_OPEN is on and no Bearer is sent. */
export function veraPmDevOpenActor(): SecurityActor {
  const companyIdRaw = Number(process.env.VERA_PM_DEV_COMPANY_ID ?? '1');
  const companyId =
    Number.isFinite(companyIdRaw) && companyIdRaw > 0 ? companyIdRaw : 1;
  return {
    id: 1,
    userId: 1,
    email: 'dev-open@vera.local',
    role: UserRole.SUPER_ADMIN,
    companyId,
    companyName: 'Dev Open Company',
  };
}
