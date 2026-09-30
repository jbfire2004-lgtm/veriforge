"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncEngine = exports.OfflineSyncEngine = void 0;
const incident_service_1 = require("../services/incident.service");
const incident_repository_1 = require("../models/incident.repository");
const logger_1 = require("../utils/logger");
class OfflineSyncEngine {
    async processAction(input) {
        const { action, deviceId, companyId, userId, token } = input;
        const { clientSyncId } = action;
        const existing = await incident_repository_1.incidentRepository.findOfflineSync(deviceId, clientSyncId);
        if (existing?.status === 'synced') {
            const result = existing.result;
            return {
                clientSyncId,
                ok: true,
                action: action.action,
                incidentId: result?.incidentId,
                duplicate: true,
            };
        }
        try {
            let result;
            switch (action.action) {
                case 'report':
                    result = await this.handleReport(companyId, userId, action, token);
                    break;
                case 'investigate':
                    result = await this.handleInvestigate(companyId, userId, action);
                    break;
                case 'close':
                    result = await this.handleClose(companyId, userId, action);
                    break;
                case 'link_corrective_action':
                    result = await this.handleLinkCapa(companyId, userId, action, token);
                    break;
                case 'add_witness':
                    result = await this.handleAddWitness(companyId, userId, action);
                    break;
                default:
                    result = {
                        clientSyncId,
                        ok: false,
                        action: action.action,
                        error: `Unknown action: ${action.action}`,
                    };
            }
            await incident_repository_1.incidentRepository.upsertOfflineSync({
                companyId,
                deviceId,
                clientSyncId,
                action: action.action,
                payload: action.payload,
                status: result.ok ? 'synced' : 'failed',
                result: result,
            });
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger_1.logger.error('offline sync action failed', { clientSyncId, action: action.action, error: message });
            await incident_repository_1.incidentRepository.upsertOfflineSync({
                companyId,
                deviceId,
                clientSyncId,
                action: action.action,
                payload: action.payload,
                status: 'failed',
                result: { error: message },
            });
            return { clientSyncId, ok: false, action: action.action, error: message };
        }
    }
    async handleReport(companyId, userId, action, token) {
        const p = action.payload;
        const incident = await incident_service_1.incidentService.report({
            companyId,
            projectId: p.project_id,
            incidentType: p.incident_type ?? 'near_miss',
            title: p.title,
            description: p.description,
            severity: p.severity ?? 'medium',
            location: p.location,
            occurredAt: p.occurred_at ?? new Date().toISOString(),
            latitude: p.latitude,
            longitude: p.longitude,
            workerId: p.worker_id,
            equipmentId: p.equipment_id,
            likelihoodLevel: p.likelihood_level,
            witnesses: p.witnesses,
            reportedBy: userId,
            token,
            autoCreateCapa: p.auto_create_capa === true,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            incidentId: incident.id,
        };
    }
    async handleInvestigate(companyId, userId, action) {
        const p = action.payload;
        const incident = await incident_service_1.incidentService.investigate({
            incidentId: p.incident_id,
            companyId,
            investigatedBy: userId,
            findings: p.findings,
            rootCause: p.root_cause,
            method: p.method,
            recommendations: p.recommendations,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            incidentId: incident.id,
        };
    }
    async handleClose(companyId, userId, action) {
        const p = action.payload;
        const incident = await incident_service_1.incidentService.close({
            incidentId: p.incident_id,
            companyId,
            closedBy: userId,
            closeNotes: p.close_notes,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            incidentId: incident.id,
        };
    }
    async handleLinkCapa(companyId, userId, action, token) {
        const p = action.payload;
        const incident = await incident_service_1.incidentService.linkCorrectiveActions({
            incidentId: p.incident_id,
            companyId,
            linkedBy: userId,
            correctiveActionIds: p.corrective_action_ids ?? [],
            token,
            createIfMissing: p.create_if_missing,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            incidentId: incident.id,
        };
    }
    async handleAddWitness(companyId, userId, action) {
        const p = action.payload;
        const incident = await incident_service_1.incidentService.addWitness({
            incidentId: p.incident_id,
            companyId,
            createdBy: userId,
            name: p.name,
            contact: p.contact,
            workerId: p.worker_id,
            statement: p.statement,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            incidentId: incident.id,
        };
    }
}
exports.OfflineSyncEngine = OfflineSyncEngine;
exports.offlineSyncEngine = new OfflineSyncEngine();
