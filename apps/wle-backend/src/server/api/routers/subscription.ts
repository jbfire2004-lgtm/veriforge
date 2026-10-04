import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, saasFetch } from './_saas';
import {
  authorizationField,
  billingCycle,
  billingPlan,
  billingStatus,
  productModuleToggleInput,
} from './_schemas';

/**
 * @deprecated Prefer `modules` and `billing` routers directly.
 */
export const subscriptionRouter = createTRPCRouter({
  getModules: publicProcedure
    .input(z.object({ authorization: authorizationField.optional() }))
    .query(({ input }) =>
      saasFetch('/modules', { authorization: bearer(input.authorization) }),
    ),

  updateModules: publicProcedure
    .input(
      z.object({
        authorization: authorizationField.optional(),
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

  getBilling: publicProcedure
    .input(z.object({ authorization: authorizationField.optional() }))
    .query(({ input }) =>
      saasFetch('/billing', { authorization: bearer(input.authorization) }),
    ),

  updateBilling: publicProcedure
    .input(
      z.object({
        authorization: authorizationField.optional(),
        billingPlan: billingPlan.optional(),
        billingStatus: billingStatus.optional(),
        billingCycle: billingCycle.optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, ...body } = input;
      return saasFetch('/billing/update', {
        method: 'POST',
        authorization: bearer(authorization),
        body: JSON.stringify(body),
      });
    }),
});
