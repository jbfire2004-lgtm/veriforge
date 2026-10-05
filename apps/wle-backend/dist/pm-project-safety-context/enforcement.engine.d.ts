export type EnforcementCheckInput = {
    profilePublished: boolean;
    riskLevel: string;
    enforcementRules: Record<string, unknown>;
    zoneCode?: string;
    workerChecks?: Record<string, boolean>;
    activeOverrides?: Array<{
        ruleType: string;
        ruleKey: string;
    }>;
};
export type EnforcementResult = {
    enforced: boolean;
    violations: string[];
    waivedByOverride: string[];
};
export declare class EnforcementEngine {
    evaluate(input: EnforcementCheckInput): EnforcementResult;
    private hasOverride;
}
