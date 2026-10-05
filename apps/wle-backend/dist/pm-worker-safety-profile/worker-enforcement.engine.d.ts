import { PmCompanyEnforcementAction } from '@prisma/client';
export type WorkerEnforcementInput = {
    checks: Record<string, boolean>;
    medicalBlocks: string[];
    activeOverrides: Array<{
        overrideType: string;
        ruleKey: string;
    }>;
    corporateRiskLevel?: string;
};
export type WorkerEnforcementResult = {
    allowed: boolean;
    action: PmCompanyEnforcementAction;
    violations: string[];
    waived: string[];
};
export declare class WorkerEnforcementEngine {
    evaluate(input: WorkerEnforcementInput): WorkerEnforcementResult;
    private waived;
}
