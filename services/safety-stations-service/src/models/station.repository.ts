import {
  AccessLogResult,
  EmergencyModeType,
  OfflineSyncStatus,
  Prisma,
  StationStatus,
} from '@prisma/client';
import { prisma } from '../db/prisma';

export const stationRepository = {
  upsertStation(data: {
    companyId: string;
    projectId?: string;
    stationType: string;
    hardwareId: string;
    firmwareVersion?: string;
    location?: string;
    zoneId?: string;
  }) {
    return prisma.safetyStation.upsert({
      where: {
        companyId_hardwareId: {
          companyId: data.companyId,
          hardwareId: data.hardwareId,
        },
      },
      create: {
        ...data,
        status: StationStatus.online,
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

  findStation(id: string, companyId: string) {
    return prisma.safetyStation.findFirst({ where: { id, companyId } });
  },

  findByHardware(hardwareId: string, companyId: string) {
    return prisma.safetyStation.findUnique({
      where: { companyId_hardwareId: { companyId, hardwareId } },
    });
  },

  updateHeartbeat(id: string, companyId: string, data: {
    firmwareVersion?: string;
    status?: StationStatus;
    lastHeartbeat?: Date;
  }) {
    return prisma.safetyStation.updateMany({
      where: { id, companyId },
      data: { ...data, lastHeartbeat: data.lastHeartbeat ?? new Date() },
    });
  },

  setEmergencyMode(
    id: string,
    companyId: string,
    mode: EmergencyModeType | null,
    status: StationStatus,
  ) {
    return prisma.safetyStation.updateMany({
      where: { id, companyId },
      data: { emergencyMode: mode, status },
    });
  },

  setProjectEmergencyMode(companyId: string, projectId: string, mode: EmergencyModeType | null) {
    return prisma.safetyStation.updateMany({
      where: { companyId, projectId },
      data: {
        emergencyMode: mode,
        status: mode && mode !== EmergencyModeType.all_clear ? StationStatus.emergency : StationStatus.online,
      },
    });
  },

  createAccessLog(data: {
    stationId: string;
    workerId?: string;
    equipmentId?: string;
    result: AccessLogResult;
    reason?: string;
    timestamp?: Date;
  }) {
    return prisma.safetyStationAccessLog.create({ data });
  },

  createMusterCheckin(data: {
    stationId: string;
    workerId: string;
    musterPoint: string;
    notes?: string;
    checkedInAt?: Date;
  }) {
    return prisma.musterCheckin.create({ data });
  },

  findOfflineSync(stationId: string, clientSyncId: string) {
    return prisma.stationOfflineSync.findUnique({
      where: { stationId_clientSyncId: { stationId, clientSyncId } },
    });
  },

  upsertOfflineSync(data: {
    stationId: string;
    companyId: string;
    clientSyncId: string;
    action: string;
    payload: Prisma.InputJsonValue;
    status: OfflineSyncStatus;
    result?: Prisma.InputJsonValue;
  }) {
    return prisma.stationOfflineSync.upsert({
      where: {
        stationId_clientSyncId: {
          stationId: data.stationId,
          clientSyncId: data.clientSyncId,
        },
      },
      create: {
        ...data,
        syncedAt: data.status === OfflineSyncStatus.synced ? new Date() : undefined,
      },
      update: {
        action: data.action,
        payload: data.payload,
        status: data.status,
        result: data.result,
        syncedAt: data.status === OfflineSyncStatus.synced ? new Date() : undefined,
      },
    });
  },
};
