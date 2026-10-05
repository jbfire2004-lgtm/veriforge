import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export type QueuedAnalyticsEvent = {
  companyId: number;
  userId?: number | null;
  eventType: string;
  metadata?: Record<string, unknown>;
};

@Injectable()
export class AdoptionEventQueueService implements OnModuleDestroy {
  private readonly logger = new Logger(AdoptionEventQueueService.name);
  private readonly buffer: QueuedAnalyticsEvent[] = [];
  private flushTimer: ReturnType<typeof setTimeout> | null = null;
  private flushing = false;

  constructor(private readonly prisma: PrismaService) {}

  enqueue(event: QueuedAnalyticsEvent): void {
    this.buffer.push(event);
    if (this.buffer.length >= 50) {
      void this.flush();
      return;
    }
    if (!this.flushTimer) {
      this.flushTimer = setTimeout(() => {
        this.flushTimer = null;
        void this.flush();
      }, 500);
    }
  }

  async flush(): Promise<void> {
    if (this.flushing || this.buffer.length === 0) return;
    this.flushing = true;
    const batch = this.buffer.splice(0, this.buffer.length);
    try {
      await this.prisma.analyticsEvent.createMany({
        data: batch.map((e) => ({
          companyId: e.companyId,
          userId: e.userId ?? null,
          eventType: e.eventType,
          metadata: (e.metadata ?? {}) as object,
        })),
      });
    } catch (err) {
      this.logger.error(
        `Failed to flush ${batch.length} analytics events`,
        err,
      );
      this.buffer.unshift(...batch);
    } finally {
      this.flushing = false;
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.flushTimer) {
      clearTimeout(this.flushTimer);
      this.flushTimer = null;
    }
    await this.flush();
  }
}
