import { apiGet, apiPost } from "@/lib/api";

const BASE = "/api/v1/training-standards";

export type ValidationReport = {
  outcome: string;
  score: number;
  jurisdictionCode: string;
  matchedStandardCodes: string[];
  missingStandardCodes: string[];
  issues: { code: string; message: string }[];
  validationResultId?: number;
};

export type StandardsDashboard = {
  pending: number;
  approved: number;
  rejected: number;
  needsReview: number;
  recent: unknown[];
};

export async function getTrainingStandardsDashboard() {
  return apiGet<StandardsDashboard>(`${BASE}/dashboard`);
}

export async function listTrainingStandards() {
  return apiGet<unknown[]>(`${BASE}/standards`);
}

export async function listRejectionReasons() {
  return apiGet<unknown[]>(`${BASE}/rejection-reasons`);
}

export async function validateTraining(body: {
  trainingRecordId: number;
  jurisdictionCode?: string;
}) {
  return apiPost<ValidationReport>(`${BASE}/validate/training`, body);
}

export async function validateProvider(body: {
  trainingProviderId: number;
  jurisdictionCode?: string;
}) {
  return apiPost<ValidationReport>(`${BASE}/validate/provider`, body);
}

export async function validateInstructor(body: {
  instructorId: number;
  courseCode?: string;
  jurisdictionCode?: string;
}) {
  return apiPost<ValidationReport>(`${BASE}/validate/instructor`, body);
}

export async function getValidationResults(params?: {
  trainingRecordId?: number;
  trainingProviderId?: number;
  outcome?: string;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params?.trainingRecordId) q.set("trainingRecordId", String(params.trainingRecordId));
  if (params?.trainingProviderId) q.set("trainingProviderId", String(params.trainingProviderId));
  if (params?.outcome) q.set("outcome", params.outcome);
  if (params?.limit) q.set("limit", String(params.limit));
  const qs = q.toString();
  return apiGet<unknown[]>(`${BASE}/results${qs ? `?${qs}` : ""}`);
}

export async function approveValidation(validationResultId: number, notes?: string) {
  return apiPost(`${BASE}/workflow/approve`, {
    validationResultId,
    outcome: "APPROVED",
    notes,
  });
}

export async function rejectValidation(
  validationResultId: number,
  rejectionCodes: string[],
  notes?: string
) {
  return apiPost(`${BASE}/workflow/reject`, {
    validationResultId,
    rejectionCodes,
    notes,
  });
}
