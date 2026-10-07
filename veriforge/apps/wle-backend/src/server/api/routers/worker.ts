import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../../db';
import { evaluateWorker } from '../../services/verification';

export const workerRouter = createTRPCRouter({
  listByCompany: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { companyId: true },
    });
    if (!user?.companyId) return [];
    return prisma.worker.findMany({
      where: { companyId: user.companyId },
      orderBy: { lastName: 'asc' },
    });
  }),

  getWorkerOverview: protectedProcedure
    .input(z.object({ workerId: z.coerce.number().int() }))
    .query(async ({ input }) => {
      const worker = await prisma.worker.findUnique({
        where: { id: input.workerId },
        include: {
          company: true,
          trainingRecords: { include: { certification: true } },
          documents: {
            where: { type: 'TRAINING' },
          },
        },
      });

      if (!worker) return null;

      const verification = await evaluateWorker(worker.id);

      return {
        worker,
        verification,
      };
    }),
});
