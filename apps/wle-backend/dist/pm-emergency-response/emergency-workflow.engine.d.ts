import { PmEmergencyEventStatus, PmEmergencyPlanStatus } from '@prisma/client';
export declare class EmergencyWorkflowEngine {
    assertPlanTransition(from: PmEmergencyPlanStatus, to: PmEmergencyPlanStatus): void;
    assertEventTransition(from: PmEmergencyEventStatus, to: PmEmergencyEventStatus): void;
}
