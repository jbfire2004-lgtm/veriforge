import {
  applyToJobSchema,
  createJobPostSchema,
  jobBoardSearchSchema,
  updateApplicationStatusSchema,
  upsertWorkerProfileSchema,
} from '@vera/api-contract';
import { z } from 'zod';
import { createTRPCRouter, publicProcedure, protectedProcedure } from '../trpc';
import {
  createJobBoardService,
  createJobBoardWorkerService,
} from '../../../modules/vera-job-board/job-board.factory';

export const jobBoardRouter = createTRPCRouter({
  search: publicProcedure
    .input(jobBoardSearchSchema.optional())
    .query(({ ctx, input }) =>
      createJobBoardService(ctx.prisma).search(input ?? {}),
    ),

  getBySlug: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(({ ctx, input }) =>
      createJobBoardService(ctx.prisma).getBySlug(input.slug),
    ),

  getWorker: publicProcedure
    .input(z.object({ workerId: z.number().int() }))
    .query(({ ctx, input }) =>
      createJobBoardWorkerService(ctx.prisma).getProfile(input.workerId),
    ),

  sitemap: publicProcedure.query(({ ctx }) =>
    createJobBoardService(ctx.prisma).sitemapSlugs(),
  ),

  createJob: protectedProcedure
    .input(createJobPostSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { companyId: true },
      });
      return createJobBoardService(ctx.prisma).createJob({
        ...(input as Record<string, unknown>),
        companyId: input.companyId ?? user?.companyId ?? undefined,
      });
    }),

  applyToJob: protectedProcedure
    .input(applyToJobSchema)
    .mutation(({ ctx, input }) =>
      createJobBoardService(ctx.prisma).apply(
        ctx.userId,
        input.jobId,
        input.coverMessage,
      ),
    ),

  updateApplicationStatus: protectedProcedure
    .input(updateApplicationStatusSchema)
    .mutation(async ({ ctx, input }) => {
      await createJobBoardService(ctx.prisma).updateApplicationStatus(
        input.applicationId,
        ctx.userId,
        input.status,
      );
      return { ok: true as const };
    }),

  upsertProfile: protectedProcedure
    .input(upsertWorkerProfileSchema)
    .mutation(async ({ ctx, input }) => {
      const user = await ctx.prisma.user.findUnique({
        where: { id: ctx.userId },
        include: { worker: true },
      });
      if (!user?.worker) throw new Error('Worker account required');
      return createJobBoardWorkerService(ctx.prisma).upsertProfile(
        user.worker.id,
        input as Record<string, unknown>,
      );
    }),
});
