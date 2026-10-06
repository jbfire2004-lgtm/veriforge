import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { PmPredictiveSafetyAnalyticsService } from './pm-predictive-safety-analytics.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';

@Injectable()
export class PmPredictiveSafetyAnalyticsScheduler {
  private readonly logger = new Logger(
    PmPredictiveSafetyAnalyticsScheduler.name,
  );

  constructor(
    private readonly prisma: PrismaService,
    private readonly analytics: PmPredictiveSafetyAnalyticsService,
    private readonly ecosystem: SafetyEcosystemEventsService,
  ) {}

  /** Weekly risk forecast — Monday 06:00 */
  @Cron('0 6 * * 1')
  async weeklyForecast() {
    const projects = await this.prisma.project.findMany({
      where: { status: 'ACTIVE' },
      select: { id: true, companyId: true, name: true },
      take: 50,
    });

    for (const p of projects) {
      try {
        await this.analytics.runPipeline(p.companyId, p.id, { notify: true });
        this.ecosystem.invalidateHub(p.companyId, p.id, {
          source: 'predictive_weekly',
        });
        this.logger.log(
          `Weekly forecast completed for project ${p.name} (${p.id})`,
        );
      } catch (e) {
        this.logger.warn(`Forecast failed for project ${p.id}: ${e}`);
      }
    }
  }

  /** Nightly feature refresh for active projects */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async nightlyRefresh() {
    const projects = await this.prisma.project.findMany({
      select: { id: true, companyId: true },
      take: 30,
    });

    for (const p of projects) {
      try {
        await this.analytics.runPipeline(p.companyId, p.id, { notify: false });
      } catch {
        // continue
      }
    }
  }
}
