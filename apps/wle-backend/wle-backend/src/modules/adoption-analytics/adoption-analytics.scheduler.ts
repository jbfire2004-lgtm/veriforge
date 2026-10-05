import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AdoptionAggregationService } from './adoption-aggregation.service';
import { AdoptionEventQueueService } from './adoption-event-queue.service';

@Injectable()
export class AdoptionAnalyticsScheduler {
  private readonly logger = new Logger(AdoptionAnalyticsScheduler.name);

  constructor(
    private readonly aggregation: AdoptionAggregationService,
    private readonly queue: AdoptionEventQueueService,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async nightlyAggregation(): Promise<void> {
    this.logger.log('Starting nightly adoption analytics aggregation');
    await this.queue.flush();
    await this.aggregation.runNightlyAggregation();
  }
}
