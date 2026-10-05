import { createTRPCRouter, protectedProcedure } from '../trpc';
import { prisma } from '../../db';
import { evaluateWorker } from '../../services/verification';

export const trainingRouter = createTRPCRouter({
  getCompanyTrainingStatus: protectedProcedure.query(async ({ ctx }) => {
    const user = await prisma.user.findUnique({
      where: { id: ctx.userId },
      select: { companyId: true },
    });
    if (!user?.companyId) {
      return { nonCompliant: [], expiringSoon: [], all: [] };
    }

    const workers = await prisma.worker.findMany({
      where: { companyId: user.companyId },
    });

    const results = await Promise.all(
      workers.map(async (w) => {
        const verification = await evaluateWorker(w.id);
        return {
          workerId: w.id,
          name: `${w.firstName} ${w.lastName}`,
          issues: verification.issues,
          isCompliant: verification.isCompliant,
        };
      }),
    );

    return {
      nonCompliant: results.filter((r) => !r.isCompliant),
      expiringSoon: results.filter((r) =>
        r.issues.some((i) => i.type === 'EXPIRING_SOON'),
      ),
      all: results,
    };
  }),
});
