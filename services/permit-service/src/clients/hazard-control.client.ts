import { env } from '../config/env';
import { logger } from '../utils/logger';

export const hazardControlClient = {
  async getHazard(input: {
    hazardId: string;
    companyId: string;
    token: string;
  }): Promise<{ active: boolean; mitigated: boolean } | null> {
    if (!env.hazardControlServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.hazardControlServiceUrl}/hazard/${input.hazardId}?company_id=${input.companyId}`,
        { headers: { Authorization: `Bearer ${input.token}` } },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as { status?: string };
      const mitigated = body.status === 'mitigated' || body.status === 'closed';
      return { active: !mitigated, mitigated };
    } catch (err) {
      logger.warn('hazard control service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },

  async getControl(input: {
    controlId: string;
    companyId: string;
    token: string;
  }): Promise<{ effective: boolean } | null> {
    if (!env.hazardControlServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.hazardControlServiceUrl}/control/${input.controlId}?company_id=${input.companyId}`,
        { headers: { Authorization: `Bearer ${input.token}` } },
      );
      if (!res.ok) return null;
      const body = (await res.json()) as { status?: string; effectiveness?: string };
      const effective =
        body.status === 'active' || body.effectiveness === 'effective' || body.status === 'implemented';
      return { effective };
    } catch (err) {
      logger.warn('hazard control service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },
};
