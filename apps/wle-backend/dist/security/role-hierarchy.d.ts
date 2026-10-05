import { UserRole } from '@prisma/client';
export declare function roleSatisfiesAny(actorRole: UserRole, required: UserRole[]): boolean;
export declare function isContractorRole(role: UserRole): boolean;
