import cron from 'node-cron';
import { complianceService } from '../services/compliance.service';
import { logger } from '../utils/logger';
import { runScheduledJob } from './_run-job';

/**
 * Daily @ 02:00 UTC — mark expired ComplianceArtifacts, queue notifications,
 * recalculate affected scorecards.
 */
export function startComplianceExpiryCheckJob() {
  const run = (label: string) =>
    runScheduledJob('compliance_expiry_check', label, () =>
      complianceService.checkExpiries(),
    );

  const task = cron.schedule('0 2 * * *', () => {
    void run('daily').catch((err) => {
      logger.error('complianceExpiryCheck failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  setTimeout(() => {
    void run('boot').catch((err) => {
      logger.error('complianceExpiryCheck boot failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, 8_000);

  logger.info('complianceExpiryCheck scheduled (daily 02:00 UTC)');
  return { task };
}

/** @deprecated alias — prefer startComplianceExpiryCheckJob */
export function startComplianceExpiryJob() {
  return startComplianceExpiryCheckJob();
}
