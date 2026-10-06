import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PmSafetyHubAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async getUnifiedAnalytics(filters: {
    companyId: number;
    projectId?: number;
  }) {
    const { companyId, projectId } = filters;
    const projectWhere = projectId ? { projectId } : {};

    const [forecast, scores, recommendations, correlations] = await Promise.all(
      [
        this.prisma.pmPredictiveSafetyForecast.findFirst({
          where: { companyId, ...projectWhere },
          orderBy: { weekStart: 'desc' },
        }),
        this.prisma.cailScore.findMany({
          where: { companyId, ...projectWhere },
          orderBy: { computedAt: 'desc' },
          take: 20,
        }),
        this.prisma.cailRecommendation.findMany({
          where: { companyId, ...projectWhere, status: 'open' },
          orderBy: { confidence: 'desc' },
          take: 15,
        }),
        this.prisma.cailCorrelation.findMany({
          where: { companyId, ...projectWhere },
          orderBy: { strength: 'desc' },
          take: 10,
        }),
      ],
    );

    const forecastJson = (forecast?.forecastJson ?? {}) as Record<
      string,
      unknown
    >;
    const alertsJson = (forecast?.alertsJson ?? []) as unknown[];

    return {
      modelKey: forecast?.modelKey ?? 'predictive_safety_v1',
      generatedAt: new Date().toISOString(),
      predictive: forecast
        ? {
            weekStart: forecast.weekStart,
            riskIndex: forecast.riskIndex,
            riskLevel: forecast.riskLevel,
            weeklyDays: forecastJson.days ?? [],
            alerts: alertsJson,
          }
        : null,
      cailScores: scores.map((s) => ({
        id: s.id,
        entityType: s.entityType,
        entityId: s.entityId,
        scoreType: s.scoreType,
        score: s.score,
        computedAt: s.computedAt,
      })),
      recommendations: recommendations.map((r) => ({
        id: r.id,
        type: r.recommendationType,
        title: r.title,
        status: r.status,
        confidence: r.confidence,
      })),
      correlations: correlations.map((c) => ({
        id: c.id,
        leftModule: c.leftModule,
        leftEntityId: c.leftEntityId,
        rightModule: c.rightModule,
        rightEntityId: c.rightEntityId,
        strength: c.strength,
        correlationType: c.correlationType,
      })),
      layers: [
        {
          id: 'operational',
          label: 'Operational (inspections, incidents, CAPA)',
          active: true,
        },
        { id: 'predictive', label: 'Predictive forecast', active: !!forecast },
        {
          id: 'cail_intel',
          label: 'CAIL intelligence scores',
          active: scores.length > 0,
        },
      ],
    };
  }
}
