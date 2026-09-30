import type {
  AdoptionMapCompany,
  FeedbackRequest,
  GrowthStatsResponse,
  ModuleUsageResponse,
} from "@vera/api-contract";
import { apiFetchJson } from "@/lib/api-fetch";

const ADMIN = "/api/v1/admin";

export function fetchAdoptionMap() {
  return apiFetchJson<AdoptionMapCompany[]>(`${ADMIN}/adoption-map`);
}

export function fetchGrowthStats() {
  return apiFetchJson<GrowthStatsResponse>(`${ADMIN}/growth-stats`);
}

export function fetchModuleUsage() {
  return apiFetchJson<ModuleUsageResponse>(`${ADMIN}/module-usage`);
}

export function fetchAdminFeedback() {
  return apiFetchJson<FeedbackRequest[]>(`${ADMIN}/feedback`);
}

export async function submitFeedback(body: {
  title: string;
  description: string;
  category?: string;
  companyId?: number;
}) {
  return apiFetchJson<FeedbackRequest>("/api/v1/feedback", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function listFeedback(params?: {
  category?: string;
  status?: string;
  sort?: "upvotes" | "newest";
}) {
  const q = new URLSearchParams();
  if (params?.category) q.set("category", params.category);
  if (params?.status) q.set("status", params.status);
  if (params?.sort) q.set("sort", params.sort);
  const qs = q.toString();
  return apiFetchJson<FeedbackRequest[]>(
    `/api/v1/feedback${qs ? `?${qs}` : ""}`,
  );
}

export async function voteFeedback(id: number) {
  return apiFetchJson<FeedbackRequest>(`/api/v1/feedback/${id}/vote`, {
    method: "POST",
  });
}

export async function updateFeedbackStatus(
  id: number,
  body: { status: string; internalNotes?: string },
) {
  return apiFetchJson<FeedbackRequest>(`/api/v1/admin/feedback/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}
