import { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const explainabilityRepository = {
  create(data: {
    companyId: string;
    predictionId?: string;
    explanationText: string;
    contributingData: unknown;
  }) {
    return prisma.cailExplainability.create({
      data: {
        companyId: data.companyId,
        predictionId: data.predictionId,
        explanationText: data.explanationText,
        contributingData: json(data.contributingData),
      },
    });
  },

  findById(id: string, companyId: string) {
    return prisma.cailExplainability.findFirst({ where: { id, companyId } });
  },

  findLatestByPredictionId(predictionId: string, companyId: string) {
    return prisma.cailExplainability.findFirst({
      where: { predictionId, companyId },
      orderBy: { createdAt: 'desc' },
    });
  },
};
