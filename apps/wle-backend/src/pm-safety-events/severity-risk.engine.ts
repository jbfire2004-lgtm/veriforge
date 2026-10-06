import { Injectable } from '@nestjs/common';
import { PmSafetyEventSeverity, PmSafetyEventType } from '@prisma/client';

export type RiskScoreResult = {
  severity: PmSafetyEventSeverity;
  likelihood: number;
  riskScore: number;
  requiresSupervisorReview: boolean;
  explainability: Array<{ rule: string; detail: string }>;
};

@Injectable()
export class SeverityRiskEngine {
  score(input: {
    eventType: PmSafetyEventType;
    description?: string;
    hasInjury?: boolean;
    medicalAid?: boolean;
    lostTime?: boolean;
    equipmentFailure?: boolean;
    severityHint?: number;
    likelihoodHint?: number;
  }): RiskScoreResult {
    const explainability: Array<{ rule: string; detail: string }> = [];
    let severityScore = input.severityHint ?? 2;
    let likelihood = input.likelihoodHint ?? 2;

    if (input.eventType === 'incident_injury') {
      severityScore = 5;
      explainability.push({
        rule: 'event_type',
        detail: 'Injury incident → severity 5',
      });
    } else if (input.eventType === 'near_miss') {
      severityScore = 3;
      likelihood = 4;
    } else if (input.eventType === 'positive_observation') {
      return {
        severity: 'low',
        likelihood: 1,
        riskScore: 5,
        requiresSupervisorReview: false,
        explainability: [
          { rule: 'positive', detail: 'Positive observation — low risk' },
        ],
      };
    } else if (input.eventType === 'equipment_failure') {
      severityScore = 4;
      explainability.push({ rule: 'equipment', detail: 'Equipment failure' });
    }

    if (input.medicalAid) {
      severityScore = 5;
      explainability.push({ rule: 'medical_aid', detail: '+medical aid' });
    }
    if (input.lostTime) {
      severityScore = 5;
      likelihood = 5;
      explainability.push({ rule: 'lost_time', detail: '+lost time' });
    }
    if (input.hasInjury && !input.medicalAid) {
      severityScore = Math.max(severityScore, 4);
    }

    const riskScore = Math.min(100, severityScore * 12 + likelihood * 8);
    const severity = this.toSeverity(severityScore);
    const requiresSupervisorReview =
      severity === 'high' ||
      severity === 'critical' ||
      input.medicalAid ||
      input.lostTime ||
      input.equipmentFailure ||
      input.eventType === 'incident_injury';

    if (requiresSupervisorReview) {
      explainability.push({
        rule: 'supervisor_review',
        detail: 'High/critical severity or medical/lost time',
      });
    }

    return {
      severity,
      likelihood,
      riskScore,
      requiresSupervisorReview,
      explainability,
    };
  }

  private toSeverity(score: number): PmSafetyEventSeverity {
    if (score >= 5) return 'critical';
    if (score >= 4) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }
}
