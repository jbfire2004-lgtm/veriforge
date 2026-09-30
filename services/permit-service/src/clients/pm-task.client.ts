import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface PmTaskSnapshot {
  exists: boolean;
  status?: string;
  requiresPermit?: boolean;
  activePermits?: string[];
}

export const pmTaskClient = {
  async getTask(input: {
    taskId: string;
    companyId: string;
    token: string;
  }): Promise<PmTaskSnapshot | null> {
    if (!env.pmTaskServiceUrl) return null;

    try {
      const res = await fetch(
        `${env.pmTaskServiceUrl}/${input.taskId}?company_id=${input.companyId}`,
        { headers: { Authorization: `Bearer ${input.token}` } },
      );
      if (!res.ok) {
        logger.warn('pm task fetch failed', { taskId: input.taskId, status: res.status });
        return null;
      }
      const body = (await res.json()) as {
        status?: string;
        requiresPermit?: boolean;
        requires_permit?: boolean;
        activePermits?: string[];
        active_permits?: string[];
      };
      return {
        exists: true,
        status: body.status,
        requiresPermit: body.requiresPermit ?? body.requires_permit,
        activePermits: body.activePermits ?? body.active_permits,
      };
    } catch (err) {
      logger.warn('pm task service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },
};
