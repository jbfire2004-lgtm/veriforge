import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { API_V1_PREFIX } from '../../config/routes';
import { PrismaService } from '../../prisma/prisma.service';
import { PersonalizationService } from '../vera-hub-homepage/personalization.service';
import {
  CommentPostDto,
  CreatePostDto,
  EditPostDto,
  FeedQueryDto,
  FollowDto,
  MediaUploadDto,
  PinPostDto,
  PostIdDto,
  ReportPostDto,
} from './dto/social-post.dto';
import { SocialFeedService } from './social-feed.service';
import { SocialPostsService } from './social-posts.service';

type AuthReq = { user: { id: number } };

@Controller(`${API_V1_PREFIX}/social`)
@UseGuards(JwtAuthGuard, RolesGuard)
export class SocialFeedController {
  constructor(
    private readonly feed: SocialFeedService,
    private readonly posts: SocialPostsService,
    private readonly prisma: PrismaService,
    private readonly personalization: PersonalizationService,
  ) {}

  private async ctx(req: AuthReq) {
    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: req.user.id },
      include: { worker: true },
    });
    return this.personalization.resolveContext(user);
  }

  @Get('feed')
  async getFeed(@Req() req: AuthReq, @Query() query: FeedQueryDto) {
    const ctx = await this.ctx(req);
    return this.feed.getFeed(ctx, {
      cursor: query.cursor,
      limit: query.limit,
    });
  }

  @Get('feed/trending')
  getTrending() {
    return this.feed.getTrending();
  }

  @Get('ads/sponsored')
  getSponsored() {
    return this.feed.getSponsoredAds();
  }

  @Public()
  @Get('providers/profile/:providerId')
  getProviderProfile(@Param('providerId', ParseIntPipe) providerId: number) {
    return this.posts.getProviderProfile(providerId);
  }

  @Public()
  @Get('providers/:providerId/posts')
  getProviderPosts(
    @Param('providerId', ParseIntPipe) providerId: number,
    @Query('limit') limit?: string,
  ) {
    return this.posts.listProviderPosts(
      providerId,
      limit ? parseInt(limit, 10) : 20,
    );
  }

  @Post('posts/create')
  createPost(@Req() req: AuthReq, @Body() dto: CreatePostDto) {
    return this.posts.create(req.user.id, dto);
  }

  @Patch('posts/edit')
  editPost(@Req() req: AuthReq, @Body() dto: EditPostDto) {
    return this.posts.edit(req.user.id, dto);
  }

  @Delete('posts/delete')
  deletePost(@Req() req: AuthReq, @Body() dto: PostIdDto) {
    return this.posts.deletePost(dto.postId, req.user.id);
  }

  @Post('posts/like')
  likePost(@Req() req: AuthReq, @Body() dto: PostIdDto) {
    return this.posts.like(dto.postId, req.user.id);
  }

  @Post('posts/unlike')
  unlikePost(@Req() req: AuthReq, @Body() dto: PostIdDto) {
    return this.posts.unlike(dto.postId, req.user.id);
  }

  @Post('posts/comment')
  commentPost(@Req() req: AuthReq, @Body() dto: CommentPostDto) {
    return this.posts.comment(req.user.id, dto);
  }

  @Delete('posts/comment/delete')
  deleteComment(@Req() req: AuthReq, @Query('commentId') commentId: string) {
    return this.posts.deleteComment(commentId, req.user.id);
  }

  @Post('posts/share')
  sharePost(@Body() dto: PostIdDto) {
    return this.posts.share(dto.postId);
  }

  @Post('posts/pin')
  pinPost(@Req() req: AuthReq, @Body() dto: PinPostDto) {
    return this.posts.pin(req.user.id, dto);
  }

  @Post('posts/unpin')
  unpinPost(@Body() dto: PostIdDto) {
    return this.posts.unpin(dto.postId);
  }

  @Post('posts/report')
  reportPost(@Req() req: AuthReq, @Body() dto: ReportPostDto) {
    return this.posts.report(req.user.id, dto);
  }

  @Post('posts/save')
  savePost(@Req() req: AuthReq, @Body() dto: PostIdDto) {
    return this.posts.save(dto.postId, req.user.id);
  }

  @Post('follow')
  follow(@Req() req: AuthReq, @Body() dto: FollowDto) {
    return this.posts.follow(req.user.id, dto);
  }

  @Post('unfollow')
  unfollow(@Req() req: AuthReq, @Body() dto: FollowDto) {
    return this.posts.unfollow(req.user.id, dto);
  }

  @Get('feed/suggestions/providers')
  async suggestProviders(@Req() req: AuthReq) {
    return this.feed.suggestProviders(req.user.id);
  }

  @Get('feed/suggestions/companies')
  async suggestCompanies(@Req() req: AuthReq) {
    return this.feed.suggestCompanies(req.user.id);
  }

  @Post('media/upload')
  uploadMedia(@Req() req: AuthReq, @Body() dto: MediaUploadDto) {
    return this.posts.uploadMedia(req.user.id, dto);
  }
}
