/**
 * VeriForge Document Service — shared domain/type/status constants.
 * Aligns with docs/VERIFORGE-DOCUMENT-SERVICE.md (canonical DDL).
 * Wire format uses uppercase domain enums: VERICORE | VERIPM.
 */

export const DOCUMENT_DOMAINS = ["VERICORE", "VERIPM"] as const;
export type DocumentDomain = (typeof DOCUMENT_DOMAINS)[number];

export const DOCUMENT_STATUSES = [
  "Draft",
  "InProgress",
  "Completed",
  "RequiresReview",
  "Archived",
  "Cancelled",
] as const;
export type DocumentStatus = (typeof DOCUMENT_STATUSES)[number];

/** Statuses shown in the Completed Documents hub by default */
export const HUB_DOCUMENT_STATUSES = [
  "Completed",
  "RequiresReview",
  "Archived",
] as const satisfies readonly DocumentStatus[];

export const VERICORE_DOCUMENT_TYPES = [
  "FLHA",
  "JHA",
  "Incident",
  "Inspection",
  "SafetyPolicy",
  "Procedure",
  "TrainingRecord",
  "CorrectiveAction",
  "Audit",
] as const;

export const VERIPM_DOCUMENT_TYPES = [
  "WorkOrder",
  "PMTask",
  "AssetInspection",
  "FailureReport",
  "VendorServiceReport",
  "WarrantyDocument",
] as const;

export const DOCUMENT_TYPES = [
  ...VERICORE_DOCUMENT_TYPES,
  ...VERIPM_DOCUMENT_TYPES,
] as const;
export type DocumentType = (typeof DOCUMENT_TYPES)[number];

export const DOCUMENT_TYPE_DOMAIN: Record<DocumentType, DocumentDomain> = {
  FLHA: "VERICORE",
  JHA: "VERICORE",
  Incident: "VERICORE",
  Inspection: "VERICORE",
  SafetyPolicy: "VERICORE",
  Procedure: "VERICORE",
  TrainingRecord: "VERICORE",
  CorrectiveAction: "VERICORE",
  Audit: "VERICORE",
  WorkOrder: "VERIPM",
  PMTask: "VERIPM",
  AssetInspection: "VERIPM",
  FailureReport: "VERIPM",
  VendorServiceReport: "VERIPM",
  WarrantyDocument: "VERIPM",
};

/** Worker Documents tab group order */
export const WORKER_DOC_TYPE_ORDER: DocumentType[] = [
  "FLHA",
  "JHA",
  "Incident",
  "TrainingRecord",
  "WorkOrder",
];

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  FLHA: "FLHA",
  JHA: "JHA",
  Incident: "Incident",
  Inspection: "Inspection",
  SafetyPolicy: "Safety Policy",
  Procedure: "Procedure",
  TrainingRecord: "Training",
  CorrectiveAction: "Corrective Action",
  Audit: "Audit",
  WorkOrder: "PM Work Order",
  PMTask: "PM Task",
  AssetInspection: "Asset Inspection",
  FailureReport: "Failure Report",
  VendorServiceReport: "Vendor Service Report",
  WarrantyDocument: "Warranty Document",
};

export function isVeriCoreType(type: DocumentType): boolean {
  return DOCUMENT_TYPE_DOMAIN[type] === "VERICORE";
}

export function isVeriPmType(type: DocumentType): boolean {
  return DOCUMENT_TYPE_DOMAIN[type] === "VERIPM";
}

export function documentTypesForDomain(domain: DocumentDomain): DocumentType[] {
  return DOCUMENT_TYPES.filter((t) => DOCUMENT_TYPE_DOMAIN[t] === domain);
}

export type DocumentSummary = {
  document_id: string;
  domain: DocumentDomain;
  document_type: DocumentType;
  status: DocumentStatus;
  title?: string | null;
  version: number;
  template_id: string;
  template_version: number;
  worker_id?: string | null;
  worker_name?: string | null;
  crew_ids?: string[];
  crew_summary?: string | null;
  job_id?: string | null;
  job_name?: string | null;
  project_id?: string | null;
  project_name?: string | null;
  asset_id?: string | null;
  asset_name?: string | null;
  asset_tag?: string | null;
  location_id?: string | null;
  location_label?: string | null;
  external_reference?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
};
