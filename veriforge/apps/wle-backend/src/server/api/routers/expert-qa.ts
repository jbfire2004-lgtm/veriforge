import {
  acceptExpertQaAnswerSchema,
  createExpertQaAnswerSchema,
  createExpertQaQuestionSchema,
  endorseExpertSchema,
  expertQaListQuerySchema,
  moderateExpertQaSchema,
  voteExpertQaAnswerSchema,
} from '@vera/api-contract';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import { createExpertQaService } from '../../../modules/vera-expert-qa/expert-qa.factory';
import { ExpertProfileService } from '../../../modules/vera-expert-qa/expert-profile.service';

export const expertQaRouter = createTRPCRouter({
  list: publicProcedure
    .input(expertQaListQuerySchema.optional())
    .query(({ ctx, input }) =>
      createExpertQaService(ctx.prisma).listPublic(input ?? {}),
    ),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) =>
      createExpertQaService(ctx.prisma).getBySlug(input.slug),
    ),

  getExpert: publicProcedure
    .input(z.object({ userId: z.number().int() }))
    .query(({ ctx, input }) =>
      new ExpertProfileService(ctx.prisma as never).getByUserId(input.userId),
    ),

  sitemap: publicProcedure.query(({ ctx }) =>
    createExpertQaService(ctx.prisma).sitemapSlugs(),
  ),

  ask: protectedProcedure
    .input(createExpertQaQuestionSchema)
    .mutation(({ ctx, input }) =>
      createExpertQaService(ctx.prisma).createQuestion(
        ctx.userId,
        input as Record<string, unknown>,
      ),
    ),

  answer: protectedProcedure
    .input(createExpertQaAnswerSchema)
    .mutation(async ({ ctx, input }) => {
      await createExpertQaService(ctx.prisma).createAnswer(
        ctx.userId,
        input.questionId,
        input.body,
      );
      return { ok: true as const };
    }),

  vote: publicProcedure
    .input(voteExpertQaAnswerSchema)
    .mutation(({ ctx, input }) =>
      createExpertQaService(ctx.prisma).voteAnswer(
        input.answerId,
        input.value,
        input.voterKey ??
          (ctx.userId ? `user:${ctx.userId}` : `anon:${Date.now()}`),
        ctx.userId ?? undefined,
      ),
    ),

  accept: protectedProcedure
    .input(acceptExpertQaAnswerSchema)
    .mutation(async ({ ctx, input }) => {
      await createExpertQaService(ctx.prisma).acceptAnswer(
        ctx.userId,
        input.questionId,
        input.answerId,
      );
      return { ok: true as const };
    }),

  endorse: protectedProcedure
    .input(endorseExpertSchema)
    .mutation(async ({ ctx, input }) => {
      await createExpertQaService(ctx.prisma).endorseExpert(
        ctx.userId,
        input.expertProfileId,
        input.skill,
        input.message,
      );
      return { ok: true as const };
    }),

  moderateQuestion: protectedProcedure
    .input(moderateExpertQaSchema)
    .mutation(async ({ ctx, input }) => {
      await createExpertQaService(ctx.prisma).moderateQuestion(
        input.id,
        input.moderationStatus,
      );
      return { ok: true as const };
    }),

  verifyExpert: protectedProcedure
    .input(z.object({ userId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      await new ExpertProfileService(ctx.prisma as never).verifyExpert(
        input.userId,
      );
      return { ok: true as const };
    }),
});
