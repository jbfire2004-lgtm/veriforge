import { API_URL } from "@/lib/api";
import { fetchJson } from "@/lib/core";
import { getAccessToken } from "@/lib/api-fetch";
import {
  isMissingAuthTokenError,
  missingAuthTokenMessage,
} from "@/lib/core/auth-token-errors";

export type CoreDailyLogShift = "DAY" | "NIGHT" | "OTHER";

export type CoreDailyLogDto = {
  id: number;
  title: string;
  body: string | null;
  activities?: string | null;
  safetyNotes?: string | null;
  logDate: string;
  shift: CoreDailyLogShift;
  companyId: number | null;
  siteId: number | null;
  createdByUserId: number | null;
  supervisorUserId?: number | null;
  createdAt: string;
  updatedAt: string;
  company?: { id: number; name: string } | null;
  site?: { id: number; name: string; code: string | null } | null;
  createdBy?: { id: number; username: string; email?: string | null } | null;
  supervisor?: {
    id: number;
    username?: string | null;
    email?: string | null;
  } | null;
  attachments?: Array<{
    coreFile?: {
      id: number;
      originalName: string;
      mimeType: string;
      publicUrl: string | null;
      purpose: string | null;
    };
  }>;
  // Canonical schema aliases
  log_id?: number;
  site_id?: number | null;
  company_id?: number | null;
  date?: string;
  safety_notes?: string | null;
  attachments_schema?: Array<{
    file_id: number;
    file_name: string;
    file_type: string;
    public_url: string | null;
    purpose: string | null;
  }>;
};

export type CoreDailyLogListResponse = {
  items: CoreDailyLogDto[];
  total: number;
  skip: number;
  take: number;
};

export type CreateCoreDailyLogPayload = {
  title?: string;
  body?: string;
  activities?: string;
  safetyNotes?: string;
  safety_notes?: string;
  logDate?: string;
  date?: string;
  shift?: CoreDailyLogShift;
  companyId?: number;
  company_id?: number;
  siteId?: number;
  site_id?: number;
  createdByUserId?: number;
  supervisorUserId?: number;
  supervisor?: number;
  attachmentFileIds?: number[];
  attachments?: number[];
};

export type UpdateCoreDailyLogPayload = Partial<CreateCoreDailyLogPayload>;

export type CoreDailyLogListSortField =
  | "id"
  | "title"
  | "logDate"
  | "shift"
  | "createdAt"
  | "updatedAt";

export type ListCoreDailyLogsParams = {
  companyId?: number;
  siteId?: number;
  shift?: CoreDailyLogShift;
  skip?: number;
  take?: number;
  sortBy?: CoreDailyLogListSortField;
  sortOrder?: "asc" | "desc";
};

/** Response from GET /core-daily-logs/summary */
export type CoreDailyLogSummary = {
  total: number;
  byShift: Record<CoreDailyLogShift, number>;
  filters: {
    companyId: number | null;
    siteId: number | null;
    logDateFrom: string | null;
    logDateTo: string | null;
  };
};

export type CoreDailyLogSummaryParams = {
  companyId?: number;
  siteId?: number;
  /** ISO-8601; inclusive lower bound on `logDate`. */
  logDateFrom?: string;
  /** ISO-8601; inclusive upper bound on `logDate`. */
  logDateTo?: string;
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

/** Ensure Bearer token is available before calling protected daily-log APIs. */
async function withAuthHeaders(
  extra?: Record<string, string>,
): Promise<Record<string, string>> {
  try {
    const token = await getAccessToken();
    return {
      ...(extra ?? {}),
      Authorization: `Bearer ${token}`,
    };
  } catch (e) {
    if (isMissingAuthTokenError(e)) {
      throw new Error(missingAuthTokenMessage("daily logs"));
    }
    throw e;
  }
}

export async function createCoreDailyLog(
  body: CreateCoreDailyLogPayload
): Promise<CoreDailyLogDto> {
  const headers = await withAuthHeaders({ "Content-Type": "application/json" });
  return fetchJson<CoreDailyLogDto>(`${API_URL}/api/v1/core-daily-logs`, {
    method: "POST",
    credentials: "include",
    headers,
    body: JSON.stringify(body),
  });
}

/**
 * Aggregate counts by shift (dashboards / reporting).
 */
export async function getCoreDailyLogSummary(
  params?: CoreDailyLogSummaryParams
): Promise<CoreDailyLogSummary> {
  const qs = queryString({
    companyId: params?.companyId,
    siteId: params?.siteId,
    logDateFrom: params?.logDateFrom,
    logDateTo: params?.logDateTo,
  });
  const headers = await withAuthHeaders();
  return fetchJson<CoreDailyLogSummary>(
    `${API_URL}/api/v1/core-daily-logs/summary${qs}`,
    { cache: "no-store", credentials: "include", headers }
  );
}

export async function listCoreDailyLogs(
  params?: ListCoreDailyLogsParams
): Promise<CoreDailyLogListResponse> {
  const qs = queryString({
    companyId: params?.companyId,
    siteId: params?.siteId,
    shift: params?.shift,
    skip: params?.skip,
    take: params?.take,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  });
  const headers = await withAuthHeaders();
  return fetchJson<CoreDailyLogListResponse>(
    `${API_URL}/api/v1/core-daily-logs${qs}`,
    { cache: "no-store", credentials: "include", headers }
  );
}

export async function getCoreDailyLog(id: number): Promise<CoreDailyLogDto> {
  const headers = await withAuthHeaders();
  return fetchJson<CoreDailyLogDto>(
    `${API_URL}/api/v1/core-daily-logs/${id}`,
    { cache: "no-store", credentials: "include", headers }
  );
}

export async function updateCoreDailyLog(
  id: number,
  body: UpdateCoreDailyLogPayload
): Promise<CoreDailyLogDto> {
  const headers = await withAuthHeaders({ "Content-Type": "application/json" });
  return fetchJson<CoreDailyLogDto>(
    `${API_URL}/api/v1/core-daily-logs/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers,
      body: JSON.stringify(body),
    }
  );
}

export async function deleteCoreDailyLog(
  id: number
): Promise<{ id: number; deleted: true }> {
  const headers = await withAuthHeaders();
  return fetchJson<{ id: number; deleted: true }>(
    `${API_URL}/api/v1/core-daily-logs/${id}`,
    { method: "DELETE", credentials: "include", headers }
  );
}
