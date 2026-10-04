import { createTRPCRouter, protectedProcedure } from '../trpc';
import { z } from 'zod';
import { prisma } from '../../db';

export const companyRouter = createTRPCRouter({
  getTrainingRequirements: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { companyId: true },
    });
    if (!user?.companyId) return { requirements: [] };
    const requirements = await prisma.trainingRequirement.findMany({
      where: { companyId: user.companyId },
      orderBy: { courseName: 'asc' },
    });
    return { requirements };
  }),

  updateTrainingRequirements: protectedProcedure
    .input(
      z.object({
        requirements: z.array(
          z.object({
            courseName: z.string(),
            expiresInDays: z.number().optional(),
          }),
        ),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const user = await prisma.user.findUnique({
        where: { id: ctx.userId },
        select: { companyId: true },
      });
      if (!user?.companyId) {
        throw new Error('Company context required');
      }
      const companyId = user.companyId;

      await prisma.trainingRequirement.deleteMany({ where: { companyId } });

      await prisma.trainingRequirement.createMany({
        data: input.requirements.map((r) => ({
          companyId,
          courseName: r.courseName,
          expiresInDays: r.expiresInDays ?? null,
        })),
      });

      return { success: true };
    }),
});
