import { env } from '../config/env';
import { logger } from '../utils/logger';

interface TrainingJobResponse {
  status: string;
  artifacts?: Array<{ artifact_uri: string }>;
}

export const trainingClient = {
  async getTrainingJob(
    companyId: string,
    trainingJobId: string,
    token?: string,
  ): Promise<TrainingJobResponse | null> {
    try {
      const res = await fetch(
        `${env.trainingServiceUrl}/${trainingJobId}?company_id=${encodeURIComponent(companyId)}`,
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        },
      );
      if (!res.ok) return null;
      return (await res.json()) as TrainingJobResponse;
    } catch (err) {
      logger.warn('training service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },
};
