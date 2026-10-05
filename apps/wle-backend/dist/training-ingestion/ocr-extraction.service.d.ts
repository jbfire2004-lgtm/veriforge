import { OcrFieldExtractorService, OcrExtractedFields } from './ocr-field-extractor.service';
export type OcrExtractionResult = {
    text: string;
    confidence: number;
    engine: 'heuristic' | 'stub';
    fields: OcrExtractedFields;
};
export declare class OcrExtractionService {
    private readonly fieldExtractor;
    private readonly logger;
    constructor(fieldExtractor: OcrFieldExtractorService);
    extractWithRetry(buffer: Buffer, mimeType: string, maxAttempts?: number): Promise<OcrExtractionResult>;
    extractFromBuffer(buffer: Buffer, mimeType: string): Promise<OcrExtractionResult>;
    private readTextFromBuffer;
}
