import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { VeraCoreFeedService } from '../vera-core-feed.service';
import { workerAchievementToFeed } from '../transformers/vera-core-feed.transformers';

@Injectable()
export class WorkerAchievementIntegration {
  constructor(
    private readonly prisma: PrismaService,
    private readonly veraCoreFeed: VeraCoreFeedService,
  ) {}

  async syncToFeed(scope: {
    companyId?: number;
    workerId?: number;
  }): Promise<number> {
    const records = await this.prisma.trainingRecord.findMany({
      where: {
        completedAt: { not: null },
        ...(scope.companyId ? { companyId: scope.companyId } : {}),
        ...(scope.workerId ? { workerId: scope.workerId } : {}),
      },
      orderBy: { completedAt: 'desc' },
      take: 15,
      include: { worker: true, certification: true },
    });

    let count = 0;
    for (const r of records) {
      await this.veraCoreFeed.upsert(workerAchievementToFeed(r));
      count += 1;
    }
    return count;
  }
}
