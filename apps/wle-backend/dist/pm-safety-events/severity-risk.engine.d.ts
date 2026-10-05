import { PmSafetyEventSeverity, PmSafetyEventType } from '@prisma/client';
export type RiskScoreResult = {
    severity: PmSafetyEventSeverity;
    likelihood: number;
    riskScore: number;
    requiresSupervisorReview: boolean;
    explainability: Array<{
        rule: string;
        detail: string;
    }>;
};
export declare class SeverityRiskEngine {
    score(input: {
        eventType: PmSafetyEventType;
        description?: string;
        hasInjury?: boolean;
        medicalAid?: boolean;
        lostTime?: boolean;
        equipmentFailure?: boolean;
        severityHint?: number;
        likelihoodHint?: number;
    }): RiskScoreResult;
    private toSeverity;
}
