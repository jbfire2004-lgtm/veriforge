import { Module } from '@nestjs/common';
import { AcpModule } from '../../acp/acp.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { DashboardWidgetsModule } from '../dashboard-widgets/dashboard-widgets.module';
import { VeraFeedEngineModule } from '../vera-feed-engine/vera-feed-engine.module';
import { FeedAggregationService } from './feed-aggregation.service';
import { HubHomepageController } from './hub-homepage.controller';
import { HubHomepageService } from './hub-homepage.service';
import { HubWidgetsService } from './hub-widgets.service';
import { HomepageCacheService } from './homepage-cache.service';
import { PersonalizationService } from './personalization.service';
import { TrendingTopicsService } from './trending-topics.service';
import { WeatherHazardService } from './weather-hazard.service';
import { JobBoardIntegration } from './integrations/job-board.integration';
import { SafetyBlogIntegration } from './integrations/safety-blog.integration';
import { VeraCoreIntegration } from './integrations/vera-core.integration';

@Module({
  imports: [
    PrismaModule,
    VeraFeedEngineModule,
    DashboardWidgetsModule,
    AcpModule,
  ],
  controllers: [HubHomepageController],
  providers: [
    HubHomepageService,
    HubWidgetsService,
    FeedAggregationService,
    PersonalizationService,
    HomepageCacheService,
    TrendingTopicsService,
    WeatherHazardService,
    VeraCoreIntegration,
    JobBoardIntegration,
    SafetyBlogIntegration,
  ],
  exports: [
    HubHomepageService,
    FeedAggregationService,
    HomepageCacheService,
    PersonalizationService,
    HubWidgetsService,
  ],
})
export class VeraHubHomepageModule {}
