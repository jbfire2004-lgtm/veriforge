export type FitTestResult = 'PASS' | 'FAIL' | 'CONDITIONAL';
export type FitTestEvaluateInput = {
    result: FitTestResult;
    performedAt: Date;
    expiresAt?: Date | null;
    validityYears?: number;
};
export type FitTestEvaluateResult = {
    pass: boolean;
    statusLabel: 'PASS' | 'FAIL' | 'CONDITIONAL' | 'EXPIRED';
    expiresAt: Date | null;
    daysUntilExpiry: number | null;
    expired: boolean;
    expiringSoon: boolean;
};
export declare const FIT_TEST_DEFAULT_VALIDITY_YEARS = 1;
export declare function resolveFitTestValidityYears(input?: number): number;
export declare function computeFitTestExpiresAt(performedAt: Date, validityYears?: number): Date;
export declare function evaluateFitTest(input: FitTestEvaluateInput): FitTestEvaluateResult;
export declare function fitTestReadinessScore(input: {
    hasRun: boolean;
    evaluation: FitTestEvaluateResult | null;
}): number;
