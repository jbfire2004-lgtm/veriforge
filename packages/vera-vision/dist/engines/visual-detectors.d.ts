import type { ExtractedField, OcrResult } from "../types";
export type VisualDetection = {
    signatures: number;
    stamps: number;
    barcodes: number;
    qrCodes: number;
    serialNumbers: string[];
    hazards: string[];
    ppeLabels: string[];
};
export declare class SignatureDetectionEngine {
    detect(text: string, hint?: boolean): number;
}
export declare class StampSealDetectionEngine {
    detect(text: string, hint?: boolean): number;
}
export declare class BarcodeQrDetectionEngine {
    detect(text: string, hints?: {
        qr?: boolean;
        barcode?: boolean;
    }): {
        barcodes: number;
        qrCodes: number;
    };
}
export declare class SerialNumberDetectionEngine {
    detect(text: string): string[];
}
export declare class PpeLabelDetectionEngine {
    detect(text: string): string[];
}
export declare class EquipmentPlateReader {
    read(text: string): ExtractedField[];
}
export declare class ImageClassificationEngine {
    classify(documentType: string, text: string, hints?: {
        hazards?: string[];
        damageTypes?: string[];
    }): {
        category: string;
        tags: string[];
        confidence: number;
    };
}
export declare function runVisualDetection(ocr: OcrResult, hints?: {
    hasSignature?: boolean;
    hasStamp?: boolean;
    hasQr?: boolean;
    hasBarcode?: boolean;
    hazards?: string[];
}): VisualDetection;
//# sourceMappingURL=visual-detectors.d.ts.map