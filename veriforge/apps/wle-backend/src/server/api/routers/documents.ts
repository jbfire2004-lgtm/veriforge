import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../../db';

function parseOptionalInt(value?: string): number | null {
  if (value == null || value === '') return null;
  const n = Number(value);
  return Number.isFinite(n) ? n : null;
}

export const documentsRouter = createTRPCRouter({
  getUnassigned: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { companyId: true },
    });
    if (!user?.companyId) return [];

    return prisma.document.findMany({
      where: {
        companyId: user.companyId,
        workerId: null,
        type: 'TRAINING',
      },
      orderBy: { createdAt: 'desc' },
    });
  }),

  assignToWorker: protectedProcedure
    .input(
      z.object({
        documentId: z.coerce.number().int(),
        workerId: z.coerce.number().int(),
      }),
    )
    .mutation(async ({ input }) => {
      return prisma.document.update({
        where: { id: input.documentId },
        data: { workerId: input.workerId },
      });
    }),
});
