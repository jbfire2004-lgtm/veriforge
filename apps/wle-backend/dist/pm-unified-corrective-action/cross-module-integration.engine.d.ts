export type IntegrationGateResult = {
    allowed: boolean;
    module: string;
    blockers: string[];
};
export declare class CrossModuleIntegrationEngine {
    jhaApprovalGate(openCapaForJha: number, sifLinkedOpen: number): IntegrationGateResult;
    pmTaskStartGate(projectCriticalOpen: number, workerOverdue: number): IntegrationGateResult;
    permitApprovalGate(openCapa: number): IntegrationGateResult;
    safetyStationEnforcement(workerBlocked: boolean, equipmentBlocked: boolean): IntegrationGateResult;
}
