export declare class FieldSyncActionDto {
    type: string;
    payload: Record<string, unknown>;
    clientId?: string;
    clientTimestamp?: string;
    clientVersion?: number;
}
export declare class FieldSyncBatchDto {
    actions: FieldSyncActionDto[];
    batchId?: string;
    clientId?: string;
}
export declare class FieldDeltaQueryDto {
    companyId?: number;
    since?: string;
}
