"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncEngine = exports.OfflineSyncEngine = void 0;
const jha_service_1 = require("../services/jha.service");
const jha_repository_1 = require("../models/jha.repository");
const logger_1 = require("../utils/logger");
class OfflineSyncEngine {
    async processAction(input) {
        const { action, deviceId, companyId, userId } = input;
        const { clientSyncId } = action;
        const existing = await jha_repository_1.jhaRepository.findOfflineSync(deviceId, clientSyncId);
        if (existing?.status === 'synced') {
            const result = existing.result;
            return {
                clientSyncId,
                ok: true,
                action: action.action,
                jhaId: result?.jhaId,
                duplicate: true,
            };
        }
        try {
            let result;
            switch (action.action) {
                case 'create_jha':
                    result = await this.handleCreateJha(companyId, userId, action);
                    break;
                case 'add_hazards':
                    result = await this.handleAddHazards(companyId, action);
                    break;
                case 'add_controls':
                    result = await this.handleAddControls(companyId, action);
                    break;
                case 'sign':
                    result = await this.handleSign(companyId, userId, action);
                    break;
                case 'approve':
                    result = await this.handleApprove(companyId, userId, action);
                    break;
                default:
                    result = {
                        clientSyncId,
                        ok: false,
                        action: action.action,
                        error: `Unknown action: ${action.action}`,
                    };
            }
            await jha_repository_1.jhaRepository.upsertOfflineSync({
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
            await jha_repository_1.jhaRepository.upsertOfflineSync({
                companyId,
                deviceId,
                clientSyncId,
                action: action.action,
                payload: action.payload,
                status: 'failed',
                result: { error: message },
            });
            return {
                clientSyncId,
                ok: false,
                action: action.action,
                error: message,
            };
        }
    }
    async handleCreateJha(companyId, userId, action) {
        const p = action.payload;
        const jha = await jha_service_1.jhaService.createJha({
            companyId,
            projectId: p.project_id,
            title: p.title,
            description: p.description,
            createdBy: userId,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            jhaId: jha.id,
        };
    }
    async handleAddHazards(companyId, action) {
        const p = action.payload;
        const jhaId = p.jha_id;
        const hazards = p.hazards;
        await jha_service_1.jhaService.addHazards({ jhaId, companyId, hazards });
        return { clientSyncId: action.clientSyncId, ok: true, action: action.action, jhaId };
    }
    async handleAddControls(companyId, action) {
        const p = action.payload;
        const jhaId = p.jha_id;
        const controls = p.controls;
        await jha_service_1.jhaService.addControls({ jhaId, companyId, controls });
        return { clientSyncId: action.clientSyncId, ok: true, action: action.action, jhaId };
    }
    async handleSign(companyId, userId, action) {
        const p = action.payload;
        const jhaId = p.jha_id;
        await jha_service_1.jhaService.signJha({
            jhaId,
            companyId,
            workerId: p.worker_id ?? userId,
            signatureBlob: p.signature_blob,
        });
        return { clientSyncId: action.clientSyncId, ok: true, action: action.action, jhaId };
    }
    async handleApprove(companyId, userId, action) {
        const p = action.payload;
        const jhaId = p.jha_id;
        await jha_service_1.jhaService.approveJha({
            jhaId,
            companyId,
            approvedBy: userId,
            approved: p.approved !== false,
            notes: p.notes,
        });
        return { clientSyncId: action.clientSyncId, ok: true, action: action.action, jhaId };
    }
}
exports.OfflineSyncEngine = OfflineSyncEngine;
exports.offlineSyncEngine = new OfflineSyncEngine();
