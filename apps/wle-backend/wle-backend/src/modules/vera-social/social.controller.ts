import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { SocialService } from './social.service';

@Controller('api/v1/social')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SocialController {
  constructor(private readonly social: SocialService) {}

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
    return { ok: true as const };
  }

  @Get('comments')
  listComments(@Query('feedItemId') feedItemId: string) {
    return this.social.listComments(feedItemId);
  }

  @Post('follow/:userId')
  follow(
    @Req() req: { user: { id: number } },
    @Param('userId') userId: string,
  ) {
    return this.social.followUser(req.user.id, parseInt(userId, 10));
  }

  @Delete('follow/:userId')
  unfollow(
    @Req() req: { user: { id: number } },
    @Param('userId') userId: string,
  ) {
    return this.social.unfollowUser(req.user.id, parseInt(userId, 10));
  }

  @Get('follow/:userId/status')
  followStatus(
    @Req() req: { user: { id: number } },
    @Param('userId') userId: string,
  ) {
    return this.social.followStatus(req.user.id, parseInt(userId, 10));
  }

  @Get('following')
  following(@Req() req: { user: { id: number } }) {
    return this.social.listFollowing(req.user.id);
  }

  @Get('followers')
  followers(@Req() req: { user: { id: number } }) {
    return this.social.listFollowers(req.user.id);
  }

  @Get('activity')
  activity(
    @Req() req: { user: { id: number } },
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('scope') scope?: 'me' | 'following' | 'all',
  ) {
    return this.social.getActivity(req.user.id, {
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      scope,
    });
  }

  @Post('subscribe')
  subscribe(
    @Req() req: { user: { id: number } },
    @Body()
    body: {
      targetType:
        | 'SOURCE'
        | 'COMPANY'
        | 'PROJECT'
        | 'TRADE'
        | 'EXPERT'
        | 'USER';
      targetKey: string;
    },
  ) {
    return this.social.subscribeTopic(
      req.user.id,
      body.targetType,
      body.targetKey,
    );
  }
}
