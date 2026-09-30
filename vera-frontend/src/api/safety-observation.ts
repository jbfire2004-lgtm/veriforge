import { API_URL } from "@/lib/api";
import { fetchJson } from "@/lib/core";

export type SafetyObservationSeverity =
  | "LOW"
  | "MEDIUM"
  | "HIGH"
  | "CRITICAL";

export type SafetyObservationStatus = "OPEN" | "REVIEWED" | "CLOSED";

export type SafetyObservationDto = {
  id: number;
  title: string;
  description: string | null;
  severity: SafetyObservationSeverity;
  status: SafetyObservationStatus;
  observedAt: string;
  locationNote: string | null;
  companyId: number | null;
  siteId: number | null;
  reportedByUserId: number | null;
  createdAt: string;
  updatedAt: string;
  company?: { id: number; name: string } | null;
  site?: { id: number; name: string; code: string | null } | null;
  reportedBy?: { id: number; username: string } | null;
};

export type SafetyObservationListResponse = {
  items: SafetyObservationDto[];
  total: number;
  skip: number;
  take: number;
};

export type CreateSafetyObservationPayload = {
  title: string;
  description?: string;
  severity?: SafetyObservationSeverity;
  status?: SafetyObservationStatus;
  observedAt: string;
  locationNote?: string;
  companyId?: number;
  siteId?: number;
  reportedByUserId?: number;
};

export type UpdateSafetyObservationPayload =
  Partial<CreateSafetyObservationPayload>;

export type ListSafetyObservationsParams = {
  companyId?: number;
  siteId?: number;
  status?: SafetyObservationStatus;
  severity?: SafetyObservationSeverity;
  skip?: number;
  take?: number;
};

function queryString(
  params: Record<string, string | number | undefined>
): string {
  const q = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== "") q.set(k, String(v));
  }
  const s = q.toString();
  return s ? `?${s}` : "";
}

export async function createSafetyObservation(
  body: CreateSafetyObservationPayload
): Promise<SafetyObservationDto> {
  return fetchJson<SafetyObservationDto>(
    `${API_URL}/api/v1/safety-observations`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function listSafetyObservations(
  params?: ListSafetyObservationsParams
): Promise<SafetyObservationListResponse> {
  const qs = queryString({
    companyId: params?.companyId,
    siteId: params?.siteId,
    status: params?.status,
    severity: params?.severity,
    skip: params?.skip,
    take: params?.take,
  });
  return fetchJson<SafetyObservationListResponse>(
    `${API_URL}/api/v1/safety-observations${qs}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function getSafetyObservation(
  id: number
): Promise<SafetyObservationDto> {
  return fetchJson<SafetyObservationDto>(
    `${API_URL}/api/v1/safety-observations/${id}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function updateSafetyObservation(
  id: number,
  body: UpdateSafetyObservationPayload
): Promise<SafetyObservationDto> {
  return fetchJson<SafetyObservationDto>(
    `${API_URL}/api/v1/safety-observations/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function deleteSafetyObservation(
  id: number
): Promise<{ id: number; deleted: true }> {
  return fetchJson<{ id: number; deleted: true }>(
    `${API_URL}/api/v1/safety-observations/${id}`,
    { method: "DELETE", credentials: "include" }
  );
}
