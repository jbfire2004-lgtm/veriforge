import type { Prisma } from '@prisma/client';
import { prisma } from '../db/prisma';
import { emailService } from './email.service';

export type NotificationType =
  | 'compliance_expiry'
  | 'scorecard_update'
  | 'billing_issue'
  | 'module_update'
  | 'system_alert';

export type CreateNotificationInput = {
  orgId?: string;
  userId?: string;
  type: NotificationType | string;
  title: string;
  message: string;
  dedupeKey?: string;
  meta?: Record<string, unknown>;
  /** Also queue an email when provided */
  email?: { to: string; subject?: string };
};

/**
 * In-app notification inbox API.
 */
export class NotificationService {
  async createNotification(input: CreateNotificationInput) {
    let row = null;
    try {
      row = await prisma.notification.create({
        data: {
          orgId: input.orgId,
          userId: input.userId,
          type: input.type,
          title: input.title,
          body: input.message,
          subject: input.title,
          channel: 'in_app',
          status: 'sent',
          sentAt: new Date(),
          read: false,
          dedupeKey: input.dedupeKey,
          meta: (input.meta ?? undefined) as Prisma.InputJsonValue | undefined,
        },
      });
    } catch {
      if (input.dedupeKey) {
        row = await prisma.notification.findUnique({
          where: { dedupeKey: input.dedupeKey },
        });
      }
    }

    if (input.email?.to) {
      await emailService.queueEmail({
        to: input.email.to,
        subject: input.email.subject ?? input.title,
        body: input.message,
        orgId: input.orgId,
        dedupeKey: input.dedupeKey
          ? `email:${input.dedupeKey}`
          : undefined,
      });
    }

    return row;
  }

  async markAsRead(ids: string[], opts?: { userId?: string; orgId?: string }) {
    if (!ids.length) return { updated: 0 };
    const result = await prisma.notification.updateMany({
      where: {
        id: { in: ids },
        channel: 'in_app',
        ...(opts?.orgId ? { orgId: opts.orgId } : {}),
        ...(opts?.userId
          ? { OR: [{ userId: opts.userId }, { userId: null }] }
          : {}),
      },
      data: { read: true },
    });
    return { updated: result.count };
  }

  async markAllRead(opts: { userId?: string; orgId: string }) {
    const result = await prisma.notification.updateMany({
      where: {
        channel: 'in_app',
        orgId: opts.orgId,
        read: false,
        ...(opts.userId
          ? { OR: [{ userId: opts.userId }, { userId: null }] }
          : {}),
      },
      data: { read: true },
    });
    return { updated: result.count };
  }

  async getUserNotifications(
    userId: string,
    opts?: { orgId?: string; skip?: number; take?: number; unreadOnly?: boolean },
  ) {
    const skip = opts?.skip ?? 0;
    const take = Math.min(opts?.take ?? 50, 100);
    const where: Prisma.NotificationWhereInput = {
      channel: 'in_app',
      OR: [{ userId }, { userId: null, orgId: opts?.orgId }],
      ...(opts?.orgId ? { orgId: opts.orgId } : {}),
      ...(opts?.unreadOnly ? { read: false } : {}),
    };

    const [items, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({
        where: { ...where, read: false },
      }),
    ]);

    return {
      items: items.map(this.toDto),
      total,
      unread,
    };
  }

  async getOrgNotifications(
    orgId: string,
    opts?: { skip?: number; take?: number; unreadOnly?: boolean },
  ) {
    const skip = opts?.skip ?? 0;
    const take = Math.min(opts?.take ?? 50, 100);
    const where: Prisma.NotificationWhereInput = {
      channel: 'in_app',
      orgId,
      ...(opts?.unreadOnly ? { read: false } : {}),
    };

    const [items, total, unread] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      prisma.notification.count({ where }),
      prisma.notification.count({ where: { ...where, read: false } }),
    ]);

    return {
      items: items.map(this.toDto),
      total,
      unread,
    };
  }

  private toDto(row: {
    id: string;
    orgId: string | null;
    userId: string | null;
    type: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: Date;
    meta: Prisma.JsonValue;
  }) {
    return {
      id: row.id,
      orgId: row.orgId,
      userId: row.userId,
      type: row.type,
      title: row.title || 'Notification',
      message: row.body,
      read: row.read,
      createdAt: row.createdAt,
      meta: row.meta,
    };
  }
}

export const notificationService = new NotificationService();
