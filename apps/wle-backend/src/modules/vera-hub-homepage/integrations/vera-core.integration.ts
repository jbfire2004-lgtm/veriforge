import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { VeraCoreFeedService } from '../../vera-feed-engine/vera-core-feed.service';

@Injectable()
export class VeraCoreIntegration {
  constructor(
    private readonly prisma: PrismaService,
    private readonly veraCoreFeed: VeraCoreFeedService,
  ) {}

  /** Sync Vera Core sources into FeedItem rows (delegates to feed transformers). */
  async syncFeedItems(scope: {
    companyId?: number;
    workerId?: number;
  }): Promise<number> {
    const counts = await this.veraCoreFeed.syncBatch(scope);
    return (
      counts.training +
      counts.achievements +
      counts.expiry +
      counts.projects +
      counts.equipment +
      counts.verification
    );
  }

  async listProjectUpdates(companyId?: number) {
    const logs = await this.prisma.coreDailyLog.findMany({
      where: companyId ? { companyId } : {},
      orderBy: { logDate: 'desc' },
      take: 6,
    });
    return logs.map((log) => ({
      id: String(log.id),
      projectName: log.title,
      title: log.title,
      summary: log.body?.slice(0, 160) ?? null,
      publishedAt: log.logDate.toISOString(),
      url: `/core/daily-logs/${log.id}`,
    }));
  }

  async listAchievements(scope: { companyId?: number; workerId?: number }) {
    const where: Prisma.TrainingRecordWhereInput = {
      completedAt: { not: null },
      ...(scope.companyId ? { companyId: scope.companyId } : {}),
      ...(scope.workerId ? { workerId: scope.workerId } : {}),
    };
    const records = await this.prisma.trainingRecord.findMany({
      where,
      orderBy: { completedAt: 'desc' },
      take: 8,
      include: { worker: true, certification: true },
    });
    return records.map((r) => ({
      id: `achievement-${r.id}`,
      workerName: `${r.worker.firstName} ${r.worker.lastName}`,
      title: `Completed ${r.certification.name}`,
      description: null,
      completedAt: (r.completedAt ?? r.issuedAt).toISOString(),
    }));
  }
}
