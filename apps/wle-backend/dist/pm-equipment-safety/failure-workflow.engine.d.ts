import { PmEquipmentFailureStatus } from '@prisma/client';
export declare class FailureWorkflowEngine {
    assertTransition(from: PmEquipmentFailureStatus, to: PmEquipmentFailureStatus): void;
    requiresSupervisorReview(severity: 'low' | 'medium' | 'high' | 'critical'): boolean;
}
