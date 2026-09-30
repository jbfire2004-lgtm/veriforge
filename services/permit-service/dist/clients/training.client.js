"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.trainingClient = {
    async getWorkerTraining(input) {
        if (!env_1.env.trainingServiceUrl)
            return null;
        try {
            const params = new URLSearchParams({ company_id: input.companyId });
            if (input.role)
                params.set('role', input.role);
            const url = `${env_1.env.trainingServiceUrl}/worker/${input.workerId}?${params}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${input.token}` },
            });
            if (!res.ok) {
                logger_1.logger.warn('training worker fetch failed', { workerId: input.workerId, status: res.status });
                return null;
            }
            const body = (await res.json());
            return {
                compliant: body.compliant ?? (body.expiredCount ?? 0) === 0,
                expiredCount: body.expiredCount ?? 0,
                missingRequired: body.missingRequired ?? [],
            };
        }
        catch (err) {
            logger_1.logger.warn('training service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
