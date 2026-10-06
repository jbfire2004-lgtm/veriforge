import { PrismaClient } from '@prisma/client';
import { SafetyBlogService } from './safety-blog.service';
import { SafetyBlogCommentService } from './safety-blog-comment.service';
import { SafetyBlogCacheService } from './safety-blog-cache.service';
import { SafetyBlogSearchService } from './safety-blog-search.service';

export function createSafetyBlogService(
  prisma: PrismaClient,
): SafetyBlogService {
  const cache = new SafetyBlogCacheService();
  const search = new SafetyBlogSearchService();
  return new SafetyBlogService(prisma as never, cache, search);
}

export function createSafetyBlogCommentService(
  prisma: PrismaClient,
): SafetyBlogCommentService {
  return new SafetyBlogCommentService(
    prisma as never,
    new SafetyBlogCacheService(),
  );
}
