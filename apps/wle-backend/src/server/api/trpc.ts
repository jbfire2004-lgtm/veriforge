import { initTRPC, TRPCError } from '@trpc/server';
import type { CreateExpressContextOptions } from '@trpc/server/adapters/express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db';
import { createHubHomepageService } from '../../modules/vera-hub-homepage/hub-homepage.factory';
import { resolveJwtSecret } from '../../auth/jwt-secret.util';

export type TrpcContext = {
  prisma: typeof prisma;
  homepage: ReturnType<typeof createHubHomepageService>;
  userId: number | null;
  role: string | null;
};

export async function createTrpcContext({
  req,
}: CreateExpressContextOptions): Promise<TrpcContext> {
  let userId: number | null = null;
  let role: string | null = null;
  const auth = req.headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    try {
      const token = auth.slice(7);
      const payload = jwt.verify(token, resolveJwtSecret()) as jwt.JwtPayload & {
        sub?: string | number;
      };
      userId = payload.sub != null ? Number(payload.sub) : null;
      if (userId != null && Number.isNaN(userId)) userId = null;
      if (userId != null) {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { role: true, active: true },
        });
        if (user?.active) {
          role = user.role;
        } else {
          userId = null;
          role = null;
        }
      }
    } catch {
      userId = null;
      role = null;
    }
  }
  return {
    prisma,
    homepage: createHubHomepageService(prisma),
    userId,
    role,
  };
}

const t = initTRPC.context<TrpcContext>().create();

export const createTRPCRouter = t.router;
export const publicProcedure = t.procedure;

export const protectedProcedure = t.procedure.use(({ ctx, next }) => {
  if (!ctx.userId) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }
  return next({
    ctx: { ...ctx, userId: ctx.userId },
  });
});
