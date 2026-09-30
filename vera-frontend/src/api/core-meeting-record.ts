import { API_URL } from "@/lib/api";
import { fetchJson } from "@/lib/core";

export type CoreMeetingRecordType =
  | "TEAM_SAFETY"
  | "TOOLBOX"
  | "MANAGEMENT_REVIEW"
  | "OTHER";

export type CoreMeetingRecordLinkedActionItemDto = {
  id: string;
  title: string;
  status: string;
  priority: string;
  dueAt: string | null;
};

export type CoreMeetingRecordDto = {
  id: number;
  title: string;
  body: string | null;
  meetingType: CoreMeetingRecordType;
  heldAt: string;
  companyId: number | null;
  siteId: number | null;
  recordedByUserId: number | null;
  createdAt: string;
  updatedAt: string;
  company?: { id: number; name: string } | null;
  site?: { id: number; name: string; code: string | null } | null;
  recordedBy?: { id: number; username: string } | null;
  coreActionItems?: CoreMeetingRecordLinkedActionItemDto[];
};

export type CoreMeetingRecordListResponse = {
  items: CoreMeetingRecordDto[];
  total: number;
  skip: number;
  take: number;
};

export type CreateCoreMeetingRecordPayload = {
  title: string;
  body?: string;
  meetingType?: CoreMeetingRecordType;
  heldAt: string;
  companyId?: number;
  siteId?: number;
  recordedByUserId?: number;
};

export type UpdateCoreMeetingRecordPayload =
  Partial<CreateCoreMeetingRecordPayload>;

export type CoreMeetingRecordListSortField =
  | "id"
  | "title"
  | "heldAt"
  | "meetingType"
  | "createdAt";

export type ListCoreMeetingRecordsParams = {
  companyId?: number;
  siteId?: number;
  meetingType?: CoreMeetingRecordType;
  skip?: number;
  take?: number;
  sortBy?: CoreMeetingRecordListSortField;
  sortOrder?: "asc" | "desc";
};

/** Response from GET /core-meeting-records/summary */
export type CoreMeetingRecordSummary = {
  total: number;
  byType: Record<CoreMeetingRecordType, number>;
  filters: {
    companyId: number | null;
    siteId: number | null;
    heldFrom: string | null;
    heldTo: string | null;
  };
};

export type CoreMeetingRecordSummaryParams = {
  companyId?: number;
  siteId?: number;
  /** ISO-8601 date or datetime; inclusive lower bound on `heldAt`. */
  heldFrom?: string;
  /** ISO-8601 date or datetime; inclusive upper bound on `heldAt`. */
  heldTo?: string;
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

export async function createCoreMeetingRecord(
  body: CreateCoreMeetingRecordPayload
): Promise<CoreMeetingRecordDto> {
  return fetchJson<CoreMeetingRecordDto>(
    `${API_URL}/api/v1/core-meeting-records`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

/**
 * Aggregate counts by meeting type (dashboards / reporting).
 */
export async function getCoreMeetingRecordSummary(
  params?: CoreMeetingRecordSummaryParams
): Promise<CoreMeetingRecordSummary> {
  const qs = queryString({
    companyId: params?.companyId,
    siteId: params?.siteId,
    heldFrom: params?.heldFrom,
    heldTo: params?.heldTo,
  });
  return fetchJson<CoreMeetingRecordSummary>(
    `${API_URL}/api/v1/core-meeting-records/summary${qs}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function listCoreMeetingRecords(
  params?: ListCoreMeetingRecordsParams
): Promise<CoreMeetingRecordListResponse> {
  const qs = queryString({
    companyId: params?.companyId,
    siteId: params?.siteId,
    meetingType: params?.meetingType,
    skip: params?.skip,
    take: params?.take,
    sortBy: params?.sortBy,
    sortOrder: params?.sortOrder,
  });
  return fetchJson<CoreMeetingRecordListResponse>(
    `${API_URL}/api/v1/core-meeting-records${qs}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function getCoreMeetingRecord(
  id: number
): Promise<CoreMeetingRecordDto> {
  return fetchJson<CoreMeetingRecordDto>(
    `${API_URL}/api/v1/core-meeting-records/${id}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function updateCoreMeetingRecord(
  id: number,
  body: UpdateCoreMeetingRecordPayload
): Promise<CoreMeetingRecordDto> {
  return fetchJson<CoreMeetingRecordDto>(
    `${API_URL}/api/v1/core-meeting-records/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function deleteCoreMeetingRecord(
  id: number
): Promise<{ id: number; deleted: true }> {
  return fetchJson<{ id: number; deleted: true }>(
    `${API_URL}/api/v1/core-meeting-records/${id}`,
    { method: "DELETE", credentials: "include" }
  );
}
