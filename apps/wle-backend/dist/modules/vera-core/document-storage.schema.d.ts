export type DocumentStorageUploadedBy = {
    id: number;
    email: string;
    companyId: number | null;
};
export type DocumentStorageRecord = {
    file_id: number;
    file_name: string;
    file_type: string;
    uploaded_by: DocumentStorageUploadedBy | null;
    uploaded_at: string;
    purpose: string | null;
    linked_project_id: number | null;
};
export declare function toDocumentStorageRecord(row: {
    id: number;
    originalName: string;
    mimeType: string;
    purpose: string | null;
    projectId?: number | null;
    createdAt: Date | string;
    completedAt?: Date | string | null;
    user?: {
        id: number;
        email: string;
        companyId: number | null;
    } | null;
}): DocumentStorageRecord;
