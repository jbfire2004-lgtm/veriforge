"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.capaHookEngine = exports.CapaHookEngine = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class CapaHookEngine {
    async trigger(input) {
        if (!input.score.requireCapa) {
            return { triggered: false };
        }
        if (!env_1.env.capaServiceUrl) {
            logger_1.logger.warn('CAPA hook skipped — CAPA_SERVICE_URL not configured', {
                jhaId: input.jhaId,
            });
            return { triggered: false, error: 'CAPA service not configured' };
        }
        try {
            const res = await fetch(env_1.env.capaServiceUrl, {
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
                logger_1.logger.error('CAPA hook failed', { jhaId: input.jhaId, status: res.status, text });
                return { triggered: false, error: `CAPA service returned ${res.status}` };
            }
            const body = (await res.json());
            const capaId = body.capa_id ?? body.id;
            logger_1.logger.info('CAPA hook triggered', { jhaId: input.jhaId, capaId });
            return { triggered: true, capaId };
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger_1.logger.error('CAPA hook error', { jhaId: input.jhaId, error: message });
            return { triggered: false, error: message };
        }
    }
}
exports.CapaHookEngine = CapaHookEngine;
exports.capaHookEngine = new CapaHookEngine();
