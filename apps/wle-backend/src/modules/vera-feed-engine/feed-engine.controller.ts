import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { PrismaService } from '../../prisma/prisma.service';
import { FeedEngineService } from './feed-engine.service';
import { FeedPersonalizationService } from './feed-personalization.service';
import { SocialService } from '../vera-social/social.service';
import { VeraCoreFeedService } from './vera-core-feed.service';

@Controller('api/v1/feed')
@UseGuards(JwtAuthGuard, RolesGuard)
export class FeedEngineController {
  constructor(
    private readonly feed: FeedEngineService,
    private readonly personalization: FeedPersonalizationService,
    private readonly prisma: PrismaService,
    private readonly social: SocialService,
    private readonly veraCoreFeed: VeraCoreFeedService,
  ) {}

  @Get()
  async getFeed(
    @Req() req: { user: { id: number } },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('refresh') refresh?: string,
  ) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user.id },
      include: { worker: true },
    });
    const ctx = this.personalization.resolveContext(user);
    if (refresh === 'true') await this.feed.refreshAndInvalidate(ctx);
    return this.feed.getFeedPage(ctx, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      refresh: refresh === 'true',
    });
  }

  @Post('interact')
  async interact(
    @Req() req: { user: { id: number } },
    @Body()
    body: {
      feedItemId: string;
      type: 'LIKE' | 'COMMENT' | 'SHARE';
      body?: string;
      parentId?: string;
    },
  ) {
    await this.social.interact(
      req.user.id,
      body.feedItemId,
      body.type,
      body.body,
      body.parentId,
    );
    return { ok: true };
  }

  @Get('comments')
  listComments(@Query('feedItemId') feedItemId: string) {
    return this.social.listComments(feedItemId);
  }

  @Post('subscribe')
  async subscribe(
    @Req() req: { user: { id: number } },
    @Body()
    body: {
      targetType: 'SOURCE' | 'COMPANY' | 'PROJECT' | 'TRADE' | 'EXPERT';
      targetKey: string;
    },
  ) {
    return this.feed.subscribe(req.user.id, body.targetType, body.targetKey);
  }

  @Get('subscriptions')
  listSubscriptions(@Req() req: { user: { id: number } }) {
    return this.feed.listSubscriptions(req.user.id);
  }

  /** Incremental sync of Vera Core events into the feed (training, tickets, projects, equipment, verification). */
  @Post('sync/vera-core')
  async syncVeraCore(@Req() req: { user: { id: number } }) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user.id },
      include: { worker: true },
    });
    const ctx = this.personalization.resolveContext(user);
    const counts = await this.veraCoreFeed.syncBatch({
      companyId: ctx.companyId,
      workerId: ctx.workerId,
    });
    await this.feed.refreshAndInvalidate(ctx);
    const synced = Object.values(counts).reduce((a, b) => a + b, 0);
    return { synced, counts };
  }
}
