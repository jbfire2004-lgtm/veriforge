import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { HubConnectionService } from './hub-connection.service';
import { HubFeedService, type HubFeedFilter } from './hub-feed.service';
import { HubProfileService } from './hub-profile.service';
import type { UpdateHubProfileDto } from './hub-profile.types';
import { CreatePostDto } from '../vera-social-feed/dto/social-post.dto';

type AuthReq = { user: { id: number } };

@Controller(`${API_V1_PREFIX}/hub`)
@UseGuards(JwtAuthGuard, RolesGuard)
export class HubProfileController {
  constructor(
    private readonly profiles: HubProfileService,
    private readonly connections: HubConnectionService,
    private readonly feed: HubFeedService,
  ) {}

  @Get('profiles/me')
  getMyProfile(@Req() req: AuthReq) {
    return this.profiles.getProfile(req.user.id, req.user.id);
  }

  @Patch('profiles/me')
  updateMyProfile(@Req() req: AuthReq, @Body() body: UpdateHubProfileDto) {
    return this.profiles.updateMyProfile(req.user.id, body);
  }

  @Get('profiles/:userId')
  getProfile(
    @Req() req: AuthReq,
    @Param('userId', ParseIntPipe) userId: number,
  ) {
    return this.profiles.getProfile(req.user.id, userId);
  }

  @Get('profiles/:userId/card')
  getProfileCard(@Param('userId', ParseIntPipe) userId: number) {
    return this.profiles.getProfileCard(userId);
  }

  @Get('feed')
  getFeed(
    @Req() req: AuthReq,
    @Query('filter') filter?: HubFeedFilter,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
    @Query('refresh') refresh?: string,
  ) {
    return this.feed.getFeed(req.user.id, {
      filter: filter ?? 'all',
      cursor,
      limit: limit ? parseInt(limit, 10) : undefined,
      refresh: refresh === 'true',
    });
  }

  @Post('feed/posts')
  createPost(@Req() req: AuthReq, @Body() body: CreatePostDto) {
    return this.feed.createPost(req.user.id, body);
  }

  @Post('connections/request')
  requestConnection(
    @Req() req: AuthReq,
    @Body() body: { addresseeUserId: number; message?: string },
  ) {
    return this.connections.requestConnection(
      req.user.id,
      body.addresseeUserId,
      body.message,
    );
  }

  @Post('connections/:id/accept')
  acceptConnection(@Req() req: AuthReq, @Param('id') id: string) {
    return this.connections.acceptConnection(id, req.user.id);
  }

  @Post('connections/:id/decline')
  declineConnection(@Req() req: AuthReq, @Param('id') id: string) {
    return this.connections.declineConnection(id, req.user.id);
  }

  @Get('connections')
  listConnections(@Req() req: AuthReq) {
    return this.connections.listConnections(req.user.id);
  }
}
