import { Global, Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AdoptionAnalyticsService } from './adoption-analytics.service';
import { AdoptionEventService } from './adoption-event.service';
import { AdoptionEventQueueService } from './adoption-event-queue.service';
import { AdoptionAnalyticsCacheService } from './adoption-analytics-cache.service';
import { AdoptionAggregationService } from './adoption-aggregation.service';
import { AdoptionChurnService } from './adoption-churn.service';
import { FeedbackService } from './feedback.service';
import { AdoptionAnalyticsAdminController } from './adoption-analytics-admin.controller';
import { AdoptionAnalyticsIngestController } from './adoption-analytics-ingest.controller';
import { FeedbackController } from './feedback.controller';
import { AdoptionAnalyticsScheduler } from './adoption-analytics.scheduler';
import { AdoptionTrackingBridge } from './adoption-tracking.bridge';
import { DomainEventBusModule } from '../api-platform/events/domain-event-bus.module';

@Global()
@Module({
  imports: [ScheduleModule, DomainEventBusModule],
  controllers: [
    AdoptionAnalyticsAdminController,
    AdoptionAnalyticsIngestController,
    FeedbackController,
  ],
  providers: [
    AdoptionAnalyticsService,
    AdoptionEventService,
    AdoptionEventQueueService,
    AdoptionAnalyticsCacheService,
    AdoptionAggregationService,
    AdoptionChurnService,
    FeedbackService,
    AdoptionAnalyticsScheduler,
    AdoptionTrackingBridge,
  ],
  exports: [AdoptionEventService],
})
export class AdoptionAnalyticsModule {}
