import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import {
  NotificationChannel,
  NotificationStatus,
  Prisma,
  UserRole,
} from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { EmailService } from './channels/email.service';
import { SmsService } from './channels/sms.service';
import { PushService } from './channels/push.service';
import type { NotificationType } from './notification-types';

export type NotifyUsersInput = {
  userIds: number[];
  type: NotificationType | string;
  title: string;
  body: string;
  payload?: Record<string, unknown>;
  dedupeKey?: string;
  channels?: NotificationChannel[];
  companyId?: number;
};

export type UpdateNotificationPreferencesInput = {
  emailEnabled?: boolean;
  smsEnabled?: boolean;
  pushEnabled?: boolean;
  inAppEnabled?: boolean;
  inspectionDue?: boolean;
  competencyExpiry?: boolean;
  ppeExpiry?: boolean;
  maintenanceDue?: boolean;
  calibrationDue?: boolean;
  assignmentAlerts?: boolean;
  quietHoursStart?: string | null;
  quietHoursEnd?: string | null;
  phone?: string | null;
};

const SUPERVISOR_ROLES: UserRole[] = [
  UserRole.SUPERVISOR,
  UserRole.PROJECT_MANAGER,
  UserRole.COMPANY_ADMIN,
  UserRole.ADMIN,
  UserRole.SUPER_ADMIN,
];

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly email: EmailService,
    private readonly sms: SmsService,
    private readonly push: PushService,
  ) {}

  async getOrCreatePreferences(userId: number) {
    const existing = await this.prisma.userNotificationPreference.findUnique({
      where: { userId },
    });
    if (existing) return existing;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, worker: { select: { phone: true } } },
    });
    if (!user) throw new NotFoundException('User not found');

    return this.prisma.userNotificationPreference.create({
      data: {
        userId,
        phone: user.worker?.phone ?? null,
      },
    });
  }

  async updatePreferences(
    userId: number,
    dto: UpdateNotificationPreferencesInput,
  ) {
    await this.getOrCreatePreferences(userId);
    return this.prisma.userNotificationPreference.update({
      where: { userId },
      data: dto,
    });
  }

  async listForUser(
    userId: number,
    opts?: { unreadOnly?: boolean; take?: number },
  ) {
    return this.prisma.notification.findMany({
      where: {
        userId,
        ...(opts?.unreadOnly ? { readAt: null } : {}),
      },
      orderBy: { createdAt: 'desc' },
      take: opts?.take ?? 100,
    });
  }

  async unreadCount(userId: number) {
    return this.prisma.notification.count({
      where: { userId, readAt: null, channel: NotificationChannel.IN_APP },
    });
  }

  async markRead(userId: number, notificationId: number) {
    const row = await this.prisma.notification.findFirst({
      where: { id: notificationId, userId },
    });
    if (!row) throw new NotFoundException('Notification not found');
    return this.prisma.notification.update({
      where: { id: notificationId },
      data: { readAt: new Date(), status: NotificationStatus.READ },
    });
  }

  async markAllRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: { userId, readAt: null },
      data: { readAt: new Date(), status: NotificationStatus.READ },
    });
    return { updated: result.count };
  }

  async notifyCompanySupervisors(
    companyId: number,
    input: Omit<NotifyUsersInput, 'userIds'>,
  ) {
    const users = await this.prisma.user.findMany({
      where: { companyId, role: { in: SUPERVISOR_ROLES } },
      select: { id: true },
      take: 50,
    });
    return this.notifyUsers({ ...input, userIds: users.map((u) => u.id) });
  }

  async notifyUsers(input: NotifyUsersInput) {
    let created = 0;
    let skipped = 0;

    for (const userId of input.userIds) {
      const prefs = await this.getOrCreatePreferences(userId);
      if (!this.isTypeEnabled(input.type, prefs)) {
        skipped++;
        continue;
      }
      if (this.inQuietHours(prefs)) {
        skipped++;
        continue;
      }

      const perUserDedupe = input.dedupeKey
        ? `${input.dedupeKey}:u${userId}`
        : undefined;

      if (perUserDedupe) {
        const exists = await this.prisma.notification.findFirst({
          where: { dedupeKey: perUserDedupe },
        });
        if (exists) {
          skipped++;
          continue;
        }
      }

      const channels = input.channels ?? this.defaultChannels(prefs);

      for (const channel of channels) {
        await this.dispatchChannel({
          userId,
          channel,
          type: input.type,
          title: input.title,
          body: input.body,
          payload: input.payload ?? {},
          dedupeKey: perUserDedupe,
        });
        created++;
      }
    }

    return { created, skipped, recipients: input.userIds.length };
  }

  async send(data: {
    userId?: number;
    channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
    type: string;
    payload: Record<string, unknown>;
    title?: string;
    body?: string;
  }) {
    const channel = data.channel as NotificationChannel;
    if (data.userId) {
      return this.dispatchChannel({
        userId: data.userId,
        channel,
        type: data.type,
        title: data.title ?? data.type,
        body: data.body ?? '',
        payload: data.payload,
      });
    }

    await this.prisma.notification.create({
      data: {
        channel,
        type: data.type,
        title: data.title,
        body: data.body,
        payload: data.payload as Prisma.InputJsonValue,
        status: NotificationStatus.SENT,
        sentAt: new Date(),
      },
    });
    return { status: 'sent', channel };
  }

  private async dispatchChannel(args: {
    userId: number;
    channel: NotificationChannel;
    type: string;
    title: string;
    body: string;
    payload: Record<string, unknown>;
    dedupeKey?: string;
  }) {
    const user = await this.prisma.user.findUnique({
      where: { id: args.userId },
      select: {
        id: true,
        email: true,
        worker: { select: { phone: true } },
      },
    });
    if (!user) return;

    const prefs = await this.getOrCreatePreferences(args.userId);
    let status: NotificationStatus = NotificationStatus.SENT;
    let sentAt: Date | null = new Date();

    try {
      if (args.channel === NotificationChannel.EMAIL && prefs.emailEnabled) {
        await this.email.send({
          to: user.email,
          subject: args.title,
          body: args.body,
        });
      } else if (args.channel === NotificationChannel.SMS && prefs.smsEnabled) {
        const phone = prefs.phone ?? user.worker?.phone;
        if (phone) {
          await this.sms.send({
            to: phone,
            message: `${args.title}: ${args.body}`,
          });
        } else {
          status = NotificationStatus.FAILED;
          sentAt = null;
        }
      } else if (
        args.channel === NotificationChannel.PUSH &&
        prefs.pushEnabled
      ) {
        await this.push.send({
          deviceToken: `user-${user.id}`,
          title: args.title,
          body: args.body,
        });
      } else if (
        args.channel === NotificationChannel.IN_APP &&
        prefs.inAppEnabled
      ) {
        // in-app stored below
      } else if (args.channel !== NotificationChannel.IN_APP) {
        return;
      }
    } catch (e) {
      this.logger.warn(`Channel ${args.channel} failed: ${e}`);
      status = NotificationStatus.FAILED;
      sentAt = null;
    }

    if (args.channel === NotificationChannel.IN_APP && !prefs.inAppEnabled) {
      return;
    }

    await this.prisma.notification.create({
      data: {
        userId: args.userId,
        channel: args.channel,
        type: args.type,
        title: args.title,
        body: args.body,
        payload: args.payload as Prisma.InputJsonValue,
        status:
          args.channel === NotificationChannel.IN_APP
            ? NotificationStatus.PENDING
            : status,
        dedupeKey: args.dedupeKey,
        sentAt,
      },
    });
  }

  private defaultChannels(prefs: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    inAppEnabled: boolean;
  }): NotificationChannel[] {
    const channels: NotificationChannel[] = [];
    if (prefs.inAppEnabled) channels.push(NotificationChannel.IN_APP);
    if (prefs.emailEnabled) channels.push(NotificationChannel.EMAIL);
    if (prefs.smsEnabled) channels.push(NotificationChannel.SMS);
    if (prefs.pushEnabled) channels.push(NotificationChannel.PUSH);
    return channels.length ? channels : [NotificationChannel.IN_APP];
  }

  private isTypeEnabled(
    type: string,
    prefs: {
      inspectionDue: boolean;
      competencyExpiry: boolean;
      ppeExpiry: boolean;
      maintenanceDue: boolean;
      calibrationDue: boolean;
      assignmentAlerts: boolean;
    },
  ) {
    switch (type) {
      case 'INSPECTION_DUE':
        return prefs.inspectionDue;
      case 'COMPETENCY_EXPIRING':
      case 'COMPETENCY_EXPIRED':
        return prefs.competencyExpiry;
      case 'PPE_EXPIRING':
      case 'PPE_EXPIRED':
        return prefs.ppeExpiry;
      case 'MAINTENANCE_DUE':
      case 'MAINTENANCE_AND_CALIBRATION_DUE':
        return prefs.maintenanceDue;
      case 'CALIBRATION_DUE':
        return prefs.calibrationDue;
      case 'SOCIAL_LIKE':
      case 'SOCIAL_COMMENT':
      case 'SOCIAL_SHARE':
      case 'SOCIAL_FOLLOW':
      case 'MODERATION_RESOLVED':
      case 'MODERATION_EXPERT_VERIFICATION':
        return true;
      case 'weather_alert':
      case 'WEATHER_ALERT':
        return true;
      case 'CAIL_OVERDUE':
      case 'CAIL_DUE_SOON':
      case 'CAIL_ASSIGNED':
      case 'TRAINING_VERIFICATION_ATTENTION':
      case 'TRAINING_INGESTION_COMPLETED':
      case 'TRAINING_INGESTION_FAILED':
        return prefs.assignmentAlerts;
      default:
        return prefs.assignmentAlerts;
    }
  }

  private inQuietHours(prefs: {
    quietHoursStart: string | null;
    quietHoursEnd: string | null;
  }) {
    if (!prefs.quietHoursStart || !prefs.quietHoursEnd) return false;
    const now = new Date();
    const [sh, sm] = prefs.quietHoursStart.split(':').map(Number);
    const [eh, em] = prefs.quietHoursEnd.split(':').map(Number);
    const start = sh * 60 + (sm || 0);
    const end = eh * 60 + (em || 0);
    const cur = now.getHours() * 60 + now.getMinutes();
    if (start <= end) return cur >= start && cur < end;
    return cur >= start || cur < end;
  }
}
