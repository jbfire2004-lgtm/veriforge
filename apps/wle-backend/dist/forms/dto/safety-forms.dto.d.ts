import { SafetyFormStatus } from '@prisma/client';
export declare class CreateSafetyFormDto {
    definitionId: string;
    title?: string;
    formData?: Record<string, unknown>;
    companyId?: number;
    projectId?: number;
    siteId?: number;
    workerId?: number;
    equipmentId?: number;
    clientSyncId?: string;
}
export declare class SaveSafetyFormDraftDto {
    formData: Record<string, unknown>;
}
declare class SignatureInputDto {
    fieldId?: string;
    signatureData: string;
    signerName?: string;
}
export declare class SubmitSafetyFormDto {
    formData: Record<string, unknown>;
    signatures?: SignatureInputDto[];
}
export declare class TransitionSafetyFormDto {
    status: SafetyFormStatus;
    note?: string;
}
export declare class AutoPopulateQueryDto {
    workerId?: number;
    projectId?: number;
    companyId?: number;
    equipmentId?: number;
}
export declare class AddAttachmentDto {
    fieldId?: string;
    fileName: string;
    mimeType?: string;
    dataUrl?: string;
    sizeBytes?: number;
}
export declare class OfflineSyncDto {
    clientSyncId: string;
    definitionId: string;
    formData: Record<string, unknown>;
    submit?: boolean;
    companyId?: number;
    projectId?: number;
    siteId?: number;
    workerId?: number;
    signatures?: SignatureInputDto[];
}
export {};
