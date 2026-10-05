import { PmAccessDecision } from '@prisma/client';
export type AccessDecisionInput = {
    denialReasons: string[];
    checks: Record<string, boolean>;
    zoneHighRisk: boolean;
    hasActiveOverride: boolean;
};
export type AccessDecisionResult = {
    decision: PmAccessDecision;
    denialReasons: string[];
    checks: Record<string, boolean>;
};
export declare class AccessDecisionEngine {
    decide(input: AccessDecisionInput): AccessDecisionResult;
}
