import { createTRPCRouter, publicProcedure } from '../trpc';
import { z } from 'zod';
import { bearer, placeholderResult } from './_saas';
import { authorizationField } from './_schemas';

/**
 * Manual cron triggers for platform operators.
 * Production jobs run via services/veriforge-saas-service worker + node-cron.
 *
 * Schedules (UTC):
 * - complianceExpiryCheck: daily 02:00
 * - scorecardRecalculation: hourly
 * - notificationDispatcher: every 5 minutes
 * - billingCycleCheck: daily 03:00
 * - moduleUsageTracker: hourly
 */
export const cronRouter = createTRPCRouter({
  /** POST /api/cron.runComplianceExpiryCheck */
  runComplianceExpiryCheck: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        orgId: z.string().uuid().optional(),
      }),
    )
    .mutation(({ input }) => {
      bearer(input.authorization, 'Platform operator bearer');
      return placeholderResult('cron', 'runComplianceExpiryCheck', {
        orgId: input.orgId ?? null,
        scheduled: '0 2 * * *',
        service: 'complianceService.checkExpiries()',
        job: 'jobs/complianceExpiryCheck.ts',
      });
    }),

  /** POST /api/cron.runScorecardRecalculation */
  runScorecardRecalculation: publicProcedure
    .input(
      z.object({
        authorization: authorizationField,
        orgId: z.string().uuid().optional(),
      }),
    )
    .mutation(({ input }) => {
      bearer(input.authorization, 'Platform operator bearer');
      return placeholderResult('cron', 'runScorecardRecalculation', {
        orgId: input.orgId ?? null,
        scheduled: '0 * * * *',
        service: 'complianceScorecardService.recalculateAll()',
        job: 'jobs/scorecardRecalculation.ts',
      });
    }),

  /** POST /api/cron.runNotificationDispatcher */
  runNotificationDispatcher: publicProcedure
    .input(z.object({ authorization: authorizationField }))
    .mutation(({ input }) => {
      bearer(input.authorization, 'Platform operator bearer');
      return placeholderResult('cron', 'runNotificationDispatcher', {
        scheduled: '*/5 * * * *',
        service: 'notificationDispatchService.dispatchQueued()',
        job: 'jobs/notificationDispatcher.ts',
      });
    }),

  /** POST /api/cron.runBillingCycleCheck */
  runBillingCycleCheck: publicProcedure
    .input(z.object({ authorization: authorizationField }))
    .mutation(({ input }) => {
      bearer(input.authorization, 'Platform operator bearer');
      return placeholderResult('cron', 'runBillingCycleCheck', {
        scheduled: '0 3 * * *',
        service: 'billingCycleService.checkBillingCycles()',
        job: 'jobs/billingCycleCheck.ts',
      });
    }),

  /** POST /api/cron.runModuleUsageTracker */
  runModuleUsageTracker: publicProcedure
    .input(z.object({ authorization: authorizationField }))
    .mutation(({ input }) => {
      bearer(input.authorization, 'Platform operator bearer');
      return placeholderResult('cron', 'runModuleUsageTracker', {
        scheduled: '0 * * * *',
        service: 'moduleUsageTrackerService.trackHourlyUsage()',
        job: 'jobs/moduleUsageTracker.ts',
      });
    }),
});
