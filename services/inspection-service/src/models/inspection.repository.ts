import { Prisma, InspectionStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

const inspectionInclude = {
  findings: { orderBy: { createdAt: 'desc' as const } },
} as const;

export type InspectionWithRelations = Prisma.InspectionGetPayload<{
  include: typeof inspectionInclude;
}>;

export const inspectionRepository = {
  create(data: {
    companyId: string;
    projectId: string;
    checklistId?: string;
    checklistType: string;
    title: string;
    description?: string;
    checklistItems: Prisma.InputJsonValue;
    equipmentId?: string;
    workerId?: string;
    inspectorId?: string;
    location?: string;
    scheduledAt?: Date;
    status?: InspectionStatus;
    passThreshold?: number;
    metadata?: Prisma.InputJsonValue;
    createdBy: string;
  }) {
    return prisma.inspection.create({
      data,
      include: inspectionInclude,
    });
  },

  findById(id: string, companyId: string): Promise<InspectionWithRelations | null> {
    return prisma.inspection.findFirst({
      where: { id, companyId, deletedAt: null },
      include: inspectionInclude,
    });
  },

  list(filters: {
    companyId: string;
    projectId?: string;
    workerId?: string;
    equipmentId?: string;
    status?: InspectionStatus;
    limit?: number;
  }) {
    const where: Prisma.InspectionWhereInput = {
      companyId: filters.companyId,
      deletedAt: null,
    };
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.workerId) where.workerId = filters.workerId;
    if (filters.equipmentId) where.equipmentId = filters.equipmentId;
    if (filters.status) where.status = filters.status;

    return prisma.inspection.findMany({
      where,
      include: inspectionInclude,
      orderBy: { createdAt: 'desc' },
      take: filters.limit ?? 100,
    });
  },

  update(
    id: string,
    companyId: string,
    data: Partial<{
      title: string;
      description: string;
      checklistItems: Prisma.InputJsonValue;
      equipmentId: string;
      workerId: string;
      inspectorId: string;
      location: string;
      scheduledAt: Date;
      startedAt: Date;
      submittedAt: Date;
      completedAt: Date;
      status: InspectionStatus;
      score: number;
      maxScore: number;
      passThreshold: number;
      safetyGatePassed: boolean;
      safetyGateReason: string;
      metadata: Prisma.InputJsonValue;
    }>,
  ) {
    return prisma.inspection.updateMany({
      where: { id, companyId, deletedAt: null },
      data,
    });
  },

  softDelete(id: string, companyId: string) {
    return prisma.inspection.updateMany({
      where: { id, companyId, deletedAt: null },
      data: { deletedAt: new Date(), status: InspectionStatus.closed },
    });
  },

  replaceFindings(
    inspectionId: string,
    findings: Array<{
      itemKey: string;
      findingType: string;
      severity?: string;
      description?: string;
      photoUrl?: string;
      hazardId?: string;
      controlId?: string;
      correctiveActionId?: string;
      metadata?: Prisma.InputJsonValue;
    }>,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.inspectionFinding.deleteMany({ where: { inspectionId } });
      if (findings.length === 0) return [];
      await tx.inspectionFinding.createMany({
        data: findings.map((f) => ({
          inspectionId,
          itemKey: f.itemKey,
          findingType: f.findingType,
          severity: f.severity,
          description: f.description,
          photoUrl: f.photoUrl,
          hazardId: f.hazardId,
          controlId: f.controlId,
          correctiveActionId: f.correctiveActionId,
          metadata: f.metadata ?? {},
        })),
      });
      return tx.inspectionFinding.findMany({
        where: { inspectionId },
        orderBy: { createdAt: 'desc' },
      });
    });
  },

  findOfflineSync(deviceId: string, clientSyncId: string) {
    return prisma.inspectionOfflineSync.findUnique({
      where: { deviceId_clientSyncId: { deviceId, clientSyncId } },
    });
  },

  upsertOfflineSync(data: {
    companyId: string;
    deviceId: string;
    clientSyncId: string;
    action: string;
    payload: Prisma.InputJsonValue;
    status: string;
    result?: Prisma.InputJsonValue;
  }) {
    return prisma.inspectionOfflineSync.upsert({
      where: {
        deviceId_clientSyncId: {
          deviceId: data.deviceId,
          clientSyncId: data.clientSyncId,
        },
      },
      create: {
        companyId: data.companyId,
        deviceId: data.deviceId,
        clientSyncId: data.clientSyncId,
        action: data.action,
        payload: data.payload,
        status: data.status,
        result: data.result,
        syncedAt: data.status === 'synced' ? new Date() : undefined,
      },
      update: {
        status: data.status,
        result: data.result,
        syncedAt: data.status === 'synced' ? new Date() : undefined,
      },
    });
  },

  reload(id: string, companyId: string): Promise<InspectionWithRelations | null> {
    return this.findById(id, companyId);
  },
};
