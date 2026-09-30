import { apiFetchJson } from "@/lib/api-client";

const BASE = "/api/v1/pm/inspections";

export type PhotoCaptureResult = {
  attachment: { id: string; analysisStatus?: string };
  findings: Array<{
    id: string;
    category: string;
    title: string;
    severity: string;
    responsibleParty: string;
  }>;
  correctiveActions: Array<{ id: string; title: string; status: string; dueAt?: string }>;
  dispatches: Array<{ dispatch: { id: string; status: string } }>;
  visionSummary?: { bullets?: string[] };
  llmSummary?: string;
  analysisEngine?: string;
};

export type CorrectiveBoard = {
  totals: { open: number; inProgress: number; verification: number; overdue: number };
  columns: Record<string, unknown[]>;
};

export function captureInspectionPhoto(
  inspectionId: string,
  body: {
    dataUrl?: string;
    fileName?: string;
    mimeType?: string;
    caption?: string;
    clientSyncId?: string;
    offline?: boolean;
    defaultSubcontractorCompanyId?: number;
    checklistItemId?: string;
  },
) {
  return apiFetchJson<PhotoCaptureResult>(`${BASE}/${inspectionId}/photos/capture`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getInspectionPhotoFindings(inspectionId: string) {
  return apiFetchJson<unknown[]>(`${BASE}/${inspectionId}/photo-findings`);
}

export function getCorrectiveActionBoard(projectId: number) {
  return apiFetchJson<CorrectiveBoard>(`${BASE}/dashboard/project/${projectId}/corrective-board`);
}

export function getInspectionOverdueAlerts(projectId: number) {
  return apiFetchJson<{ alertCount: number; correctiveActions: unknown[] }>(
    `${BASE}/dashboard/project/${projectId}/overdue-alerts`,
  );
}

export function getContractorPerformance(projectId: number) {
  return apiFetchJson<{ contractors: Array<{ name: string; score: number; completionRate: number }> }>(
    `${BASE}/dashboard/project/${projectId}/contractor-performance`,
  );
}

export function acknowledgeContractorDispatch(dispatchId: string) {
  return apiFetchJson(`${BASE}/contractor-dispatch/${dispatchId}/acknowledge`, { method: "POST" });
}

export function listProjectInspectionSubcontractors(projectId: number) {
  return apiFetchJson<Array<{ id: number; name: string }>>(
    `${BASE}/projects/${projectId}/subcontractors`,
  );
}

export function completeContractorDispatch(
  dispatchId: string,
  body?: {
    storageKey?: string;
    dataUrl?: string;
    fileName?: string;
    mimeType?: string;
    notes?: string;
  },
) {
  return apiFetchJson(`${BASE}/contractor-dispatch/${dispatchId}/complete`, {
    method: "POST",
    body: JSON.stringify(body ?? {}),
  });
}

export function listContractorInspectionDispatches(projectId: number, companyId: number) {
  return apiFetchJson<Array<{
    id: string;
    status: string;
    correctiveAction: {
      id: string;
      title: string;
      description: string | null;
      status: string;
      dueAt: string | null;
      sourceId: string;
    };
  }>>(`${BASE}/projects/${projectId}/contractor-dispatches?companyId=${companyId}`);
}
