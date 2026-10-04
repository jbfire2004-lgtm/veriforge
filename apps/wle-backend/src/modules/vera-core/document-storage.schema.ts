/**
 * Document Storage schema (CoreFile-backed).
 *
 * Persistence (Prisma CoreFile):
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

export function toDocumentStorageRecord(row: {
  id: number;
  originalName: string;
  mimeType: string;
  purpose: string | null;
  projectId?: number | null;
  createdAt: Date | string;
  completedAt?: Date | string | null;
  user?: {
    id: number;
    email: string;
    companyId: number | null;
  } | null;
}): DocumentStorageRecord {
  const uploadedAt = row.completedAt ?? row.createdAt;
  return {
    file_id: row.id,
    file_name: row.originalName,
    file_type: row.mimeType,
    uploaded_by: row.user
      ? {
          id: row.user.id,
          email: row.user.email,
          companyId: row.user.companyId,
        }
      : null,
    uploaded_at:
      typeof uploadedAt === 'string'
        ? uploadedAt
        : uploadedAt.toISOString(),
    purpose: row.purpose,
    linked_project_id: row.projectId ?? null,
  };
}
