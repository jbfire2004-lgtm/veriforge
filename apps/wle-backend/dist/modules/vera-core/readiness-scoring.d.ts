export type ReadinessVisualState = 'OK' | 'AT_RISK' | 'NON_COMPLIANT';
export type ReadinessDimensionPayload = {
    key: string;
    label: string;
    score: number;
    state: ReadinessVisualState;
    metrics: Record<string, number>;
    evaluatedAt?: string | null;
};
export declare function scoreToVisualState(score: number, options?: {
    criticalCount?: number;
    missingCount?: number;
}): ReadinessVisualState;
export declare function complianceRateToVisualState(rate: number, nonCompliant: number, critical?: number): ReadinessVisualState;
export declare function assessmentStatusToVisualState(status: string, score?: number): ReadinessVisualState;
export declare function fitTestRateToVisualState(input: {
    complianceRate: number;
    expired: number;
    failed: number;
    missing: number;
}): ReadinessVisualState;
export declare function trainingExpiryToVisualState(input: {
    expired: number;
    highRisk: number;
    gaps: number;
}): ReadinessVisualState;
export declare function predictiveRiskToVisualState(riskLevel: string, riskIndex: number): ReadinessVisualState;
export declare function competencyRollupToVisualState(input: {
    current: number;
    expired: number;
    failed: number;
    missing: number;
    total: number;
}): ReadinessVisualState;
export declare function trainingExpiryScore(input: {
    expired: number;
    expiring30: number;
    highRisk: number;
    gaps: number;
}): number;
