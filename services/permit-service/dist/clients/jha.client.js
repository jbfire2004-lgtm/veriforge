"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jhaClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.jhaClient = {
    async getScore(input) {
        if (!env_1.env.jhaServiceUrl)
            return null;
        try {
            const url = `${env_1.env.jhaServiceUrl}/${input.jhaId}/score?company_id=${input.companyId}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${input.token}` },
            });
            if (!res.ok) {
                logger_1.logger.warn('jha score fetch failed', { jhaId: input.jhaId, status: res.status });
                return null;
            }
            const body = (await res.json());
            const approved = body.status === 'approved';
            return {
                approved,
                blockSubmission: body.blockSubmission ?? false,
                blockReasons: body.blockReasons ?? [],
                riskScore: body.riskScore,
                status: body.status,
            };
        }
        catch (err) {
            logger_1.logger.warn('jha service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
