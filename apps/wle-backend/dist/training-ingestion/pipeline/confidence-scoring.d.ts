import type { OcrExtractedFields } from '../ocr-field-extractor.service';
import type { IngestionConfidenceReport, NormalizedIngestRow } from './types';
export declare const INGESTION_BLOCK_THRESHOLD = 0.35;
export declare const INGESTION_REVIEW_THRESHOLD = 0.55;
export declare function scoreIngestRow(row: NormalizedIngestRow, ocr?: OcrExtractedFields | null): IngestionConfidenceReport;
export declare function scoreBatch(rows: NormalizedIngestRow[], ocr?: OcrExtractedFields | null): IngestionConfidenceReport;
