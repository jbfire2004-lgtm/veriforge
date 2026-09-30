import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { EventPublisherService } from './event-publisher.service';
import { EventBusMetricsService } from './event-bus-metrics.service';

@Injectable()
export class EventBusScheduler {
  private readonly logger = new Logger(EventBusScheduler.name);

  constructor(
    private readonly publisher: EventPublisherService,
    private readonly metrics: EventBusMetricsService,
  ) {}

  @Cron(CronExpression.EVERY_30_SECONDS)
  async publishOutbox(): Promise<void> {
    const result = await this.publisher.publishPendingBatch();
    if (result.published > 0 || result.failed > 0 || result.dlq > 0) {
      this.logger.log(
        JSON.stringify({ type: 'event_bus.publish_batch', ...result }),
      );
    }
  }

  @Cron(CronExpression.EVERY_5_MINUTES)
  heartbeat(): void {
    this.metrics.emitMonitoringHeartbeat();
  }
}
