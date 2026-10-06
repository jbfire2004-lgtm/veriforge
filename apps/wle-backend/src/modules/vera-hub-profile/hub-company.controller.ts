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
import { CreatePostDto } from '../vera-social-feed/dto/social-post.dto';
import { HubCompanyService } from './hub-company.service';
import type {
  HubFollowTargetType,
  UpdateHubCompanyPageDto,
} from './hub-company.types';
import { HubFollowService } from './hub-follow.service';
import { HubProviderService } from './hub-provider.service';
import { HubSuggestionsService } from './hub-suggestions.service';

type AuthReq = { user: { id: number } };

@Controller(`${API_V1_PREFIX}/hub`)
@UseGuards(JwtAuthGuard, RolesGuard)
export class HubCompanyController {
  constructor(
    private readonly companies: HubCompanyService,
    private readonly providers: HubProviderService,
    private readonly followService: HubFollowService,
    private readonly suggestions: HubSuggestionsService,
  ) {}

  @Get('companies/:companyId/page')
  getCompanyPage(
    @Req() req: AuthReq,
    @Param('companyId', ParseIntPipe) companyId: number,
  ) {
    return this.companies.getPage(req.user.id, companyId);
  }

  @Patch('companies/:companyId/page')
  updateCompanyPage(
    @Req() req: AuthReq,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() body: UpdateHubCompanyPageDto,
  ) {
    return this.companies.updatePage(req.user.id, companyId, body);
  }

  @Get('companies/:companyId/members')
  listCompanyMembers(@Param('companyId', ParseIntPipe) companyId: number) {
    return this.companies.listMembers(companyId);
  }

  @Get('companies/:companyId/posts')
  listCompanyPosts(
    @Param('companyId', ParseIntPipe) companyId: number,
    @Query('limit') limit?: string,
  ) {
    return this.companies.listPosts(
      companyId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('companies/:companyId/posts')
  createCompanyPost(
    @Req() req: AuthReq,
    @Param('companyId', ParseIntPipe) companyId: number,
    @Body() body: CreatePostDto,
  ) {
    return this.companies.createPost(req.user.id, companyId, body);
  }

  @Get('providers/:providerId/channel')
  getProviderChannel(
    @Req() req: AuthReq,
    @Param('providerId', ParseIntPipe) providerId: number,
  ) {
    return this.providers.getChannel(req.user.id, providerId);
  }

  @Get('providers/:providerId/courses')
  listProviderCourses(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.providers.listCourses(providerId);
  }

  @Get('providers/:providerId/posts')
  listProviderPosts(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query('limit') limit?: string,
  ) {
    return this.providers.listPosts(
      providerId,
      limit ? parseInt(limit, 10) : undefined,
    );
  }

  @Post('providers/:providerId/posts')
  createProviderPost(
    @Req() req: AuthReq,
    @Param('providerId', ParseIntPipe) providerId: number,
    @Body() body: CreatePostDto,
  ) {
    return this.providers.createPost(req.user.id, providerId, body);
  }

  @Post('follows')
  follow(
    @Req() req: AuthReq,
    @Body() body: { targetType: HubFollowTargetType; targetId: string },
  ) {
    return this.followService.follow(
      req.user.id,
      body.targetType,
      body.targetId,
    );
  }

  @Post('follows/unfollow')
  unfollow(
    @Req() req: AuthReq,
    @Body() body: { targetType: HubFollowTargetType; targetId: string },
  ) {
    return this.followService.unfollow(
      req.user.id,
      body.targetType,
      body.targetId,
    );
  }

  @Get('follows/status')
  followStatus(
    @Req() req: AuthReq,
    @Query('targetType') targetType: HubFollowTargetType,
    @Query('targetId') targetId: string,
  ) {
    return this.followService
      .isFollowing(req.user.id, targetType, targetId)
      .then((following) => ({ following }));
  }

  @Get('suggestions')
  getSuggestions(@Req() req: AuthReq) {
    return this.suggestions.getSuggestions(req.user.id);
  }
}
