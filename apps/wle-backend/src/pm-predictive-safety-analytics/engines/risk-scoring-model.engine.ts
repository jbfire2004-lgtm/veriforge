import { Injectable } from '@nestjs/common';
import type {
  EntityRiskScore,
  RiskLevel,
} from '../types/predictive-analytics.types';

export const MODEL_KEY = 'predictive_safety_v1';
export const MODEL_VERSION = 1;

/** Weighted logistic-style risk index (0–100) from normalized features */
@Injectable()
export class RiskScoringModelEngine {
  private toLevel(score: number): RiskLevel {
    if (score >= 75) return 'critical';
    if (score >= 55) return 'high';
    if (score >= 35) return 'medium';
    return 'low';
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x));
  }

  scoreWorker(input: {
    workerId: number;
    name: string;
    profileScore: number;
    overdueCapa: number;
    incidents90d: number;
    trainingGaps: number;
    accessDenials30d: number;
    openMedicalBlocks: number;
    sclConditionalLoss?: number;
    hecaExposure?: number;
    highEnergyExposure?: number;
  }): EntityRiskScore {
    const z =
      (100 - input.profileScore) * 0.04 +
      input.overdueCapa * 0.35 +
      input.incidents90d * 0.45 +
      input.trainingGaps * 0.3 +
      input.accessDenials30d * 0.15 +
      input.openMedicalBlocks * 0.5 +
      (input.sclConditionalLoss ?? 0) * 0.4 +
      (input.hecaExposure ?? 0) * 0.35 +
      (input.highEnergyExposure ?? 0) * 0.25;
    const probability = Math.min(0.95, this.sigmoid(z - 2));
    const riskScore = Math.round(probability * 100);
    const factors: string[] = [];
    if (input.profileScore < 60) factors.push('low_safety_profile_score');
    if (input.overdueCapa > 0) factors.push('overdue_capa');
    if (input.incidents90d > 0) factors.push('recent_incidents');
    if (input.trainingGaps > 0) factors.push('training_gaps');
    if (input.accessDenials30d > 2) factors.push('access_denials');
    if (input.openMedicalBlocks > 0) factors.push('medical_restrictions');
    if ((input.sclConditionalLoss ?? 0) > 0)
      factors.push('scl_conditional_loss');
    if ((input.hecaExposure ?? 0) > 0) factors.push('heca_exposure');
    if ((input.highEnergyExposure ?? 0) > 0)
      factors.push('high_energy_exposure');

    return {
      entityType: 'worker',
      entityId: String(input.workerId),
      label: input.name,
      riskScore,
      riskLevel: this.toLevel(riskScore),
      probability,
      factors,
    };
  }

  scoreContractor(input: {
    companyId: number;
    name: string;
    deficiencies90d: number;
    overdueDispatches: number;
    openCapa: number;
    photoFindingsHigh: number;
    completionRate: number;
    sclLossCount?: number;
    hecaFindings?: number;
    highEnergyFindings?: number;
  }): EntityRiskScore {
    const z =
      input.deficiencies90d * 0.25 +
      input.overdueDispatches * 0.5 +
      input.openCapa * 0.2 +
      input.photoFindingsHigh * 0.35 +
      (100 - input.completionRate) * 0.02 +
      (input.sclLossCount ?? 0) * 0.45 +
      (input.hecaFindings ?? 0) * 0.3 +
      (input.highEnergyFindings ?? 0) * 0.25;
    const probability = Math.min(0.95, this.sigmoid(z - 1.5));
    const riskScore = Math.round(probability * 100);
    const factors: string[] = [];
    if (input.deficiencies90d > 3) factors.push('repeat_deficiencies');
    if (input.overdueDispatches > 0) factors.push('overdue_dispatches');
    if (input.photoFindingsHigh > 0) factors.push('high_severity_findings');
    if (input.completionRate < 70) factors.push('low_completion_rate');
    if ((input.sclLossCount ?? 0) > 0) factors.push('scl_loss_findings');
    if ((input.hecaFindings ?? 0) > 0) factors.push('heca_findings');
    if ((input.highEnergyFindings ?? 0) > 0)
      factors.push('high_energy_findings');

    return {
      entityType: 'contractor',
      entityId: String(input.companyId),
      label: input.name,
      riskScore,
      riskLevel: this.toLevel(riskScore),
      probability,
      factors,
      metadata: { completionRate: input.completionRate },
    };
  }

  scoreTask(input: {
    jhaId: string;
    title: string;
    riskScore: number;
    hazardCount: number;
    unsignedCrew: number;
    daysSinceUpdate: number;
    sifPotential: boolean;
    hecaTask?: boolean;
    highEnergyTypes?: number;
  }): EntityRiskScore {
    const z =
      input.riskScore * 0.03 +
      input.hazardCount * 0.2 +
      input.unsignedCrew * 0.4 +
      Math.min(30, input.daysSinceUpdate) * 0.05 +
      (input.sifPotential ? 1.2 : 0) +
      (input.hecaTask ? 0.8 : 0) +
      (input.highEnergyTypes ?? 0) * 0.15;
    const probability = Math.min(0.95, this.sigmoid(z - 2));
    const riskScore = Math.round(probability * 100);
    const factors: string[] = [];
    if (input.riskScore > 70) factors.push('high_jha_risk_score');
    if (input.unsignedCrew > 0) factors.push('unsigned_crew');
    if (input.daysSinceUpdate > 14) factors.push('stale_jha');
    if (input.sifPotential) factors.push('sif_potential');
    if (input.hecaTask) factors.push('heca_task');
    if ((input.highEnergyTypes ?? 0) > 0) factors.push('high_energy_task');

    return {
      entityType: 'task',
      entityId: input.jhaId,
      label: input.title,
      riskScore,
      riskLevel: this.toLevel(riskScore),
      probability,
      factors,
    };
  }

  scoreLocation(input: {
    siteId: number;
    name: string;
    incidents90d: number;
    deficiencies90d: number;
    openHazards: number;
    accessDenials30d: number;
  }): EntityRiskScore {
    const z =
      input.incidents90d * 0.5 +
      input.deficiencies90d * 0.2 +
      input.openHazards * 0.35 +
      input.accessDenials30d * 0.1;
    const probability = Math.min(0.95, this.sigmoid(z - 1.8));
    const riskScore = Math.round(probability * 100);
    const factors: string[] = [];
    if (input.incidents90d > 0) factors.push('site_incidents');
    if (input.deficiencies90d > 2) factors.push('inspection_deficiencies');
    if (input.openHazards > 0) factors.push('open_hazards');

    return {
      entityType: 'location',
      entityId: String(input.siteId),
      label: input.name,
      riskScore,
      riskLevel: this.toLevel(riskScore),
      probability,
      factors,
    };
  }

  aggregateProjectRisk(entities: EntityRiskScore[]): number {
    if (!entities.length) return 15;
    const top = [...entities]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 10);
    const avg = top.reduce((s, e) => s + e.riskScore, 0) / top.length;
    return Math.round(avg);
  }
}
