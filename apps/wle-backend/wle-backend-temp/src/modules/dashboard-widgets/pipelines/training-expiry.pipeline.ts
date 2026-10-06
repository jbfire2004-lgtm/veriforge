import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import type { TrainingExpiryWidgetData } from '../dashboard-widgets.types';

@Injectable()
export class TrainingExpiryPipeline {
  constructor(private readonly prisma: PrismaService) {}

  async run(companyId?: number): Promise<TrainingExpiryWidgetData> {
    const now = new Date();
    const d30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const d60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
    const d90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

    const workerFilter = companyId ? { worker: { companyId } } : {};

    const base = {
      expiresAt: { not: null },
      ...workerFilter,
    };

    const [expired, expiring30, expiring60, expiring90, gaps] =
      await Promise.all([
        this.prisma.trainingRecord.count({
          where: { ...base, expiresAt: { lte: now } },
        }),
        this.prisma.trainingRecord.count({
          where: { ...base, expiresAt: { gt: now, lte: d30 } },
        }),
        this.prisma.trainingRecord.count({
          where: { ...base, expiresAt: { gt: d30, lte: d60 } },
        }),
        this.prisma.trainingRecord.count({
          where: { ...base, expiresAt: { gt: d60, lte: d90 } },
        }),
        this.prisma.worker.count({
          where: {
            ...(companyId ? { companyId } : {}),
            trainingRecords: { none: {} },
          },
        }),
      ]);

    const highRisk = expired + expiring30;

    return {
      expired,
      expiring30,
      expiring60,
      expiring90,
      highRisk,
      gaps,
    };
  }
}
