"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pmTaskClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.pmTaskClient = {
    async getTask(input) {
        if (!env_1.env.pmTaskServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.pmTaskServiceUrl}/${input.taskId}?company_id=${input.companyId}`, { headers: { Authorization: `Bearer ${input.token}` } });
            if (!res.ok) {
                logger_1.logger.warn('pm task fetch failed', { taskId: input.taskId, status: res.status });
                return null;
            }
            const body = (await res.json());
            return {
                exists: true,
                status: body.status,
                requiresPermit: body.requiresPermit ?? body.requires_permit,
                activePermits: body.activePermits ?? body.active_permits,
            };
        }
        catch (err) {
            logger_1.logger.warn('pm task service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
