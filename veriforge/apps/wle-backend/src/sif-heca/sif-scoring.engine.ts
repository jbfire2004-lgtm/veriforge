import { Injectable } from '@nestjs/common';
import { categoryFromScore, HIGH_ENERGY_TYPES } from './sif-heca.constants';

export type SifScoringInput = {
  hazardSeverity: number;
  hazardLikelihood: number;
  energyTypes: string[];
  controlStrength: number;
  workerCompetencyGap: boolean;
  equipmentConditionPoor: boolean;
  environmentRisk: boolean;
  historicalIncidents12mo: number;
  missingControls: number;
  weakControls: number;
};

export type SifScoringOutput = {
  sifScore: number;
  sifCategory: 'low' | 'medium' | 'high' | 'critical';
  severityComponent: number;
  likelihoodComponent: number;
  energyComponent: number;
  controlComponent: number;
  competencyComponent: number;
  equipmentComponent: number;
  environmentComponent: number;
  historyComponent: number;
  requiresSupervisorReview: boolean;
  requiredControls: string[];
  requiredActions: string[];
  explainability: Array<{ rule: string; points: number; detail: string }>;
};

@Injectable()
export class SifScoringEngine {
  score(input: SifScoringInput): SifScoringOutput {
    const explainability: SifScoringOutput['explainability'] = [];

    const severityComponent = Math.min(
      25,
      Math.round((input.hazardSeverity / 5) * 25),
    );
    explainability.push({
      rule: 'hazard_severity',
      points: severityComponent,
      detail: `Severity ${input.hazardSeverity}/5`,
    });

    const likelihoodComponent = Math.min(
      20,
      Math.round((input.hazardLikelihood / 5) * 20),
    );
    explainability.push({
      rule: 'hazard_likelihood',
      points: likelihoodComponent,
      detail: `Likelihood ${input.hazardLikelihood}/5`,
    });

    const highEnergy = input.energyTypes.some((e) => HIGH_ENERGY_TYPES.has(e));
    const energyComponent = highEnergy
      ? 20
      : input.energyTypes.length > 0
      ? 8
      : 0;
    if (energyComponent) {
      explainability.push({
        rule: 'energy_exposure',
        points: energyComponent,
        detail: `Energy types: ${input.energyTypes.join(', ') || 'none'}`,
      });
    }

    let controlComponent = 0;
    const requiredControls: string[] = [];
    if (input.missingControls > 0) {
      controlComponent += 15;
      requiredControls.push(
        'Add engineering or administrative controls before work',
      );
      explainability.push({
        rule: 'missing_controls',
        points: 15,
        detail: `${input.missingControls} missing control(s)`,
      });
    }
    if (input.weakControls > 0) {
      controlComponent += 10;
      requiredControls.push('Strengthen weak controls and re-verify');
      explainability.push({
        rule: 'weak_controls',
        points: 10,
        detail: `${input.weakControls} weak control(s)`,
      });
    }
    controlComponent += Math.max(0, 10 - Math.round(input.controlStrength * 2));
    controlComponent = Math.min(25, controlComponent);

    const competencyComponent = input.workerCompetencyGap ? 10 : 0;
    if (competencyComponent) {
      explainability.push({
        rule: 'competency_gap',
        points: competencyComponent,
        detail: 'Worker training/competency gap detected',
      });
    }

    const equipmentComponent = input.equipmentConditionPoor ? 10 : 0;
    if (equipmentComponent) {
      explainability.push({
        rule: 'equipment_condition',
        points: equipmentComponent,
        detail: 'Equipment not fit for use or unauthorized',
      });
    }

    const environmentComponent = input.environmentRisk ? 8 : 0;
    if (environmentComponent) {
      explainability.push({
        rule: 'environment',
        points: environmentComponent,
        detail: 'Adverse weather or site conditions',
      });
    }

    const historyComponent = Math.min(12, input.historicalIncidents12mo * 4);
    if (historyComponent) {
      explainability.push({
        rule: 'incident_history',
        points: historyComponent,
        detail: `${input.historicalIncidents12mo} related incident(s) in 12mo`,
      });
    }

    const sifScore = Math.min(
      100,
      severityComponent +
        likelihoodComponent +
        energyComponent +
        controlComponent +
        competencyComponent +
        equipmentComponent +
        environmentComponent +
        historyComponent,
    );

    const sifCategory = categoryFromScore(sifScore);
    const requiresSupervisorReview =
      sifCategory === 'high' ||
      sifCategory === 'critical' ||
      highEnergy ||
      input.missingControls > 0;

    const requiredActions: string[] = [];
    if (requiresSupervisorReview) {
      requiredActions.push('Supervisor review required before work proceeds');
    }
    if (sifCategory === 'critical') {
      requiredActions.push('Stop work and escalate to company safety manager');
    }

    return {
      sifScore,
      sifCategory,
      severityComponent,
      likelihoodComponent,
      energyComponent,
      controlComponent,
      competencyComponent,
      equipmentComponent,
      environmentComponent,
      historyComponent,
      requiresSupervisorReview,
      requiredControls,
      requiredActions,
      explainability,
    };
  }
}
