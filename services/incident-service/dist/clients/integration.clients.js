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
                    source_type: 'incident',
                    source_id: input.sourceId,
                    action_type: 'permanent',
                    title: input.title,
                    description: input.description,
                    severity: input.severity ?? 'high',
                    worker_id: input.workerId,
                    equipment_id: input.equipmentId,
                    sif_linked: input.sifLinked,
                    heca_linked: input.hecaLinked,
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
    async getCorrectiveAction(input) {
        if (!env_1.env.correctiveActionServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.correctiveActionServiceUrl}/${input.correctiveActionId}?company_id=${input.companyId}`, { headers: { Authorization: `Bearer ${input.token}` } });
            if (!res.ok)
                return null;
            return (await res.json());
        }
        catch (err) {
            logger_1.logger.warn('corrective action service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
    async getWorkerScore(input) {
        if (!env_1.env.workerSafetyServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.workerSafetyServiceUrl}/${input.workerId}/score?company_id=${input.companyId}`, { headers: { Authorization: `Bearer ${input.token}` } });
            if (!res.ok)
                return null;
            const body = (await res.json());
            return {
                score: body.score,
                blocked: body.blocked ?? body.accessBlocked,
            };
        }
        catch (err) {
            logger_1.logger.warn('worker safety service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
    async recordWorkerExposure(input) {
        if (!env_1.env.workerSafetyServiceUrl)
            return false;
        try {
            const res = await fetch(`${env_1.env.workerSafetyServiceUrl}/exposure`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${input.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_id: input.companyId,
                    worker_id: input.workerId,
                    hazard_id: input.hazardId,
                    severity: input.severity,
                    likelihood: input.likelihood,
                }),
            });
            return res.ok;
        }
        catch (err) {
            logger_1.logger.warn('worker exposure record failed', {
                error: err instanceof Error ? err.message : String(err),
            });
            return false;
        }
    },
    async hasActiveEmergency(input) {
        if (!env_1.env.emergencyResponseServiceUrl)
            return null;
        try {
            const res = await fetch(`${env_1.env.emergencyResponseServiceUrl}?company_id=${input.companyId}&project_id=${input.projectId}&status=active`, { headers: { Authorization: `Bearer ${input.token}` } });
            if (res.status === 404)
                return false;
            if (!res.ok)
                return null;
            const body = (await res.json());
            if (typeof body.active === 'boolean')
                return body.active;
            if (Array.isArray(body.items))
                return body.items.length > 0;
            if (Array.isArray(body))
                return body.length > 0;
            return false;
        }
        catch (err) {
            logger_1.logger.warn('emergency response service unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return null;
        }
    },
    async declareEmergencyForSif(input) {
        if (!env_1.env.emergencyResponseServiceUrl)
            return { declared: false };
        try {
            const res = await fetch(`${env_1.env.emergencyResponseServiceUrl}/declare`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${input.token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    company_id: input.companyId,
                    project_id: input.projectId,
                    type: 'safety_incident',
                    severity: 'high',
                    description: input.description ?? `SIF-potential incident ${input.incidentId}`,
                }),
            });
            if (!res.ok) {
                logger_1.logger.warn('emergency declare failed', { status: res.status });
                return { declared: false };
            }
            const body = (await res.json());
            return { declared: true, emergencyId: body.id };
        }
        catch (err) {
            logger_1.logger.warn('emergency declare unavailable', {
                error: err instanceof Error ? err.message : String(err),
            });
            return { declared: false };
        }
    },
};
