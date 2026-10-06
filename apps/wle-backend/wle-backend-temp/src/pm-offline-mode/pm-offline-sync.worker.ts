import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../prisma/prisma.service';
import { OfflineBatchRouter } from './offline-batch.router';

/**
 * Server-side background worker — retries PmOfflineCache rows stuck in pending_sync.
 */
@Injectable()
export class PmOfflineSyncWorker {
  private readonly logger = new Logger(PmOfflineSyncWorker.name);
  private running = false;

  constructor(
    private readonly prisma: PrismaService,
    private readonly router: OfflineBatchRouter,
  ) {}

  @Cron(CronExpression.EVERY_5_MINUTES)
  async retryPendingSync(): Promise<void> {
    if (this.running) return;
    this.running = true;

    try {
      const pending = await this.prisma.pmOfflineCache.findMany({
        where: { syncStatus: 'pending_sync' },
        orderBy: { lastModified: 'asc' },
        take: 50,
      });

      if (pending.length === 0) return;

      this.logger.log(
        `Retrying ${pending.length} pending offline sync entries`,
      );

      for (const row of pending) {
        await this.prisma.pmOfflineCache.update({
          where: { id: row.id },
          data: { syncStatus: 'syncing' },
        });

        const payload = row.payload as Record<string, unknown>;
        const result = await this.router.process(
          {
            type: row.moduleType,
            payload,
            clientVersion: row.clientVersion ?? undefined,
          },
          0,
        );

        if (result.ok) {
          await this.prisma.pmOfflineCache.update({
            where: { id: row.id },
            data: {
              syncStatus: 'synced',
              syncedAt: new Date(),
              errorMessage: null,
              clientVersion: (row.clientVersion ?? 0) + 1,
            },
          });
        } else {
          await this.prisma.pmOfflineCache.update({
            where: { id: row.id },
            data: {
              syncStatus: 'pending_sync',
              errorMessage: result.error ?? 'Retry failed',
            },
          });
        }
      }
    } catch (err) {
      this.logger.error('Offline sync worker failed', err);
    } finally {
      this.running = false;
    }
  }
}
