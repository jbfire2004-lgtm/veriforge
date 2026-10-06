import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { PredictiveRiskService } from '../predictive/predictive-risk.service';

@Injectable()
export class PredictiveRiskScheduler {
  private readonly logger = new Logger(PredictiveRiskScheduler.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly predictive: PredictiveRiskService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async computeProjectSnapshots() {
    if (this.running) return;
    this.running = true;
    try {
      const projects = await this.prisma.project.findMany({
        where: { status: 'ACTIVE' },
        select: { id: true },
        take: 200,
      });

      let computed = 0;
      for (const p of projects) {
        try {
          await this.predictive.computeAndStore(p.id);
          computed++;
        } catch (e) {
          this.logger.warn(
            `Predictive risk failed for project ${p.id}: ${
              e instanceof Error ? e.message : String(e)
            }`,
          );
        }
      }
      this.logger.log(
        `Predictive risk snapshots: ${computed}/${projects.length}`,
      );
    } finally {
      this.running = false;
    }
  }
}
