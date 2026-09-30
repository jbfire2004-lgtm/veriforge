"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.safetyClients = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
async function fetchJson(url, token, init) {
    try {
        const res = await fetch(url, {
            ...init,
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
                ...(init?.headers ?? {}),
            },
        });
        if (!res.ok)
            return null;
        return (await res.json());
    }
    catch (err) {
        logger_1.logger.warn('upstream service unavailable', {
            url,
            error: err instanceof Error ? err.message : String(err),
        });
        return null;
    }
}
exports.safetyClients = {
    async fetchWorkerContext(workerId, companyId, token, inline) {
        if (inline)
            return inline;
        if (!env_1.env.workerSafetyServiceUrl)
            return {};
        const data = await fetchJson(`${env_1.env.workerSafetyServiceUrl}/worker/${workerId}?company_id=${companyId}`, token);
        if (!data)
            return {};
        const now = Date.now();
        return {
            role: data.role,
            safetyScore: data.safetyScore,
            riskLevel: data.riskLevel,
            activeRestrictions: (data.restrictions ?? [])
                .filter((r) => !r.expiryDate || new Date(r.expiryDate).getTime() > now)
                .map((r) => r.restrictionType),
            signedJhaIds: (data.jhaSignatures ?? []).map((j) => j.jhaId),
        };
    },
    async fetchEquipmentContext(equipmentId, companyId, token, inline) {
        if (inline)
            return inline;
        if (!env_1.env.equipmentSafetyServiceUrl)
            return {};
        const data = await fetchJson(`${env_1.env.equipmentSafetyServiceUrl}/equipment/${equipmentId}/score?company_id=${companyId}`, token);
        return data ?? {};
    },
    async validateJha(jhaId, workerId, companyId, token) {
        if (!env_1.env.jhaServiceUrl)
            return true;
        const data = await fetchJson(`${env_1.env.jhaServiceUrl}/safety/jha/${jhaId}?company_id=${companyId}&worker_id=${workerId}`, token);
        return Boolean(data?.signed && data?.approved);
    },
};
