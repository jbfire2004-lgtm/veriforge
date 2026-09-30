import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";

export type HubCompanyPage = {
  id: string;
  companyId: number;
  companyName: string;
  bannerUrl?: string | null;
  logoUrl?: string | null;
  tagline?: string | null;
  about?: string | null;
  industry?: string | null;
  specialties: string[];
  websiteUrl?: string | null;
  isProviderChannel: boolean;
  followerCount: number;
  published: boolean;
  location?: { city?: string | null; region?: string | null };
  following: boolean;
  canManage: boolean;
  memberCount: number;
  openJobCount: number;
};

export type HubCompanyMember = {
  userId: number;
  displayName: string;
  title?: string | null;
  role: string;
  photoUrl?: string | null;
  primaryTrade?: string | null;
};

export type HubCompanyPost = {
  id: string;
  title?: string | null;
  body: string;
  publishedAt: string;
  authorName: string;
  likeCount: number;
  commentCount: number;
};

export type UpdateHubCompanyPageInput = {
  tagline?: string;
  about?: string;
  industry?: string;
  websiteUrl?: string;
  published?: boolean;
};

export async function fetchCompanyPage(
  session: Session | null,
  companyId: number,
): Promise<HubCompanyPage> {
  return apiFetchJson<HubCompanyPage>(`/api/v1/hub/companies/${companyId}/page`, {
    session,
  });
}

export async function updateCompanyPage(
  session: Session | null,
  companyId: number,
  body: UpdateHubCompanyPageInput,
): Promise<void> {
  await apiFetchJson(`/api/v1/hub/companies/${companyId}/page`, {
    session,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function fetchCompanyMembers(
  session: Session | null,
  companyId: number,
): Promise<HubCompanyMember[]> {
  return apiFetchJson<HubCompanyMember[]>(
    `/api/v1/hub/companies/${companyId}/members`,
    { session },
  );
}

export async function fetchCompanyPosts(
  session: Session | null,
  companyId: number,
): Promise<HubCompanyPost[]> {
  return apiFetchJson<HubCompanyPost[]>(
    `/api/v1/hub/companies/${companyId}/posts`,
    { session },
  );
}

export async function createCompanyPost(
  session: Session | null,
  companyId: number,
  body: { title?: string; body: string },
): Promise<void> {
  await apiFetchJson(`/api/v1/hub/companies/${companyId}/posts`, {
    session,
    method: "POST",
    body: JSON.stringify(body),
  });
}
