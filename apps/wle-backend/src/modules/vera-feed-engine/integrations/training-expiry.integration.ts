import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { VeraCoreFeedService } from '../vera-core-feed.service';

@Injectable()
export class TrainingExpiryIntegration {
  constructor(
    private readonly prisma: PrismaService,
    private readonly veraCoreFeed: VeraCoreFeedService,
  ) {}

  /** Sync certifications expiring or recently expired into feed items. */
  async syncToFeed(scope: {
    companyId?: number;
    workerId?: number;
  }): Promise<number> {
    const now = new Date();
    const horizon = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    const records = await this.prisma.trainingRecord.findMany({
      where: {
        expiresAt: { not: null },
        OR: [
          { expiresAt: { gte: now, lte: horizon } },
          {
            expiresAt: {
              lt: now,
              gte: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            },
          },
        ],
        ...(scope.companyId ? { companyId: scope.companyId } : {}),
        ...(scope.workerId ? { workerId: scope.workerId } : {}),
      },
      select: { id: true },
      take: 40,
    });

    let count = 0;
    for (const r of records) {
      if (await this.veraCoreFeed.syncTrainingExpiry(r.id)) count += 1;
    }
    return count;
  }
}
