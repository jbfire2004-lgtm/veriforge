import { CailSeverity, PmCorrectiveActionType } from '@prisma/client';

export const DUE_DAYS_DEFAULT = {
  low: 30,
  medium: 14,
  high: 7,
  critical: 1,
};

export const ESCALATION_LEVELS = {
  1: 'Reminder',
  2: 'Supervisor escalation',
  3: 'Safety escalation',
  4: 'Project manager escalation',
  5: 'Company-level escalation',
} as const;

export const SOURCE_MODULE_TO_CAIL: Record<string, string> = {
  jha_flha: 'jha',
  inspection: 'inspection',
  incident: 'incident',
  sif_heca: 'sif',
  equipment: 'equipment',
  manual: 'general',
  training: 'training',
  safety_meetings: 'safety_meeting',
};

export function severityToScore(sev: CailSeverity | string): number {
  const map: Record<string, number> = {
    low: 25,
    medium: 50,
    high: 75,
    critical: 100,
  };
  return map[sev] ?? 50;
}

export function actionTypeDefault(type: PmCorrectiveActionType): {
  priorityBoost: number;
} {
  const boosts: Partial<Record<PmCorrectiveActionType, number>> = {
    immediate: 30,
    equipment_repair: 25,
    training_requirement: 15,
    interim_control: 20,
  };
  return { priorityBoost: boosts[type] ?? 10 };
}
