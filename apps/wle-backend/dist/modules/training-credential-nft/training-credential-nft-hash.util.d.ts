export declare function hashRegulatoryDecisionPayload(payload: unknown): string;
export declare function hashOriginalDocumentRef(parts: {
    coreFileObjectKey?: string | null;
    coreFileId?: number | null;
    ingestionRunId?: number | null;
    certificateNumber?: string | null;
}): string | null;
