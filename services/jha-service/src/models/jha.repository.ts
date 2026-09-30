import { Prisma, JhaStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

const jhaInclude = {
  hazards: true,
  controls: true,
  signatures: true,
} as const;

export type JhaWithRelations = Prisma.JhaGetPayload<{ include: typeof jhaInclude }>;

export const jhaRepository = {
  createJha(data: {
    companyId: string;
    projectId: string;
    title: string;
    description?: string;
    createdBy: string;
  }) {
    return prisma.jha.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        title: data.title,
        description: data.description,
        createdBy: data.createdBy,
      },
      include: jhaInclude,
    });
  },

  findJha(id: string, companyId: string): Promise<JhaWithRelations | null> {
    return prisma.jha.findFirst({
      where: { id, companyId },
      include: jhaInclude,
    });
  },

  updateJha(
    id: string,
    companyId: string,
    data: Partial<{
      title: string;
      description: string;
      status: JhaStatus;
      riskScore: number;
      sifScore: number;
      hecaCategory: string;
      version: number;
      approvedBy: string | null;
    }>,
  ) {
    return prisma.jha.updateMany({
      where: { id, companyId },
      data,
    });
  },

  addHazard(data: {
    jhaId: string;
    hazardId: string;
    severity: number;
    likelihood: number;
    sifPotential: boolean;
    hecaCategory: string;
  }) {
    return prisma.jhaHazard.create({ data });
  },

  addControl(data: {
    jhaId: string;
    controlId: string;
    controlStrength: number;
  }) {
    return prisma.jhaControl.create({ data });
  },

  addSignature(data: {
    jhaId: string;
    workerId: string;
    signatureBlob: string;
    signedAt?: Date;
  }) {
    return prisma.jhaSignature.create({
      data: {
        jhaId: data.jhaId,
        workerId: data.workerId,
        signatureBlob: data.signatureBlob,
        signedAt: data.signedAt ?? new Date(),
      },
    });
  },

  createVersion(data: {
    jhaId: string;
    version: number;
    snapshot: Prisma.InputJsonValue;
  }) {
    return prisma.jhaVersion.create({ data });
  },

  findVersion(jhaId: string, version: number) {
    return prisma.jhaVersion.findUnique({
      where: { jhaId_version: { jhaId, version } },
    });
  },

  findOfflineSync(deviceId: string, clientSyncId: string) {
    return prisma.jhaOfflineSync.findUnique({
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
    return prisma.jhaOfflineSync.upsert({
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

  reloadJha(id: string, companyId: string): Promise<JhaWithRelations | null> {
    return this.findJha(id, companyId);
  },
};
