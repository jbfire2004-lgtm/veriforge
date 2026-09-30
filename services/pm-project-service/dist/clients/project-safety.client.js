"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectSafetyClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.projectSafetyClient = {
    async fetchProjectSafetyScore(projectId, companyId, token) {
        if (!env_1.env.projectSafetyServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.projectSafetyServiceUrl}/project/safety/${projectId}?company_id=${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok)
                return null;
            const body = (await res.json());
            return body.score ?? body.safetyScore ?? null;
        }
        catch (err) {
            logger_1.logger.warn('project safety service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
