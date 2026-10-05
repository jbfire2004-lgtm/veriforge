import { PmCompanyEnforcementAction } from '@prisma/client';
export type CompanyEnforcementInput = {
    profilePublished: boolean;
    corporateRiskLevel: string;
    enforcementRules: Record<string, unknown>;
    workerChecks: Record<string, boolean>;
    activeOverrides: Array<{
        overrideType: string;
        ruleKey: string;
    }>;
    missingPolicyAcks: number;
    missingTraining: string[];
    expiredSds: number;
};
export type CompanyEnforcementResult = {
    allowed: boolean;
    action: PmCompanyEnforcementAction;
    violations: string[];
    waived: string[];
};
export declare class CompanyEnforcementEngine {
    evaluate(input: CompanyEnforcementInput): CompanyEnforcementResult;
    private waived;
}
