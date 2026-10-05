export type UnifiedEnforcementInput = {
    workerOpen: number;
    workerOverdue: number;
    workerCritical: number;
    equipmentOpen: number;
    projectCriticalOpen: number;
    emergencyActive: boolean;
    activeOverrides: Array<{
        ruleType: string;
        ruleKey: string;
    }>;
};
export type UnifiedEnforcementResult = {
    allowed: boolean;
    blockers: string[];
    waived: string[];
    blocks: {
        workerAccess: boolean;
        equipmentAccess: boolean;
        zoneAccess: boolean;
        taskStart: boolean;
        permitApproval: boolean;
        jhaApproval: boolean;
        pmScheduling: boolean;
    };
};
export declare class CapaEnforcementEngine {
    evaluate(input: UnifiedEnforcementInput): UnifiedEnforcementResult;
    private waived;
}
