import type { OcrBlock, OcrResult } from "../types";
export type OcrInput = {
    text?: string;
    blocks?: OcrBlock[];
    imageBase64?: string;
};
/**
 * OCR engine — accepts pre-extracted text (client Tesseract / cloud OCR)
 * or raw text paste. Image pipeline hooks via `registerProvider`.
 */
export declare class OcrEngine {
    private provider;
    registerProvider(fn: (input: OcrInput) => Promise<OcrResult>): void;
    extract(input: OcrInput): Promise<OcrResult>;
    fromText(text: string, engine?: string): OcrResult;
}
//# sourceMappingURL=ocr-engine.d.ts.map