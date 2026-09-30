export type ReadinessVisualState = 'OK' | 'AT_RISK' | 'NON_COMPLIANT';

export type ReadinessDimensionPayload = {
  key: string;
  label: string;
  score: number;
  state: ReadinessVisualState;
  metrics: Record<string, number>;
  evaluatedAt?: string | null;
};

export function scoreToVisualState(
  score: number,
  options?: { criticalCount?: number; missingCount?: number },
): ReadinessVisualState {
  if ((options?.criticalCount ?? 0) > 0 || score < 50) return 'NON_COMPLIANT';
  if ((options?.missingCount ?? 0) > 0 || score < 85) return 'AT_RISK';
  return 'OK';
}

export function complianceRateToVisualState(
  rate: number,
  nonCompliant: number,
  critical = 0,
): ReadinessVisualState {
  if (critical > 0 || rate < 50 || (nonCompliant > 0 && rate < 70)) {
    return nonCompliant > 0 && rate >= 50 ? 'AT_RISK' : 'NON_COMPLIANT';
  }
  if (rate < 85) return 'AT_RISK';
  return 'OK';
}

export function assessmentStatusToVisualState(
  status: string,
  score?: number,
): ReadinessVisualState {
  const normalized = status.toLowerCase();
  if (
    normalized.includes('reject') ||
    normalized.includes('not acceptable') ||
    normalized.includes('notacceptable') ||
    normalized.includes('fail') ||
    normalized.includes('weak')
  ) {
    return 'NON_COMPLIANT';
  }
  if (
    normalized.includes('conditional') ||
    normalized.includes('moderate') ||
    normalized.includes('developing') ||
    (score != null && score < 85)
  ) {
    return 'AT_RISK';
  }
  return 'OK';
}

export function fitTestRateToVisualState(input: {
  complianceRate: number;
  expired: number;
  failed: number;
  missing: number;
}): ReadinessVisualState {
  if (input.failed > 0 || input.complianceRate < 50) return 'NON_COMPLIANT';
  if (input.expired > 0 || input.missing > 0 || input.complianceRate < 85) {
    return 'AT_RISK';
  }
  return 'OK';
}

export function trainingExpiryToVisualState(input: {
  expired: number;
  highRisk: number;
  gaps: number;
}): ReadinessVisualState {
  if (input.expired > 0 || input.highRisk > 0) return 'NON_COMPLIANT';
  if (input.gaps > 0) return 'AT_RISK';
  return 'OK';
}

export function predictiveRiskToVisualState(
  riskLevel: string,
  riskIndex: number,
): ReadinessVisualState {
  const level = riskLevel.toLowerCase();
  if (level === 'critical' || level === 'high' || riskIndex >= 70) {
    return 'NON_COMPLIANT';
  }
  if (level === 'medium' || riskIndex >= 45) return 'AT_RISK';
  return 'OK';
}

export function competencyRollupToVisualState(input: {
  current: number;
  expired: number;
  failed: number;
  missing: number;
  total: number;
}): ReadinessVisualState {
  if (input.total === 0) return 'AT_RISK';
  const rate = Math.round((input.current / input.total) * 100);
  if (input.failed > 0 || rate < 50) return 'NON_COMPLIANT';
  if (input.expired > 0 || input.missing > 0 || rate < 85) return 'AT_RISK';
  return 'OK';
}

export function trainingExpiryScore(input: {
  expired: number;
  expiring30: number;
  highRisk: number;
  gaps: number;
}): number {
  const penalty =
    input.expired * 12 +
    input.expiring30 * 4 +
    input.highRisk * 8 +
    input.gaps * 3;
  return Math.max(0, Math.min(100, 100 - penalty));
}
