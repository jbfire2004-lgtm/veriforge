import { env } from '../config/env';
import { logger } from '../utils/logger';

export const pmProjectClient = {
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

  async checkProjectSafetyGate(
    projectId: string,
    companyId: string,
    token: string,
    context: Record<string, unknown>,
  ): Promise<{ passed: boolean; reason?: string }> {
    if (!env.pmProjectServiceUrl) return { passed: true };

    try {
      const res = await fetch(
        `${env.pmProjectServiceUrl}/pm/project/${projectId}/safety-gate/check`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ company_id: companyId, ...context }),
        },
      );
      const body = (await res.json()) as { passed?: boolean; reason?: string };
      return { passed: body.passed ?? res.ok, reason: body.reason };
    } catch {
      return { passed: true };
    }
  },
};
