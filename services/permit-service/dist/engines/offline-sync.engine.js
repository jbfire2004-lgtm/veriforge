"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncEngine = exports.OfflineSyncEngine = void 0;
const permit_service_1 = require("../services/permit.service");
const permit_repository_1 = require("../models/permit.repository");
const logger_1 = require("../utils/logger");
class OfflineSyncEngine {
    async processAction(input) {
        const { action, deviceId, companyId, userId, token } = input;
        const { clientSyncId } = action;
        const existing = await permit_repository_1.permitRepository.findOfflineSync(deviceId, clientSyncId);
        if (existing?.status === 'synced') {
            const result = existing.result;
            return {
                clientSyncId,
                ok: true,
                action: action.action,
                permitId: result?.permitId,
                duplicate: true,
            };
        }
        try {
            let result;
            switch (action.action) {
                case 'create':
                    result = await this.handleCreate(companyId, userId, action);
                    break;
                case 'request_approval':
                    result = await this.handleRequestApproval(companyId, token, action);
                    break;
                case 'approve':
                    result = await this.handleApprove(companyId, userId, token, action);
                    break;
                case 'activate':
                    result = await this.handleActivate(companyId, token, action);
                    break;
                case 'suspend':
                    result = await this.handleSuspend(companyId, action);
                    break;
                case 'close':
                    result = await this.handleClose(companyId, action);
                    break;
                default:
                    result = {
                        clientSyncId,
                        ok: false,
                        action: action.action,
                        error: `Unknown action: ${action.action}`,
                    };
            }
            await permit_repository_1.permitRepository.upsertOfflineSync({
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
            await permit_repository_1.permitRepository.upsertOfflineSync({
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
        const permit = await permit_service_1.permitService.create({
            companyId,
            projectId: p.project_id,
            workPackageId: p.work_package_id,
            pmTaskId: p.pm_task_id,
            permitType: p.permit_type ?? 'general',
            title: p.title,
            description: p.description,
            location: p.location,
            requestedBy: userId,
            workerId: p.worker_id,
            jhaId: p.jha_id,
            hazardId: p.hazard_id,
            controlId: p.control_id,
            equipmentId: p.equipment_id,
            validFrom: p.valid_from,
            validTo: p.valid_to,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            permitId: permit.id,
        };
    }
    async handleRequestApproval(companyId, token, action) {
        const p = action.payload;
        const permit = await permit_service_1.permitService.requestApproval({
            permitId: p.permit_id,
            companyId,
            token,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            permitId: permit.id,
        };
    }
    async handleApprove(companyId, userId, token, action) {
        const p = action.payload;
        const permit = await permit_service_1.permitService.approve({
            permitId: p.permit_id,
            companyId,
            approvedBy: userId,
            role: p.role ?? 'supervisor',
            outcome: p.outcome ?? 'approved',
            notes: p.notes,
            token,
            verifierRoles: p.verifier_roles ?? ['supervisor'],
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            permitId: permit.id,
        };
    }
    async handleActivate(companyId, token, action) {
        const p = action.payload;
        const permit = await permit_service_1.permitService.activate({
            permitId: p.permit_id,
            companyId,
            token,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            permitId: permit.id,
        };
    }
    async handleSuspend(companyId, action) {
        const p = action.payload;
        const permit = await permit_service_1.permitService.suspend({
            permitId: p.permit_id,
            companyId,
            reason: p.reason,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            permitId: permit.id,
        };
    }
    async handleClose(companyId, action) {
        const p = action.payload;
        const permit = await permit_service_1.permitService.close({
            permitId: p.permit_id,
            companyId,
            notes: p.notes,
        });
        return {
            clientSyncId: action.clientSyncId,
            ok: true,
            action: action.action,
            permitId: permit.id,
        };
    }
}
exports.OfflineSyncEngine = OfflineSyncEngine;
exports.offlineSyncEngine = new OfflineSyncEngine();
