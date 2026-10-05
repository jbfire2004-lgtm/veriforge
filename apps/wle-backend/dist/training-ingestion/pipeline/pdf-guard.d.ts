export declare class PdfGuardError extends Error {
    constructor(message: string);
}
export declare function assertValidPdfHeader(buffer: Buffer): void;
export declare function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T>;
