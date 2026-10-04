import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard';
import { RolesGuard } from '../../auth/roles.guard';
import { Roles } from '../../auth/roles.decorator';
import { UserRole } from '@prisma/client';
import { SafetyBlogService } from './safety-blog.service';
import { SafetyBlogCommentService } from './safety-blog-comment.service';

@Controller('api/v1/admin/safety-blog')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
export class SafetyBlogAdminController {
  constructor(
    private readonly blog: SafetyBlogService,
    private readonly comments: SafetyBlogCommentService,
  ) {}

  @Get('posts')
  listPosts(
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string,
    @Query('status') status?: string,
  ) {
    return this.blog.adminList({
      page: page ? parseInt(page, 10) : undefined,
      pageSize: pageSize ? parseInt(pageSize, 10) : undefined,
      status,
    });
  }

  @Get('posts/:id')
  getPost(@Param('id') id: string) {
    return this.blog.adminGet(id);
  }

  @Post('posts')
  createPost(@Body() body: Record<string, unknown>) {
    return this.blog.adminCreate(body);
  }

  @Patch('posts/:id')
  updatePost(@Param('id') id: string, @Body() body: Record<string, unknown>) {
    return this.blog.adminUpdate(id, body);
  }

  @Delete('posts/:id')
  deletePost(@Param('id') id: string) {
    return this.blog.adminDelete(id);
  }

  @Get('categories')
  categories() {
    return this.blog.listCategories();
  }

  @Post('categories')
  upsertCategory(
    @Body()
    body: {
      slug?: string;
      name: string;
      description?: string;
      sortOrder?: number;
    },
  ) {
    return this.blog.adminUpsertCategory(body);
  }

  @Delete('categories/:id')
  deleteCategory(@Param('id') id: string) {
    return this.blog.adminDeleteCategory(id);
  }

  @Get('tags')
  tags() {
    return this.blog.listTags();
  }

  @Post('tags')
  upsertTag(@Body() body: { slug?: string; name: string }) {
    return this.blog.adminUpsertTag(body);
  }

  @Delete('tags/:id')
  deleteTag(@Param('id') id: string) {
    return this.blog.adminDeleteTag(id);
  }

  @Get('comments/pending')
  pendingComments() {
    return this.comments.listPending();
  }

  @Patch('comments/:id/moderate')
  moderate(@Param('id') id: string, @Body() body: { status: string }) {
    return this.comments.moderate(id, body.status);
  }
}
