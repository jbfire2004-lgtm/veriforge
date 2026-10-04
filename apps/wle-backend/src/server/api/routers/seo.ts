import { seoLookupSchema } from '@vera/api-contract';
import { createTRPCRouter, publicProcedure } from '../trpc';
import { createSeoEngineService } from '../../../modules/vera-seo-engine/seo.factory';

export const seoRouter = createTRPCRouter({
  sitemap: publicProcedure.query(({ ctx }) =>
    createSeoEngineService(ctx.prisma).getSitemap(),
  ),

  metadata: publicProcedure
    .input(seoLookupSchema)
    .query(({ ctx, input }) =>
      createSeoEngineService(ctx.prisma).getMetadata(input),
    ),

  schema: publicProcedure
    .input(seoLookupSchema)
    .query(({ ctx, input }) =>
      createSeoEngineService(ctx.prisma).getSchema(input),
    ),
});
