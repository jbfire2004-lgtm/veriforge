import { Prisma, PredictionType } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const predictionRepository = {
  create(data: {
    companyId: string;
    projectId?: string;
    workerId?: string;
    equipmentId?: string;
    entityType: string;
    entityId: string;
    moduleType: string;
    predictionType: PredictionType;
    predictionValue: number;
    confidence: number;
    riskLevel: string;
    factors: string[];
    modelKey: string;
  }) {
    return prisma.cailPrediction.create({
      data: {
        companyId: data.companyId,
        projectId: data.projectId,
        workerId: data.workerId,
        equipmentId: data.equipmentId,
        entityType: data.entityType,
        entityId: data.entityId,
        moduleType: data.moduleType,
        predictionType: data.predictionType,
        predictionValue: data.predictionValue,
        confidence: data.confidence,
        riskLevel: data.riskLevel,
        factors: json(data.factors),
        modelKey: data.modelKey,
      },
    });
  },

  findLatestByEntity(
    companyId: string,
    entityType: string,
    entityId: string,
    predictionType?: PredictionType,
  ) {
    return prisma.cailPrediction.findMany({
      where: {
        companyId,
        entityType,
        entityId,
        ...(predictionType ? { predictionType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: predictionType ? 1 : 20,
    });
  },

  async findLatestPerType(companyId: string, entityType: string, entityId: string) {
    const rows = await prisma.cailPrediction.findMany({
      where: { companyId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });

    const latest = new Map<PredictionType, (typeof rows)[0]>();
    for (const row of rows) {
      if (!latest.has(row.predictionType)) {
        latest.set(row.predictionType, row);
      }
    }
    return [...latest.values()];
  },
};
