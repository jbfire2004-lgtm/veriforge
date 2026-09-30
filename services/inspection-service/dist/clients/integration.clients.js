"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.integrationClients = void 0;
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
exports.integrationClients = {
    async createCorrectiveAction(input) {
        if (!env_1.env.correctiveActionServiceUrl)
            return { created: false };
        try {
            const res = await fetch(`${env_1.env.correctiveActionServiceUrl}`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${input.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_id: input.companyId,
                    project_id: input.projectId,
                    source_type: 'inspection',
                    source_id: input.sourceId,
                    action_type: 'permanent',
                    title: input.title,
                    description: input.description,
                    severity: input.severity ?? 'medium',
                    hazard_id: input.hazardId,
                    control_id: input.controlId,
                    equipment_id: input.equipmentId,
                    worker_id: input.workerId,
                    publish: true,
                }),
            });
            if (!res.ok) {
                logger_1.logger.warn('corrective action create failed', { status: res.status });
                return { created: false };
            }
            const body = (await res.json());
            return { id: body.id, created: true };
        }
        catch (err) {
            logger_1.logger.warn('corrective action service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return { created: false };
        }
    },
    async getHazard(input) {
        if (!env_1.env.hazardControlServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.hazardControlServiceUrl}/hazard/${input.hazardId}?company_id=${input.companyId}`, { headers: { Authorization: `Bearer ${input.token}` } });
            if (!res.ok)
                return null;
            const body = (await res.json());
            return {
                active: body.status !== 'closed' && body.status !== 'mitigated',
                severity: body.severity,
            };
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
            return {
                effective: body.status === 'active' || body.effectiveness === 'effective',
            };
        }
        catch (err) {
            logger_1.logger.warn('hazard control service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
    async getEquipmentSafety(input) {
        if (!env_1.env.equipmentSafetyServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.equipmentSafetyServiceUrl}/${input.equipmentId}/score?company_id=${input.companyId}`, { headers: { Authorization: `Bearer ${input.token}` } });
            if (!res.ok)
                return null;
            const body = (await res.json());
            const safe = body.safetyStatus !== 'UNSAFE' && body.lockoutStatus !== 'LOCKED';
            return { safe, score: body.score, lockoutActive: body.lockoutStatus === 'LOCKED' };
        }
        catch (err) {
            logger_1.logger.warn('equipment safety service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
};
