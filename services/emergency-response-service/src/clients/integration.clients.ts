import { env } from '../config/env';
import { logger } from '../utils/logger';

export const integrationClients = {
  async activateSiteLockout(input: {
    companyId: string;
    projectId?: string | null;
    mode: string;
    token: string;
  }): Promise<boolean> {
    const body = {
      company_id: input.companyId,
      project_id: input.projectId,
      mode: input.mode,
    };

    if (env.safetyStationsServiceUrl) {
      try {
        const res = await fetch(`${env.safetyStationsServiceUrl}/station/emergency/mode`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${input.token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(body),
        });
        if (res.ok) return true;
      } catch (err) {
        logger.warn('safety stations lockout failed', {
          error: err instanceof Error ? err.message : String(err),
        });
      }
    }

    return false;
  },

  async clearSiteLockout(input: {
    companyId: string;
    projectId?: string | null;
    token: string;
  }): Promise<boolean> {
    return this.activateSiteLockout({
      ...input,
      mode: 'all_clear',
    });
  },

  async sendNotification(input: {
    emergencyId: string;
    channel: string;
    recipient: string;
    message: string;
  }): Promise<'sent' | 'pending' | 'failed'> {
    if (!env.notificationWebhookUrl) return 'pending';

    try {
      const res = await fetch(env.notificationWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });
      return res.ok ? 'sent' : 'failed';
    } catch (err) {
      logger.warn('notification webhook failed', {
        error: err instanceof Error ? err.message : String(err),
      });
      return 'failed';
    }
  },
};
