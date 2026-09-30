export declare class FileValidationEngine {
    validate(input: {
        mimeType: string;
        fileName: string;
        fileSize: number;
        maxBytes?: number;
    }): {
        ok: boolean;
        errors: string[];
    };
    isImageMime(mimeType: string): boolean;
}
export declare const fileValidationEngine: FileValidationEngine;
