import type { PriorityResult } from '../types';

const SEVERITY_DUE_DAYS: Record<string, number> = {
  low: 30,
  medium: 14,
  high: 7,
  critical: 3,
};

const SEVERITY_PRIORITY: Record<string, string> = {
  low: 'low',
  medium: 'medium',
  high: 'high',
  critical: 'critical',
};

export class PriorityEngine {
  compute(input: {
    severity: string;
    actionType: string;
    sifLinked?: boolean;
    hecaLinked?: boolean;
    equipmentUnsafe?: boolean;
  }): PriorityResult {
    const severity = input.severity.toLowerCase();
    const explainability: string[] = [];

    let priority = SEVERITY_PRIORITY[severity] ?? 'medium';
    explainability.push(`Base priority from severity: ${priority}`);

    if (input.sifLinked) {
      priority = 'critical';
      explainability.push('SIF-linked — priority elevated to critical');
    } else if (input.hecaLinked && priority !== 'critical') {
      priority = 'high';
      explainability.push('HECA-linked — priority elevated to high');
    }

    if (input.equipmentUnsafe && priority !== 'critical') {
      priority = 'high';
      explainability.push('Equipment unsafe — priority elevated');
    }

    if (input.actionType === 'immediate') {
      priority = 'critical';
      explainability.push('Immediate action type — priority critical');
    }

    const dueDays = SEVERITY_DUE_DAYS[severity] ?? 14;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);

    return { severity, priority, dueDate, explainability };
  }
}

export const priorityEngine = new PriorityEngine();
