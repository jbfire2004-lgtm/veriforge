import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const trainingDataRepository = {
  createMany(
    rows: Array<{
      companyId: string;
      modelId: string;
      version: number;
      datasetReference: string;
      featureSet: unknown;
      labelSet?: unknown;
      sourceEvent?: string;
      anomalyFlag: boolean;
      qualityScore: number;
    }>,
  ) {
    if (rows.length === 0) return Promise.resolve({ count: 0 });
    return prisma.cailTrainingData.createMany({ data: rows.map((r) => ({
      companyId: r.companyId,
      modelId: r.modelId,
      version: r.version,
      datasetReference: r.datasetReference,
      featureSet: json(r.featureSet),
      labelSet: r.labelSet !== undefined ? json(r.labelSet) : undefined,
      sourceEvent: r.sourceEvent,
      anomalyFlag: r.anomalyFlag,
      qualityScore: r.qualityScore,
    })) });
  },

  countByCompany(companyId: string) {
    return prisma.cailTrainingData.count({ where: { companyId } });
  },

  countAnomalies(companyId: string) {
    return prisma.cailTrainingData.count({ where: { companyId, anomalyFlag: true } });
  },

  groupByModel(companyId: string) {
    return prisma.cailTrainingData.groupBy({
      by: ['modelId', 'version'],
      where: { companyId },
      _count: { _all: true },
    });
  },

  groupByDataset(companyId: string) {
    return prisma.cailTrainingData.groupBy({
      by: ['datasetReference'],
      where: { companyId },
      _count: { _all: true },
    });
  },

  groupBySourceEvent(companyId: string) {
    return prisma.cailTrainingData.groupBy({
      by: ['sourceEvent'],
      where: { companyId, sourceEvent: { not: null } },
      _count: { _all: true },
    });
  },

  lastCreatedAt(companyId: string) {
    return prisma.cailTrainingData.findFirst({
      where: { companyId },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
  },
};
