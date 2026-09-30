/**
 * Document Storage schema (CoreFile-backed).
 *
 * Persistence mapping:
 *   file_id            → CoreFile.id
 *   file_name          → CoreFile.originalName
 *   file_type          → CoreFile.mimeType
 *   uploaded_by        → CoreFile.userId (+ User join)
 *   uploaded_at        → CoreFile.completedAt ?? CoreFile.createdAt
 *   purpose            → CoreFile.purpose
 *   linked_project_id  → CoreFile.projectId
 */

export type DocumentStorageUploadedBy = {
  id: number;
  email: string;
  companyId: number | null;
};

/** Canonical Document Storage record shape (API contract). */
export type DocumentStorageRecord = {
  file_id: number;
  file_name: string;
  file_type: string;
  uploaded_by: DocumentStorageUploadedBy | null;
  uploaded_at: string;
  purpose: string | null;
  linked_project_id: number | null;
};
