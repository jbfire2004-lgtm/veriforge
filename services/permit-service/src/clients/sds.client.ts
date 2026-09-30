import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface WorkerSdsSnapshot {
  acknowledged: boolean;
  pendingCount: number;
}

export const sdsClient = {
  async getWorkerSds(input: {
    workerId: string;
    companyId: string;
    token: string;
  }): Promise<WorkerSdsSnapshot | null> {
    if (!env.sdsServiceUrl) return null;

    try {
      const url = `${env.sdsServiceUrl}/worker/${input.workerId}?company_id=${input.companyId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${input.token}` },
      });
      if (!res.ok) {
        logger.warn('sds worker fetch failed', { workerId: input.workerId, status: res.status });
        return null;
      }
      const body = (await res.json()) as {
        allAcknowledged?: boolean;
        acknowledged?: boolean;
        pendingCount?: number;
        pending?: number;
      };
      const pendingCount = body.pendingCount ?? body.pending ?? 0;
      const acknowledged = body.allAcknowledged ?? body.acknowledged ?? pendingCount === 0;
      return { acknowledged, pendingCount };
    } catch (err) {
      logger.warn('sds service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },
};
