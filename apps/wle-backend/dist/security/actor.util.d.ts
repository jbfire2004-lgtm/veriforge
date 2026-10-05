import type { UserRole } from '@prisma/client';
import type { SecurityActor } from './security.types';
export declare function toSecurityActor(user: {
    id: number;
    userId?: number;
    email?: string;
    role: UserRole;
    companyId?: number | null;
    companyName?: string | null;
    trainingProviderId?: number | null;
    instructorId?: number | null;
}): SecurityActor;
