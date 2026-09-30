import { Prisma, WorkPermitStatus, PermitType } from '@prisma/client';
import { prisma } from '../db/prisma';

const permitInclude = {
  approvals: { orderBy: { approvedAt: 'desc' as const } },
  safetyRequirements: { orderBy: { checkedAt: 'desc' as const } },
} as const;

export type PermitWithRelations = Prisma.WorkPermitGetPayload<{ include: typeof permitInclude }>;

export const permitRepository = {
  create(data: {
    companyId: string;
    projectId: string;
    workPackageId?: string;
    pmTaskId?: string;
    permitType: PermitType;
    title: string;
    description?: string;
    location?: string;
    status?: WorkPermitStatus;
    requestedBy: string;
    workerId?: string;
    jhaId?: string;
    hazardId?: string;
    controlId?: string;
    equipmentId?: string;
    validFrom?: Date;
    validTo?: Date;
  }) {
    return prisma.workPermit.create({ data, include: permitInclude });
  },

  findById(id: string, companyId: string): Promise<PermitWithRelations | null> {
    return prisma.workPermit.findFirst({
      where: { id, companyId },
      include: permitInclude,
    });
  },

  update(
    id: string,
    companyId: string,
    data: Partial<{
      status: WorkPermitStatus;
      validFrom: Date;
      validTo: Date;
      jhaId: string;
      hazardId: string;
      controlId: string;
      equipmentId: string;
      workerId: string;
      pmTaskId: string;
    }>,
  ) {
    return prisma.workPermit.updateMany({ where: { id, companyId }, data });
  },

  addApproval(data: {
    permitId: string;
    approvedBy: string;
    role: string;
    outcome: string;
    notes?: string;
  }) {
    return prisma.permitApproval.create({ data });
  },

  upsertSafetyRequirement(data: {
    permitId: string;
    requirementType: string;
    linkedId?: string;
    satisfied: boolean;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.permitSafetyRequirement.upsert({
      where: {
        permitId_requirementType: {
          permitId: data.permitId,
          requirementType: data.requirementType,
        },
      },
      create: {
        permitId: data.permitId,
        requirementType: data.requirementType,
        linkedId: data.linkedId,
        satisfied: data.satisfied,
        metadata: data.metadata ?? {},
      },
      update: {
        linkedId: data.linkedId,
        satisfied: data.satisfied,
        metadata: data.metadata ?? {},
        checkedAt: new Date(),
      },
    });
  },

  findOfflineSync(deviceId: string, clientSyncId: string) {
    return prisma.permitOfflineSync.findUnique({
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
    return prisma.permitOfflineSync.upsert({
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

  reload(id: string, companyId: string): Promise<PermitWithRelations | null> {
    return this.findById(id, companyId);
  },
};
