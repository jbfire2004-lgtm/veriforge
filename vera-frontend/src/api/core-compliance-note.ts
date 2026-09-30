import { API_URL } from "@/lib/api";
import { fetchJson } from "@/lib/core";

export type CoreComplianceNoteCategory =
  | "REGULATORY"
  | "AUDIT"
  | "INTERNAL"
  | "CLIENT"
  | "OTHER";

export type CoreComplianceNoteStatus = "DRAFT" | "ACTIVE" | "ARCHIVED";

export type CoreComplianceNotePriority = "LOW" | "NORMAL" | "HIGH";

export type CoreComplianceNoteDto = {
  id: number;
  title: string;
  body: string | null;
  category: CoreComplianceNoteCategory;
  status: CoreComplianceNoteStatus;
  priority: CoreComplianceNotePriority;
  dueAt: string | null;
  companyId: number | null;
  siteId: number | null;
  createdByUserId: number | null;
  createdAt: string;
  updatedAt: string;
  company?: { id: number; name: string } | null;
  site?: { id: number; name: string; code: string | null } | null;
  createdBy?: { id: number; username: string } | null;
};

export type CoreComplianceNoteListResponse = {
  items: CoreComplianceNoteDto[];
  total: number;
  skip: number;
  take: number;
};

export type CreateCoreComplianceNotePayload = {
  title: string;
  body?: string;
  category?: CoreComplianceNoteCategory;
  status?: CoreComplianceNoteStatus;
  priority?: CoreComplianceNotePriority;
  dueAt?: string | null;
  companyId?: number;
  siteId?: number;
  createdByUserId?: number;
};

export type UpdateCoreComplianceNotePayload =
  Partial<CreateCoreComplianceNotePayload>;

export type ListCoreComplianceNotesParams = {
  companyId?: number;
  siteId?: number;
  status?: CoreComplianceNoteStatus;
  category?: CoreComplianceNoteCategory;
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

export async function createCoreComplianceNote(
  body: CreateCoreComplianceNotePayload
): Promise<CoreComplianceNoteDto> {
  return fetchJson<CoreComplianceNoteDto>(
    `${API_URL}/api/v1/core-compliance-notes`,
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function listCoreComplianceNotes(
  params?: ListCoreComplianceNotesParams
): Promise<CoreComplianceNoteListResponse> {
  const qs = queryString({
    companyId: params?.companyId,
    siteId: params?.siteId,
    status: params?.status,
    category: params?.category,
    skip: params?.skip,
    take: params?.take,
  });
  return fetchJson<CoreComplianceNoteListResponse>(
    `${API_URL}/api/v1/core-compliance-notes${qs}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function getCoreComplianceNote(
  id: number
): Promise<CoreComplianceNoteDto> {
  return fetchJson<CoreComplianceNoteDto>(
    `${API_URL}/api/v1/core-compliance-notes/${id}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function updateCoreComplianceNote(
  id: number,
  body: UpdateCoreComplianceNotePayload
): Promise<CoreComplianceNoteDto> {
  return fetchJson<CoreComplianceNoteDto>(
    `${API_URL}/api/v1/core-compliance-notes/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function deleteCoreComplianceNote(
  id: number
): Promise<{ id: number; deleted: true }> {
  return fetchJson<{ id: number; deleted: true }>(
    `${API_URL}/api/v1/core-compliance-notes/${id}`,
    { method: "DELETE", credentials: "include" }
  );
}
