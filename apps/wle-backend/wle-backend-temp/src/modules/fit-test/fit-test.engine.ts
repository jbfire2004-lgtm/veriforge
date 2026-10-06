export type FitTestResult = 'PASS' | 'FAIL' | 'CONDITIONAL';

export type FitTestEvaluateInput = {
  result: FitTestResult;
  performedAt: Date;
  expiresAt?: Date | null;
  /** Override default validity window (years) for PASS results. */
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

/** Regulatory default: fit test valid for one year after a passing result. */
export const FIT_TEST_DEFAULT_VALIDITY_YEARS = 1;

export function resolveFitTestValidityYears(input?: number): number {
  if (input == null || !Number.isFinite(input) || input <= 0) {
    return FIT_TEST_DEFAULT_VALIDITY_YEARS;
  }
  return input;
}

export function computeFitTestExpiresAt(
  performedAt: Date,
  validityYears = FIT_TEST_DEFAULT_VALIDITY_YEARS,
): Date {
  const expiresAt = new Date(performedAt);
  expiresAt.setFullYear(expiresAt.getFullYear() + validityYears);
  return expiresAt;
}

export function evaluateFitTest(
  input: FitTestEvaluateInput,
): FitTestEvaluateResult {
  const pass = input.result === 'PASS';
  const conditional = input.result === 'CONDITIONAL';
  const validityYears = resolveFitTestValidityYears(input.validityYears);
  let expiresAt = input.expiresAt ?? null;
  if (pass && !expiresAt) {
    expiresAt = computeFitTestExpiresAt(input.performedAt, validityYears);
  }
  const now = new Date();
  const expired = Boolean(expiresAt && expiresAt < now && pass);
  const daysUntilExpiry =
    expiresAt != null
      ? Math.ceil((expiresAt.getTime() - now.getTime()) / (24 * 60 * 60 * 1000))
      : null;
  const expiringSoon =
    daysUntilExpiry != null &&
    daysUntilExpiry >= 0 &&
    daysUntilExpiry <= 30 &&
    pass &&
    !expired;

  let statusLabel: FitTestEvaluateResult['statusLabel'];
  if (conditional) statusLabel = 'CONDITIONAL';
  else if (expired) statusLabel = 'EXPIRED';
  else if (pass) statusLabel = 'PASS';
  else statusLabel = 'FAIL';

  return {
    pass: pass && !expired,
    statusLabel,
    expiresAt,
    daysUntilExpiry,
    expired,
    expiringSoon,
  };
}

export function fitTestReadinessScore(input: {
  hasRun: boolean;
  evaluation: FitTestEvaluateResult | null;
}): number {
  if (!input.hasRun || !input.evaluation) return 0;
  if (input.evaluation.pass) return 100;
  if (input.evaluation.expired) return 20;
  if (input.evaluation.statusLabel === 'CONDITIONAL') return 50;
  return 0;
}
