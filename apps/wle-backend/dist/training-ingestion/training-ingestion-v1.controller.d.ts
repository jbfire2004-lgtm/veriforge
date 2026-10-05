import { TrainingIngestUploadFieldsDto } from './dto/training-ingest-upload-fields.dto';
import { EmailIngestDto } from './dto/email-ingest.dto';
import { BulkVerifyDto } from './dto/bulk-verify.dto';
import { TrainingIngestionService } from './training-ingestion.service';
import { TrainingQrIngestionService } from './training-qr-ingestion.service';
import { TrainingProviderIngestionService } from './training-provider-ingestion.service';
import { TrainingStandardsComplianceService } from '../modules/training-standards-compliance/training-standards-compliance.service';
import type { Request } from 'express';
type ReqUser = Request & {
    user: {
        id: number;
    };
};
export declare class TrainingIngestionV1Controller {
    private readonly ingestion;
    private readonly qrIngestion;
    private readonly providerIngestion;
    private readonly standards;
    constructor(ingestion: TrainingIngestionService, qrIngestion: TrainingQrIngestionService, providerIngestion: TrainingProviderIngestionService, standards: TrainingStandardsComplianceService);
    needsReviewQueue(companyId: number, limit?: string): Promise<({
        trainingRecord: {
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
            certification: {
                id: number;
                name: string;
                code: string;
            };
            id: number;
            workerId: number;
            certificationId: number;
            expiresAt: Date;
            issuedAt: Date;
            ingestionRun: {
                coreFile: {
                    id: number;
                    originalName: string;
                    publicUrl: string;
                };
                id: number;
            };
        };
    } & {
        id: number;
        subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
        outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
        score: number | null;
        jurisdictionCode: string | null;
        matchedStandardCodes: string[];
        missingStandardCodes: string[];
        details: import(".prisma/client").Prisma.JsonValue | null;
        validatedAt: Date;
        validatedBy: number | null;
        trainingRecordId: number | null;
        trainingProviderId: number | null;
        instructorId: number | null;
        courseId: number | null;
        certificateQrToken: string | null;
    })[]>;
    listRuns(companyId: number, status?: string, sourceChannel?: string, limit?: string): Promise<({
        coreFile: {
            id: number;
            originalName: string;
            publicUrl: string;
        };
        createdRecords: {
            id: number;
            workerId: number;
        }[];
    } & {
        id: number;
        companyId: number;
        status: string;
        sourceChannel: string;
        sourceMime: string;
        originalFilename: string;
        sizeBytes: number;
        coreFileId: number | null;
        ocrText: string | null;
        ocrExtracted: import(".prisma/client").Prisma.JsonValue | null;
        ocrConfidence: number | null;
        metadataSnapshot: import(".prisma/client").Prisma.JsonValue | null;
        validationErrors: import(".prisma/client").Prisma.JsonValue | null;
        resultSummary: import(".prisma/client").Prisma.JsonValue | null;
        errorMessage: string | null;
        createdAt: Date;
        completedAt: Date | null;
    })[]>;
    verificationQueue(companyId: number, limit?: string): Promise<({
        trainingRecord: {
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
            certification: {
                id: number;
                name: string;
                code: string;
            };
            id: number;
            workerId: number;
            certificationId: number;
            expiresAt: Date;
            issuedAt: Date;
            ingestionRun: {
                coreFile: {
                    id: number;
                    originalName: string;
                    publicUrl: string;
                };
                id: number;
            };
        };
    } & {
        id: number;
        subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
        outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
        score: number | null;
        jurisdictionCode: string | null;
        matchedStandardCodes: string[];
        missingStandardCodes: string[];
        details: import(".prisma/client").Prisma.JsonValue | null;
        validatedAt: Date;
        validatedBy: number | null;
        trainingRecordId: number | null;
        trainingProviderId: number | null;
        instructorId: number | null;
        courseId: number | null;
        certificateQrToken: string | null;
    })[]>;
    getRun(id: number): Promise<{
        company: {
            id: number;
            name: string;
        };
        coreFile: {
            id: number;
            originalName: string;
            mimeType: string;
            publicUrl: string;
        };
        createdRecords: {
            id: number;
            workerId: number;
            ingestionRunId: number;
        }[];
    } & {
        id: number;
        companyId: number;
        status: string;
        sourceChannel: string;
        sourceMime: string;
        originalFilename: string;
        sizeBytes: number;
        coreFileId: number | null;
        ocrText: string | null;
        ocrExtracted: import(".prisma/client").Prisma.JsonValue | null;
        ocrConfidence: number | null;
        metadataSnapshot: import(".prisma/client").Prisma.JsonValue | null;
        validationErrors: import(".prisma/client").Prisma.JsonValue | null;
        resultSummary: import(".prisma/client").Prisma.JsonValue | null;
        errorMessage: string | null;
        createdAt: Date;
        completedAt: Date | null;
    }>;
    emailIngest(body: EmailIngestDto, secret?: string): Promise<{
        company: {
            id: number;
            name: string;
        };
        coreFile: {
            id: number;
            originalName: string;
            mimeType: string;
            publicUrl: string;
        };
        createdRecords: {
            id: number;
            workerId: number;
            ingestionRunId: number;
        }[];
    } & {
        id: number;
        companyId: number;
        status: string;
        sourceChannel: string;
        sourceMime: string;
        originalFilename: string;
        sizeBytes: number;
        coreFileId: number | null;
        ocrText: string | null;
        ocrExtracted: import(".prisma/client").Prisma.JsonValue | null;
        ocrConfidence: number | null;
        metadataSnapshot: import(".prisma/client").Prisma.JsonValue | null;
        validationErrors: import(".prisma/client").Prisma.JsonValue | null;
        resultSummary: import(".prisma/client").Prisma.JsonValue | null;
        errorMessage: string | null;
        createdAt: Date;
        completedAt: Date | null;
    }>;
    preview(file: Express.Multer.File, body: TrainingIngestUploadFieldsDto): Promise<import("./pipeline/types").IngestionPreviewResult>;
    confirm(body: unknown): Promise<{
        created: number;
        errors: import("./training-ingestion.service").IngestRowError[];
        recordIds: number[];
        needsReview: number;
        autoVerified?: number;
        correlationId?: string;
        runId: number;
    }>;
    qrIngest(body: unknown): Promise<import("./pipeline/types").QrIngestResult>;
    providerIngest(providerId: number, body: unknown, signature?: string, req?: Request): Promise<import("./pipeline/types").ProviderIngestResult>;
    approveReview(id: number, body: {
        notes?: string;
    }, req: ReqUser): Promise<{
        rejections: ({
            rejectionReason: {
                id: number;
                code: string;
                title: string;
                description: string | null;
                severity: import(".prisma/client").$Enums.TrainingRejectionSeverity;
                category: import(".prisma/client").$Enums.TrainingRejectionCategory;
                active: boolean;
            };
        } & {
            validationResultId: number;
            rejectionReasonId: number;
            message: string | null;
        })[];
    } & {
        id: number;
        subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
        outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
        score: number | null;
        jurisdictionCode: string | null;
        matchedStandardCodes: string[];
        missingStandardCodes: string[];
        details: import(".prisma/client").Prisma.JsonValue | null;
        validatedAt: Date;
        validatedBy: number | null;
        trainingRecordId: number | null;
        trainingProviderId: number | null;
        instructorId: number | null;
        courseId: number | null;
        certificateQrToken: string | null;
    }>;
    correctReview(id: number, body: unknown, req: ReqUser): Promise<{
        rejections: ({
            rejectionReason: {
                id: number;
                code: string;
                title: string;
                description: string | null;
                severity: import(".prisma/client").$Enums.TrainingRejectionSeverity;
                category: import(".prisma/client").$Enums.TrainingRejectionCategory;
                active: boolean;
            };
        } & {
            validationResultId: number;
            rejectionReasonId: number;
            message: string | null;
        })[];
    } & {
        id: number;
        subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
        outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
        score: number | null;
        jurisdictionCode: string | null;
        matchedStandardCodes: string[];
        missingStandardCodes: string[];
        details: import(".prisma/client").Prisma.JsonValue | null;
        validatedAt: Date;
        validatedBy: number | null;
        trainingRecordId: number | null;
        trainingProviderId: number | null;
        instructorId: number | null;
        courseId: number | null;
        certificateQrToken: string | null;
    }>;
    upload(file: Express.Multer.File, body: TrainingIngestUploadFieldsDto): Promise<{
        company: {
            id: number;
            name: string;
        };
        coreFile: {
            id: number;
            originalName: string;
            mimeType: string;
            publicUrl: string;
        };
        createdRecords: {
            id: number;
            workerId: number;
            ingestionRunId: number;
        }[];
    } & {
        id: number;
        companyId: number;
        status: string;
        sourceChannel: string;
        sourceMime: string;
        originalFilename: string;
        sizeBytes: number;
        coreFileId: number | null;
        ocrText: string | null;
        ocrExtracted: import(".prisma/client").Prisma.JsonValue | null;
        ocrConfidence: number | null;
        metadataSnapshot: import(".prisma/client").Prisma.JsonValue | null;
        validationErrors: import(".prisma/client").Prisma.JsonValue | null;
        resultSummary: import(".prisma/client").Prisma.JsonValue | null;
        errorMessage: string | null;
        createdAt: Date;
        completedAt: Date | null;
    }>;
    bulkUpload(files: Express.Multer.File[], body: TrainingIngestUploadFieldsDto): Promise<{
        count: number;
        runs: any[];
    }>;
    bulkVerify(body: BulkVerifyDto, req: ReqUser): Promise<{
        approved: number;
        results: any[];
    }>;
}
export {};
