import { EventBusService } from '../modules/api-platform/events/event-bus.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import type { TrainingIngestRowDto } from './dto/ingest-training-rows.dto';
import type { EmailIngestDto } from './dto/email-ingest.dto';
import { OcrExtractionService } from './ocr-extraction.service';
import type { OcrExtractedFields } from './ocr-field-extractor.service';
import { TrainingMetadataParserService } from './training-metadata-parser.service';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
import { TrainingWalletIntegrationService } from '../modules/vera-core/training-wallet-integration.service';
import { CoreUploadService } from '../modules/core-upload/core-upload.service';
import { IngestionConfidencePolicyService } from './ingestion-confidence-policy.service';
import type { IngestionChannel, IngestionPreviewResult, NormalizedIngestRow } from './pipeline/types';
import { TrainingStandardsComplianceService } from '../modules/training-standards-compliance/training-standards-compliance.service';
import { CredentialLedgerService } from '../modules/credential-ledger/credential-ledger.service';
export type IngestRowError = {
    row: number;
    message: string;
};
export type IngestSummary = {
    created: number;
    errors: IngestRowError[];
    recordIds: number[];
    needsReview: number;
    autoVerified?: number;
    correlationId?: string;
};
export declare class TrainingIngestionService {
    private prisma;
    private readonly ocr;
    private readonly parser;
    private readonly monitoring;
    private readonly walletIntegration;
    private readonly coreUpload;
    private readonly confidencePolicy;
    private readonly standards;
    private readonly credentialLedger;
    private readonly events?;
    private readonly notifications?;
    private readonly logger;
    constructor(prisma: PrismaService, ocr: OcrExtractionService, parser: TrainingMetadataParserService, monitoring: Phase1MonitoringService, walletIntegration: TrainingWalletIntegrationService, coreUpload: CoreUploadService, confidencePolicy: IngestionConfidencePolicyService, standards: TrainingStandardsComplianceService, credentialLedger: CredentialLedgerService, events?: EventBusService, notifications?: NotificationsService);
    private newLookupContext;
    ingestCsv(companyId: number, csvText: string): Promise<IngestSummary>;
    ingestRows(companyId: number, rows: TrainingIngestRowDto[], options?: {
        ingestionRunId?: number;
    }): Promise<IngestSummary>;
    ingestRowsWithConfidence(companyId: number, rows: NormalizedIngestRow[], options?: {
        ingestionRunId?: number;
        correlationId?: string;
        channel?: IngestionChannel;
        providerId?: number;
        ocrExtracted?: OcrExtractedFields | null;
    }): Promise<IngestSummary>;
    private ingestOneRow;
    private createIngestionValidation;
    private createPendingValidation;
    private createPendingValidations;
    private resolveCertificationId;
    getRun(runId: number): Promise<{
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
    listRuns(params: {
        companyId: number;
        status?: string;
        sourceChannel?: string;
        limit?: number;
    }): Promise<({
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
    verificationQueue(companyId: number, limit?: number): Promise<({
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
    needsReviewQueue(companyId: number, limit?: number): Promise<({
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
    approveReview(validationResultId: number, validatedBy: number, notes?: string): Promise<{
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
    correctReview(validationResultId: number, validatedBy: number, corrections: Record<string, unknown>): Promise<{
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
    previewFileUpload(companyId: number, file: Express.Multer.File, metadataJson?: string): Promise<IngestionPreviewResult>;
    confirmIngest(companyId: number, body: unknown, sourceChannel?: IngestionChannel): Promise<{
        created: number;
        errors: IngestRowError[];
        recordIds: number[];
        needsReview: number;
        autoVerified?: number;
        correlationId?: string;
        runId: number;
    }>;
    processEmailIngest(dto: EmailIngestDto, webhookSecret?: string): Promise<{
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
    processFileUpload(companyId: number, file: Express.Multer.File, metadataJson?: string, sourceChannel?: 'upload' | 'email' | 'bulk'): Promise<{
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
    private parseUploadToRows;
    private buildRowsFromOcr;
    private resolveWorkerIdFromName;
    private emitIngestionTerminalEvent;
}
