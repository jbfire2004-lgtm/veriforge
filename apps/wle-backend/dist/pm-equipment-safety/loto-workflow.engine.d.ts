import { PmEquipmentLotoStatus } from '@prisma/client';
export declare class LotoWorkflowEngine {
    assertTransition(from: PmEquipmentLotoStatus, to: PmEquipmentLotoStatus): void;
}
