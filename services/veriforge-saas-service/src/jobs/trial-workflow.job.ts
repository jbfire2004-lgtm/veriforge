import cron from 'node-cron';
import { randomUUID } from 'crypto';
import { trialService } from '../services/trial.service';
import { logger } from '../utils/logger';
import { runWithContext } from '../observability/context';
import { withSpan } from '../observability/tracing';
import {
  trialExpiryOrgsTotal,
  trialNotificationsTotal,
  workerJobDuration,
  workerJobRunsTotal,
} from '../observability/metrics';

/**
 * Daily trial workflow (idempotent):
 * 1) Expire due trials + lock modules + day-7 email
 * 2) Send day-0 / day-5 / day-7 notifications for any missed sends
 */
export function startTrialWorkflowJob() {
  const run = async (label: string) => {
    const correlationId = `trial-job-${label}-${randomUUID()}`;
    return runWithContext({ correlationId }, async () =>
      withSpan('worker.trial_workflow', { 'job.label': label }, async () => {
        const end = workerJobDuration.startTimer({ worker_job: 'trial_workflow' });
        logger.info(`trial workflow start (${label})`, { correlationId });
        try {
          const expired = await trialService.checkAndExpireTrials();
          trialExpiryOrgsTotal.inc({ result: 'expired' }, expired.expired);
          trialExpiryOrgsTotal.inc({ result: 'notified_ended' }, expired.notifiedEnded);

          const notices = await trialService.sendTrialNotifications();
          for (const [kind, count] of Object.entries(notices)) {
            if (count > 0) {
              trialNotificationsTotal.inc({ kind, result: 'sent' }, count);
            }
          }

          logger.info(`trial workflow done (${label})`, { ...expired, ...notices, correlationId });
          workerJobRunsTotal.inc({ worker_job: 'trial_workflow', status: 'success' });
          end();
        } catch (err) {
          workerJobRunsTotal.inc({ worker_job: 'trial_workflow', status: 'error' });
          end();
          throw err;
        }
      }),
    );
  };

  const task = cron.schedule('15 9 * * *', () => {
    void run('daily').catch((err) => {
      logger.error('trial workflow daily job failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  const hourly = cron.schedule('20 * * * *', () => {
    void runWithContext({ correlationId: `trial-expiry-hourly-${randomUUID()}` }, async () =>
      withSpan('worker.trial_expiry_hourly', {}, async () => {
        const end = workerJobDuration.startTimer({ worker_job: 'trial_expiry_hourly' });
        try {
          const expired = await trialService.checkAndExpireTrials();
          trialExpiryOrgsTotal.inc({ result: 'expired' }, expired.expired);
          workerJobRunsTotal.inc({ worker_job: 'trial_expiry_hourly', status: 'success' });
          end();
          return expired;
        } catch (err) {
          workerJobRunsTotal.inc({ worker_job: 'trial_expiry_hourly', status: 'error' });
          end();
          throw err;
        }
      }),
    ).catch((err) => {
      logger.error('trial expiry hourly failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  setTimeout(() => {
    void run('boot').catch((err) => {
      logger.error('trial workflow boot run failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, 5_000);

  logger.info('trial workflow cron scheduled (daily 09:15 UTC + hourly expiry)');
  return { task, hourly };
}

/** @deprecated use startTrialWorkflowJob */
export function startTrialExpiryJob() {
  return startTrialWorkflowJob();
}
