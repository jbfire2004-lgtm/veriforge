import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, saasFetch } from './_saas';
import {
  authorizationField,
  productModuleCode,
  productModuleToggleInput,
} from './_schemas';

export const modulesRouter = createTRPCRouter({
  /** GET /api/modules.listModules */
  listModules: publicProcedure
    .input(z.object({ authorization: authorizationField }))
    .query(({ input }) =>
      saasFetch('/modules', { authorization: bearer(input.authorization) }),
    ),

  /** POST /api/modules.updateModules */
  updateModules: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        modules: z.array(productModuleToggleInput).min(1),
      }),
    )
    .mutation(({ input }) =>
      saasFetch('/modules/update', {
        method: 'POST',
        authorization: bearer(input.authorization),
        body: JSON.stringify({ modules: input.modules }),
      }),
    ),

  /** GET /api/modules.getModuleStatus */
  getModuleStatus: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        code: productModuleCode.optional(),
      }),
    )
    .query(async ({ input }) => {
      const view = await saasFetch<{
        modules?: Array<{ code: string; enabled: boolean; required?: boolean }>;
        billingPlan?: string;
        billingStatus?: string;
      }>('/modules', { authorization: bearer(input.authorization) });

      const modules = view.modules ?? [];
      if (input.code) {
        const row = modules.find((m) => m.code === input.code);
        return {
          code: input.code,
          enabled: row?.enabled ?? false,
          required: row?.required ?? false,
          billingPlan: view.billingPlan ?? null,
          billingStatus: view.billingStatus ?? null,
        };
      }

      return {
        billingPlan: view.billingPlan ?? null,
        billingStatus: view.billingStatus ?? null,
        modules: modules.map((m) => ({
          code: m.code,
          enabled: m.enabled,
          required: m.required ?? false,
        })),
      };
    }),

  /** Public legacy Stripe module catalog */
  catalog: publicProcedure.query(() => saasFetch('/modules/catalog')),
});
