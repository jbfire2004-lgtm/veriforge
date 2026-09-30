export interface CreateAttachmentInput {
    id?: string;
    companyId: string;
    projectId?: string;
    moduleType: string;
    moduleRecordId: string;
    filePath: string;
    fileType: string;
    fileSize: number;
    thumbnailPath?: string;
    uploadedBy: string;
}
declare function toDto(row: {
    id: string;
    companyId: string;
    projectId: string | null;
    moduleType: string;
    moduleRecordId: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedAt: Date;
}): {
    id: string;
    companyId: string;
    projectId: string | null;
    moduleType: string;
    moduleRecordId: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedAt: string;
};
export declare const attachmentRepository: {
    create(input: CreateAttachmentInput): import(".prisma/client").Prisma.Prisma__AttachmentClient<{
        id: string;
        companyId: string;
        projectId: string | null;
        moduleType: string;
        moduleRecordId: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        thumbnailPath: string | null;
        uploadedBy: string;
        uploadedAt: Date;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import(".prisma/client").Prisma.PrismaClientOptions>;
    findById(id: string, companyId: string): Promise<{
        id: string;
        companyId: string;
        projectId: string | null;
        moduleType: string;
        moduleRecordId: string;
        filePath: string;
        fileType: string;
        fileSize: number;
        thumbnailPath: string | null;
        uploadedBy: string;
        uploadedAt: Date;
    } | null>;
    toDto: typeof toDto;
};
export {};
