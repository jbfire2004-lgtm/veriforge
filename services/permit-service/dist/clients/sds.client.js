"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sdsClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.sdsClient = {
    async getWorkerSds(input) {
        if (!env_1.env.sdsServiceUrl)
            return null;
        try {
            const url = `${env_1.env.sdsServiceUrl}/worker/${input.workerId}?company_id=${input.companyId}`;
            const res = await fetch(url, {
                headers: { Authorization: `Bearer ${input.token}` },
            });
            if (!res.ok) {
                logger_1.logger.warn('sds worker fetch failed', { workerId: input.workerId, status: res.status });
                return null;
            }
            const body = (await res.json());
            const pendingCount = body.pendingCount ?? body.pending ?? 0;
            const acknowledged = body.allAcknowledged ?? body.acknowledged ?? pendingCount === 0;
            return { acknowledged, pendingCount };
        }
        catch (err) {
            logger_1.logger.warn('sds service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
