import { Injectable } from '@nestjs/common';

import { JhaEnergyType } from '@prisma/client';

import { ENERGY_WHEEL } from './jha-flha.constants';

export type SupervisorReviewFlag = {
  severity: 'critical' | 'warning' | 'info';

  code: string;

  message: string;

  hazardId?: string;
};

export type JhaEvaluationResult = {
  riskScore: number;

  taskRiskScore: number;

  sifScore: number;

  sifPotential: boolean;

  highEnergyFlag: boolean;

  qualityScore: number;

  requiresSupervisorReview: boolean;

  controlsAdequate: boolean;

  missingControls: string[];

  weakControls: string[];

  blockSubmission: boolean;

  blockReasons: string[];

  supervisorReviewFlags: SupervisorReviewFlag[];

  ppeOnlyHighEnergyHazards: string[];
};

type HazardRow = {
  id: string;

  description?: string;

  severity: number;

  likelihood: number;

  riskScore: number;

  energyTypes: unknown;

  sifIndicator: boolean;

  category: string | null;
};

type ControlRow = {
  id: string;

  hazardId: string | null;

  controlType: string;

  adequate: boolean | null;

  effectivenessScore: number | null;

  ppeRequired: boolean;

  verified: boolean;
};

@Injectable()
export class JhaScoringService {
  computeHazardRisk(severity: number, likelihood: number): number {
    return Math.min(25, severity * likelihood);
  }

  private hazardEnergyTypes(h: HazardRow): string[] {
    const raw = h.energyTypes;

    if (Array.isArray(raw)) return raw.map(String);

    return [];
  }

  private isHighEnergyHazard(
    h: HazardRow,

    energySources: Array<{ energyType: JhaEnergyType; exposureLevel: number }>,
  ): boolean {
    const hazardEnergies = this.hazardEnergyTypes(h);

    for (const es of energySources) {
      const def = ENERGY_WHEEL.find((e) => e.type === es.energyType);

      if (def && es.exposureLevel >= def.highExposureThreshold) {
        if (
          hazardEnergies.length === 0 ||
          hazardEnergies.includes(es.energyType)
        )
          return true;
      }
    }

    const highRiskEnergies = [
      'electrical',
      'pressure',
      'chemical',
      'radiation',
    ];

    return hazardEnergies.some((e) => highRiskEnergies.includes(e));
  }

  evaluate(input: {
    hazards: HazardRow[];

    controls: ControlRow[];

    energySources: Array<{ energyType: JhaEnergyType; exposureLevel: number }>;

    environmentalJson: Record<string, unknown>;

    workersCount: number;

    workersSigned: number;

    newWorkerPresent: boolean;

    equipmentUnauthorized: number;
  }): JhaEvaluationResult {
    const missingControls: string[] = [];

    const weakControls: string[] = [];

    const blockReasons: string[] = [];

    const supervisorReviewFlags: SupervisorReviewFlag[] = [];

    const ppeOnlyHighEnergyHazards: string[] = [];

    let maxRisk = 0;

    let sifIndicators = 0;

    for (const h of input.hazards) {
      maxRisk = Math.max(maxRisk, h.riskScore);

      if (h.sifIndicator || h.riskScore >= 20) sifIndicators++;

      const hazardControls = input.controls.filter((c) => c.hazardId === h.id);

      if (h.riskScore >= 12 && hazardControls.length === 0) {
        missingControls.push(
          `No controls for hazard: ${h.description ?? h.id}`,
        );
      }

      const nonPpe = hazardControls.filter((c) => c.controlType !== 'ppe');

      if (h.riskScore >= 12 && nonPpe.length === 0) {
        missingControls.push(
          `High-risk hazard needs non-PPE control: ${h.category ?? 'hazard'}`,
        );
      }

      const highEnergy = this.isHighEnergyHazard(h, input.energySources);

      if (highEnergy && hazardControls.length > 0) {
        const onlyPpe = hazardControls.every((c) => c.controlType === 'ppe');

        if (onlyPpe) {
          const label = h.description ?? h.category ?? h.id;

          ppeOnlyHighEnergyHazards.push(label);

          supervisorReviewFlags.push({
            severity: 'critical',

            code: 'PPE_ONLY_HIGH_ENERGY',

            message: `High-energy hazard "${label}" has only PPE controls — engineering or administrative controls required`,

            hazardId: h.id,
          });
        }
      }

      for (const c of hazardControls) {
        if (
          c.adequate === false ||
          (c.effectivenessScore != null && c.effectivenessScore < 3)
        ) {
          weakControls.push(`Weak control on ${h.category ?? 'hazard'}`);
        }
      }
    }

    let highEnergyFlag = false;

    for (const es of input.energySources) {
      const def = ENERGY_WHEEL.find((e) => e.type === es.energyType);

      if (def && es.exposureLevel >= def.highExposureThreshold) {
        highEnergyFlag = true;
      }

      const hasRequired = input.controls.some((c) =>
        def?.requiredControlTypes.includes(c.controlType),
      );

      if (def && es.exposureLevel >= 2 && !hasRequired) {
        missingControls.push(
          `Missing required controls for ${es.energyType} energy`,
        );

        supervisorReviewFlags.push({
          severity: 'warning',

          code: 'MISSING_ENERGY_CONTROLS',

          message: `Missing ${def.requiredControlTypes.join(
            ' or ',
          )} controls for ${def.label} energy on the wheel`,
        });
      }
    }

    const weather = String(input.environmentalJson.weather ?? '').toLowerCase();

    const highRiskWeather =
      weather.includes('ice') ||
      weather.includes('storm') ||
      weather.includes('extreme');

    let sifScore = 0;

    sifScore += maxRisk >= 20 ? 25 : 0;

    sifScore += highEnergyFlag ? 20 : 0;

    sifScore += missingControls.length > 0 ? 15 : 0;

    sifScore += input.newWorkerPresent ? 10 : 0;

    sifScore += input.equipmentUnauthorized > 0 ? 15 : 0;

    sifScore += highRiskWeather ? 10 : 0;

    sifScore += ppeOnlyHighEnergyHazards.length > 0 ? 15 : 0;

    sifScore = Math.min(100, sifScore);

    const sifPotential = sifScore >= 40 || sifIndicators > 0;

    const requiresSupervisorReview =
      sifPotential ||
      highEnergyFlag ||
      input.newWorkerPresent ||
      highRiskWeather ||
      ppeOnlyHighEnergyHazards.length > 0;

    if (sifPotential) {
      supervisorReviewFlags.push({
        severity: 'critical',

        code: 'SIF_POTENTIAL',

        message:
          'Serious injury or fatality (SIF) potential identified — supervisor review required',
      });
    }

    if (highEnergyFlag) {
      supervisorReviewFlags.push({
        severity: 'warning',

        code: 'HIGH_ENERGY',

        message:
          'High-energy exposure on energy wheel — verify hierarchy of controls',
      });
    }

    if (highRiskWeather) {
      supervisorReviewFlags.push({
        severity: 'info',

        code: 'WEATHER',

        message:
          'Extreme weather noted — confirm stop-work criteria and controls',
      });
    }

    if (input.hazards.length === 0) {
      blockReasons.push('At least one hazard is required');
    }

    if (missingControls.length > 0) {
      blockReasons.push('Missing required controls');
    }

    const controlsAdequate =
      missingControls.length === 0 && weakControls.length === 0;

    const riskScore = input.hazards.reduce((s, h) => s + h.riskScore, 0);

    const taskRiskScore = Math.min(
      100,
      Math.round(maxRisk * 2 + input.hazards.length * 2),
    );

    const qualityScore = Math.max(
      0,

      100 -
        missingControls.length * 15 -
        weakControls.length * 10 -
        ppeOnlyHighEnergyHazards.length * 12 -
        (input.hazards.length === 0 ? 50 : 0),
    );

    return {
      riskScore,

      taskRiskScore,

      sifScore,

      sifPotential,

      highEnergyFlag,

      qualityScore,

      requiresSupervisorReview,

      controlsAdequate,

      missingControls,

      weakControls,

      blockSubmission: blockReasons.length > 0,

      blockReasons,

      supervisorReviewFlags,

      ppeOnlyHighEnergyHazards,
    };
  }
}
