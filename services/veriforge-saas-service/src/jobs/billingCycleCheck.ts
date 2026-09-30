import cron from 'node-cron';
import { billingCycleService } from '../services/billing-cycle.service';
import { logger } from '../utils/logger';
import { runScheduledJob } from './_run-job';

/**
 * Daily @ 03:00 UTC — suspend modules for overdue billing; reactivate when paid.
 */
export function startBillingCycleCheckJob() {
  const run = (label: string) =>
    runScheduledJob('billing_cycle_check', label, () =>
      billingCycleService.checkBillingCycles(),
    );

  const task = cron.schedule('0 3 * * *', () => {
    void run('daily').catch((err) => {
      logger.error('billingCycleCheck failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  setTimeout(() => {
    void run('boot').catch((err) => {
      logger.error('billingCycleCheck boot failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, 20_000);

  logger.info('billingCycleCheck scheduled (daily 03:00 UTC)');
  return { task };
}
