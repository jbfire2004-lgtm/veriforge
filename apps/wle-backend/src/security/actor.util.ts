import type { UserRole } from '@prisma/client';
import type { SecurityActor } from './security.types';

/** Normalize JwtStrategy principal to SecurityActor. */
export function toSecurityActor(user: {
  id: number;
  userId?: number;
  email?: string;
  role: UserRole;
  companyId?: number | null;
  companyName?: string | null;
  trainingProviderId?: number | null;
  instructorId?: number | null;
}): SecurityActor {
  return {
    id: user.id,
    userId: user.userId ?? user.id,
    email: user.email,
    role: user.role,
    companyId: user.companyId ?? null,
    companyName: user.companyName ?? null,
    trainingProviderId: user.trainingProviderId ?? null,
    instructorId: user.instructorId ?? null,
  };
}
