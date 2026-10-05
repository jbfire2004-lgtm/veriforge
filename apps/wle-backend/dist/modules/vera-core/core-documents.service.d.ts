import { PrismaService } from '../../prisma/prisma.service';
export declare class CoreDocumentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    listDocuments(params: {
        purpose?: string;
        userId?: number;
        companyId?: number;
        projectId?: number;
        limit?: number;
    }): Promise<{
        id: number;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        publicUrl: string;
        purpose: string;
        companyId: number;
        companyName: string;
        projectId: number;
        projectName: string;
        projectCode: string;
        createdAt: string;
        completedAt: string;
        uploadedBy: import("./document-storage.schema").DocumentStorageUploadedBy;
        ingestionRun: {
            id: number;
            status: string;
            ocrConfidence: number;
        };
        file_id: number;
        file_name: string;
        file_type: string;
        uploaded_by: import("./document-storage.schema").DocumentStorageUploadedBy | null;
        uploaded_at: string;
        linked_project_id: number | null;
    }[]>;
}
