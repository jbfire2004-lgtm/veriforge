export type PredictionOutput = {
  predictionType: string;
  probability: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  factors: string[];
};

export class CailPredictiveEngine {
  incidentLikelihood(input: {
    workerScore: number;
    openCapa: number;
    sifExposures: number;
    incidents90d: number;
  }): PredictionOutput {
    let p = 0.05;
    const factors: string[] = [];
    if (input.workerScore < 50) {
      p += 0.22;
      factors.push('low_worker_safety_score');
    }
    if (input.openCapa > 2) {
      p += 0.15;
      factors.push('multiple_open_capa');
    }
    if (input.sifExposures > 0) {
      p += 0.2;
      factors.push('sif_exposure');
    }
    if (input.incidents90d > 0) {
      p += 0.12 * Math.min(3, input.incidents90d);
      factors.push('recent_incidents');
    }
    const probability = Math.min(0.95, Math.round(p * 1000) / 1000);
    return {
      predictionType: 'incident_likelihood',
      probability,
      riskLevel:
        probability > 0.45 ? 'high' : probability > 0.25 ? 'medium' : 'low',
      factors,
    };
  }

  equipmentFailure(input: {
    failures90d: number;
    openCapa: number;
    inspectionFailures: number;
  }): PredictionOutput {
    let p = 0.08;
    const factors: string[] = [];
    if (input.failures90d > 0) {
      p += 0.2 * Math.min(2, input.failures90d);
      factors.push('failure_history');
    }
    if (input.openCapa > 0) {
      p += 0.18;
      factors.push('open_equipment_capa');
    }
    if (input.inspectionFailures > 0) {
      p += 0.15;
      factors.push('inspection_deficiencies');
    }
    const probability = Math.min(0.9, Math.round(p * 1000) / 1000);
    return {
      predictionType: 'equipment_failure',
      probability,
      riskLevel:
        probability > 0.4 ? 'high' : probability > 0.2 ? 'medium' : 'low',
      factors,
    };
  }

  capaOverdueRisk(input: {
    openCount: number;
    overdueCount: number;
    avgDaysToDue: number;
    escalationMax: number;
  }): PredictionOutput {
    let p = 0.1;
    const factors: string[] = [];
    if (input.overdueCount > 0) {
      p += 0.25 + input.overdueCount * 0.08;
      factors.push('already_overdue');
    }
    if (input.avgDaysToDue < 3) {
      p += 0.15;
      factors.push('due_soon');
    }
    if (input.escalationMax >= 3) {
      p += 0.12;
      factors.push('high_escalation');
    }
    const probability = Math.min(0.95, Math.round(p * 1000) / 1000);
    return {
      predictionType: 'capa_overdue',
      probability,
      riskLevel:
        probability > 0.5 ? 'high' : probability > 0.3 ? 'medium' : 'low',
      factors,
    };
  }

  projectRisk(input: {
    projectScore: number;
    overdueCapa: number;
    emergencyActive: boolean;
  }): PredictionOutput {
    let p = (100 - input.projectScore) / 100;
    const factors: string[] = ['project_safety_score'];
    if (input.overdueCapa > 0) {
      p += 0.1;
      factors.push('overdue_capa');
    }
    if (input.emergencyActive) {
      p += 0.2;
      factors.push('emergency_active');
    }
    const probability = Math.min(0.95, Math.round(p * 1000) / 1000);
    return {
      predictionType: 'project_risk',
      probability,
      riskLevel:
        probability > 0.55
          ? 'critical'
          : probability > 0.35
          ? 'high'
          : probability > 0.2
          ? 'medium'
          : 'low',
      factors,
    };
  }

  trainingLapse(input: {
    expired: number;
    expiring7d: number;
  }): PredictionOutput {
    let p = 0.05;
    const factors: string[] = [];
    if (input.expired > 0) {
      p += 0.35;
      factors.push('training_expired');
    }
    if (input.expiring7d > 0) {
      p += 0.2;
      factors.push('training_expiring_soon');
    }
    const probability = Math.min(0.9, Math.round(p * 1000) / 1000);
    return {
      predictionType: 'training_lapse',
      probability,
      riskLevel:
        probability > 0.4 ? 'high' : probability > 0.2 ? 'medium' : 'low',
      factors,
    };
  }
}
