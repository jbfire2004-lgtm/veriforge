"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncEngine = exports.OfflineSyncEngine = void 0;
const corrective_action_service_1 = require("../services/corrective-action.service");
const capa_repository_1 = require("../models/capa.repository");
const logger_1 = require("../utils/logger");
class OfflineSyncEngine {
    async processAction(input) {
        const { action, deviceId, companyId, userId } = input;
        const { clientSyncId } = action;
        const existing = await capa_repository_1.capaRepository.findOfflineSync(deviceId, clientSyncId);
        if (existing?.status === 'synced') {
            const result = existing.result;
            return {
                clientSyncId,
                ok: true,
                action: action.action,
                correctiveActionId: result?.correctiveActionId,
                duplicate: true,
            };
        }
        try {
            let result;
            switch (action.action) {
                case 'create':
                    result = await this.handleCreate(companyId, userId, action);
                    break;
                case 'assign':
                    result = await this.handleAssign(companyId, userId, action);
                    break;
                case 'escalate':
                    result = await this.handleEscalate(companyId, action);
                    break;
                case 'verify':
                    result = await this.handleVerify(companyId, userId, action);
                    break;
                case 'add_attachment':
                    result = await this.handleAttachment(companyId, action);
                    break;
                default:
                    result = {
                        clientSyncId,
                        ok: false,
                        action: action.action,
                        error: `Unknown action: ${action.action}`,
                    };
            }
            await capa_repository_1.capaRepository.upsertOfflineSync({
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
            await capa_repository_1.capaRepository.upsertOfflineSync({
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
        const capa = await corrective_action_service_1.correctiveActionService.create({
            companyId,
            projectId: p.project_id,
            sourceType: p.source_type,
            sourceId: p.source_id,
            actionType: p.action_type ?? 'permanent',
            title: p.title,
            description: p.description,
            severity: p.severity ?? 'medium',
            createdBy: userId,
            hazardId: p.hazard_id,
            controlId: p.control_id,
            equipmentId: p.equipment_id,
            workerId: p.worker_id,
            moduleLinks: p.module_links,
            attachments: p.attachments,
            publish: p.publish !== false,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            correctiveActionId: capa.id,
        };
    }
    async handleAssign(companyId, userId, action) {
        const p = action.payload;
        const capa = await corrective_action_service_1.correctiveActionService.assign({
            correctiveActionId: p.corrective_action_id,
            companyId,
            assigneeId: p.assignee_id,
            assignedBy: userId,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            correctiveActionId: capa.id,
        };
    }
    async handleEscalate(companyId, action) {
        const p = action.payload;
        const capa = await corrective_action_service_1.correctiveActionService.escalate({
            correctiveActionId: p.corrective_action_id,
            companyId,
            reason: p.reason,
            level: p.level,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            correctiveActionId: capa.id,
        };
    }
    async handleVerify(companyId, userId, action) {
        const p = action.payload;
        const capa = await corrective_action_service_1.correctiveActionService.verify({
            correctiveActionId: p.corrective_action_id,
            companyId,
            verifiedBy: userId,
            notes: p.notes,
            outcome: p.outcome ?? 'approved',
            verifierRoles: p.verifier_roles ?? ['supervisor'],
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            correctiveActionId: capa.id,
        };
    }
    async handleAttachment(companyId, action) {
        const p = action.payload;
        const capa = await corrective_action_service_1.correctiveActionService.addAttachment({
            correctiveActionId: p.corrective_action_id,
            companyId,
            attachment: {
                fileName: p.file_name,
                mimeType: p.mime_type,
                storageKey: p.storage_key,
                dataUrl: p.data_url,
                phase: p.phase ?? 'evidence',
            },
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            correctiveActionId: capa.id,
        };
    }
}
exports.OfflineSyncEngine = OfflineSyncEngine;
exports.offlineSyncEngine = new OfflineSyncEngine();
