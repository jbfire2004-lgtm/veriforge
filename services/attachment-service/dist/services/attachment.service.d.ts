import type { AttachmentDto } from '../types';
export declare const attachmentService: {
    assertCompanyAccess(tokenCompanyId: string, requestedCompanyId: string): void;
    upload(input: {
        companyId: string;
        projectId?: string;
        moduleType: string;
        moduleRecordId: string;
        uploadedBy: string;
        fileName: string;
        mimeType: string;
        buffer: Buffer;
    }): Promise<AttachmentDto>;
    getMetadata(companyId: string, id: string, includeUrls: boolean): Promise<{
        id: string;
        companyId: string;
        projectId: string | null;
        moduleType: string;
        moduleRecordId: string;
        fileType: string;
        fileSize: number;
        uploadedBy: string;
        uploadedAt: string;
    }>;
    getFileStream(companyId: string, id: string, kind: "file" | "thumbnail"): Promise<{
        buffer: Buffer<ArrayBufferLike>;
        contentType: string;
        fileName: string;
    }>;
    withSecureUrls(dto: Omit<AttachmentDto, "downloadUrl" | "thumbnailUrl">, filePath: string, thumbnailPath: string | null): Promise<AttachmentDto>;
};
