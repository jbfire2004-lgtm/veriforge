/**
 * Canonical CoreFile.purpose tags used by Document Storage, Training Ingestion,
 * and related Core upload callers.
 */
export const CORE_FILE_PURPOSES = [
  'document_storage',
  'training_ingestion',
  'safety_program_ingestion',
  'completed_document',
  'inspection_signature',
  'orientation_media',
  'generic',
] as const;

export type CoreFilePurpose = (typeof CORE_FILE_PURPOSES)[number];

export const CORE_FILE_PURPOSE_LABELS: Record<CoreFilePurpose, string> = {
  document_storage: 'Document storage',
  training_ingestion: 'Training ingestion',
  safety_program_ingestion: 'Safety program ingestion',
  completed_document: 'Completed document',
  inspection_signature: 'Inspection signature',
  orientation_media: 'Orientation media',
  generic: 'General',
};

export function normalizeCoreFilePurpose(
  value?: string | null,
): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  // Legacy UI / docs used hyphenated form
  if (trimmed === 'training-ingest' || trimmed === 'training-ingestion') {
    return 'training_ingestion';
  }
  if (
    trimmed === 'safety-program-ingest' ||
    trimmed === 'safety-program-ingestion'
  ) {
    return 'safety_program_ingestion';
  }
  return trimmed.slice(0, 200);
}
