import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { VeraFeedEngineModule } from '../vera-feed-engine/vera-feed-engine.module';
import { VeraHubHomepageModule } from '../vera-hub-homepage/vera-hub-homepage.module';
import { VeraSocialFeedModule } from '../vera-social-feed/vera-social-feed.module';
import { HubCompanyController } from './hub-company.controller';
import { HubCompanyService } from './hub-company.service';
import { HubConnectionService } from './hub-connection.service';
import { HubFeedService } from './hub-feed.service';
import { HubFollowService } from './hub-follow.service';
import { HubProfileController } from './hub-profile.controller';
import { HubProfileService } from './hub-profile.service';
import { HubProviderService } from './hub-provider.service';
import { HubSuggestionsService } from './hub-suggestions.service';

@Module({
  imports: [
    PrismaModule,
    VeraHubHomepageModule,
    VeraFeedEngineModule,
    VeraSocialFeedModule,
  ],
  controllers: [HubProfileController, HubCompanyController],
  providers: [
    HubProfileService,
    HubConnectionService,
    HubFeedService,
    HubCompanyService,
    HubProviderService,
    HubFollowService,
    HubSuggestionsService,
  ],
  exports: [HubProfileService, HubFeedService, HubCompanyService],
})
export class VeraHubProfileModule {}
