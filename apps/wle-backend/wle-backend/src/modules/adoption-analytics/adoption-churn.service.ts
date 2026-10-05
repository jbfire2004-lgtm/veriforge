import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type ChurnFactors = {
  lowModuleUsage: boolean;
  lowActiveUsers: boolean;
  highNegativeFeedback: boolean;
  noRecentEvents: boolean;
};

@Injectable()
export class AdoptionChurnService {
  constructor(private readonly prisma: PrismaService) {}

  computeScore(input: {
    modulesUsedCount: number;
    activeUsers30d: number;
    totalWorkers: number;
    negativeFeedbackCount: number;
    daysSinceLastEvent: number | null;
  }): { score: number; factors: ChurnFactors } {
    const factors: ChurnFactors = {
      lowModuleUsage: input.modulesUsedCount < 2,
      lowActiveUsers:
        input.activeUsers30d < 3 ||
        (input.totalWorkers > 0 &&
          input.activeUsers30d / input.totalWorkers < 0.15),
      highNegativeFeedback: input.negativeFeedbackCount >= 2,
      noRecentEvents:
        input.daysSinceLastEvent === null || input.daysSinceLastEvent > 14,
    };

    let score = 0;
    if (factors.lowModuleUsage) score += 30;
    if (factors.lowActiveUsers) score += 30;
    if (factors.highNegativeFeedback) score += 20;
    if (factors.noRecentEvents) score += 20;

    return { score: Math.min(100, score), factors };
  }

  async refreshCompanyChurn(companyId: number): Promise<number> {
    const [analytics, lastEvent, negativeFeedback] = await Promise.all([
      this.prisma.companyAnalytics.findUnique({ where: { companyId } }),
      this.prisma.analyticsEvent.findFirst({
        where: { companyId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      this.prisma.feedbackRequest.count({
        where: {
          companyId,
          status: 'DECLINED',
        },
      }),
    ]);

    const modules =
      analytics?.modulesUsed && typeof analytics.modulesUsed === 'object'
        ? Object.keys(analytics.modulesUsed as object).length
        : 0;

    const daysSinceLastEvent = lastEvent
      ? Math.floor(
          (Date.now() - lastEvent.createdAt.getTime()) / (1000 * 60 * 60 * 24),
        )
      : null;

    const { score } = this.computeScore({
      modulesUsedCount: modules,
      activeUsers30d: analytics?.activeUsers30d ?? 0,
      totalWorkers: analytics?.totalWorkers ?? 0,
      negativeFeedbackCount: negativeFeedback,
      daysSinceLastEvent,
    });

    await this.prisma.companyAnalytics.upsert({
      where: { companyId },
      create: { companyId, churnRiskScore: score },
      update: { churnRiskScore: score },
    });

    return score;
  }
}
