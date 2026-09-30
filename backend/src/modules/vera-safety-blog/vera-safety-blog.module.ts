import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { SafetyBlogController } from './safety-blog.controller';
import { SafetyBlogAdminController } from './safety-blog-admin.controller';
import { SafetyBlogService } from './safety-blog.service';
import { SafetyBlogCommentService } from './safety-blog-comment.service';
import { SafetyBlogCacheService } from './safety-blog-cache.service';
import { SafetyBlogSearchService } from './safety-blog-search.service';

@Module({
  imports: [PrismaModule],
  controllers: [SafetyBlogController, SafetyBlogAdminController],
  providers: [
    SafetyBlogService,
    SafetyBlogCommentService,
    SafetyBlogCacheService,
    SafetyBlogSearchService,
  ],
  exports: [SafetyBlogService, SafetyBlogCacheService],
})
export class VeraSafetyBlogModule {}
