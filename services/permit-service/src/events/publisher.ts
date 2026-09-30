import { env } from '../config/env';
import { logger } from '../utils/logger';
import type { PermitEventPayload } from '../types';

export const eventPublisher = {
  async publish(subject: string, payload: PermitEventPayload | Record<string, unknown>) {
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

  permitRequested(payload: PermitEventPayload) {
    return this.publish('pm.permit.requested', payload);
  },

  permitApproved(payload: PermitEventPayload) {
    return this.publish('pm.permit.approved', payload);
  },

  permitActive(payload: PermitEventPayload) {
    return this.publish('pm.permit.active', payload);
  },
};
