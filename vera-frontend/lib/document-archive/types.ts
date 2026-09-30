/**
 * Unified Document Archive — merges finalized forms/reports/assessments
 * (Document Service) with binary Document Storage (CoreFile).
 */

import type { DocumentStatus, DocumentSummary, DocumentType } from "@/lib/documents";
import type { CoreDocument } from "@/lib/core/vera-core-platform";

export type ArchiveKind = "form" | "report" | "assessment" | "attachment";

export type DocumentArchiveItem = {
  id: string;
  source: "form" | "file";
  kind: ArchiveKind;
  title: string;
  typeKey: string;
  typeLabel: string;
  projectId: string | null;
  projectName: string | null;
  status: string;
  date: string | null;
  href?: string | null;
  openUrl?: string | null;
  purpose?: string | null;
  mimeType?: string | null;
};

export const ARCHIVE_KIND_LABELS: Record<ArchiveKind, string> = {
  form: "Form",
  report: "Report",
  assessment: "Assessment",
  attachment: "Attachment",
};

export const ARCHIVE_STATUS_OPTIONS = [
  "Completed",
  "RequiresReview",
  "Archived",
  "Pending",
  "Failed",
] as const;

const FORM_TYPES = new Set<DocumentType>([
  "FLHA",
  "JHA",
  "WorkOrder",
  "PMTask",
  "CorrectiveAction",
  "TrainingRecord",
  "SafetyPolicy",
  "Procedure",
]);

const REPORT_TYPES = new Set<DocumentType>([
  "Incident",
  "FailureReport",
  "VendorServiceReport",
  "WarrantyDocument",
  "Audit",
]);

const ASSESSMENT_TYPES = new Set<DocumentType>([
  "Inspection",
  "AssetInspection",
]);

export function kindFromDocumentType(type: DocumentType): ArchiveKind {
  if (ASSESSMENT_TYPES.has(type)) return "assessment";
  if (REPORT_TYPES.has(type)) return "report";
  if (FORM_TYPES.has(type)) return "form";
  return "form";
}

export function kindFromCorePurpose(purpose: string | null | undefined): ArchiveKind {
  const p = (purpose ?? "").toLowerCase();
  if (p.includes("assessment") || p === "inspection_signature") return "assessment";
  if (p.includes("report")) return "report";
  if (p === "completed_document" || p === "training_ingestion") return "form";
  return "attachment";
}

function fileStatus(doc: CoreDocument): string {
  // Core upload lifecycle — surface as archive status
  const purpose = (doc.purpose ?? "").toLowerCase();
  if (purpose === "completed_document") return "Completed";
  if (doc.publicUrl) return "Completed";
  return "Archived";
}

export function formToArchiveItem(row: DocumentSummary): DocumentArchiveItem {
  const kind = kindFromDocumentType(row.document_type);
  return {
    id: `form:${row.document_id}`,
    source: "form",
    kind,
    title: row.title?.trim() || `${row.document_type} · ${row.document_id}`,
    typeKey: row.document_type,
    typeLabel: row.document_type,
    projectId: row.project_id ?? null,
    projectName: row.project_name ?? null,
    status: row.status,
    date: row.completed_at ?? row.updated_at ?? row.created_at,
    href: `/pm/documents?highlight=${encodeURIComponent(row.document_id)}`,
  };
}

export function fileToArchiveItem(doc: CoreDocument): DocumentArchiveItem {
  const kind = kindFromCorePurpose(doc.purpose);
  const typeKey = doc.purpose || doc.mimeType || "file";
  const isTraining =
    (doc.purpose ?? "").toLowerCase() === "training_ingestion";
  return {
    id: `file:${doc.file_id ?? doc.id}`,
    source: "file",
    kind,
    title: doc.file_name || doc.originalName || `File ${doc.id}`,
    typeKey,
    typeLabel: doc.purpose
      ? String(doc.purpose).replace(/_/g, " ")
      : doc.mimeType || "File",
    projectId:
      doc.linked_project_id != null
        ? String(doc.linked_project_id)
        : doc.projectId != null
          ? String(doc.projectId)
          : null,
    projectName: doc.projectName ?? null,
    status: fileStatus(doc),
    date: doc.uploaded_at || doc.createdAt,
    openUrl: doc.publicUrl,
    href: isTraining
      ? `/core/training-ingest?coreFileId=${doc.file_id ?? doc.id}`
      : `/core/upload`,
    purpose: doc.purpose,
    mimeType: doc.mimeType || doc.file_type,
  };
}

export type ArchiveFilterInput = {
  projectId?: string;
  kind?: ArchiveKind | "";
  typeKey?: string;
  status?: string[];
  dateFrom?: string;
  dateTo?: string;
  q?: string;
};

export function filterArchiveItems(
  items: DocumentArchiveItem[],
  filters: ArchiveFilterInput,
): DocumentArchiveItem[] {
  const q = filters.q?.trim().toLowerCase() ?? "";
  const statusSet = filters.status?.length
    ? new Set(filters.status.map((s) => s.toLowerCase()))
    : null;
  const from = filters.dateFrom ? new Date(filters.dateFrom) : null;
  const to = filters.dateTo ? new Date(`${filters.dateTo}T23:59:59.999`) : null;

  return items.filter((item) => {
    if (filters.projectId && item.projectId !== filters.projectId) return false;
    if (filters.kind && item.kind !== filters.kind) return false;
    if (filters.typeKey && item.typeKey !== filters.typeKey) return false;
    if (statusSet && !statusSet.has(item.status.toLowerCase())) return false;
    if (from || to) {
      if (!item.date) return false;
      const d = new Date(item.date);
      if (from && d < from) return false;
      if (to && d > to) return false;
    }
    if (q) {
      const hay = [
        item.title,
        item.typeLabel,
        item.projectName,
        item.projectId,
        item.status,
        item.purpose,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

export function sortArchiveByDateDesc(
  items: DocumentArchiveItem[],
): DocumentArchiveItem[] {
  return [...items].sort((a, b) => {
    const ta = a.date ? new Date(a.date).getTime() : 0;
    const tb = b.date ? new Date(b.date).getTime() : 0;
    return tb - ta;
  });
}

export function collectArchiveProjects(
  items: DocumentArchiveItem[],
): Array<{ id: string; label: string }> {
  const map = new Map<string, string>();
  for (const item of items) {
    if (!item.projectId) continue;
    map.set(
      item.projectId,
      item.projectName
        ? `${item.projectName} (#${item.projectId})`
        : `Project #${item.projectId}`,
    );
  }
  return [...map.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function collectArchiveTypeKeys(
  items: DocumentArchiveItem[],
): Array<{ key: string; label: string }> {
  const map = new Map<string, string>();
  for (const item of items) {
    map.set(item.typeKey, item.typeLabel);
  }
  return [...map.entries()]
    .map(([key, label]) => ({ key, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

/** Keep status typing aligned with Document Service where applicable */
export type ArchiveDocumentStatus = DocumentStatus | "Pending" | "Failed";
