import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { CapaHookResult, JhaScoreResult } from '../types';

export class CapaHookEngine {
  async trigger(input: {
    jhaId: string;
    companyId: string;
    projectId: string;
    score: JhaScoreResult;
    title: string;
  }): Promise<CapaHookResult> {
    if (!input.score.requireCapa) {
      return { triggered: false };
    }

    if (!env.capaServiceUrl) {
      logger.warn('CAPA hook skipped — CAPA_SERVICE_URL not configured', {
        jhaId: input.jhaId,
      });
      return { triggered: false, error: 'CAPA service not configured' };
    }

    try {
      const res = await fetch(env.capaServiceUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: 'jha-service',
          jha_id: input.jhaId,
          company_id: input.companyId,
          project_id: input.projectId,
          title: `Corrective action for JHA: ${input.title}`,
          priority: input.score.sifPotential ? 'critical' : 'high',
          sif_potential: input.score.sifPotential,
          heca_category: input.score.hecaCategory,
          missing_controls: input.score.missingControls,
          weak_controls: input.score.weakControls,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        logger.error('CAPA hook failed', { jhaId: input.jhaId, status: res.status, text });
        return { triggered: false, error: `CAPA service returned ${res.status}` };
      }

      const body = (await res.json()) as { id?: string; capa_id?: string };
      const capaId = body.capa_id ?? body.id;
      logger.info('CAPA hook triggered', { jhaId: input.jhaId, capaId });
      return { triggered: true, capaId };
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      logger.error('CAPA hook error', { jhaId: input.jhaId, error: message });
      return { triggered: false, error: message };
    }
  }
}

export const capaHookEngine = new CapaHookEngine();
