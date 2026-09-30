import { API_URL } from "@/lib/api";
import { fetchJson } from "@/lib/core";

export type CoreSiteRiskCategory =
  | "STRUCTURAL"
  | "ELECTRICAL"
  | "ERGONOMIC"
  | "ENVIRONMENTAL"
  | "OTHER";

export type CoreSiteRiskSeverity = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export type CoreSiteRiskStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "MITIGATED"
  | "CLOSED";

export type CoreSiteRiskDto = {
  id: number;
  title: string;
  description: string | null;
  category: CoreSiteRiskCategory;
  severity: CoreSiteRiskSeverity;
  status: CoreSiteRiskStatus;
  identifiedAt: string;
  mitigatedAt: string | null;
  locationNote: string | null;
  companyId: number | null;
  siteId: number | null;
  ownerUserId: number | null;
  createdAt: string;
  updatedAt: string;
  company?: { id: number; name: string } | null;
  site?: { id: number; name: string; code: string | null } | null;
  owner?: { id: number; username: string } | null;
};

export type CoreSiteRiskListResponse = {
  items: CoreSiteRiskDto[];
  total: number;
  skip: number;
  take: number;
};

export type CreateCoreSiteRiskPayload = {
  title: string;
  description?: string;
  category?: CoreSiteRiskCategory;
  severity?: CoreSiteRiskSeverity;
  status?: CoreSiteRiskStatus;
  identifiedAt: string;
  mitigatedAt?: string | null;
  locationNote?: string;
  companyId?: number;
  siteId?: number;
  ownerUserId?: number;
};

export type UpdateCoreSiteRiskPayload = Partial<CreateCoreSiteRiskPayload>;

export type ListCoreSiteRisksParams = {
  companyId?: number;
  siteId?: number;
  status?: CoreSiteRiskStatus;
  category?: CoreSiteRiskCategory;
  severity?: CoreSiteRiskSeverity;
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

export async function createCoreSiteRisk(
  body: CreateCoreSiteRiskPayload
): Promise<CoreSiteRiskDto> {
  return fetchJson<CoreSiteRiskDto>(`${API_URL}/api/v1/core-site-risks`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function listCoreSiteRisks(
  params?: ListCoreSiteRisksParams
): Promise<CoreSiteRiskListResponse> {
  const qs = queryString({
    companyId: params?.companyId,
    siteId: params?.siteId,
    status: params?.status,
    category: params?.category,
    severity: params?.severity,
    skip: params?.skip,
    take: params?.take,
  });
  return fetchJson<CoreSiteRiskListResponse>(
    `${API_URL}/api/v1/core-site-risks${qs}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function getCoreSiteRisk(id: number): Promise<CoreSiteRiskDto> {
  return fetchJson<CoreSiteRiskDto>(
    `${API_URL}/api/v1/core-site-risks/${id}`,
    { cache: "no-store", credentials: "include" }
  );
}

export async function updateCoreSiteRisk(
  id: number,
  body: UpdateCoreSiteRiskPayload
): Promise<CoreSiteRiskDto> {
  return fetchJson<CoreSiteRiskDto>(
    `${API_URL}/api/v1/core-site-risks/${id}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );
}

export async function deleteCoreSiteRisk(
  id: number
): Promise<{ id: number; deleted: true }> {
  return fetchJson<{ id: number; deleted: true }>(
    `${API_URL}/api/v1/core-site-risks/${id}`,
    { method: "DELETE", credentials: "include" }
  );
}
