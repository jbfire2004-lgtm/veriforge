import { startComplianceExpiryCheckJob } from './complianceExpiryCheck';
import { startDocumentCenterExpiryJob } from './documentCenterExpiry';
import { startScorecardRecalculationJob } from './scorecardRecalculation';
import { startNotificationDispatcherJob } from './notificationDispatcher';
import { startBillingCycleCheckJob } from './billingCycleCheck';
import { startModuleUsageTrackerJob } from './moduleUsageTracker';
import { startTrialWorkflowJob } from './trial-workflow.job';
import { logger } from '../utils/logger';

export const CRON_SCHEDULES = {
  complianceExpiryCheck: '0 2 * * *',
  documentCenterExpiry: '15 2 * * *',
  scorecardRecalculation: '0 * * * *',
  notificationDispatcher: '*/5 * * * *',
  billingCycleCheck: '0 3 * * *',
  moduleUsageTracker: '0 * * * *',
  trialWorkflow: '15 9 * * *',
} as const;

/**
 * Start all Veriforge background cron jobs (worker / optional API attach).
 */
export function startAllCronJobs() {
  const handles = {
    complianceExpiryCheck: startComplianceExpiryCheckJob(),
    documentCenterExpiry: startDocumentCenterExpiryJob(),
    scorecardRecalculation: startScorecardRecalculationJob(),
    notificationDispatcher: startNotificationDispatcherJob(),
    billingCycleCheck: startBillingCycleCheckJob(),
    moduleUsageTracker: startModuleUsageTrackerJob(),
    trialWorkflow: startTrialWorkflowJob(),
  };

  logger.info('veriforge cron scheduler started', { schedules: CRON_SCHEDULES });
  return handles;
}
