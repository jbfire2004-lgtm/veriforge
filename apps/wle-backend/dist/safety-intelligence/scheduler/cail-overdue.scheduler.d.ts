import { PrismaService } from '../../prisma/prisma.service';
import { NotificationsService } from '../../notifications/notifications.service';
export declare class CailOverdueScheduler {
    private readonly prisma;
    private readonly notifications;
    private readonly logger;
    private runningOverdue;
    private runningDueSoon;
    constructor(prisma: PrismaService, notifications: NotificationsService);
    markOverdueEntries(): Promise<void>;
    notifyDueSoonEntries(): Promise<void>;
    private notifyOverdue;
}
