import { z } from 'zod';
import {
  feedQuerySchema,
  interactFeedInputSchema,
  subscribeFeedInputSchema,
} from '@vera/api-contract';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { createFeedEngineService } from '../../../modules/vera-feed-engine/feed-engine.factory';
import { FeedPersonalizationService } from '../../../modules/vera-feed-engine/feed-personalization.service';
import type { PrismaService } from '../../../prisma/prisma.service';
import { createSocialService } from '../../../modules/vera-social/social.factory';

export const feedRouter = createTRPCRouter({
  getPage: protectedProcedure
    .input(feedQuerySchema.optional())
    .query(async ({ ctx, input }) => {
      const feed = createFeedEngineService(ctx.prisma);
      const personalization = new FeedPersonalizationService(
        ctx.prisma as unknown as PrismaService,
      );
      const user = await ctx.prisma.user.findUniqueOrThrow({
        where: { id: ctx.userId },
        include: { worker: true },
      });
      const hubCtx = personalization.resolveContext(user);
      if (input?.refresh) await feed.refreshAndInvalidate(hubCtx);
      return feed.getFeedPage(hubCtx, {
        cursor: input?.cursor,
        limit: input?.limit,
        sources: input?.sources,
        refresh: input?.refresh,
      });
    }),

  interact: protectedProcedure
    .input(interactFeedInputSchema)
    .mutation(async ({ ctx, input }) => {
      await createSocialService(ctx.prisma).interact(
        ctx.userId,
        input.feedItemId,
        input.type,
        input.body,
        input.parentId,
      );
      return { ok: true as const };
    }),

  comments: protectedProcedure
    .input(z.object({ feedItemId: z.string().uuid() }))
    .query(async ({ ctx, input }) =>
      createSocialService(ctx.prisma).listComments(input.feedItemId),
    ),

  subscribe: protectedProcedure
    .input(subscribeFeedInputSchema)
    .mutation(async ({ ctx, input }) => {
      const feed = createFeedEngineService(ctx.prisma);
      return feed.subscribe(ctx.userId, input.targetType, input.targetKey);
    }),

  subscriptions: protectedProcedure.query(async ({ ctx }) => {
    const feed = createFeedEngineService(ctx.prisma);
    return feed.listSubscriptions(ctx.userId);
  }),

  refresh: protectedProcedure.mutation(async ({ ctx }) => {
    const feed = createFeedEngineService(ctx.prisma);
    const personalization = new FeedPersonalizationService(
      ctx.prisma as unknown as PrismaService,
    );
    const user = await ctx.prisma.user.findUniqueOrThrow({
      where: { id: ctx.userId },
      include: { worker: true },
    });
    const hubCtx = personalization.resolveContext(user);
    await feed.refreshAndInvalidate(hubCtx);
    return { ok: true as const };
  }),
});
