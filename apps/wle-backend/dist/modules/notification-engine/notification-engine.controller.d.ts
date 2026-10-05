import { NotificationsService, UpdateNotificationPreferencesInput } from '../../notifications/notifications.service';
import { NotificationSchedulerService } from './notification-scheduler.service';
import { RunSchedulerQueryDto } from './dto/notification-engine.dto';
export declare class NotificationEngineController {
    private readonly notifications;
    private readonly scheduler;
    constructor(notifications: NotificationsService, scheduler: NotificationSchedulerService);
    list(req: {
        user: {
            id: number;
        };
    }, unreadOnly?: string): Promise<{
        id: number;
        userId: number | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        type: string;
        title: string | null;
        body: string | null;
        payload: import(".prisma/client").Prisma.JsonValue;
        status: import(".prisma/client").$Enums.NotificationStatus;
        readAt: Date | null;
        dedupeKey: string | null;
        scheduledFor: Date | null;
        sentAt: Date | null;
        createdAt: Date;
    }[]>;
    unreadCount(req: {
        user: {
            id: number;
        };
    }): Promise<{
        count: number;
    }>;
    markRead(req: {
        user: {
            id: number;
        };
    }, id: number): Promise<{
        id: number;
        userId: number | null;
        channel: import(".prisma/client").$Enums.NotificationChannel;
        type: string;
        title: string | null;
        body: string | null;
        payload: import(".prisma/client").Prisma.JsonValue;
        status: import(".prisma/client").$Enums.NotificationStatus;
        readAt: Date | null;
        dedupeKey: string | null;
        scheduledFor: Date | null;
        sentAt: Date | null;
        createdAt: Date;
    }>;
    markAllRead(req: {
        user: {
            id: number;
        };
    }): Promise<{
        updated: number;
    }>;
    getSettings(req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    updateSettings(req: {
        user: {
            id: number;
        };
    }, body: UpdateNotificationPreferencesInput): Promise<{
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
    runScheduler(query: RunSchedulerQueryDto): Promise<{
        inspections: {
            notified: number;
            equipmentCount: number;
        };
        training: import("./notification-scheduler.types").ExpiryRunMetrics;
        competency: {
            notified: number;
            evaluations: number;
        };
        equipmentCerts: import("./notification-scheduler.types").ExpiryRunMetrics;
        fitTests: {
            notified: number;
            tests: number;
        };
        ppe: {
            notified: number;
            ppeCount: number;
        };
        maintenance: {
            notified: number;
            equipmentCount: number;
        };
        calibration: {
            notified: number;
            equipmentCount: number;
        };
        workerAssignments: {
            notified: number;
            starting: number;
            ending: number;
        };
        equipmentAssignments: {
            notified: number;
            equipmentProjects: number;
            operators: number;
        };
    }>;
    testSend(req: {
        user: {
            id: number;
        };
    }, body: {
        title?: string;
        body?: string;
    }): Promise<{
        created: number;
        skipped: number;
        recipients: number;
    }>;
}
