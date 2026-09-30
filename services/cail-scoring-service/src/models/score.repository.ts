import { Prisma, ScoreType } from '@prisma/client';
import { prisma } from '../db/prisma';

function json(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

export const scoreRepository = {
  create(data: {
    companyId: string;
    projectId?: string;
    workerId?: string;
    equipmentId?: string;
    entityType: string;
    entityId: string;
    scoreType: ScoreType;
    scoreValue: number;
    contributingFactors: unknown;
  }) {
    return prisma.cailScore.create({ data: {
      companyId: data.companyId,
      projectId: data.projectId,
      workerId: data.workerId,
      equipmentId: data.equipmentId,
      entityType: data.entityType,
      entityId: data.entityId,
      scoreType: data.scoreType,
      scoreValue: data.scoreValue,
      contributingFactors: json(data.contributingFactors),
    } });
  },

  findLatestByEntity(companyId: string, entityType: string, entityId: string, scoreType?: ScoreType) {
    return prisma.cailScore.findMany({
      where: {
        companyId,
        entityType,
        entityId,
        ...(scoreType ? { scoreType } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: scoreType ? 1 : 20,
    });
  },

  async findLatestPerType(companyId: string, entityType: string, entityId: string) {
    const rows = await prisma.cailScore.findMany({
      where: { companyId, entityType, entityId },
      orderBy: { createdAt: 'desc' },
    });

    const latest = new Map<ScoreType, (typeof rows)[0]>();
    for (const row of rows) {
      if (!latest.has(row.scoreType)) {
        latest.set(row.scoreType, row);
      }
    }
    return [...latest.values()];
  },
};
