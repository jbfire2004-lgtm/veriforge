import type { TrainingIngestRowDto } from '../dto/ingest-training-rows.dto';
import type { OcrExtractedFields } from '../ocr-field-extractor.service';
export type IngestionChannel = 'upload' | 'email' | 'bulk' | 'qr' | 'provider_api' | 'csv';
export type IngestionFieldKey = 'workerId' | 'workerName' | 'certificationId' | 'certificationCode' | 'certificationName' | 'issuedAt' | 'expiresAt' | 'providerName' | 'certificateNumber';
export type FieldConfidenceMap = Partial<Record<IngestionFieldKey, number>>;
export type IngestionConfidenceReport = {
    overall: number;
    fields: FieldConfidenceMap;
    blocked: boolean;
    needsReview: boolean;
    reasons: string[];
};
export type NormalizedIngestRow = TrainingIngestRowDto & {
    confidence?: number;
    fieldConfidence?: FieldConfidenceMap;
};
export type ParsedIngestContext = {
    correlationId: string;
    channel: IngestionChannel;
    companyId: number;
    mimeType?: string;
    originalFilename?: string;
    ocrText?: string | null;
    ocrExtracted?: OcrExtractedFields | null;
    rows: NormalizedIngestRow[];
    confidence: IngestionConfidenceReport;
};
export type IngestionPreviewResult = {
    correlationId: string;
    rows: NormalizedIngestRow[];
    confidence: IngestionConfidenceReport;
    ocrText?: string | null;
    ocrExtracted?: OcrExtractedFields | null;
    validationErrors: string[];
    canConfirm: boolean;
};
export type QrIngestResult = {
    correlationId: string;
    status: 'linked' | 'needs_review' | 'preview';
    trainingRecordId?: number;
    validationResultId?: number;
    certificate?: {
        valid: boolean;
        expired: boolean;
        workerId?: number;
        workerName?: string;
        certification?: string;
        issuedAt?: string;
        expiresAt?: string | null;
    };
    message: string;
};
export type ProviderIngestResult = {
    correlationId: string;
    created: number;
    needsReview: number;
    errors: Array<{
        row: number;
        message: string;
    }>;
    recordIds: number[];
};
