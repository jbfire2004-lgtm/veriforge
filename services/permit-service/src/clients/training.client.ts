import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface WorkerTrainingSnapshot {
  compliant: boolean;
  expiredCount: number;
  missingRequired: string[];
}

export const trainingClient = {
  async getWorkerTraining(input: {
    workerId: string;
    companyId: string;
    token: string;
    role?: string;
  }): Promise<WorkerTrainingSnapshot | null> {
    if (!env.trainingServiceUrl) return null;

    try {
      const params = new URLSearchParams({ company_id: input.companyId });
      if (input.role) params.set('role', input.role);
      const url = `${env.trainingServiceUrl}/worker/${input.workerId}?${params}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${input.token}` },
      });
      if (!res.ok) {
        logger.warn('training worker fetch failed', { workerId: input.workerId, status: res.status });
        return null;
      }
      const body = (await res.json()) as {
        compliant?: boolean;
        expiredCount?: number;
        missingRequired?: string[];
      };
      return {
        compliant: body.compliant ?? (body.expiredCount ?? 0) === 0,
        expiredCount: body.expiredCount ?? 0,
        missingRequired: body.missingRequired ?? [],
      };
    } catch (err) {
      logger.warn('training service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },
};
