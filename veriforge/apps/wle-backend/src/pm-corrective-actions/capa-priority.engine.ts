import { Injectable } from '@nestjs/common';
import { PmCorrectiveActionType } from '@prisma/client';
import { actionTypeDefault, severityToScore } from './pm-capa.constants';

@Injectable()
export class CapaPriorityEngine {
  score(input: {
    severity: string;
    actionType: PmCorrectiveActionType;
    sifLinked?: boolean;
    hecaLinked?: boolean;
    equipmentUnsafe?: boolean;
    overdue?: boolean;
  }) {
    const explainability: Array<{ rule: string; points: number }> = [];
    const severityScore = severityToScore(input.severity);
    explainability.push({ rule: 'base_severity', points: severityScore });

    let priorityScore = severityScore;
    const typeBoost = actionTypeDefault(input.actionType).priorityBoost;
    priorityScore += typeBoost;
    explainability.push({ rule: 'action_type', points: typeBoost });

    if (input.sifLinked) {
      priorityScore += 20;
      explainability.push({ rule: 'sif_linked', points: 20 });
    }
    if (input.hecaLinked) {
      priorityScore += 15;
      explainability.push({ rule: 'heca_linked', points: 15 });
    }
    if (input.equipmentUnsafe) {
      priorityScore += 25;
      explainability.push({ rule: 'equipment_unsafe', points: 25 });
    }
    if (input.overdue) {
      priorityScore += 30;
      explainability.push({ rule: 'overdue', points: 30 });
    }

    priorityScore = Math.min(100, priorityScore);
    return { severityScore, priorityScore, explainability };
  }
}
