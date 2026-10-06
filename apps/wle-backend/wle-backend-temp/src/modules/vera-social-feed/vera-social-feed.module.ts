import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { VeraHubHomepageModule } from '../vera-hub-homepage/vera-hub-homepage.module';
import { VeraModerationModule } from '../vera-moderation/vera-moderation.module';
import { SocialFeedController } from './social-feed.controller';
import { SocialFeedService } from './social-feed.service';
import { SocialPostsService } from './social-posts.service';
import { SocialTrendingService } from './social-trending.service';

@Module({
  imports: [PrismaModule, VeraHubHomepageModule, VeraModerationModule],
  controllers: [SocialFeedController],
  providers: [SocialFeedService, SocialPostsService, SocialTrendingService],
  exports: [SocialFeedService, SocialPostsService],
})
export class VeraSocialFeedModule {}
