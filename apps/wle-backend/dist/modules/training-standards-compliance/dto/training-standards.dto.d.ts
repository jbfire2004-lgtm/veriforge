import { TrainingValidationOutcome } from '@prisma/client';
export declare class ValidateTrainingDto {
    trainingRecordId: number;
    jurisdictionCode?: string;
}
export declare class ValidateProviderDto {
    trainingProviderId: number;
    jurisdictionCode?: string;
}
export declare class ValidateInstructorDto {
    instructorId: number;
    courseCode?: string;
    jurisdictionCode?: string;
}
export declare class ValidateCertificateDto {
    certificateQrToken?: string;
    trainingRecordId?: number;
}
export declare class ApprovalWorkflowDto {
    validationResultId: number;
    outcome: TrainingValidationOutcome;
    notes?: string;
}
export declare class RejectionWorkflowDto {
    validationResultId: number;
    rejectionCodes: string[];
    notes?: string;
}
