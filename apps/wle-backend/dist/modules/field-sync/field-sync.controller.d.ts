import { Request } from 'express';
import { FieldSyncBatchDto } from './dto/field-sync.dto';
import { FieldSyncService } from './field-sync.service';
type ReqUser = Request & {
    user: {
        id: number;
    };
};
export declare class FieldSyncController {
    private readonly fieldSync;
    constructor(fieldSync: FieldSyncService);
    delta(companyId?: string, since?: string): Promise<import("./field-sync-delta.service").FieldDeltaBundle>;
    offlineBundle(companyId?: string, workerId?: string): Promise<import("./field-offline-bundle.service").FieldOfflineBundle>;
    registerOfflineScan(body: Record<string, unknown>, req: ReqUser): Promise<{
        accepted: boolean;
        batchId: string;
        tempId: unknown;
        receivedAt: string;
    }>;
    syncBatch(body: FieldSyncBatchDto, req: ReqUser): Promise<{
        processed: number;
        failed: number;
        results: any[];
        syncedAt: string;
    }>;
}
export {};
