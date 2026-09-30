import { env } from '../config/env';
import { logger } from '../utils/logger';

export const projectClient = {
  async verifyProject(projectId: string, companyId: string, token: string): Promise<boolean> {
    if (!env.pmProjectServiceUrl) return true;

    try {
      const res = await fetch(
        `${env.pmProjectServiceUrl}/pm/project/${projectId}?company_id=${companyId}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      return res.ok;
    } catch (err) {
      logger.warn('pm project service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return true;
    }
  },
};
