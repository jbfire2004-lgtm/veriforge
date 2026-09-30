import { Prisma, CorrectiveActionStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

const capaInclude = {
  assignments: { orderBy: { assignedAt: 'desc' as const } },
  escalations: { orderBy: { triggeredAt: 'desc' as const } },
  verifications: { orderBy: { verifiedAt: 'desc' as const } },
  attachments: { orderBy: { createdAt: 'desc' as const } },
  moduleLinks: true,
} as const;

export type CapaWithRelations = Prisma.CorrectiveActionGetPayload<{ include: typeof capaInclude }>;

export const capaRepository = {
  create(data: {
    companyId: string;
    projectId: string;
    sourceType: string;
    sourceId: string;
    actionType: string;
    title: string;
    description?: string;
    severity: string;
    priority: string;
    hazardId?: string;
    controlId?: string;
    equipmentId?: string;
    workerId?: string;
    dueDate?: Date;
    status?: CorrectiveActionStatus;
    createdBy: string;
  }) {
    return prisma.correctiveAction.create({
      data,
      include: capaInclude,
    });
  },

  findById(id: string, companyId: string): Promise<CapaWithRelations | null> {
    return prisma.correctiveAction.findFirst({
      where: { id, companyId },
      include: capaInclude,
    });
  },

  update(
    id: string,
    companyId: string,
    data: Partial<{
      status: CorrectiveActionStatus;
      priority: string;
      dueDate: Date;
      escalationLevel: number;
    }>,
  ) {
    return prisma.correctiveAction.updateMany({
      where: { id, companyId },
      data,
    });
  },

  addAssignment(data: {
    correctiveActionId: string;
    assigneeId: string;
    assignedBy: string;
  }) {
    return prisma.correctiveActionAssignment.create({ data });
  },

  addEscalation(data: {
    correctiveActionId: string;
    level: number;
    reason?: string;
  }) {
    return prisma.correctiveActionEscalation.create({ data });
  },

  addVerification(data: {
    correctiveActionId: string;
    verifiedBy: string;
    notes?: string;
    outcome: string;
  }) {
    return prisma.correctiveActionVerification.create({ data });
  },

  addAttachment(data: {
    correctiveActionId: string;
    fileName?: string;
    mimeType?: string;
    storageKey?: string;
    dataUrl?: string;
    phase?: string;
  }) {
    return prisma.correctiveActionAttachment.create({ data });
  },

  addModuleLink(data: {
    correctiveActionId: string;
    moduleType: string;
    linkedId: string;
    metadata?: Prisma.InputJsonValue;
  }) {
    return prisma.correctiveActionModuleLink.create({ data });
  },

  findOfflineSync(deviceId: string, clientSyncId: string) {
    return prisma.correctiveActionOfflineSync.findUnique({
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
    return prisma.correctiveActionOfflineSync.upsert({
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

  reload(id: string, companyId: string): Promise<CapaWithRelations | null> {
    return this.findById(id, companyId);
  },
};
