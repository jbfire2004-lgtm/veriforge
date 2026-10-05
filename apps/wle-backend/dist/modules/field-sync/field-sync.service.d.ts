import { PrismaService } from '../../prisma/prisma.service';
import { FieldSyncBatchProcessor, type BatchActionInput } from './field-sync-batch.processor';
import { FieldSyncDeltaService } from './field-sync-delta.service';
import { FieldOfflineBundleService } from './field-offline-bundle.service';
export declare class FieldSyncService {
    private readonly prisma;
    private readonly processor;
    private readonly delta;
    private readonly offlineBundle;
    private readonly logger;
    constructor(prisma: PrismaService, processor: FieldSyncBatchProcessor, delta: FieldSyncDeltaService, offlineBundle: FieldOfflineBundleService);
    registerOfflineScan(body: Record<string, unknown>, actorUserId?: number): Promise<{
        accepted: boolean;
        batchId: string;
        tempId: unknown;
        receivedAt: string;
    }>;
    processBatch(actions: BatchActionInput[], actorUserId?: number, meta?: {
        batchId?: string;
        clientId?: string;
    }): Promise<{
        processed: number;
        failed: number;
        results: any[];
        syncedAt: string;
    }>;
    fetchDelta(params: {
        companyId?: number;
        since?: string;
    }): Promise<import("./field-sync-delta.service").FieldDeltaBundle>;
    fetchOfflineBundle(params: {
        companyId?: number;
        workerId?: number;
    }): Promise<import("./field-offline-bundle.service").FieldOfflineBundle>;
}
