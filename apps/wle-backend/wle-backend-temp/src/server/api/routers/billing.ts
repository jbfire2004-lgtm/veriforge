import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, saasFetch } from './_saas';
import {
  authorizationField,
  billingCycle,
  billingPlan,
  billingStatus,
} from './_schemas';

const billingUpdateInput = z.object({
  authorization: authorizationField,
  billingPlan: billingPlan.optional(),
  billingStatus: billingStatus.optional(),
  billingCycle: billingCycle.optional(),
});

export const billingRouter = createTRPCRouter({
  /** GET /api/billing.getBillingProfile */
  getBillingProfile: publicProcedure
    .input(z.object({ authorization: authorizationField }))
    .query(({ input }) =>
      saasFetch('/billing', { authorization: bearer(input.authorization) }),
    ),

  /** POST /api/billing.updateBilling */
  updateBilling: publicProcedure.input(billingUpdateInput).mutation(({ input }) => {
    const { authorization, ...body } = input;
    return saasFetch('/billing/update', {
      method: 'POST',
      authorization: bearer(authorization),
      body: JSON.stringify(body),
    });
  }),

  /** POST /api/billing.updatePlan */
  updatePlan: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        billingPlan: billingPlan,
        billingCycle: billingCycle.optional(),
      }),
    )
    .mutation(({ input }) => {
      const { authorization, billingPlan: plan, billingCycle: cycle } = input;
      return saasFetch('/billing/update', {
        method: 'POST',
        authorization: bearer(authorization),
        body: JSON.stringify({ billingPlan: plan, billingCycle: cycle }),
      });
    }),
});
