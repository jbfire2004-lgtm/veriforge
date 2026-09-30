import {
  applyExpertVerificationSchema,
  moderationQueueQuerySchema,
  reportPostSchema,
  reportUserSchema,
  resolveModerationCaseSchema,
  reviewExpertVerificationSchema,
  upsertAutoRuleSchema,
} from '@vera/api-contract';
import { createTRPCRouter, protectedProcedure } from '../trpc';
import {
  createExpertVerificationService,
  createModerationQueueService,
  createModerationReportService,
} from '../../../modules/vera-moderation/moderation.factory';
import { ModerationAutoRulesService } from '../../../modules/vera-moderation/moderation-auto-rules.service';

const adminRoles = new Set([
  'ADMIN',
  'SUPERVISOR',
  'COMPANY_ADMIN',
  'SUPER_ADMIN',
]);

function assertAdmin(role: string | null) {
  if (!role || !adminRoles.has(role)) {
    throw new Error('Admin access required');
  }
}

export const moderationRouter = createTRPCRouter({
  reportPost: protectedProcedure
    .input(reportPostSchema)
    .mutation(({ ctx, input }) =>
      createModerationReportService(ctx.prisma).reportPost(
        ctx.userId,
        input.targetType,
        input.targetId,
        input.reason,
        input.details,
      ),
    ),

  reportUser: protectedProcedure
    .input(reportUserSchema)
    .mutation(({ ctx, input }) =>
      createModerationReportService(ctx.prisma).reportUser(
        ctx.userId,
        input.userId,
        input.reason,
        input.details,
      ),
    ),

  applyExpertVerification: protectedProcedure
    .input(applyExpertVerificationSchema)
    .mutation(({ ctx, input }) =>
      createExpertVerificationService(ctx.prisma).apply(
        ctx.userId,
        input.statement,
        input.tradeEvidence,
      ),
    ),

  adminQueue: protectedProcedure
    .input(moderationQueueQuerySchema.optional())
    .query(({ ctx, input }) => {
      assertAdmin(ctx.role);
      return createModerationQueueService(ctx.prisma).listQueue(input ?? {});
    }),

  adminStats: protectedProcedure.query(({ ctx }) => {
    assertAdmin(ctx.role);
    return createModerationQueueService(ctx.prisma).queueStats();
  }),

  resolveCase: protectedProcedure
    .input(resolveModerationCaseSchema)
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.role);
      await createModerationQueueService(ctx.prisma).resolveCase(
        input.caseId,
        ctx.userId,
        input,
      );
      return { ok: true as const };
    }),

  listRules: protectedProcedure.query(({ ctx }) => {
    assertAdmin(ctx.role);
    return new ModerationAutoRulesService(ctx.prisma as never).listRules();
  }),

  upsertRule: protectedProcedure
    .input(upsertAutoRuleSchema)
    .mutation(({ ctx, input }) => {
      assertAdmin(ctx.role);
      return new ModerationAutoRulesService(ctx.prisma as never).upsertRule(
        input as never,
      );
    }),

  listExpertVerification: protectedProcedure.query(({ ctx }) => {
    assertAdmin(ctx.role);
    return createExpertVerificationService(ctx.prisma).listPending();
  }),

  reviewExpertVerification: protectedProcedure
    .input(reviewExpertVerificationSchema)
    .mutation(async ({ ctx, input }) => {
      assertAdmin(ctx.role);
      await createExpertVerificationService(ctx.prisma).review(
        input.requestId,
        ctx.userId,
        input.status,
        input.reviewNote,
      );
      return { ok: true as const };
    }),
});
