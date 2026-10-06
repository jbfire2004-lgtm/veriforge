import { Controller, Get, Post, Body, Param, Query, Req } from '@nestjs/common';
import { Public } from '../../auth/public.decorator';
import { SafetyBlogService } from './safety-blog.service';
import { SafetyBlogCommentService } from './safety-blog-comment.service';

@Controller('api/v1/safety-blog')
@Public()
export class SafetyBlogController {
  constructor(
    private readonly blog: SafetyBlogService,
    private readonly comments: SafetyBlogCommentService,
  ) {}

  @Get('posts')
  listPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('categorySlug') categorySlug?: string,
    @Query('tagSlug') tagSlug?: string,
    @Query('featured') featured?: string,
    @Query('safetyLevel') safetyLevel?: string,
    @Query('q') q?: string,
  ) {
    return this.blog.listPublished({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      categorySlug,
      tagSlug,
      featured: featured === 'true' ? true : undefined,
      safetyLevel,
      q,
    });
  }

  @Get('posts/trending')
  trending(@Query('limit') limit?: string) {
    return this.blog.getTrending(limit ? parseInt(limit, 10) : 6);
  }

  @Get('posts/:slug')
  getPost(@Param('slug') slug: string) {
    return this.blog.getBySlug(slug);
  }

  @Get('categories')
  categories() {
    return this.blog.listCategories();
  }

  @Get('tags')
  tags() {
    return this.blog.listTags();
  }

  @Get('sitemap')
  sitemap() {
    return this.blog.sitemapEntries();
  }

  @Get('posts/:slug/comments')
  listComments(@Param('slug') slug: string) {
    return this.comments.listForPost(slug);
  }

  @Post('comments')
  createComment(
    @Body()
    body: {
      postId: string;
      parentId?: string;
      authorName?: string;
      body: string;
    },
    @Req() req: { user?: { id: number } },
  ) {
    return this.comments.createComment({
      ...body,
      userId: req.user?.id,
    });
  }

  @Post('comments/:id/upvote')
  upvote(
    @Param('id') id: string,
    @Body() body: { voterKey?: string },
    @Req() req: { ip?: string; user?: { id: number } },
  ) {
    const voterKey =
      body.voterKey ??
      (req.user?.id ? `user:${req.user.id}` : `ip:${req.ip ?? 'anon'}`);
    return this.comments.upvote(id, voterKey, req.user?.id);
  }
}
