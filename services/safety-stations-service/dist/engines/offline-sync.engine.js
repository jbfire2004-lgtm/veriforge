"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineSyncEngine = exports.OfflineSyncEngine = void 0;
const client_1 = require("@prisma/client");
const station_repository_1 = require("../models/station.repository");
const station_service_1 = require("../services/station.service");
const logger_1 = require("../utils/logger");
class OfflineSyncEngine {
    async processAction(input) {
        const { action, stationId, companyId, token } = input;
        const { clientSyncId } = action;
        const existing = await station_repository_1.stationRepository.findOfflineSync(stationId, clientSyncId);
        if (existing?.status === client_1.OfflineSyncStatus.synced) {
            return {
                clientSyncId,
                ok: true,
                action: action.action,
                duplicate: true,
            };
        }
        try {
            let result;
            switch (action.action) {
                case 'heartbeat':
                    result = await this.handleHeartbeat(companyId, stationId, action);
                    break;
                case 'validate_worker':
                    result = await this.handleValidateWorker(companyId, stationId, token, action);
                    break;
                case 'validate_equipment':
                    result = await this.handleValidateEquipment(companyId, stationId, token, action);
                    break;
                case 'muster_checkin':
                    result = await this.handleMusterCheckin(companyId, stationId, action);
                    break;
                case 'access_log':
                    result = await this.handleAccessLog(stationId, action);
                    break;
                default:
                    result = {
                        clientSyncId,
                        ok: false,
                        action: action.action,
                        error: `Unknown action: ${action.action}`,
                    };
            }
            await station_repository_1.stationRepository.upsertOfflineSync({
                stationId,
                companyId,
                clientSyncId,
                action: action.action,
                payload: action.payload,
                status: result.ok ? client_1.OfflineSyncStatus.synced : client_1.OfflineSyncStatus.failed,
                result: result,
            });
            return result;
        }
        catch (err) {
            const message = err instanceof Error ? err.message : String(err);
            logger_1.logger.error('offline sync failed', { clientSyncId, action: action.action, error: message });
            await station_repository_1.stationRepository.upsertOfflineSync({
                stationId,
                companyId,
                clientSyncId,
                action: action.action,
                payload: action.payload,
                status: client_1.OfflineSyncStatus.failed,
                result: { error: message },
            });
            return { clientSyncId, ok: false, action: action.action, error: message };
        }
    }
    async handleHeartbeat(companyId, stationId, action) {
        const p = action.payload;
        await station_service_1.stationService.heartbeat({
            companyId,
            stationId,
            firmwareVersion: p.firmware_version,
            recordedAt: p.recorded_at,
        });
        return { clientSyncId: action.clientSyncId, ok: true, action: action.action };
    }
    async handleValidateWorker(companyId, stationId, token, action) {
        const p = action.payload;
        const result = await station_service_1.stationService.validateWorker({
            companyId,
            stationId,
            workerId: p.worker_id,
            requiredJhaIds: p.required_jha_ids,
            workerContext: p.worker_context,
            recordedAt: p.recorded_at,
        }, token);
        return {
            clientSyncId: action.clientSyncId,
            ok: result.granted,
            action: action.action,
            error: result.granted ? undefined : result.reason,
        };
    }
    async handleValidateEquipment(companyId, stationId, token, action) {
        const p = action.payload;
        const result = await station_service_1.stationService.validateEquipment({
            companyId,
            stationId,
            equipmentId: p.equipment_id,
            equipmentContext: p.equipment_context,
            recordedAt: p.recorded_at,
        }, token);
        return {
            clientSyncId: action.clientSyncId,
            ok: result.granted,
            action: action.action,
            error: result.granted ? undefined : result.reason,
        };
    }
    async handleMusterCheckin(companyId, stationId, action) {
        const p = action.payload;
        await station_service_1.stationService.musterCheckin({
            companyId,
            stationId,
            workerId: p.worker_id,
            musterPoint: p.muster_point,
            notes: p.notes,
            checkedInAt: p.checked_in_at,
        });
        return { clientSyncId: action.clientSyncId, ok: true, action: action.action };
    }
    async handleAccessLog(stationId, action) {
        const p = action.payload;
        await station_repository_1.stationRepository.createAccessLog({
            stationId,
            workerId: p.worker_id,
            equipmentId: p.equipment_id,
            result: p.result === 'granted' ? client_1.AccessLogResult.granted : client_1.AccessLogResult.denied,
            reason: p.reason,
            timestamp: p.timestamp ? new Date(p.timestamp) : undefined,
        });
        return { clientSyncId: action.clientSyncId, ok: true, action: action.action };
    }
}
exports.OfflineSyncEngine = OfflineSyncEngine;
exports.offlineSyncEngine = new OfflineSyncEngine();
