import { AnalyticsService } from '../../../analytics/analytics.service';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import { FieldSyncService } from '../../field-sync/field-sync.service';
import { EventBusService } from '../events/event-bus.service';
export declare class ApiPlatformScheduler {
    private readonly analytics;
    private readonly reporting;
    private readonly fieldSync;
    private readonly events;
    private readonly logger;
    constructor(analytics: AnalyticsService, reporting: ReportingCoreService, fieldSync: FieldSyncService, events: EventBusService);
    trainingExpiryJob(): Promise<void>;
    complianceRecalcJob(): Promise<void>;
    inspectionScheduleJob(): Promise<void>;
    syncQueueJob(): Promise<void>;
    dispatchQueueJob(): Promise<void>;
}
