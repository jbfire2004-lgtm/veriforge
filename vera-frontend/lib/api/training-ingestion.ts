import { apiGet } from "@/lib/api";
import { API_URL, getAccessToken, unwrapApiPayload } from "@/lib/api-fetch";
import { errorFromApiResponse } from "@/lib/core/api-error";

const BASE = "/api/v1/training-ingestion";

export type IngestionRun = {
  id: number;
  companyId: number;
  status: string;
  sourceChannel: string;
  originalFilename: string;
  createdAt: string;
  ocrConfidence?: number | null;
  createdRecords?: { id: number; workerId: number }[];
  coreFile?: { id: number; publicUrl: string | null; originalName: string } | null;
};

export async function listIngestionRuns(params: {
  companyId: number;
  status?: string;
  sourceChannel?: string;
  limit?: number;
}) {
  const q = new URLSearchParams();
  q.set("companyId", String(params.companyId));
  if (params.status) q.set("status", params.status);
  if (params.sourceChannel) q.set("sourceChannel", params.sourceChannel);
  if (params.limit) q.set("limit", String(params.limit));
  return apiGet<IngestionRun[]>(`${BASE}/runs?${q}`);
}

export async function getVerificationQueue(companyId: number, limit = 50) {
  return apiGet<unknown[]>(
    `${BASE}/verification-queue?companyId=${companyId}&limit=${limit}`,
  );
}

export async function uploadTrainingDocument(form: FormData) {
  const token = await getAccessToken();
  const res = await fetch(`${API_URL}${BASE}/upload`, {
    method: "POST",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const text = await res.text();
  if (!res.ok) {
    throw errorFromApiResponse(res.status, text);
  }
  if (!text) return undefined as IngestionRun | undefined;
  return unwrapApiPayload<IngestionRun>(JSON.parse(text));
}
