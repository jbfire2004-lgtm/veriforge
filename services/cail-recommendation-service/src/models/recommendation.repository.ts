import { Prisma, RecommendationType } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const recommendationRepository = {
  createMany(
    rows: Array<{
      companyId: string;
      projectId?: string;
      workerId?: string;
      equipmentId?: string;
      entityType: string;
      entityId: string;
      recommendationType: RecommendationType;
      recommendationText: string;
      evidence: unknown;
      confidence: number;
    }>,
  ) {
    if (rows.length === 0) return Promise.resolve({ count: 0 });
    return prisma.cailRecommendation.createMany({
      data: rows.map((r) => ({
        companyId: r.companyId,
        projectId: r.projectId,
        workerId: r.workerId,
        equipmentId: r.equipmentId,
        entityType: r.entityType,
        entityId: r.entityId,
        recommendationType: r.recommendationType,
        recommendationText: r.recommendationText,
        evidence: json(r.evidence),
        confidence: r.confidence,
      })),
    });
  },

  findByEntity(
    companyId: string,
    entityType: string,
    entityId: string,
    recommendationType?: RecommendationType,
    limit = 50,
  ) {
    return prisma.cailRecommendation.findMany({
      where: {
        companyId,
        entityType,
        entityId,
        ...(recommendationType ? { recommendationType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  },

  async findLatestPerType(companyId: string, entityType: string, entityId: string) {
    const rows = await prisma.cailRecommendation.findMany({
      where: { companyId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    const latest = new Map<RecommendationType, (typeof rows)[0]>();
    for (const row of rows) {
      if (!latest.has(row.recommendationType)) {
        latest.set(row.recommendationType, row);
      }
    }
    return [...latest.values()];
  },
};
