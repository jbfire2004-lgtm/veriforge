import { randomUUID } from 'crypto';
import { logger } from '../utils/logger';
import { runWithContext } from '../observability/context';
import { withSpan } from '../observability/tracing';
import {
  workerJobDuration,
  workerJobRunsTotal,
} from '../observability/metrics';

/**
 * Shared cron execution wrapper (correlation + span + metrics).
 */
export async function runScheduledJob<T>(
  jobName: string,
  label: string,
  fn: () => Promise<T>,
): Promise<T> {
  const correlationId = `${jobName}-${label}-${randomUUID()}`;
  return runWithContext({ correlationId }, async () =>
    withSpan(`worker.${jobName}`, { 'job.label': label }, async () => {
      const end = workerJobDuration.startTimer({ worker_job: jobName });
      logger.info(`${jobName} start (${label})`, { correlationId });
      try {
        const result = await fn();
        logger.info(`${jobName} done (${label})`, {
          ...(result && typeof result === 'object' ? result : { result }),
          correlationId,
        });
        workerJobRunsTotal.inc({ worker_job: jobName, status: 'success' });
        end();
        return result;
      } catch (err) {
        workerJobRunsTotal.inc({ worker_job: jobName, status: 'error' });
        end();
        throw err;
      }
    }),
  );
}
