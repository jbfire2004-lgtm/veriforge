import { API_URL } from "@/lib/api";
import { fetchJson } from "@/lib/core/fetch-json";

/** Success row shape from GET /api/v1/sites/:id */
export interface SiteDto {
  id: number;
  name: string;
  code: string | null;
  region: string | null;
  active: boolean;
  createdAt: string;
}

/** Example POST /api/v1/sites JSON body */
export const SITE_CREATE_EXAMPLE_PAYLOAD = {
  name: "River Crossing Yard",
  code: "RCY-01",
  region: "Northern Division",
  active: true,
} as const;

/** Paginated list envelope */
export interface SitesPaginatedDto {
  data: SiteDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/** GET /api/v1/sites/:id/verify */
export interface SiteVerifyDto {
  ok: boolean;
  siteId: number;
  name: string;
  active: boolean;
  code: string | null;
  region: string | null;
  verifiedAt: string;
}

export interface ApiErrorBody {
  statusCode: number;
  message: string | string[] | Record<string, unknown>;
  error?: string;
}

const base = () => `${API_URL}/api/v1/sites`;

export async function fetchSites(params: {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  activeOnly?: boolean;
}): Promise<SitesPaginatedDto> {
  const u = new URL(base());
  if (params.page) u.searchParams.set("page", String(params.page));
  if (params.limit) u.searchParams.set("limit", String(params.limit));
  if (params.search) u.searchParams.set("search", params.search);
  if (params.sortBy) u.searchParams.set("sortBy", params.sortBy);
  if (params.sortOrder) u.searchParams.set("sortOrder", params.sortOrder);
  if (params.activeOnly === true) u.searchParams.set("activeOnly", "true");
  return fetchJson<SitesPaginatedDto>(u.toString(), { cache: "no-store" });
}

export async function fetchSite(id: number): Promise<SiteDto> {
  return fetchJson<SiteDto>(`${base()}/${id}`, { cache: "no-store" });
}

export async function createSite(body: {
  name: string;
  code?: string;
  region?: string;
  active?: boolean;
}): Promise<SiteDto> {
  return fetchJson<SiteDto>(base(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updateSite(
  id: number,
  body: Partial<{
    name: string;
    code: string | null;
    region: string | null;
    active: boolean;
  }>
): Promise<SiteDto> {
  return fetchJson<SiteDto>(`${base()}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteSite(id: number): Promise<{ deleted: boolean; id: number }> {
  return fetchJson<{ deleted: boolean; id: number }>(`${base()}/${id}`, {
    method: "DELETE",
  });
}

export async function verifySite(id: number): Promise<SiteVerifyDto> {
  return fetchJson<SiteVerifyDto>(`${base()}/${id}/verify`, { cache: "no-store" });
}
