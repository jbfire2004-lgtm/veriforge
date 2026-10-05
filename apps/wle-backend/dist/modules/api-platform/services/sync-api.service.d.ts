import { FieldSyncService } from '../../field-sync/field-sync.service';
import { DashboardWidgetsService } from '../../dashboard-widgets/dashboard-widgets.service';
import { EventBusService } from '../events/event-bus.service';
export declare class SyncApiService {
    private readonly fieldSync;
    private readonly dashboardWidgets;
    private readonly events;
    constructor(fieldSync: FieldSyncService, dashboardWidgets: DashboardWidgetsService, events: EventBusService);
    processBatch(actions: {
        type: string;
        payload: Record<string, unknown>;
        clientTimestamp?: string;
        clientVersion?: number;
    }[], actorUserId: number, meta?: {
        batchId?: string;
        clientId?: string;
    }): Promise<{
        processed: number;
        failed: number;
        results: any[];
        syncedAt: string;
    }>;
    getDashboardWidgets(role: string, companyId?: number, unionHallId?: number): Promise<import("../../dashboard-widgets/dashboard-widgets.types").DashboardWidgetsBundle>;
}
