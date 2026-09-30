import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { InspectionEventPayload } from '../types';

export const eventPublisher = {
  async publish(subject: string, payload: InspectionEventPayload | Record<string, unknown>) {
    if (env.natsBridgeUrl) {
      try {
        const res = await fetch(env.natsBridgeUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ subject, data: payload }),
        });
        if (!res.ok) {
          logger.warn('event publish rejected', { subject, status: res.status });
        }
        return;
      } catch (err) {
        logger.warn('event publish failed', {
          subject,
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    logger.info('event publish (stub)', { subject, payload });
  },

  inspectionCreated(payload: InspectionEventPayload) {
    return this.publish('safety.inspection.created', payload);
  },

  inspectionSubmitted(payload: InspectionEventPayload) {
    return this.publish('safety.inspection.submitted', payload);
  },

  inspectionFailed(payload: InspectionEventPayload) {
    return this.publish('safety.inspection.failed', payload);
  },
};
