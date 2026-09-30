import cron from 'node-cron';
import { moduleUsageTrackerService } from '../services/module-usage-tracker.service';
import { logger } from '../utils/logger';
import { runScheduledJob } from './_run-job';

/**
 * Hourly — log module usage metrics into module_usage_metrics.
 */
export function startModuleUsageTrackerJob() {
  const run = (label: string) =>
    runScheduledJob('module_usage_tracker', label, () =>
      moduleUsageTrackerService.trackHourlyUsage(),
    );

  const task = cron.schedule('0 * * * *', () => {
    void run('hourly').catch((err) => {
      logger.error('moduleUsageTracker failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  setTimeout(() => {
    void run('boot').catch((err) => {
      logger.error('moduleUsageTracker boot failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, 25_000);

  logger.info('moduleUsageTracker scheduled (hourly)');
  return { task };
}
