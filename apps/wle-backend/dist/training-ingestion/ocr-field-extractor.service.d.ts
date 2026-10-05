export type OcrExtractedFields = {
    workerName?: string;
    certificationName?: string;
    certificationCode?: string;
    issuedAt?: string;
    expiresAt?: string;
    certificateNumber?: string;
    confidence: number;
    fieldConfidence: Record<string, number>;
};
export declare class OcrFieldExtractorService {
    extract(text: string): OcrExtractedFields;
}
