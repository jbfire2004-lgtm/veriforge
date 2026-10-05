export type EnforcementInput = {
    publishedHazardCount: number;
    unmappedPublishedHazards: number;
    sdsAckRequired: boolean;
    sdsAcknowledged: boolean;
    trainingComplete: boolean;
    controlsVerified: boolean;
    emergencyLocked: boolean;
    activeOverrides: Array<{
        ruleType: string;
        ruleKey: string;
    }>;
};
export type EnforcementResult = {
    allowed: boolean;
    blockers: string[];
    waived: string[];
    actions: Array<'block_worker' | 'block_equipment' | 'block_task' | 'block_zone'>;
};
export declare class EnforcementEngine {
    evaluate(input: EnforcementInput): EnforcementResult;
    private waived;
}
