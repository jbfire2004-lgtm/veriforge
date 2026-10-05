import { CoreUploadStatus, CoreUploadStorage } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Phase1MonitoringService } from '../../common/monitoring/phase1-monitoring.service';
import type { PresignDto } from './dto/presign.dto';
export type CoreFileResponse = {
    id: number;
    storage: CoreUploadStorage;
    status: CoreUploadStatus;
    objectKey: string;
    originalName: string;
    mimeType: string;
    sizeBytes: number;
    publicUrl: string | null;
    purpose: string | null;
    companyId: number | null;
    userId: number | null;
    projectId: number | null;
    file_id: number;
    file_name: string;
    file_type: string;
    uploaded_by: number | null;
    uploaded_at: Date;
    linked_project_id: number | null;
    createdAt: Date;
    completedAt: Date | null;
};
export type CoreUploadOwnership = {
    userId?: number | null;
    companyId?: number | null;
    projectId?: number | null;
};
export declare class CoreUploadService {
    private readonly prisma;
    private readonly monitoring;
    private readonly logger;
    private s3;
    constructor(prisma: PrismaService, monitoring: Phase1MonitoringService);
    private getS3;
    private requireAwsBucket;
    getPublicConfig(): {
        mode: import("./core-upload.config").CoreUploadMode;
        maxBytes: number;
        allowedMimeTypes: string[];
    };
    listPurposes(): {
        value: "document_storage" | "training_ingestion" | "safety_program_ingestion" | "completed_document" | "inspection_signature" | "orientation_media" | "generic";
        label: string;
    }[];
    private assertMimeAllowed;
    private assertSizeAllowed;
    private makeObjectKey;
    private localDiskPath;
    private localPublicUrl;
    private s3PublicUrl;
    private toResponse;
    private ownershipData;
    findOne(id: number): Promise<CoreFileResponse>;
    readBuffer(id: number): Promise<{
        buffer: Buffer;
        mimeType: string;
        originalName: string;
    }>;
    abandonDirectUpload(id: number): Promise<{
        id: number;
        status: string;
    }>;
    handleMultipartUpload(file: Express.Multer.File, purpose?: string, ownership?: CoreUploadOwnership): Promise<CoreFileResponse>;
    createPresignedUpload(dto: PresignDto, ownership?: CoreUploadOwnership): Promise<{
        id: number;
        uploadUrl: string;
        method: "PUT";
        headers: {
            'Content-Type': string;
        };
        objectKey: string;
        expiresInSeconds: number;
    }>;
    completeDirectUpload(id: number): Promise<CoreFileResponse>;
    sha256Hex(buffer: Buffer): string;
}
