"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hazardControlClient = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.hazardControlClient = {
    async getHazard(input) {
        if (!env_1.env.hazardControlServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.hazardControlServiceUrl}/hazard/${input.hazardId}?company_id=${input.companyId}`, { headers: { Authorization: `Bearer ${input.token}` } });
            if (!res.ok)
                return null;
            const body = (await res.json());
            const mitigated = body.status === 'mitigated' || body.status === 'closed';
            return { active: !mitigated, mitigated };
        }
        catch (err) {
            logger_1.logger.warn('hazard control service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
    async getControl(input) {
        if (!env_1.env.hazardControlServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.hazardControlServiceUrl}/control/${input.controlId}?company_id=${input.companyId}`, { headers: { Authorization: `Bearer ${input.token}` } });
            if (!res.ok)
                return null;
            const body = (await res.json());
            const effective = body.status === 'active' || body.effectiveness === 'effective' || body.status === 'implemented';
            return { effective };
        }
        catch (err) {
            logger_1.logger.warn('hazard control service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
