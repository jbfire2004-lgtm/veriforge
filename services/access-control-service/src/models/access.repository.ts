import { AccessResult, OverrideType, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return (value ?? {}) as Prisma.InputJsonValue;
}

export const accessRepository = {
  findAccessPoint(id: string, companyId: string) {
    return prisma.accessPoint.findFirst({ where: { id, companyId, active: true } });
  },

  upsertAccessPoint(data: {
    id?: string;
    companyId: string;
    projectId?: string;
    zoneId?: string;
    name: string;
    rules?: unknown;
  }) {
    if (data.id) {
      return prisma.accessPoint.upsert({
        where: { id: data.id },
        create: {
          id: data.id,
          companyId: data.companyId,
          projectId: data.projectId,
          zoneId: data.zoneId,
          name: data.name,
          rules: json(data.rules),
        },
        update: {
          projectId: data.projectId,
          zoneId: data.zoneId,
          name: data.name,
          rules: json(data.rules),
        },
      });
    }

    return prisma.accessPoint.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        zoneId: data.zoneId,
        name: data.name,
        rules: json(data.rules),
      },
    });
  },

  findActiveLockouts(companyId: string, projectId?: string | null) {
    return prisma.emergencyLockout.findMany({
      where: {
        companyId,
        active: true,
        OR: [{ projectId: null }, ...(projectId ? [{ projectId }] : [])],
      },
    });
  },

  createAttempt(data: {
    companyId: string;
    accessPointId: string;
    workerId: string;
    equipmentId?: string;
    result: AccessResult;
    reason?: string;
  }) {
    return prisma.accessAttempt.create({ data });
  },

  findAttempt(id: string, companyId: string) {
    return prisma.accessAttempt.findFirst({
      where: { id, companyId },
      include: { overrides: true, accessPoint: true },
    });
  },

  createOverride(data: {
    accessAttemptId: string;
    overrideType: OverrideType;
    approvedBy: string;
    expiry?: Date;
  }) {
    return prisma.accessOverride.create({ data });
  },

  findActiveOverrideForWorker(workerId: string, accessPointId: string, now = new Date()) {
    return prisma.accessOverride.findFirst({
      where: {
        accessAttempt: { workerId, accessPointId },
        OR: [{ expiry: null }, { expiry: { gt: now } }],
      },
      orderBy: { approvedAt: 'desc' },
    });
  },

  listWorkerAttempts(workerId: string, companyId: string, limit = 20) {
    return prisma.accessAttempt.findMany({
      where: { workerId, companyId },
      orderBy: { timestamp: 'desc' },
      take: limit,
      include: { overrides: true },
    });
  },

  listEquipmentAttempts(equipmentId: string, companyId: string, limit = 20) {
    return prisma.accessAttempt.findMany({
      where: { equipmentId, companyId },
      orderBy: { timestamp: 'desc' },
      take: limit,
    });
  },

  countWorkerAttempts(workerId: string, companyId: string) {
    return prisma.accessAttempt.groupBy({
      by: ['result'],
      where: { workerId, companyId },
      _count: { result: true },
    });
  },

  countEquipmentAttempts(equipmentId: string, companyId: string) {
    return prisma.accessAttempt.groupBy({
      by: ['result'],
      where: { equipmentId, companyId },
      _count: { result: true },
    });
  },

  createEmergencyLockout(data: {
    companyId: string;
    projectId?: string;
    reason: string;
    lockedBy: string;
  }) {
    return prisma.emergencyLockout.create({ data });
  },
};
