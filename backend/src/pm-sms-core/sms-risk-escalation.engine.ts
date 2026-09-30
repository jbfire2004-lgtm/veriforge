import { Injectable } from '@nestjs/common';
import {
  PmDeficiencySeverity,
  PmEnergyControlState,
  PmSclState,
  PmUnifiedEnergyType,
} from '@prisma/client';

export type SmsRiskTagInput = {
  sclState?: PmSclState | null;
  hecaInvolved?: boolean;
  hecaType?: string | null;
  energyTypes?: string[];
  energyControlState?: PmEnergyControlState | null;
  highEnergyFlag?: boolean;
};

export type EscalationResult = {
  severity: PmDeficiencySeverity;
  escalated: boolean;
  escalationScore: number;
  requiresInvestigation: boolean;
  dueDateMultiplier: number;
  factors: string[];
};

const HIGH_ENERGY_TYPES: PmUnifiedEnergyType[] = [
  'gravity',
  'electrical',
  'pressure',
  'chemical',
  'radiation',
  'mechanical',
];

@Injectable()
export class SmsRiskEscalationEngine {
  evaluate(
    baseSeverity: PmDeficiencySeverity,
    tags: SmsRiskTagInput,
  ): EscalationResult {
    let score = 0;
    const factors: string[] = [];
    const energyTypes = (tags.energyTypes ?? []) as PmUnifiedEnergyType[];

    const highEnergy =
      tags.highEnergyFlag ||
      energyTypes.some((e) => HIGH_ENERGY_TYPES.includes(e));

    if (tags.sclState === 'conditional') {
      score += 15;
      factors.push('scl_conditional');
    }
    if (tags.sclState === 'loss') {
      score += 35;
      factors.push('scl_loss');
    }
    if (tags.hecaInvolved) {
      score += 20;
      factors.push('heca_involved');
    }
    if (highEnergy) {
      score += 15;
      factors.push('high_energy');
    }
    if (
      tags.energyControlState === 'uncontrolled' ||
      tags.energyControlState === 'partially_controlled'
    ) {
      score += 10;
      factors.push(`energy_${tags.energyControlState}`);
    }

    const hecaHighEnergyScl =
      tags.hecaInvolved &&
      highEnergy &&
      (tags.sclState === 'conditional' || tags.sclState === 'loss');

    if (hecaHighEnergyScl) {
      score += 25;
      factors.push('heca_high_energy_scl_combo');
    }

    const severity = this.bumpSeverity(baseSeverity, score);
    const requiresInvestigation =
      hecaHighEnergyScl || tags.sclState === 'loss' || severity === 'critical';

    return {
      severity,
      escalated: severity !== baseSeverity || score >= 25,
      escalationScore: score,
      requiresInvestigation,
      dueDateMultiplier: score >= 35 ? 0.5 : score >= 20 ? 0.75 : 1,
      factors,
    };
  }

  private bumpSeverity(
    base: PmDeficiencySeverity,
    score: number,
  ): PmDeficiencySeverity {
    const order: PmDeficiencySeverity[] = ['low', 'medium', 'high', 'critical'];
    let idx = order.indexOf(base);
    if (score >= 50) idx = Math.min(3, idx + 2);
    else if (score >= 30) idx = Math.min(3, idx + 1);
    else if (score >= 15 && idx < 2) idx += 1;
    return order[idx] ?? base;
  }
}
