import { SyncApiService } from '../services/sync-api.service';
export declare class SyncApiController {
    private readonly sync;
    constructor(sync: SyncApiService);
    batch(body: {
        actions: {
            type: string;
            payload: Record<string, unknown>;
            clientTimestamp?: string;
            clientVersion?: number;
        }[];
        batchId?: string;
        clientId?: string;
    }, req: {
        user?: {
            id?: number;
        };
    }): Promise<{
        processed: number;
        failed: number;
        results: any[];
        syncedAt: string;
    }>;
}
export declare class DashboardApiController {
    private readonly sync;
    constructor(sync: SyncApiService);
    widgets(req: {
        user?: {
            role?: string;
        };
    }, companyId?: string, unionHallId?: string): Promise<import("../../dashboard-widgets/dashboard-widgets.types").DashboardWidgetsBundle>;
}
