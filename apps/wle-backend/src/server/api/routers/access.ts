import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { canWorkerAccessSite } from '../../services/access';

export const accessRouter = createTRPCRouter({
  check: protectedProcedure
    .input(z.object({ workerId: z.coerce.number().int(), siteId: z.string() }))
    .query(async ({ input }) => {
      return await canWorkerAccessSite(input.workerId, input.siteId);
    }),
});
