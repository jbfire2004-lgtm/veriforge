import { PrismaService } from '../../prisma/prisma.service';
export declare class SafetyFormAttachmentsService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    add(formId: string, input: {
        fieldId?: string;
        fileName: string;
        mimeType?: string;
        dataUrl?: string;
        storageKey?: string;
        sizeBytes?: number;
    }): Promise<{
        id: string;
        formId: string;
        fieldId: string | null;
        fileName: string;
        mimeType: string | null;
        storageKey: string | null;
        dataUrl: string | null;
        sizeBytes: number | null;
        createdAt: Date;
    }>;
    list(formId: string): Promise<{
        id: string;
        formId: string;
        fieldId: string | null;
        fileName: string;
        mimeType: string | null;
        storageKey: string | null;
        dataUrl: string | null;
        sizeBytes: number | null;
        createdAt: Date;
    }[]>;
    remove(formId: string, attachmentId: string): Promise<{
        ok: boolean;
        id: string;
    }>;
}
