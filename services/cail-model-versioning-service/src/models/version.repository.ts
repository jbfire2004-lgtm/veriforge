import { Prisma, ModelVersionStatus } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const versionRepository = {
  create(data: {
    companyId: string;
    modelId: string;
    version: string;
    createdBy: string;
    trainingJobId?: string;
    artifactUri?: string;
    metadata?: unknown;
  }) {
    return prisma.modelVersion.create({
      data: {
        companyId: data.companyId,
        modelId: data.modelId,
        version: data.version,
        createdBy: data.createdBy,
        trainingJobId: data.trainingJobId,
        artifactUri: data.artifactUri,
        metadata: json(data.metadata ?? {}),
      },
    });
  },

  findById(id: string, companyId: string) {
    return prisma.modelVersion.findFirst({ where: { id, companyId } });
  },

  findByModelVersion(companyId: string, modelId: string, version: string) {
    return prisma.modelVersion.findFirst({ where: { companyId, modelId, version } });
  },

  list(companyId: string, modelId?: string, status?: ModelVersionStatus) {
    return prisma.modelVersion.findMany({
      where: {
        companyId,
        ...(modelId ? { modelId } : {}),
        ...(status ? { status } : {}),
      },
      orderBy: { createdAt: 'desc' },
    });
  },

  updateStatus(id: string, companyId: string, status: ModelVersionStatus) {
    return prisma.modelVersion.updateMany({ where: { id, companyId }, data: { status } });
  },

  async retireProduction(companyId: string, modelId: string, excludeId: string) {
    await prisma.modelVersion.updateMany({
      where: {
        companyId,
        modelId,
        status: ModelVersionStatus.production,
        id: { not: excludeId },
      },
      data: { status: ModelVersionStatus.retired },
    });
  },

  recordPromotion(data: {
    companyId: string;
    modelVersionId: string;
    action: string;
    fromStatus: ModelVersionStatus;
    toStatus: ModelVersionStatus;
    performedBy: string;
    reason?: string;
  }) {
    return prisma.modelPromotionHistory.create({
      data: {
        companyId: data.companyId,
        modelVersionId: data.modelVersionId,
        action: data.action,
        fromStatus: data.fromStatus,
        toStatus: data.toStatus,
        performedBy: data.performedBy,
        reason: data.reason,
      },
    });
  },
};
