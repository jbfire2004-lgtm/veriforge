"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stationService = void 0;
const client_1 = require("@prisma/client");
const safety_clients_1 = require("../clients/safety.clients");
const station_engine_1 = require("../engines/station.engine");
const station_repository_1 = require("../models/station.repository");
const errors_1 = require("../utils/errors");
const offline_sync_engine_1 = require("../engines/offline-sync.engine");
const logger_1 = require("../utils/logger");
function mapStation(s) {
    if (!s)
        return null;
    const stale = station_engine_1.heartbeatEngine.isStale(s.lastHeartbeat);
    return {
        id: s.id,
        companyId: s.companyId,
        projectId: s.projectId,
        stationType: s.stationType,
        hardwareId: s.hardwareId,
        firmwareVersion: s.firmwareVersion,
        location: s.location,
        zoneId: s.zoneId,
        status: stale && s.status === client_1.StationStatus.online ? client_1.StationStatus.offline : s.status,
        emergencyMode: s.emergencyMode,
        lastHeartbeat: s.lastHeartbeat?.toISOString() ?? null,
        heartbeatStale: stale,
    };
}
async function requireStation(stationId, companyId) {
    const station = await station_repository_1.stationRepository.findStation(stationId, companyId);
    if (!station)
        throw new errors_1.NotFoundError('Station not found');
    return station;
}
exports.stationService = {
    async register(input) {
        const station = await station_repository_1.stationRepository.upsertStation(input);
        logger_1.logger.info('station registered', { stationId: station.id, hardwareId: input.hardwareId });
        return mapStation(station);
    },
    async heartbeat(input) {
        const station = await requireStation(input.stationId, input.companyId);
        const heartbeatAt = input.recordedAt ? new Date(input.recordedAt) : new Date();
        const status = station_engine_1.heartbeatEngine.resolveStatus(heartbeatAt, station.status, Boolean(station.emergencyMode && station.emergencyMode !== client_1.EmergencyModeType.all_clear));
        await station_repository_1.stationRepository.updateHeartbeat(input.stationId, input.companyId, {
            firmwareVersion: input.firmwareVersion,
            status,
            lastHeartbeat: heartbeatAt,
        });
        const updated = await station_repository_1.stationRepository.findStation(input.stationId, input.companyId);
        return mapStation(updated);
    },
    async validateWorker(input, token) {
        const station = await requireStation(input.stationId, input.companyId);
        if (station_engine_1.heartbeatEngine.isStale(station.lastHeartbeat)) {
            throw new errors_1.BadRequestError('Station offline — heartbeat stale');
        }
        const worker = await safety_clients_1.safetyClients.fetchWorkerContext(input.workerId, input.companyId, token, input.workerContext);
        if (input.requiredJhaIds?.length && envHasJhaService()) {
            for (const jhaId of input.requiredJhaIds) {
                const valid = await safety_clients_1.safetyClients.validateJha(jhaId, input.workerId, input.companyId, token);
                if (!valid && !(worker.signedJhaIds ?? []).includes(jhaId)) {
                    worker.signedJhaIds = worker.signedJhaIds ?? [];
                }
                else if (valid) {
                    worker.signedJhaIds = [...(worker.signedJhaIds ?? []), jhaId];
                }
            }
        }
        const checks = station_engine_1.workerValidationEngine.evaluate(worker, input.requiredJhaIds ?? [], station.emergencyMode);
        const decision = station_engine_1.safetyGatingEngine.aggregate(checks);
        const log = await station_repository_1.stationRepository.createAccessLog({
            stationId: input.stationId,
            workerId: input.workerId,
            result: decision.granted ? client_1.AccessLogResult.granted : client_1.AccessLogResult.denied,
            reason: decision.reason,
            timestamp: input.recordedAt ? new Date(input.recordedAt) : undefined,
        });
        return {
            granted: decision.granted,
            reason: decision.reason,
            gates: decision.failedGates,
            logId: log.id,
        };
    },
    async validateEquipment(input, token) {
        const station = await requireStation(input.stationId, input.companyId);
        if (station_engine_1.heartbeatEngine.isStale(station.lastHeartbeat)) {
            throw new errors_1.BadRequestError('Station offline — heartbeat stale');
        }
        const equipment = await safety_clients_1.safetyClients.fetchEquipmentContext(input.equipmentId, input.companyId, token, input.equipmentContext);
        const checks = station_engine_1.equipmentValidationEngine.evaluate(equipment, station.emergencyMode);
        const decision = station_engine_1.safetyGatingEngine.aggregate(checks);
        const log = await station_repository_1.stationRepository.createAccessLog({
            stationId: input.stationId,
            equipmentId: input.equipmentId,
            result: decision.granted ? client_1.AccessLogResult.granted : client_1.AccessLogResult.denied,
            reason: decision.reason,
            timestamp: input.recordedAt ? new Date(input.recordedAt) : undefined,
        });
        return {
            granted: decision.granted,
            reason: decision.reason,
            gates: decision.failedGates,
            logId: log.id,
        };
    },
    async musterCheckin(input) {
        await requireStation(input.stationId, input.companyId);
        const checkin = await station_repository_1.stationRepository.createMusterCheckin({
            stationId: input.stationId,
            workerId: input.workerId,
            musterPoint: input.musterPoint,
            notes: input.notes,
            checkedInAt: input.checkedInAt ? new Date(input.checkedInAt) : undefined,
        });
        await station_repository_1.stationRepository.createAccessLog({
            stationId: input.stationId,
            workerId: input.workerId,
            result: client_1.AccessLogResult.granted,
            reason: `Muster check-in at ${input.musterPoint}`,
            timestamp: checkin.checkedInAt,
        });
        return {
            id: checkin.id,
            stationId: checkin.stationId,
            workerId: checkin.workerId,
            musterPoint: checkin.musterPoint,
            checkedInAt: checkin.checkedInAt.toISOString(),
            notes: checkin.notes,
        };
    },
    async setEmergencyMode(input) {
        if (input.stationId) {
            const station = await requireStation(input.stationId, input.companyId);
            const status = input.mode === client_1.EmergencyModeType.all_clear
                ? client_1.StationStatus.online
                : client_1.StationStatus.emergency;
            await station_repository_1.stationRepository.setEmergencyMode(input.stationId, input.companyId, input.mode === client_1.EmergencyModeType.all_clear ? null : input.mode, status);
            const updated = await station_repository_1.stationRepository.findStation(input.stationId, input.companyId);
            return { scope: 'station', station: mapStation(updated) };
        }
        if (input.projectId) {
            await station_repository_1.stationRepository.setProjectEmergencyMode(input.companyId, input.projectId, input.mode === client_1.EmergencyModeType.all_clear ? null : input.mode);
            return { scope: 'project', projectId: input.projectId, mode: input.mode };
        }
        throw new errors_1.BadRequestError('station_id or project_id required for emergency mode');
    },
    async offlineSync(input) {
        await requireStation(input.stationId, input.companyId);
        const results = [];
        for (const action of input.actions) {
            const result = await offline_sync_engine_1.offlineSyncEngine.processAction({
                stationId: input.stationId,
                companyId: input.companyId,
                token: input.token,
                action,
            });
            results.push(result);
        }
        const synced = results.filter((r) => r.ok).length;
        return { results, synced, failed: results.length - synced };
    },
};
function envHasJhaService() {
    return Boolean(process.env.JHA_SERVICE_URL);
}
