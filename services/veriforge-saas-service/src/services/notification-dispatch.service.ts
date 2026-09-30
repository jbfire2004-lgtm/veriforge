import type { NotificationChannel, Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { emailService } from './email.service';
import { notificationService } from './notification.service';
import { logger } from '../utils/logger';

export type EnqueueNotificationInput = {
  orgId?: string;
  userId?: string;
  channel: NotificationChannel;
  type?: string;
  title?: string;
  subject?: string;
  body: string;
  recipientEmail?: string;
  dedupeKey?: string;
  meta?: Record<string, unknown>;
};

/**
 * Legacy enqueue + cron dispatch (EmailQueue + Notification email channel).
 * Prefer notificationService / notificationTriggers for new code.
 */
export class NotificationDispatchService {
  async enqueue(input: EnqueueNotificationInput) {
    const title = input.title || input.subject || 'Notification';

    if (input.channel === 'in_app') {
      return notificationService.createNotification({
        orgId: input.orgId,
        userId: input.userId,
        type: input.type || 'system_alert',
        title,
        message: input.body,
        dedupeKey: input.dedupeKey,
        meta: input.meta,
        email: input.recipientEmail
          ? { to: input.recipientEmail, subject: title }
          : undefined,
      });
    }

    if (input.recipientEmail) {
      await emailService.queueEmail({
        to: input.recipientEmail,
        subject: title,
        body: input.body,
        orgId: input.orgId,
        dedupeKey: input.dedupeKey
          ? `email:${input.dedupeKey}`
          : undefined,
      });
    }

    try {
      return await prisma.notification.create({
        data: {
          orgId: input.orgId,
          userId: input.userId,
          type: input.type || 'system_alert',
          title,
          body: input.body,
          subject: title,
          channel: 'email',
          status: 'queued',
          recipientEmail: input.recipientEmail,
          dedupeKey: input.dedupeKey,
          meta: (input.meta ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    } catch (err) {
      logger.debug('notification enqueue skipped', {
        dedupeKey: input.dedupeKey,
        error: err instanceof Error ? err.message : String(err),
      });
      return null;
    }
  }

  /**
   * Drain EmailQueue + legacy Notification email rows.
   */
  async dispatchQueued(limit = 100) {
    const emailResult = await emailService.sendQueuedEmails(limit);

    const batch = await prisma.notification.findMany({
      where: { status: 'queued', channel: 'email' },
      orderBy: { queuedAt: 'asc' },
      take: Math.min(limit, 500),
    });

    let sent = emailResult.sent;
    let failed = emailResult.failed;

    for (const row of batch) {
      try {
        const to =
          row.recipientEmail ||
          (await this.orgFallbackEmail(row.orgId)) ||
          'noreply@veriforge.local';
        await emailService.send({
          to,
          subject: row.title || row.subject || 'VeriForge notification',
          text: row.body,
        });
        await prisma.notification.update({
          where: { id: row.id },
          data: { status: 'sent', sentAt: new Date(), error: null },
        });
        sent += 1;
      } catch (err) {
        await prisma.notification.update({
          where: { id: row.id },
          data: {
            status: 'failed',
            error: err instanceof Error ? err.message : String(err),
          },
        });
        failed += 1;
      }
    }

    return {
      processed: emailResult.processed + batch.length,
      sent,
      failed,
      emailQueue: emailResult,
    };
  }

  private async orgFallbackEmail(orgId: string | null) {
    if (!orgId) return null;
    const org = await prisma.organization.findUnique({
      where: { id: orgId },
      select: { billingEmail: true, contactEmail: true },
    });
    return org?.billingEmail || org?.contactEmail || null;
  }
}

export const notificationDispatchService = new NotificationDispatchService();
