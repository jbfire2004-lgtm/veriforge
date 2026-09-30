import type { PresignedUrlResult, StorageAdapter, StoredObject } from '../types';
export declare class S3StorageAdapter implements StorageAdapter {
    private readonly client;
    private readonly bucket;
    constructor();
    putObject(key: string, body: Buffer, contentType: string): Promise<StoredObject>;
    getObject(key: string): Promise<{
        body: Buffer;
        contentType?: string;
    }>;
    exists(key: string): Promise<boolean>;
    getPresignedUrl(key: string, ttlSec: number): Promise<PresignedUrlResult>;
}
