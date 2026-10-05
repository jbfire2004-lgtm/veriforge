import { NotificationSchedulerService } from './notification-scheduler.service';
export declare class NotificationSchedulerCron {
    private readonly scheduler;
    private readonly logger;
    constructor(scheduler: NotificationSchedulerService);
    dailyComplianceNotifications(): Promise<void>;
    hourlyAssignmentNotifications(): Promise<void>;
    private runStep;
    private asExpiryMetrics;
}
