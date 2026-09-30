import { prisma } from '../db/prisma';
import { env } from '../config/env';
import { logger } from '../utils/logger';

export interface EmailMessage {
  to: string | string[];
  subject: string;
  text: string;
  html?: string;
}

export type QueueEmailInput = {
  to: string;
  subject: string;
  body: string;
  orgId?: string;
  dedupeKey?: string;
};

/**
 * Email transport + EmailQueue outbox.
 * Provider: console (dev) or Resend when RESEND_API_KEY is set.
 */
export class EmailService {
  async queueEmail(input: QueueEmailInput) {
    try {
      return await prisma.emailQueue.create({
        data: {
          to: input.to,
          subject: input.subject,
          body: input.body,
          orgId: input.orgId,
          dedupeKey: input.dedupeKey,
          status: 'pending',
        },
      });
    } catch (err) {
      logger.debug('email queue skipped', {
        dedupeKey: input.dedupeKey,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  async markEmailSent(id: string) {
    return prisma.emailQueue.update({
      where: { id },
      data: { status: 'sent', sentAt: new Date(), error: null },
    });
  }

  async markEmailFailed(id: string, error: string) {
    return prisma.emailQueue.update({
      where: { id },
      data: { status: 'failed', error },
    });
  }

  /**
   * Drain pending EmailQueue rows via send().
   */
  async sendQueuedEmails(limit = 100) {
    const batch = await prisma.emailQueue.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: Math.min(limit, 500),
    });

    let sent = 0;
    let failed = 0;

    for (const row of batch) {
      try {
        await this.send({
          to: row.to,
          subject: row.subject,
          text: row.body,
        });
        await this.markEmailSent(row.id);
        sent += 1;
      } catch (err) {
        await this.markEmailFailed(
          row.id,
          err instanceof Error ? err.message : String(err),
        );
        failed += 1;
      }
    }

    return { processed: batch.length, sent, failed };
  }

  async send(message: EmailMessage): Promise<{ id: string; provider: 'resend' | 'console' }> {
    const to = Array.isArray(message.to) ? message.to : [message.to];

    if (!env.resendApiKey) {
      logger.info('email (console provider)', {
        to,
        subject: message.subject,
        text: message.text,
      });
      return { id: `console_${Date.now()}`, provider: 'console' };
    }

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.resendApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: env.emailFrom,
        to,
        subject: message.subject,
        text: message.text,
        html: message.html ?? `<pre>${escapeHtml(message.text)}</pre>`,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Resend failed (${res.status}): ${body}`);
    }

    const data = (await res.json()) as { id?: string };
    return { id: data.id ?? `resend_${Date.now()}`, provider: 'resend' };
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const emailService = new EmailService();
