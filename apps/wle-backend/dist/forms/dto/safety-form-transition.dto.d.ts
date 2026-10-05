import { SafetyFormStatus } from '@prisma/client';
export declare class SafetyFormTransitionDto {
    status: SafetyFormStatus;
    note?: string;
}
