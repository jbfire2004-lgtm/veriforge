import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { TaskRequirements } from '../types';

export interface TaskSnapshot {
  id: string;
  requirements: TaskRequirements;
  assignedWorkers: string[];
  assignedEquipment: string[];
}

export const taskClient = {
  async fetchTask(taskId: string, companyId: string, token: string): Promise<TaskSnapshot | null> {
    if (!env.pmTaskServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.pmTaskServiceUrl}/pm/task/${taskId}?company_id=${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return null;

      const body = (await res.json()) as Record<string, unknown>;
      const assignments = Array.isArray(body.assignments) ? body.assignments : [];

      const assignedWorkers = assignments
        .filter((a) => (a as { type?: string }).type === 'worker')
        .map((a) => String((a as { assigneeId: string }).assigneeId));

      const assignedEquipment = assignments
        .filter((a) => (a as { type?: string }).type === 'equipment')
        .map((a) => String((a as { assigneeId: string }).assigneeId));

      return {
        id: String(body.id),
        requirements: {
          requiredSkills: toArr(body.requiredSkills ?? body.required_skills),
          requiredEquipment: toArr(body.requiredEquipment ?? body.required_equipment),
          requiredTraining: toArr(body.requiredTraining ?? body.required_training),
          requiredControls: toArr(body.requiredControls ?? body.required_controls),
          requiredPpe: toArr(body.requiredPpe ?? body.required_ppe),
          requiredJha: toArr(body.requiredJha ?? body.required_jha),
        },
        assignedWorkers,
        assignedEquipment,
      };
    } catch (err) {
      logger.warn('pm task service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },
};

function toArr(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String);
}
