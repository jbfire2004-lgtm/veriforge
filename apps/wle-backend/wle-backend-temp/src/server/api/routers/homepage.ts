import { z } from 'zod';
import { createTRPCRouter, protectedProcedure } from '../trpc';

const homepageQuerySchema = z.object({
  cursor: z.string().uuid().optional(),
  limit: z.number().int().min(1).max(50).optional(),
  region: z.string().optional(),
  refresh: z.boolean().optional(),
});

export const homepageRouter = createTRPCRouter({
  getHomepage: protectedProcedure
    .input(homepageQuerySchema.optional())
    .query(async ({ ctx, input }) => {
      return ctx.homepage.buildForUser(ctx.userId, input ?? {});
    }),

  invalidateCache: protectedProcedure.mutation(async ({ ctx }) => {
    ctx.homepage.invalidateCache(ctx.userId);
    return { ok: true as const };
  }),
});
