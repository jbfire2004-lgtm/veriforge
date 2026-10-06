import {
  followUserInputSchema,
  interactFeedSocialInputSchema,
  socialActivityQuerySchema,
  subscribeFeedInputSchema,
} from '@vera/api-contract';
import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import { createSocialService } from '../../../modules/vera-social/social.factory';

export const socialRouter = createTRPCRouter({
  interact: protectedProcedure
    .input(interactFeedSocialInputSchema)
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
    .query(({ ctx, input }) =>
      createSocialService(ctx.prisma).listComments(input.feedItemId),
    ),

  follow: protectedProcedure
    .input(followUserInputSchema)
    .mutation(({ ctx, input }) =>
      createSocialService(ctx.prisma).followUser(ctx.userId, input.userId),
    ),

  unfollow: protectedProcedure
    .input(followUserInputSchema)
    .mutation(({ ctx, input }) =>
      createSocialService(ctx.prisma).unfollowUser(ctx.userId, input.userId),
    ),

  followStatus: protectedProcedure
    .input(followUserInputSchema)
    .query(({ ctx, input }) =>
      createSocialService(ctx.prisma).followStatus(ctx.userId, input.userId),
    ),

  following: protectedProcedure.query(({ ctx }) =>
    createSocialService(ctx.prisma).listFollowing(ctx.userId),
  ),

  followers: protectedProcedure.query(({ ctx }) =>
    createSocialService(ctx.prisma).listFollowers(ctx.userId),
  ),

  activity: protectedProcedure
    .input(socialActivityQuerySchema.optional())
    .query(({ ctx, input }) =>
      createSocialService(ctx.prisma).getActivity(ctx.userId, input ?? {}),
    ),

  subscribe: protectedProcedure
    .input(subscribeFeedInputSchema)
    .mutation(({ ctx, input }) =>
      createSocialService(ctx.prisma).subscribeTopic(
        ctx.userId,
        input.targetType,
        input.targetKey,
      ),
    ),
});
