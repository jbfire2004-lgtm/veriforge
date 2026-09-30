import { apiGet, apiPost, apiPatch } from "@/lib/api";

const BASE = "/api/v1/training-providers";
export type ProviderDashboard = {
  provider: { id: number; name: string; approvalStatus: string };
  stats: {
    activeCourses: number;
    activeInstructors: number;
    trainingRecordsIssued: number;
  };
  compliance: { status: string; score?: number } | null;
  recentRecords: unknown[];
};

export async function getProviderDashboard(providerId?: number) {
  const qs = providerId ? `?providerId=${providerId}` : "";
  return apiGet<ProviderDashboard>(`${BASE}/dashboard${qs}`);
}

export async function listTrainingProviders() {
  return apiGet<unknown[]>(`${BASE}/providers`);
}

export async function getTrainingProvider(id: number) {
  return apiGet<unknown>(`${BASE}/providers/${id}`);
}

export async function listProviderCourses(providerId: number) {
  return apiGet<unknown[]>(`${BASE}/providers/${providerId}/courses`);
}

export async function addProviderCourse(
  providerId: number,
  body: Record<string, unknown>
) {
  return apiPost(`${BASE}/providers/${providerId}/courses`, body);
}

export async function listProviderInstructors(providerId: number) {
  return apiGet<unknown[]>(`${BASE}/providers/${providerId}/instructors`);
}

export async function addProviderInstructor(
  providerId: number,
  body: Record<string, unknown>
) {
  return apiPost(`${BASE}/providers/${providerId}/instructors`, body);
}

export async function uploadProviderTraining(
  providerId: number,
  body: Record<string, unknown>
) {
  return apiPost(`${BASE}/providers/${providerId}/training/upload`, body);
}

export async function issueProviderCertificate(
  providerId: number,
  body: { trainingRecordId: number; certificateUrl?: string }
) {
  return apiPost(`${BASE}/providers/${providerId}/certificates/issue`, body);
}

export async function getProviderCompliance(providerId: number) {
  return apiGet<unknown[]>(`${BASE}/providers/${providerId}/compliance`);
}

export async function assessProviderCompliance(providerId: number, notes?: string) {
  return apiPost(`${BASE}/providers/${providerId}/compliance/assess`, { notes });
}

export async function approveTrainingProvider(
  providerId: number,
  body: { status: string; notes?: string }
) {
  return apiPost(`${BASE}/providers/${providerId}/approve`, body);
}

export async function getProviderTrainingHistory(providerId: number, limit = 50) {
  return apiGet<unknown[]>(
    `${BASE}/providers/${providerId}/history?limit=${limit}`
  );
}

export async function updateProviderProfile(
  providerId: number,
  body: Record<string, unknown>
) {
  return apiPatch(`${BASE}/providers/${providerId}/profile`, body);
}

export async function validateCertificateToken(token: string) {
  return apiGet<unknown>(`${BASE}/certificates/validate/${token}`);
}

export async function getPortalMe() {
  return apiGet<{
    user: { role: string; trainingProviderId: number | null; instructorId: number | null };
    permissions: string[];
    dashboardPath: string;
  }>(`${BASE}/portal/me`);
}

export async function getApprovalStatus(providerId: number) {
  return apiGet<unknown>(`${BASE}/providers/${providerId}/approval-status`);
}

export async function requestProviderApproval(providerId: number, notes?: string) {
  return apiPost(`${BASE}/providers/${providerId}/request-approval`, { notes });
}

export async function uploadClassList(providerId: number, body: Record<string, unknown>) {
  return apiPost(`${BASE}/providers/${providerId}/class-lists/upload`, body);
}

export async function signCertificate(recordId: number, signatureName: string) {
  return apiPost(`${BASE}/records/${recordId}/sign`, { signatureName });
}

export async function getInstructorProfile() {
  return apiGet<unknown>(`${BASE}/instructor/me`);
}
