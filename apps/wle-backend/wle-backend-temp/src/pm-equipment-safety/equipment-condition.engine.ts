export type ConditionInput = {
  complianceStatus: string;
  safetyStatus: string;
  lockoutStatus: string;
  operationalStatus: string;
  lastInspectionScore?: number | null;
  openCriticalDeficiencies: number;
  expiredCertifications: number;
  chronicFailureCount: number;
};

export type ConditionResult = {
  score: number;
  riskBand: 'low' | 'medium' | 'high' | 'critical';
  factors: Record<string, number>;
};

export class EquipmentConditionEngine {
  score(input: ConditionInput): ConditionResult {
    const factors: Record<string, number> = {};
    let score = 100;

    if (
      input.lockoutStatus === 'LOCKED_OUT' ||
      input.operationalStatus === 'locked_out'
    ) {
      factors.lockout = -100;
      score = 0;
    }
    if (input.complianceStatus === 'NON_COMPLIANT') {
      factors.nonCompliant = -40;
      score -= 40;
    } else if (input.complianceStatus === 'NEEDS_ATTENTION') {
      factors.needsAttention = -20;
      score -= 20;
    }
    if (input.safetyStatus === 'UNSAFE') {
      factors.unsafe = -35;
      score -= 35;
    } else if (input.safetyStatus === 'NEEDS_INSPECTION') {
      factors.needsInspection = -15;
      score -= 15;
    }
    if (input.openCriticalDeficiencies > 0) {
      factors.criticalDeficiencies = -25 * input.openCriticalDeficiencies;
      score -= Math.min(50, 25 * input.openCriticalDeficiencies);
    }
    if (input.expiredCertifications > 0) {
      factors.expiredCerts = -20 * input.expiredCertifications;
      score -= Math.min(40, 20 * input.expiredCertifications);
    }
    if (input.chronicFailureCount >= 3) {
      factors.chronicFailures = -30;
      score -= 30;
    }
    if (input.lastInspectionScore != null && input.lastInspectionScore < 70) {
      factors.lowInspectionScore = -15;
      score -= 15;
    }

    score = Math.max(0, Math.min(100, score));
    const riskBand =
      score >= 80
        ? 'low'
        : score >= 60
        ? 'medium'
        : score >= 40
        ? 'high'
        : 'critical';

    return { score, riskBand, factors };
  }
}
