import cron from 'node-cron';
import { notificationDispatchService } from '../services/notification-dispatch.service';
import { logger } from '../utils/logger';
import { runScheduledJob } from './_run-job';

/**
 * Every 5 minutes — send queued email + in-app notifications and mark sent.
 */
export function startNotificationDispatcherJob() {
  const run = (label: string) =>
    runScheduledJob('notification_dispatcher', label, () =>
      notificationDispatchService.dispatchQueued(),
    );

  const task = cron.schedule('*/5 * * * *', () => {
    void run('interval').catch((err) => {
      logger.error('notificationDispatcher failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  setTimeout(() => {
    void run('boot').catch((err) => {
      logger.error('notificationDispatcher boot failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, 12_000);

  logger.info('notificationDispatcher scheduled (every 5 minutes)');
  return { task };
}
