export type ExpiryRunMetrics = {
    scanned: number;
    processed: number;
    notified: number;
    skipped: number;
    readinessRecalc: number;
    errors: number;
};
export type DailyComplianceStepResult = {
    name: string;
    ok: boolean;
    durationMs: number;
    metrics?: ExpiryRunMetrics;
    error?: string;
};
