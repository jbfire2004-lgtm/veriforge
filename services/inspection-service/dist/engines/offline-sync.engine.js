"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncEngine = exports.OfflineSyncEngine = void 0;
const inspection_service_1 = require("../services/inspection.service");
const inspection_repository_1 = require("../models/inspection.repository");
const logger_1 = require("../utils/logger");
class OfflineSyncEngine {
    async processAction(input) {
        const { action, deviceId, companyId, userId, token } = input;
        const { clientSyncId } = action;
        const existing = await inspection_repository_1.inspectionRepository.findOfflineSync(deviceId, clientSyncId);
        if (existing?.status === 'synced') {
            const result = existing.result;
            return {
                clientSyncId,
                ok: true,
                action: action.action,
                inspectionId: result?.inspectionId,
                duplicate: true,
            };
        }
        try {
            let result;
            switch (action.action) {
                case 'create':
                    result = await this.handleCreate(companyId, userId, action);
                    break;
                case 'update':
                    result = await this.handleUpdate(companyId, action);
                    break;
                case 'submit_findings':
                    result = await this.handleSubmitFindings(companyId, userId, token, action);
                    break;
                case 'complete':
                    result = await this.handleComplete(companyId, userId, token, action);
                    break;
                case 'safety_gate':
                    result = await this.handleSafetyGate(companyId, token, action);
                    break;
                default:
                    result = {
                        clientSyncId,
                        ok: false,
                        action: action.action,
                        error: `Unknown action: ${action.action}`,
                    };
            }
            await inspection_repository_1.inspectionRepository.upsertOfflineSync({
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
            await inspection_repository_1.inspectionRepository.upsertOfflineSync({
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
    async handleCreate(companyId, userId, action) {
        const p = action.payload;
        const inspection = await inspection_service_1.inspectionService.create({
            companyId,
            projectId: p.project_id,
            checklistType: p.checklist_type ?? 'general',
            title: p.title,
            description: p.description,
            checklistItems: p.checklist_items,
            equipmentId: p.equipment_id,
            workerId: p.worker_id,
            inspectorId: p.inspector_id,
            location: p.location,
            scheduledAt: p.scheduled_at,
            createdBy: userId,
            schedule: p.schedule === true,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            inspectionId: inspection.id,
        };
    }
    async handleUpdate(companyId, action) {
        const p = action.payload;
        const inspection = await inspection_service_1.inspectionService.update({
            id: p.inspection_id,
            companyId,
            title: p.title,
            description: p.description,
            checklistItems: p.checklist_items,
            equipmentId: p.equipment_id,
            workerId: p.worker_id,
            inspectorId: p.inspector_id,
            location: p.location,
            scheduledAt: p.scheduled_at,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            inspectionId: inspection.id,
        };
    }
    async handleSubmitFindings(companyId, userId, token, action) {
        const p = action.payload;
        const inspection = await inspection_service_1.inspectionService.submitFindings({
            id: p.inspection_id,
            companyId,
            userId,
            token,
            findings: p.findings,
            autoCreateCapa: p.auto_create_capa !== false,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            inspectionId: inspection.id,
        };
    }
    async handleComplete(companyId, userId, token, action) {
        const p = action.payload;
        const inspection = await inspection_service_1.inspectionService.complete({
            id: p.inspection_id,
            companyId,
            userId,
            token,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            inspectionId: inspection.id,
        };
    }
    async handleSafetyGate(companyId, token, action) {
        const p = action.payload;
        const result = await inspection_service_1.inspectionService.safetyGateCheck({
            id: p.inspection_id,
            companyId,
            token,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            inspectionId: result.inspectionId,
        };
    }
}
exports.OfflineSyncEngine = OfflineSyncEngine;
exports.offlineSyncEngine = new OfflineSyncEngine();
