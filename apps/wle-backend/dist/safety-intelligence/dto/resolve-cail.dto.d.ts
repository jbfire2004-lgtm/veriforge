declare class CailAttachmentInput {
    fileName: string;
    storageKey?: string;
    mimeType?: string;
    dataUrl?: string;
}
export declare class ResolveCailDto {
    resolutionNotes?: string;
    evidenceAfter?: unknown[];
    attachments?: CailAttachmentInput[];
}
export {};
