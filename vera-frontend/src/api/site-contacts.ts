import { API_URL } from "@/lib/api";
import { fetchJson } from "@/lib/core/fetch-json";
import type {
  CreateSiteContactPayload,
  SiteContactDto,
  SiteContactsPaginatedDto,
  UpdateSiteContactPayload,
} from "@/src/types/site-contact";

const base = () => `${API_URL}/api/v1/site-contacts`;

export async function fetchSiteContacts(params: {
  page?: number;
  limit?: number;
  siteId?: number;
  search?: string;
}): Promise<SiteContactsPaginatedDto> {
  const u = new URL(base());
  if (params.page) u.searchParams.set("page", String(params.page));
  if (params.limit) u.searchParams.set("limit", String(params.limit));
  if (params.siteId) u.searchParams.set("siteId", String(params.siteId));
  if (params.search) u.searchParams.set("search", params.search);
  return fetchJson<SiteContactsPaginatedDto>(u.toString(), { cache: "no-store" });
}

export async function fetchSiteContact(id: number): Promise<SiteContactDto> {
  return fetchJson<SiteContactDto>(`${base()}/${id}`, { cache: "no-store" });
}

export async function createSiteContact(
  body: CreateSiteContactPayload
): Promise<SiteContactDto> {
  return fetchJson<SiteContactDto>(base(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function updateSiteContact(
  id: number,
  body: UpdateSiteContactPayload
): Promise<SiteContactDto> {
  return fetchJson<SiteContactDto>(`${base()}/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

export async function deleteSiteContact(
  id: number
): Promise<{ deleted: boolean; id: number }> {
  return fetchJson<{ deleted: boolean; id: number }>(`${base()}/${id}`, {
    method: "DELETE",
  });
}

/** Example POST body for documentation / tests */
export const SITE_CONTACT_CREATE_EXAMPLE: CreateSiteContactPayload = {
  siteId: 1,
  fullName: "Jamie Smith",
  email: "jamie.smith@example.com",
  phone: "+1-555-0100",
  role: "Site safety lead",
  isPrimary: true,
};
