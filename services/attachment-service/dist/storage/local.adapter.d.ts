import type { PresignedUrlResult, StorageAdapter, StoredObject } from '../types';
export declare class LocalStorageAdapter implements StorageAdapter {
    private readonly rootDir;
    constructor(rootDir: string);
    private resolveKey;
    putObject(key: string, body: Buffer, _contentType: string): Promise<StoredObject>;
    getObject(key: string): Promise<{
        body: Buffer;
        contentType?: string;
    }>;
    exists(key: string): Promise<boolean>;
    /**
     * Local dev: presigned URLs are gateway-proxied download paths with HMAC token.
     * Production should use S3 adapter for true pre-signing.
     */
    getPresignedUrl(key: string, ttlSec: number): Promise<PresignedUrlResult>;
}
