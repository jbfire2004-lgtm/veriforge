import { SafetyFormType } from '@prisma/client';
declare class SafetyWorkflowSignatureDto {
    fieldId?: string;
    signatureData: string;
    signerName?: string;
}
export declare class CreateSafetyWorkflowFormDto {
    formType: SafetyFormType;
    projectId?: number;
    workerId?: number;
    companyId?: number;
    siteId?: number;
    equipmentId?: number;
    title?: string;
    formData?: Record<string, unknown>;
    supervisorId?: number;
}
export declare class SaveSafetyWorkflowDraftDto {
    formData: Record<string, unknown>;
}
export declare class SubmitSafetyWorkflowFormDto {
    formData: Record<string, unknown>;
    signatures?: SafetyWorkflowSignatureDto[];
}
export {};
