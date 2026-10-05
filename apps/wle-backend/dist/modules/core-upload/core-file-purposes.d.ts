export declare const CORE_FILE_PURPOSES: readonly ["document_storage", "training_ingestion", "safety_program_ingestion", "completed_document", "inspection_signature", "orientation_media", "generic"];
export type CoreFilePurpose = (typeof CORE_FILE_PURPOSES)[number];
export declare const CORE_FILE_PURPOSE_LABELS: Record<CoreFilePurpose, string>;
export declare function normalizeCoreFilePurpose(value?: string | null): string | null;
