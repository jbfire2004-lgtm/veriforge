import cron from 'node-cron';
import { documentCenterService } from '../services/document-center.service';
import { logger } from '../utils/logger';
import { runScheduledJob } from './_run-job';

/**
 * Daily @ 02:15 UTC — Document Center expiry / exemption lapse + alerts.
 */
export function startDocumentCenterExpiryJob() {
  const run = (label: string) =>
    runScheduledJob('document_center_expiry', label, () =>
      documentCenterService.checkExpiries(),
    );

  const task = cron.schedule('15 2 * * *', () => {
    void run('daily').catch((err) => {
      logger.error('documentCenterExpiry failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  });

  setTimeout(() => {
    void run('boot').catch((err) => {
      logger.error('documentCenterExpiry boot failed', {
        error: err instanceof Error ? err.message : String(err),
      });
    });
  }, 12_000);

  logger.info('documentCenterExpiry scheduled (daily 02:15 UTC)');
  return { task };
}
