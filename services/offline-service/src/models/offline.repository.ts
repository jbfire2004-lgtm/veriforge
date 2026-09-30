import { OfflineSyncStatus, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

export const offlineRepository = {
  async registerDevice(deviceId: string, companyId: string, userId: string) {
    return prisma.offlineDevice.upsert({
      where: { id: deviceId },
      create: { id: deviceId, companyId, userId },
      update: { lastSyncAt: new Date() },
    });
  },

  async touchDevice(deviceId: string) {
    return prisma.offlineDevice.update({
      where: { id: deviceId },
      data: { lastSyncAt: new Date() },
    });
  },

  async getDevice(deviceId: string, companyId: string) {
    return prisma.offlineDevice.findFirst({ where: { id: deviceId, companyId } });
  },

  async audit(input: {
    deviceId: string;
    companyId?: string;
    eventType: string;
    eventData: Record<string, unknown>;
  }) {
    return prisma.offlineAudit.create({
      data: {
        deviceId: input.deviceId,
        companyId: input.companyId,
        eventType: input.eventType,
        eventData: input.eventData as Prisma.InputJsonValue,
      },
    });
  },

  findCache(deviceId: string, moduleType: string, recordId: string) {
    return prisma.offlineCache.findUnique({
      where: {
        deviceId_moduleType_recordId: { deviceId, moduleType, recordId },
      },
    });
  },

  upsertCache(input: {
    deviceId: string;
    companyId: string;
    moduleType: string;
    recordId: string;
    payload: Record<string, unknown>;
    lastModified: Date;
    syncStatus: OfflineSyncStatus;
    clientVersion?: number;
    errorMessage?: string;
  }) {
    return prisma.offlineCache.upsert({
      where: {
        deviceId_moduleType_recordId: {
          deviceId: input.deviceId,
          moduleType: input.moduleType,
          recordId: input.recordId,
        },
      },
      create: {
        deviceId: input.deviceId,
        companyId: input.companyId,
        moduleType: input.moduleType,
        recordId: input.recordId,
        payload: input.payload as Prisma.InputJsonValue,
        lastModified: input.lastModified,
        syncStatus: input.syncStatus,
        clientVersion: input.clientVersion,
        errorMessage: input.errorMessage,
      },
      update: {
        payload: input.payload as Prisma.InputJsonValue,
        lastModified: input.lastModified,
        syncStatus: input.syncStatus,
        clientVersion: input.clientVersion,
        errorMessage: input.errorMessage,
      },
    });
  },

  createConflict(input: {
    deviceId: string;
    companyId: string;
    moduleType: string;
    recordId: string;
    localValue: Record<string, unknown>;
    serverValue: Record<string, unknown>;
  }) {
    return prisma.offlineConflict.create({
      data: {
        deviceId: input.deviceId,
        companyId: input.companyId,
        moduleType: input.moduleType,
        recordId: input.recordId,
        localValue: input.localValue as Prisma.InputJsonValue,
        serverValue: input.serverValue as Prisma.InputJsonValue,
      },
    });
  },

  findConflict(id: string, companyId: string) {
    return prisma.offlineConflict.findFirst({ where: { id, companyId } });
  },

  resolveConflict(
    id: string,
    data: {
      resolvedValue: Record<string, unknown>;
      resolvedBy: string;
    },
  ) {
    return prisma.offlineConflict.update({
      where: { id },
      data: {
        resolvedValue: data.resolvedValue as Prisma.InputJsonValue,
        resolvedBy: data.resolvedBy,
        resolvedAt: new Date(),
      },
    });
  },

  countOpenConflicts(deviceId: string) {
    return prisma.offlineConflict.count({
      where: { deviceId, resolvedAt: null },
    });
  },

  listOpenConflicts(deviceId: string, companyId: string) {
    return prisma.offlineConflict.findMany({
      where: { deviceId, companyId, resolvedAt: null },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  listDeviceCache(deviceId: string, companyId: string, since?: Date) {
    return prisma.offlineCache.findMany({
      where: {
        deviceId,
        companyId,
        ...(since ? { lastModified: { gte: since } } : {}),
      },
      orderBy: { lastModified: 'desc' },
      take: 200,
    });
  },

  listPendingCache(limit: number) {
    return prisma.offlineCache.findMany({
      where: { syncStatus: OfflineSyncStatus.pending_sync },
      orderBy: { lastModified: 'asc' },
      take: limit,
    });
  },
};
