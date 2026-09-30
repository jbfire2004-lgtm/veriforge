export declare function createSecureDownloadToken(input: {
    attachmentId: string;
    companyId: string;
    kind: 'file' | 'thumbnail';
    ttlSec: number;
}): {
    token: string;
    expiresAt: string;
};
export declare function verifySecureDownloadToken(token: string): {
    attachmentId: string;
    companyId: string;
    kind: 'file' | 'thumbnail';
};
