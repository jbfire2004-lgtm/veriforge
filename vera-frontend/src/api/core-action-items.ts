import { API_URL } from "@/lib/api";
import { fetchJson } from "@/lib/core";

export type CoreMeetingRecordLinkDto = {
  id: number;
  title: string;
  heldAt: string;
  meetingType: string;
};

export type CoreDailyLogLinkDto = {
  id: number;
  title: string;
  logDate: string;
  shift: string;
};

export type CoreActionItemDto = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  dueAt: string | null;
  priority: string;
  companyId: number | null;
  createdById: number | null;
  coreMeetingRecordId: number | null;
  coreDailyLogId: number | null;
  createdAt: string;
  updatedAt: string;
  company?: { id: number; name: string } | null;
  createdBy?: { id: number; username: string } | null;
  coreMeetingRecord?: CoreMeetingRecordLinkDto | null;
  coreDailyLog?: CoreDailyLogLinkDto | null;
  verification?: { overdueWarning: true };
};

export type CoreActionItemListResponse = {
  items: CoreActionItemDto[];
  total: number;
  skip: number;
  take: number;
};

export type CreateCoreActionItemPayload = {
  title: string;
  description?: string;
  status?: string;
  dueAt?: string | null;
  priority?: string;
  companyId?: number;
  createdById?: number;
  coreMeetingRecordId?: number;
  coreDailyLogId?: number;
};

export type UpdateCoreActionItemPayload = Partial<CreateCoreActionItemPayload>;

export type ListCoreActionItemsParams = {
  companyId?: number;
  coreMeetingRecordId?: number;
  coreDailyLogId?: number;
  status?: string;
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

export async function createCoreActionItem(
  body: CreateCoreActionItemPayload
): Promise<CoreActionItemDto> {
  return fetchJson<CoreActionItemDto>(
    `${API_URL}/api/v1/core-action-items`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function listCoreActionItems(
  params?: ListCoreActionItemsParams
): Promise<CoreActionItemListResponse> {
  const qs = queryString({
    companyId: params?.companyId,
    coreMeetingRecordId: params?.coreMeetingRecordId,
    coreDailyLogId: params?.coreDailyLogId,
    status: params?.status,
    skip: params?.skip,
    take: params?.take,
  });
  return fetchJson<CoreActionItemListResponse>(
    `${API_URL}/api/v1/core-action-items${qs}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function getCoreActionItem(
  id: string
): Promise<CoreActionItemDto> {
  return fetchJson<CoreActionItemDto>(
    `${API_URL}/api/v1/core-action-items/${encodeURIComponent(id)}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function updateCoreActionItem(
  id: string,
  body: UpdateCoreActionItemPayload
): Promise<CoreActionItemDto> {
  return fetchJson<CoreActionItemDto>(
    `${API_URL}/api/v1/core-action-items/${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function deleteCoreActionItem(
  id: string
): Promise<{ id: string; deleted: true }> {
  return fetchJson<{ id: string; deleted: true }>(
    `${API_URL}/api/v1/core-action-items/${encodeURIComponent(id)}`,
    { method: "DELETE", credentials: "include" }
  );
}
