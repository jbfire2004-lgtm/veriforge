export interface AuthJwtPayload {
    sub: string;
    user_id: string;
    company_id: string;
    email?: string;
    roles?: string[];
}
export interface StoredObject {
    key: string;
    size: number;
}
export interface PresignedUrlResult {
    url: string;
    expiresAt: string;
}
export interface StorageAdapter {
    putObject(key: string, body: Buffer, contentType: string): Promise<StoredObject>;
    getObject(key: string): Promise<{
        body: Buffer;
        contentType?: string;
    }>;
    getPresignedUrl(key: string, ttlSec: number): Promise<PresignedUrlResult>;
    exists(key: string): Promise<boolean>;
}
export interface VirusScanResult {
    clean: boolean;
    reason?: string;
}
export interface AttachmentDto {
    id: string;
    companyId: string;
    projectId: string | null;
    moduleType: string;
    moduleRecordId: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedAt: string;
    downloadUrl?: string;
    downloadUrlExpiresAt?: string;
    thumbnailUrl?: string;
    thumbnailUrlExpiresAt?: string;
}
