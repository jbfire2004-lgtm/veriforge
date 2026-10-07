import { Injectable } from '@nestjs/common';
import { PmSclState, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SmsAnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async leadingIndicators(companyId: number, projectId?: number) {
    const since = new Date();
    since.setDate(since.getDate() - 90);
    const projectFilter = projectId ? { projectId } : {};

    const [riskContexts, events, findings, forecasts] = await Promise.all([
      this.prisma.pmSmsRiskContext.groupBy({
        by: ['sclState'],
        where: { companyId, ...projectFilter, createdAt: { gte: since } },
        _count: true,
      }),
      this.prisma.pmSafetyEvent.groupBy({
        by: ['sclState'],
        where: {
          companyId,
          deletedAt: null,
          occurredAt: { gte: since },
          ...projectFilter,
        },
        _count: true,
      }),
      this.prisma.pmInspectionPhotoFinding.groupBy({
        by: ['sclState'],
        where: {
          inspection: { companyId, ...projectFilter },
          createdAt: { gte: since },
        },
        _count: true,
      }),
      this.prisma.pmSmsWeeklyRiskForecast.findMany({
        where: { companyId, ...projectFilter },
        orderBy: { weekStart: 'desc' },
        take: 4,
      }),
    ]);

    const hecaHighEnergy = await this.prisma.pmSmsRiskContext.count({
      where: {
        companyId,
        ...projectFilter,
        hecaInvolved: true,
        highEnergyFlag: true,
        sclState: { in: ['conditional', 'loss'] },
      },
    });

    const energyGaps = await this.prisma.pmSmsRiskContext.findMany({
      where: {
        companyId,
        ...projectFilter,
        missingControlsJson: { not: Prisma.JsonNull },
      },
      select: { energyTypesJson: true, missingControlsJson: true },
      take: 100,
    });

    const gapByEnergy: Record<string, number> = {};
    for (const row of energyGaps) {
      const types = row.energyTypesJson as string[];
      const gaps = row.missingControlsJson as string[];
      for (const t of types) {
        gapByEnergy[t] = (gapByEnergy[t] ?? 0) + (gaps?.length ?? 0);
      }
    }

    return {
      sclDistribution: this.mergeSclCounts(riskContexts, events, findings),
      hecaHighEnergyConditionalLoss: hecaHighEnergy,
      energyControlGaps: gapByEnergy,
      weeklyForecasts: forecasts,
    };
  }

  async saveWeeklyForecast(
    companyId: number,
    projectId: number | undefined,
    forecast: {
      forecastJson: Record<string, unknown>;
      alertsJson?: unknown[];
      recommendationsJson?: unknown[];
      sclBreakdownJson?: Record<string, number>;
      hecaHotspotsJson?: unknown[];
      energyGapsJson?: unknown[];
    },
  ) {
    const weekStart = startOfWeek(new Date());
    const existing = await this.prisma.pmSmsWeeklyRiskForecast.findFirst({
      where: { companyId, projectId: projectId ?? null, weekStart },
    });
    const payload = {
      forecastJson: forecast.forecastJson as Prisma.InputJsonValue,
      alertsJson: (forecast.alertsJson ?? []) as Prisma.InputJsonValue,
      recommendationsJson: (forecast.recommendationsJson ??
        []) as Prisma.InputJsonValue,
      sclBreakdownJson: (forecast.sclBreakdownJson ??
        {}) as Prisma.InputJsonValue,
      hecaHotspotsJson: (forecast.hecaHotspotsJson ??
        []) as Prisma.InputJsonValue,
      energyGapsJson: (forecast.energyGapsJson ?? []) as Prisma.InputJsonValue,
    };
    if (existing) {
      return this.prisma.pmSmsWeeklyRiskForecast.update({
        where: { id: existing.id },
        data: payload,
      });
    }
    return this.prisma.pmSmsWeeklyRiskForecast.create({
      data: { companyId, projectId, weekStart, ...payload },
    });
  }

  private mergeSclCounts(
    contexts: Array<{ sclState: PmSclState | null; _count: number }>,
    events: Array<{ sclState: PmSclState | null; _count: number }>,
    findings: Array<{ sclState: PmSclState | null; _count: number }>,
  ) {
    const out: Record<string, number> = {
      safe: 0,
      conditional: 0,
      loss: 0,
      untagged: 0,
    };
    for (const row of [...contexts, ...events, ...findings]) {
      const key = row.sclState ?? 'untagged';
      out[key] = (out[key] ?? 0) + row._count;
    }
    return out;
  }
}

function startOfWeek(d: Date): Date {
  const copy = new Date(d);
  const day = copy.getDay();
  const diff = copy.getDate() - day + (day === 0 ? -6 : 1);
  copy.setDate(diff);
  copy.setHours(0, 0, 0, 0);
  return copy;
}
