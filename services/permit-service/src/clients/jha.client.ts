import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface JhaScoreSnapshot {
  approved: boolean;
  blockSubmission: boolean;
  blockReasons: string[];
  riskScore?: number;
  status?: string;
}

export const jhaClient = {
  async getScore(input: {
    jhaId: string;
    companyId: string;
    token: string;
  }): Promise<JhaScoreSnapshot | null> {
    if (!env.jhaServiceUrl) return null;

    try {
      const url = `${env.jhaServiceUrl}/${input.jhaId}/score?company_id=${input.companyId}`;
      const res = await fetch(url, {
        headers: { Authorization: `Bearer ${input.token}` },
      });
      if (!res.ok) {
        logger.warn('jha score fetch failed', { jhaId: input.jhaId, status: res.status });
        return null;
      }
      const body = (await res.json()) as {
        blockSubmission?: boolean;
        blockReasons?: string[];
        riskScore?: number;
        status?: string;
      };
      const approved = body.status === 'approved';
      return {
        approved,
        blockSubmission: body.blockSubmission ?? false,
        blockReasons: body.blockReasons ?? [],
        riskScore: body.riskScore,
        status: body.status,
      };
    } catch (err) {
      logger.warn('jha service unavailable', {
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  },
};
