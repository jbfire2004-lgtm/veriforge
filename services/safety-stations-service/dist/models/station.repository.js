"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stationRepository = void 0;
const client_1 = require("@prisma/client");
const prisma_1 = require("../db/prisma");
exports.stationRepository = {
    upsertStation(data) {
        return prisma_1.prisma.safetyStation.upsert({
            where: {
                companyId_hardwareId: {
                    companyId: data.companyId,
                    hardwareId: data.hardwareId,
                },
            },
            create: {
                ...data,
                status: client_1.StationStatus.online,
                lastHeartbeat: new Date(),
            },
            update: {
                projectId: data.projectId,
                stationType: data.stationType,
                firmwareVersion: data.firmwareVersion,
                location: data.location,
                zoneId: data.zoneId,
            },
        });
    },
    findStation(id, companyId) {
        return prisma_1.prisma.safetyStation.findFirst({ where: { id, companyId } });
    },
    findByHardware(hardwareId, companyId) {
        return prisma_1.prisma.safetyStation.findUnique({
            where: { companyId_hardwareId: { companyId, hardwareId } },
        });
    },
    updateHeartbeat(id, companyId, data) {
        return prisma_1.prisma.safetyStation.updateMany({
            where: { id, companyId },
            data: { ...data, lastHeartbeat: data.lastHeartbeat ?? new Date() },
        });
    },
    setEmergencyMode(id, companyId, mode, status) {
        return prisma_1.prisma.safetyStation.updateMany({
            where: { id, companyId },
            data: { emergencyMode: mode, status },
        });
    },
    setProjectEmergencyMode(companyId, projectId, mode) {
        return prisma_1.prisma.safetyStation.updateMany({
            where: { companyId, projectId },
            data: {
                emergencyMode: mode,
                status: mode && mode !== client_1.EmergencyModeType.all_clear ? client_1.StationStatus.emergency : client_1.StationStatus.online,
            },
        });
    },
    createAccessLog(data) {
        return prisma_1.prisma.safetyStationAccessLog.create({ data });
    },
    createMusterCheckin(data) {
        return prisma_1.prisma.musterCheckin.create({ data });
    },
    findOfflineSync(stationId, clientSyncId) {
        return prisma_1.prisma.stationOfflineSync.findUnique({
            where: { stationId_clientSyncId: { stationId, clientSyncId } },
        });
    },
    upsertOfflineSync(data) {
        return prisma_1.prisma.stationOfflineSync.upsert({
            where: {
                stationId_clientSyncId: {
                    stationId: data.stationId,
                    clientSyncId: data.clientSyncId,
                },
            },
            create: {
                ...data,
                syncedAt: data.status === client_1.OfflineSyncStatus.synced ? new Date() : undefined,
            },
            update: {
                action: data.action,
                payload: data.payload,
                status: data.status,
                result: data.result,
                syncedAt: data.status === client_1.OfflineSyncStatus.synced ? new Date() : undefined,
            },
        });
    },
};
