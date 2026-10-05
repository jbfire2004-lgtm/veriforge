import type { UserRole } from '@prisma/client';
import type { PmSafetyAction } from './pm-safety-workflow.types';
export declare function assertActorMayPerformAction(action: PmSafetyAction, role: UserRole): void;
