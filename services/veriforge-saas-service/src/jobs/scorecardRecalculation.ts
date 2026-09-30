import cron from 'node-cron';
import { complianceScorecardService } from '../services/compliance-scorecard.service';
import { logger } from '../utils/logger';
import { runScheduledJob } from './_run-job';

/**
 * Hourly — recalculate compliance_score + global_score and upsert Scorecard rows.
 */
export function startScorecardRecalculationJob() {
  const run = (label: string) =>
    runScheduledJob('scorecard_recalculation', label, () =>
      complianceScorecardService.recalculateAll(),
    );

  const task = cron.schedule('0 * * * *', () => {
    void run('hourly').catch((err) => {
      logger.error('scorecardRecalculation failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  setTimeout(() => {
    void run('boot').catch((err) => {
      logger.error('scorecardRecalculation boot failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, 15_000);

  logger.info('scorecardRecalculation scheduled (hourly)');
  return { task };
}
