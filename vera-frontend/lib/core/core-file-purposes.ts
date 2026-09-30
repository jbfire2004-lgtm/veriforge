/**
 * Canonical CoreFile.purpose tags (keep in sync with backend core-file-purposes).
 */

export const CORE_FILE_PURPOSES = [
  "document_storage",
  "training_ingestion",
  "completed_document",
  "inspection_signature",
  "generic",
] as const;

export type CoreFilePurpose = (typeof CORE_FILE_PURPOSES)[number];

export const CORE_FILE_PURPOSE_OPTIONS: Array<{
  value: CoreFilePurpose;
  label: string;
}> = [
  { value: "document_storage", label: "Document storage" },
  { value: "training_ingestion", label: "Training ingestion" },
  { value: "completed_document", label: "Completed document" },
  { value: "inspection_signature", label: "Inspection signature" },
  { value: "generic", label: "General" },
];

export function purposeLabel(purpose: string | null | undefined): string {
  if (!purpose) return "Untagged";
  const hit = CORE_FILE_PURPOSE_OPTIONS.find((o) => o.value === purpose);
  return hit?.label ?? purpose;
}

export function normalizeCoreFilePurpose(
  value?: string | null,
): string | undefined {
  const trimmed = value?.trim();
  if (!trimmed) return undefined;
  if (trimmed === "training-ingest" || trimmed === "training-ingestion") {
    return "training_ingestion";
  }
  return trimmed;
}
