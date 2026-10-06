import { Injectable, Logger } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ADOPTION_EVENT_TYPES,
  EVENT_TO_DAILY_FIELD,
} from './adoption-analytics.constants';
import { AdoptionChurnService } from './adoption-churn.service';
import { AdoptionAnalyticsCacheService } from './adoption-analytics-cache.service';

@Injectable()
export class AdoptionAggregationService {
  private readonly logger = new Logger(AdoptionAggregationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly churn: AdoptionChurnService,
    private readonly cache: AdoptionAnalyticsCacheService,
  ) {}

  /** Nightly: roll up raw events → company_usage_daily + company_analytics */
  async runNightlyAggregation(): Promise<void> {
    const since = new Date();
    since.setDate(since.getDate() - 1);
    since.setHours(0, 0, 0, 0);
    const until = new Date(since);
    until.setDate(until.getDate() + 1);

    const events = await this.prisma.analyticsEvent.findMany({
      where: { createdAt: { gte: since, lt: until } },
      select: { companyId: true, eventType: true, userId: true },
    });

    const byCompanyDate = new Map<
      string,
      {
        companyId: number;
        counts: Record<string, number>;
        users: Set<number>;
      }
    >();

    for (const e of events) {
      const key = `${e.companyId}:${since.toISOString().slice(0, 10)}`;
      let row = byCompanyDate.get(key);
      if (!row) {
        row = { companyId: e.companyId, counts: {}, users: new Set() };
        byCompanyDate.set(key, row);
      }
      row.counts[e.eventType] = (row.counts[e.eventType] ?? 0) + 1;
      if (e.userId) row.users.add(e.userId);
    }

    for (const row of byCompanyDate.values()) {
      const daily: Prisma.CompanyUsageDailyUpsertArgs['create'] = {
        companyId: row.companyId,
        date: since,
        trainingEvents: 0,
        verificationEvents: 0,
        signoffEvents: 0,
        incidentEvents: 0,
        projectEvents: 0,
        jhaEvents: 0,
        flhaEvents: 0,
        sifEvents: 0,
        equipmentEvents: 0,
      };

      for (const [eventType, count] of Object.entries(row.counts)) {
        const field =
          EVENT_TO_DAILY_FIELD[eventType as keyof typeof EVENT_TO_DAILY_FIELD];
        if (field) {
          daily[field] = (daily[field] as number) + count;
        }
      }

      await this.prisma.companyUsageDaily.upsert({
        where: {
          companyId_date: { companyId: row.companyId, date: since },
        },
        create: daily,
        update: {
          trainingEvents: { increment: daily.trainingEvents },
          verificationEvents: { increment: daily.verificationEvents },
          signoffEvents: { increment: daily.signoffEvents },
          incidentEvents: { increment: daily.incidentEvents },
          projectEvents: { increment: daily.projectEvents },
          jhaEvents: { increment: daily.jhaEvents },
          flhaEvents: { increment: daily.flhaEvents },
          sifEvents: { increment: daily.sifEvents },
          equipmentEvents: { increment: daily.equipmentEvents },
        },
      });
    }

    const companies = await this.prisma.company.findMany({
      select: { id: true },
    });
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    for (const { id: companyId } of companies) {
      try {
        await this.refreshCompanyAnalytics(companyId, thirtyDaysAgo);
        await this.churn.refreshCompanyChurn(companyId);
      } catch (err) {
        this.logger.warn(`Aggregation failed for company ${companyId}`, err);
      }
    }

    this.cache.invalidate('adoption:');
    this.logger.log(
      `Nightly adoption aggregation complete (${events.length} events, ${companies.length} companies)`,
    );
  }

  private async refreshCompanyAnalytics(
    companyId: number,
    since: Date,
  ): Promise<void> {
    const [workers, equipment, projects, activeUsers, recentEvents, lastLogin] =
      await Promise.all([
        this.prisma.worker.count({
          where: {
            OR: [
              { companyId },
              { companyLinks: { some: { companyId, active: true } } },
            ],
          },
        }),
        this.prisma.equipment.count({ where: { companyId } }),
        this.prisma.project.count({ where: { companyId } }),
        this.prisma.analyticsEvent.findMany({
          where: {
            companyId,
            createdAt: { gte: since },
            userId: { not: null },
          },
          distinct: ['userId'],
          select: { userId: true },
        }),
        this.prisma.analyticsEvent.findMany({
          where: { companyId, createdAt: { gte: since } },
          select: { eventType: true },
        }),
        this.prisma.analyticsEvent.findFirst({
          where: { companyId, eventType: ADOPTION_EVENT_TYPES.USER_LOGIN },
          orderBy: { createdAt: 'desc' },
          select: { createdAt: true },
        }),
      ]);

    const modulesUsed: Record<string, number> = {};
    for (const e of recentEvents) {
      modulesUsed[e.eventType] = (modulesUsed[e.eventType] ?? 0) + 1;
    }

    await this.prisma.companyAnalytics.upsert({
      where: { companyId },
      create: {
        companyId,
        totalWorkers: workers,
        totalEquipment: equipment,
        totalProjects: projects,
        activeUsers30d: activeUsers.length,
        modulesUsed,
        lastLogin: lastLogin?.createdAt ?? null,
      },
      update: {
        totalWorkers: workers,
        totalEquipment: equipment,
        totalProjects: projects,
        activeUsers30d: activeUsers.length,
        modulesUsed,
        lastLogin: lastLogin?.createdAt ?? undefined,
      },
    });
  }
}
