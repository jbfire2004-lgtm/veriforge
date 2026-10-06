/** Metrics returned by daily expiry notification scans. */
export type ExpiryRunMetrics = {
  /** Rows returned from the expiry query. */
  scanned: number;
  /** Rows considered for notification (after in-memory dedupe). */
  processed: number;
  /** Notification channel dispatches created. */
  notified: number;
  /** Skipped (prefs, quiet hours, or DB dedupe). */
  skipped: number;
  /** Readiness/compliance recalculations triggered. */
  readinessRecalc: number;
  /** Per-record errors that did not abort the batch. */
  errors: number;
};

export type DailyComplianceStepResult = {
  name: string;
  ok: boolean;
  durationMs: number;
  metrics?: ExpiryRunMetrics;
  error?: string;
};
