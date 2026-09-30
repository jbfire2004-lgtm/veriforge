import { env } from '../config/env';
import { logger } from '../utils/logger';

export const projectSafetyClient = {
  async fetchProjectSafetyScore(
    projectId: string,
    companyId: string,
    token: string,
  ): Promise<number | null> {
    if (!env.projectSafetyServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.projectSafetyServiceUrl}/project/safety/${projectId}?company_id=${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as { score?: number; safetyScore?: number };
      return body.score ?? body.safetyScore ?? null;
    } catch (err) {
      logger.warn('project safety service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },
};
