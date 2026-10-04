import {
  createSafetyBlogCommentSchema,
  createSafetyBlogPostSchema,
  moderateCommentSchema,
  safetyBlogListQuerySchema,
  updateSafetyBlogPostSchema,
} from '@vera/api-contract';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { createSafetyBlogService } from '../../../modules/vera-safety-blog/safety-blog.factory';
import { createSafetyBlogCommentService } from '../../../modules/vera-safety-blog/safety-blog.factory';

export const safetyBlogRouter = createTRPCRouter({
  listPosts: publicProcedure
    .input(safetyBlogListQuerySchema.optional())
    .query(({ ctx, input }) =>
      createSafetyBlogService(ctx.prisma).listPublished(input ?? {}),
    ),

  getPost: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) =>
      createSafetyBlogService(ctx.prisma).getBySlug(input.slug),
    ),

  trending: publicProcedure
    .input(z.object({ limit: z.number().int().optional() }).optional())
    .query(({ ctx, input }) =>
      createSafetyBlogService(ctx.prisma).getTrending(input?.limit ?? 6),
    ),

  categories: publicProcedure.query(({ ctx }) =>
    createSafetyBlogService(ctx.prisma).listCategories(),
  ),

  tags: publicProcedure.query(({ ctx }) =>
    createSafetyBlogService(ctx.prisma).listTags(),
  ),

  sitemap: publicProcedure.query(({ ctx }) =>
    createSafetyBlogService(ctx.prisma).sitemapEntries(),
  ),

  listComments: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) =>
      createSafetyBlogCommentService(ctx.prisma).listForPost(input.slug),
    ),

  createComment: publicProcedure
    .input(createSafetyBlogCommentSchema)
    .mutation(({ ctx, input }) =>
      createSafetyBlogCommentService(ctx.prisma).createComment({
        ...input,
        userId: ctx.userId ?? undefined,
      }),
    ),

  adminListPosts: protectedProcedure
    .input(
      z
        .object({
          page: z.number().optional(),
          pageSize: z.number().optional(),
          status: z.string().optional(),
        })
        .optional(),
    )
    .query(({ ctx, input }) =>
      createSafetyBlogService(ctx.prisma).adminList(input ?? {}),
    ),

  adminCreatePost: protectedProcedure
    .input(createSafetyBlogPostSchema)
    .mutation(({ ctx, input }) =>
      createSafetyBlogService(ctx.prisma).adminCreate(input),
    ),

  adminUpdatePost: protectedProcedure
    .input(
      z.object({ id: z.string().uuid(), data: updateSafetyBlogPostSchema }),
    )
    .mutation(({ ctx, input }) =>
      createSafetyBlogService(ctx.prisma).adminUpdate(
        input.id,
        input.data as Record<string, unknown>,
      ),
    ),

  adminDeletePost: protectedProcedure
    .input(z.object({ id: z.string().uuid() }))
    .mutation(({ ctx, input }) =>
      createSafetyBlogService(ctx.prisma).adminDelete(input.id),
    ),

  adminUpsertCategory: protectedProcedure
    .input(
      z.object({
        slug: z.string().optional(),
        name: z.string(),
        description: z.string().optional(),
        sortOrder: z.number().optional(),
      }),
    )
    .mutation(({ ctx, input }) =>
      createSafetyBlogService(ctx.prisma).adminUpsertCategory(input),
    ),

  adminUpsertTag: protectedProcedure
    .input(z.object({ slug: z.string().optional(), name: z.string() }))
    .mutation(({ ctx, input }) =>
      createSafetyBlogService(ctx.prisma).adminUpsertTag(input),
    ),

  adminModerateComment: protectedProcedure
    .input(moderateCommentSchema)
    .mutation(({ ctx, input }) =>
      createSafetyBlogCommentService(ctx.prisma).moderate(
        input.commentId,
        input.status,
      ),
    ),

  adminPendingComments: protectedProcedure.query(({ ctx }) =>
    createSafetyBlogCommentService(ctx.prisma).listPending(),
  ),
});
