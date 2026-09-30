"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pmProjectClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.pmProjectClient = {
    async verifyProject(projectId, companyId, token) {
        if (!env_1.env.pmProjectServiceUrl)
            return true;
        try {
            const res = await fetch(`${env_1.env.pmProjectServiceUrl}/pm/project/${projectId}?company_id=${companyId}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.ok;
        }
        catch (err) {
            logger_1.logger.warn('pm project service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return true;
        }
    },
    async checkProjectSafetyGate(projectId, companyId, token, context) {
        if (!env_1.env.pmProjectServiceUrl)
            return { passed: true };
        try {
            const res = await fetch(`${env_1.env.pmProjectServiceUrl}/pm/project/${projectId}/safety-gate/check`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ company_id: companyId, ...context }),
            });
            const body = (await res.json());
            return { passed: body.passed ?? res.ok, reason: body.reason };
        }
        catch {
            return { passed: true };
        }
    },
};
