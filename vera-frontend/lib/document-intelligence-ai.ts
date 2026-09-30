import { apiFetchJson } from "./api-client";

export type DocumentIntelligenceType =
  | "training_certificate"
  | "training_proof"
  | "permit"
  | "inspection"
  | "insurance"
  | "wcb_clearance"
  | "sds"
  | "policy"
  | "safety_program"
  | "jha_flha"
  | "sif_heca"
  | "incident_report"
  | "equipment_manual"
  | "other";

export type DocumentIntelligenceMetadata = {
  worker_name?: string;
  company?: string;
  training_type?: string;
  certification_code?: string;
  issue_date?: string;
  expiry_date?: string;
  provider?: string;
  certificate_number?: string;
  product_name?: string;
  policy_type?: string;
  permit_type?: string;
  file_name?: string;
  mime_type?: string;
};

export type DocumentAutoLink = {
  entity_type: string;
  entity_id: string | number;
  label: string;
  confidence: number;
  method: string;
};

export type DocumentRecommendedAction = {
  action: string;
  priority: "high" | "medium" | "low";
  reason: string;
};

export type DocumentIntelligenceAiInput = {
  documentId?: number;
  ocrText?: string;
  fileName?: string;
  mimeType?: string;
  companyId?: number;
  projectId?: number;
  workerId?: number;
  hints?: Partial<DocumentIntelligenceMetadata>;
};

export type DocumentIntelligenceAiJson = {
  document_type: DocumentIntelligenceType;
  metadata: DocumentIntelligenceMetadata;
  authenticity_score: number;
  auto_links: DocumentAutoLink[];
  recommended_actions: DocumentRecommendedAction[];
};

export type DocumentIntelligenceAiResult = DocumentIntelligenceAiJson & {
  intelligence_id: string;
  confidence_score: number;
  authenticity_indicators: Array<{
    signal: string;
    impact: "positive" | "negative" | "neutral";
    weight: number;
  }>;
  field_summary: string;
  source: "rule_engine";
  model: null;
  document_id?: number;
};

export async function analyzeDocumentIntelligence(
  input: DocumentIntelligenceAiInput,
): Promise<DocumentIntelligenceAiResult> {
  return apiFetchJson<DocumentIntelligenceAiResult>("/api/ai/document/intelligence", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
}

export async function analyzeDocumentIntelligenceById(
  documentId: number,
): Promise<DocumentIntelligenceAiResult> {
  return apiFetchJson<DocumentIntelligenceAiResult>(
    `/api/ai/document/intelligence/document/${documentId}`,
    { method: "POST" },
  );
}

export async function analyzeDocumentIntelligenceUpload(
  file: File,
  context?: { companyId?: number; projectId?: number; workerId?: number },
): Promise<DocumentIntelligenceAiResult> {
  const form = new FormData();
  form.append("file", file);
  if (context?.companyId != null) form.append("companyId", String(context.companyId));
  if (context?.projectId != null) form.append("projectId", String(context.projectId));
  if (context?.workerId != null) form.append("workerId", String(context.workerId));

  return apiFetchJson<DocumentIntelligenceAiResult>("/api/ai/document/intelligence/upload", {
    method: "POST",
    body: form,
  });
}
