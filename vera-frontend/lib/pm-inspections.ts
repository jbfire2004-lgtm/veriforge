import type { Session } from "next-auth";
import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/inspections`;

export type PmInspectionApiContext = {
  session?: Session | null;
};

export type ShowIfCondition =
  | { itemId: string; equals: unknown }
  | { all: ShowIfCondition[] }
  | { any: ShowIfCondition[] };

export type PmInspectionScoringRules = {
  failThresholdPercent?: number;
  reviewThresholdRisk?: number;
  inspectionKind?: 'smart_site' | 'focus_audit' | 'checklist';
  industry?: string;
  industryLabel?: string;
  focusArea?: string;
  libraryGroup?: string;
  photoFirst?: boolean;
  skipChecklistScoring?: boolean;
};

export const PM_CHECKLIST_LIBRARY_GROUPS: Record<string, string> = {
  equipment: 'Equipment & vehicles',
  ppe: 'PPE',
  safety_devices: 'Safety devices',
  site: 'Site conditions',
  construction: 'Construction programs',
  environmental: 'Environmental',
  emergency: 'Emergency readiness',
  general: 'General programs',
};

export function getPmTemplateKind(
  template: Pick<PmInspectionTemplate, 'scoringRules' | 'name'>,
): string {
  if (template.scoringRules?.inspectionKind) {
    return template.scoringRules.inspectionKind;
  }
  if (template.name === 'Smart Site Inspection') return 'smart_site';
  if (template.name?.startsWith('Focus Audit —')) return 'focus_audit';
  return 'checklist';
}

export type PmInspectionTemplate = {
  id: string;
  name: string;
  category: string;
  status: string;
  version?: number;
  description?: string | null;
  scoringMode: string;
  scoringRules?: PmInspectionScoringRules;
  requiredSignatures?: Array<{ role: string; label?: string }>;
  items: Array<{
    id: string;
    label: string;
    type: string;
    required?: boolean;
    weight?: number;
    critical?: boolean;
    failValues?: unknown[];
    showIf?: ShowIfCondition;
    options?: string[];
    energyType?: string;
    controlHierarchy?: string;
  }>;
};

export type PmInspection = {
  id: string;
  companyId: number;
  projectId: number;
  clientSyncId?: string | null;
  siteId?: number | null;
  equipmentId?: number | null;
  workerId?: number | null;
  title: string | null;
  status: string;
  passed: boolean | null;
  scorePercent: number | null;
  riskScore: number | null;
  requiresSupervisorReview: boolean;
  answers: Record<string, unknown>;
  template: PmInspectionTemplate;
  deficiencies: Array<{
    id: string;
    title: string;
    severity: string;
    status: string;
  }>;
  signatures: Array<{
    id: string;
    role: string;
    signerName?: string | null;
    signedAt?: string;
    signatureData?: string | null;
    coreFileId?: number | null;
    coreFile?: { id: number; publicUrl?: string | null; mimeType?: string } | null;
  }>;
  attachments?: Array<{
    id: string;
    fileName?: string | null;
    mimeType?: string | null;
    dataUrl?: string | null;
    analysisStatus?: string | null;
    annotationJson?: Record<string, unknown> | null;
  }>;
};

export type PmInspectionPhotoFinding = {
  id: string;
  title: string;
  description?: string | null;
  severity: string;
  category: string;
  createdAt: string;
  checklistItemId?: string | null;
  confidence?: number;
  sclState?: string | null;
  hecaInvolved?: boolean;
  hecaType?: string | null;
  hecaCategoryCode?: string | null;
  highEnergyFlag?: boolean;
  energyTypes?: string[];
  analysisJson?: { llm?: string; source?: string } | null;
  attachment?: {
    id: string;
    fileName?: string | null;
    analysisStatus?: string | null;
    dataUrl?: string | null;
    mimeType?: string | null;
    analysisJson?: Record<string, unknown> | null;
    annotationJson?: { checklistItemId?: string } | null;
  };
  correctiveAction?: {
    id: string;
    title: string;
    status: string;
    dueAt?: string | null;
  } | null;
};

export async function listPmInspectionTemplates(
  companyId: number,
  projectId?: number,
  ctx?: PmInspectionApiContext,
) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  q.set("status", "published");
  return apiFetchJson<PmInspectionTemplate[]>(`${BASE}/templates?${q}`, {
    session: ctx?.session,
  });
}

export async function listPmInspectionTemplatesForBuilder(
  companyId: number,
  projectId?: number,
  ctx?: PmInspectionApiContext,
) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<PmInspectionTemplate[]>(`${BASE}/templates?${q}`, {
    session: ctx?.session,
  });
}

export async function getPmInspectionTemplate(
  id: string,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspectionTemplate>(`${BASE}/templates/${id}`, {
    session: ctx?.session,
  });
}

export type PmInspectionTemplateSeedResult = {
  created: number;
  updated: number;
  total: number;
  checklistCount: number;
  focusAuditCount: number;
};

export async function seedPmInspectionTemplates(
  companyId: number,
  projectId?: number,
  ctx?: PmInspectionApiContext,
) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson<PmInspectionTemplateSeedResult>(`${BASE}/templates/seed?${q}`, {
    method: "POST",
    session: ctx?.session,
    timeoutMs: 120_000,
  });
}

export async function listPmInspections(
  projectId: number,
  companyId?: number,
  ctx?: PmInspectionApiContext,
) {
  const q = new URLSearchParams({ projectId: String(projectId) });
  if (companyId != null) q.set("companyId", String(companyId));
  return apiFetchJson<PmInspection[]>(`${BASE}?${q}`, { session: ctx?.session });
}

export async function getPmInspection(id: string, ctx?: PmInspectionApiContext) {
  return apiFetchJson<PmInspection>(`${BASE}/${id}`, { session: ctx?.session });
}

export async function createPmInspection(
  body: {
    templateId: string;
    companyId: number;
    projectId: number;
    siteId?: number;
    equipmentId?: number;
    workerId?: number;
    title?: string;
    locationNote?: string;
    clientSyncId?: string;
  },
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspection>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function savePmInspectionAnswers(
  id: string,
  answers: Record<string, unknown>,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspection>(`${BASE}/${id}/answers`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ answers }),
    session: ctx?.session,
  });
}

export async function submitPmInspection(id: string, ctx?: PmInspectionApiContext) {
  return apiFetchJson<PmInspection>(`${BASE}/${id}/submit`, {
    method: "POST",
    session: ctx?.session,
  });
}

export async function reviewPmInspection(
  id: string,
  action: "approve" | "reject" | "request_changes",
  notes?: string,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspection>(`${BASE}/${id}/review`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, notes }),
    session: ctx?.session,
  });
}

export async function fetchPmInspectionAnalytics(
  projectId: number,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/analytics/project/${projectId}`,
    { session: ctx?.session },
  );
}

export async function predictPmInspectionDeficiencies(
  templateId: string,
  answers: Record<string, unknown>,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<Record<string, unknown>>(`${BASE}/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ templateId, answers }),
    session: ctx?.session,
  });
}

export async function fetchPmInspectionIntelligence(
  projectId: number,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<Record<string, unknown>>(
    `${BASE}/intelligence/project/${projectId}`,
    { session: ctx?.session },
  );
}

export type PmInspectionPhotoCaptureSync = {
  dataUrl?: string;
  caption?: string;
  clientSyncId?: string;
  mimeType?: string;
  fileName?: string;
  defaultSubcontractorCompanyId?: number;
};

export async function escalatePmInspectionToIncident(
  id: string,
  body?: { title?: string; description?: string },
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<{
    inspectionId: string;
    eventId: string;
    existing: boolean;
    event: unknown;
  }>(`${BASE}/${id}/escalate-to-incident`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body ?? {}),
    session: ctx?.session,
  });
}

export async function createPmInspectionTemplate(
  body: {
  companyId: number;
  projectId?: number;
  name: string;
  category: string;
  description?: string;
  scoringMode?: string;
  scoringRules?: PmInspectionScoringRules;
  items: PmInspectionTemplate["items"];
  requiredSignatures?: Array<{ role: string; label?: string }>;
},
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspectionTemplate>(`${BASE}/templates`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function updatePmInspectionTemplate(
  id: string,
  body: Partial<{
    name: string;
    description: string;
    scoringMode: string;
    scoringRules: PmInspectionScoringRules;
    items: PmInspectionTemplate["items"];
    requiredSignatures: Array<{ role: string; label?: string }>;
  }>,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspectionTemplate>(`${BASE}/templates/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function publishPmInspectionTemplate(
  id: string,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspectionTemplate>(`${BASE}/templates/${id}/publish`, {
    method: "POST",
    session: ctx?.session,
  });
}

export async function newPmInspectionTemplateVersion(
  id: string,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspectionTemplate>(`${BASE}/templates/${id}/version`, {
    method: "POST",
    session: ctx?.session,
  });
}

export async function archivePmInspectionTemplate(
  id: string,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspectionTemplate>(`${BASE}/templates/${id}/archive`, {
    method: "POST",
    session: ctx?.session,
  });
}

export async function addPmInspectionSignature(
  id: string,
  body: {
    role: string;
    signatureData?: string;
    coreFileId?: number;
    signerName?: string;
  },
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<unknown>(`${BASE}/${id}/signatures`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function fetchPmInspectionReport(
  id: string,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspectionReport>(`${BASE}/${id}/report`, {
    session: ctx?.session,
  });
}

export type PmInspectionReport = {
  inspectionId: string;
  title: string;
  status: string;
  submittedAt: string | null;
  project: { id: number; name: string };
  inspector: { id: number; username: string; email: string } | null;
  template: {
    name: string;
    category: string;
    inspectionKind: string;
    industry: string | null;
    focusArea: string | null;
  };
  siteAnswers: Record<string, unknown>;
  locationNote: string | null;
  totals: { photoCount: number; safeCount: number; atRiskCount: number };
  photos: Array<{
    photoNumber: number;
    attachmentId: string;
    fileName: string | null;
    dataUrl: string | null;
    locationDescription: string;
    pictureDescription: string;
    safetyStatus: 'safe' | 'at_risk';
    responsibleCompanyName: string | null;
  correctionPhotoDataUrl?: string | null;
    findings: Array<{ title: string; severity: string }>;
  }>;
  summarySheet: Array<{
    photoNumber: number;
    locationDescription: string;
    pictureDescription: string;
    safetyStatus: 'safe' | 'at_risk';
    responsibleCompanyName: string | null;
    findingTitle: string | null;
    severity: string | null;
  }>;
  sharing?: {
    shareReportWithContractors: boolean;
    shareReportWithWorkers: boolean;
  };
  generatedAt: string;
};

export type PmInspectionSharedReportItem = {
  id: string;
  title: string;
  status: string;
  submittedAt: string | null;
  project: { id: number; name: string } | null;
  inspector: { id: number; username: string } | null;
  templateName: string;
  inspectionKind: string;
  sharing: {
    shareReportWithContractors: boolean;
    shareReportWithWorkers: boolean;
  };
  accessReason: string;
};

export async function fetchPmInspectionSharedReports(
  projectId?: number,
  ctx?: PmInspectionApiContext,
) {
  const q = new URLSearchParams();
  if (projectId) q.set('projectId', String(projectId));
  const suffix = q.toString() ? `?${q}` : '';
  return apiFetchJson<{ total: number; items: PmInspectionSharedReportItem[] }>(
    `${BASE}/shared${suffix}`,
    { session: ctx?.session },
  );
}

export async function fetchPmInspectionFindingsLog(
  projectId: number,
  companyId?: number,
  ctx?: PmInspectionApiContext,
) {
  const q = new URLSearchParams();
  if (companyId) q.set('companyId', String(companyId));
  const suffix = q.toString() ? `?${q}` : '';
  return apiFetchJson<{
    projectId: number;
    total: number;
    entries: Array<{
      id: string;
      inspectionId: string;
      inspectionTitle: string | null;
      photoNumber: number | null;
      locationDescription: string;
      pictureDescription: string;
      safetyStatus: 'safe' | 'at_risk' | 'unknown';
      responsibleCompanyName: string | null;
      correctionPhotoDataUrl: string | null;
      correctiveActionStatus: string | null;
      dispatchStatus: string | null;
      loggedAt: string;
    }>;
  }>(`${BASE}/projects/${projectId}/findings-log${suffix}`, { session: ctx?.session });
}

export async function updatePmInspectionSharing(
  inspectionId: string,
  body: {
    shareReportWithContractors?: boolean;
    shareReportWithWorkers?: boolean;
  },
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<unknown>(`${BASE}/${inspectionId}/sharing`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function savePmInspectionPhotoMetadata(
  inspectionId: string,
  attachmentId: string,
  body: {
    locationDescription: string;
    pictureDescription: string;
    safetyStatus: 'safe' | 'at_risk';
    responsibleCompanyId?: number;
  },
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<{ attachmentId: string; photoNumber: number }>(
    `${BASE}/${inspectionId}/photos/${attachmentId}/metadata`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      session: ctx?.session,
    },
  );
}

export async function findPmInspectionTemplateByKind(
  companyId: number,
  kind: 'smart_site' | 'focus_audit',
  projectId?: number,
  focusArea?: string,
  ctx?: PmInspectionApiContext,
) {
  const templates = await listPmInspectionTemplates(companyId, projectId, ctx);
  const byKind = templates.find((t) => {
    if (getPmTemplateKind(t) !== kind) return false;
    if (focusArea && t.scoringRules?.focusArea !== focusArea) return false;
    return true;
  });
  if (byKind) return byKind;

  if (kind === 'smart_site') {
    return templates.find((t) => t.name === 'Smart Site Inspection');
  }
  return undefined;
}

export async function fetchPmInspectionPhotoFindings(
  id: string,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspectionPhotoFinding[]>(`${BASE}/${id}/photo-findings`, {
    session: ctx?.session,
  });
}

export async function draftPmInspectionSafetyMeeting(
  id: string,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<unknown>(`${BASE}/${id}/draft-safety-meeting`, {
    method: "POST",
    session: ctx?.session,
  });
}

export type AuditInspectionCapaEngineInput = {
  checklist_template: {
    items?: Array<{
      id: string;
      label: string;
      category?: string;
      type?: string;
      required?: boolean;
      weight?: number;
      critical?: boolean;
      energyType?: string;
    }>;
    categories?: string[];
    scoring_rules?: Record<string, unknown>;
  };
  responses: Array<{
    item_id: string;
    status: string;
    comments?: string;
    photos_summaries?: string[];
  }>;
  site_risk_profile?: string;
  previous_audits?: Array<{ date?: string; failed_items?: string[]; summary?: string }>;
  org_standards?: string[];
};

export type AuditInspectionCapaEngineOutput = {
  findings: Array<{
    item_id: string;
    description: string;
    related_standard: string;
    risk_rating: {
      likelihood: number;
      consequence: number;
      score: number;
      level: string;
    };
    sif_relevance: "yes" | "no";
    category?: string;
  }>;
  capa_list: Array<{
    finding_ref: string;
    corrective_action: string;
    preventive_action?: string;
    responsible_role: string;
    due_date_priority: string;
  }>;
  executive_summary: string[];
  field_brief: string[];
  trends: Array<{ issue: string; recurrence_count: number; note: string }>;
};

export async function generateAuditInspectionCapaEngine(
  body: AuditInspectionCapaEngineInput,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<AuditInspectionCapaEngineOutput>(`${BASE}/engine/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function generateAuditInspectionCapaForInspection(
  id: string,
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<AuditInspectionCapaEngineOutput>(`${BASE}/${id}/engine/generate`, {
    method: "POST",
    session: ctx?.session,
  });
}

export async function syncPmInspectionsOffline(
  payload: {
  clientSyncId: string;
  templateId: string;
  companyId: number;
  projectId: number;
  answers: Record<string, unknown>;
  siteId?: number;
  equipmentId?: number;
  workerId?: number;
  submitted?: boolean;
  signatures?: Array<{ role: string; signatureData?: string; clientSyncId?: string }>;
  photoCaptures?: PmInspectionPhotoCaptureSync[];
},
  ctx?: PmInspectionApiContext,
) {
  return apiFetchJson<PmInspection>(`${BASE}/sync`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    session: ctx?.session,
  });
}
