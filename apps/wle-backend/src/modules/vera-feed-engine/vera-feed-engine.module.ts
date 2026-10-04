import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { ApiPlatformModule } from '../api-platform/api-platform.module';
import { JobBoardIntegration } from '../vera-hub-homepage/integrations/job-board.integration';
import { SafetyBlogIntegration } from '../vera-hub-homepage/integrations/safety-blog.integration';
import { VeraCoreIntegration } from '../vera-hub-homepage/integrations/vera-core.integration';
import { FeedEngineController } from './feed-engine.controller';
import { FeedEngineService } from './feed-engine.service';
import { FeedAggregationPipeline } from './feed-aggregation.pipeline';
import { FeedCacheService } from './feed-cache.service';
import { FeedPersonalizationService } from './feed-personalization.service';
import { FeedRealtimeGateway } from './feed-realtime.gateway';
import { TrainingExpiryIntegration } from './integrations/training-expiry.integration';
import { UnionDispatchIntegration } from './integrations/union-dispatch.integration';
import { WorkerAchievementIntegration } from './integrations/worker-achievement.integration';
import { WorkerVerificationIntegration } from './integrations/worker-verification.integration';
import { ExpertAnswerIntegration } from './integrations/expert-answer.integration';
import { CompanyAnnouncementIntegration } from './integrations/company-announcement.integration';
import { VeraExpertQaModule } from '../vera-expert-qa/vera-expert-qa.module';
import { VeraSocialModule } from '../vera-social/vera-social.module';
import { VeraCoreFeedService } from './vera-core-feed.service';
import { FeedDomainEventHandler } from './events/feed-domain-event.handler';

@Module({
  imports: [
    PrismaModule,
    ApiPlatformModule,
    VeraExpertQaModule,
    VeraSocialModule,
  ],
  controllers: [FeedEngineController],
  providers: [
    VeraCoreFeedService,
    VeraCoreIntegration,
    JobBoardIntegration,
    SafetyBlogIntegration,
    FeedEngineService,
    FeedAggregationPipeline,
    FeedCacheService,
    FeedPersonalizationService,
    FeedRealtimeGateway,
    FeedDomainEventHandler,
    TrainingExpiryIntegration,
    UnionDispatchIntegration,
    WorkerAchievementIntegration,
    WorkerVerificationIntegration,
    ExpertAnswerIntegration,
    CompanyAnnouncementIntegration,
  ],
  exports: [
    FeedEngineService,
    FeedRealtimeGateway,
    FeedAggregationPipeline,
    VeraCoreFeedService,
    VeraCoreIntegration,
  ],
})
export class VeraFeedEngineModule {}
