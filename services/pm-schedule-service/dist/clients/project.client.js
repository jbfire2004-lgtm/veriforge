"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.projectClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.projectClient = {
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
};
