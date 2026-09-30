"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.trainingClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.trainingClient = {
    async getTrainingJob(companyId, trainingJobId, token) {
        try {
            const res = await fetch(`${env_1.env.trainingServiceUrl}/${trainingJobId}?company_id=${encodeURIComponent(companyId)}`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            if (!res.ok)
                return null;
            return (await res.json());
        }
        catch (err) {
            logger_1.logger.warn('training service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
