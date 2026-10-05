import { NotificationChannel, Prisma } from '@prisma/client';
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
export declare class NotificationsService {
    private readonly prisma;
    private readonly email;
    private readonly sms;
    private readonly push;
    private readonly logger;
    constructor(prisma: PrismaService, email: EmailService, sms: SmsService, push: PushService);
    getOrCreatePreferences(userId: number): Promise<{
        userId: number;
        emailEnabled: boolean;
        smsEnabled: boolean;
        pushEnabled: boolean;
        inAppEnabled: boolean;
        inspectionDue: boolean;
        competencyExpiry: boolean;
        ppeExpiry: boolean;
        maintenanceDue: boolean;
        calibrationDue: boolean;
        assignmentAlerts: boolean;
        quietHoursStart: string | null;
        quietHoursEnd: string | null;
        phone: string | null;
    }>;
    updatePreferences(userId: number, dto: UpdateNotificationPreferencesInput): Promise<{
        userId: number;
        emailEnabled: boolean;
        smsEnabled: boolean;
        pushEnabled: boolean;
        inAppEnabled: boolean;
        inspectionDue: boolean;
        competencyExpiry: boolean;
        ppeExpiry: boolean;
        maintenanceDue: boolean;
        calibrationDue: boolean;
        assignmentAlerts: boolean;
        quietHoursStart: string | null;
        quietHoursEnd: string | null;
        phone: string | null;
    }>;
    listForUser(userId: number, opts?: {
        unreadOnly?: boolean;
        take?: number;
    }): Promise<{
        id: number;
        userId: number | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        type: string;
        title: string | null;
        body: string | null;
        payload: Prisma.JsonValue;
        status: import(".prisma/client").$Enums.NotificationStatus;
        readAt: Date | null;
        dedupeKey: string | null;
        scheduledFor: Date | null;
        sentAt: Date | null;
        createdAt: Date;
    }[]>;
    unreadCount(userId: number): Promise<number>;
    markRead(userId: number, notificationId: number): Promise<{
        id: number;
        userId: number | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        type: string;
        title: string | null;
        body: string | null;
        payload: Prisma.JsonValue;
        status: import(".prisma/client").$Enums.NotificationStatus;
        readAt: Date | null;
        dedupeKey: string | null;
        scheduledFor: Date | null;
        sentAt: Date | null;
        createdAt: Date;
    }>;
    markAllRead(userId: number): Promise<{
        updated: number;
    }>;
    notifyCompanySupervisors(companyId: number, input: Omit<NotifyUsersInput, 'userIds'>): Promise<{
        created: number;
        skipped: number;
        recipients: number;
    }>;
    notifyUsers(input: NotifyUsersInput): Promise<{
        created: number;
        skipped: number;
        recipients: number;
    }>;
    send(data: {
        userId?: number;
        channel: 'EMAIL' | 'SMS' | 'PUSH' | 'IN_APP';
        type: string;
        payload: Record<string, unknown>;
        title?: string;
        body?: string;
    }): Promise<void | {
        status: string;
        channel: import(".prisma/client").$Enums.NotificationChannel;
    }>;
    private dispatchChannel;
    private defaultChannels;
    private isTypeEnabled;
    private inQuietHours;
}
