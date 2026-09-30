import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";
import type { HubCompanyPost } from "./company-api";

export type HubProviderChannel = {
  providerId: number;
  displayName: string;
  bio?: string | null;
  logoUrl?: string | null;
  bannerUrl?: string | null;
  websiteUrl?: string | null;
  followerCount: number;
  following: boolean;
  courseCount: number;
  canManage: boolean;
};

export type HubProviderCourse = {
  id: number;
  code: string;
  name: string;
  description?: string | null;
  durationHours?: number | null;
};

export async function fetchProviderChannel(
  session: Session | null,
  providerId: number,
): Promise<HubProviderChannel> {
  return apiFetchJson<HubProviderChannel>(
    `/api/v1/hub/providers/${providerId}/channel`,
    { session },
  );
}

export async function fetchProviderCourses(
  session: Session | null,
  providerId: number,
): Promise<HubProviderCourse[]> {
  return apiFetchJson<HubProviderCourse[]>(
    `/api/v1/hub/providers/${providerId}/courses`,
    { session },
  );
}

export async function fetchProviderPosts(
  session: Session | null,
  providerId: number,
): Promise<HubCompanyPost[]> {
  return apiFetchJson<HubCompanyPost[]>(`/api/v1/hub/providers/${providerId}/posts`, {
    session,
  });
}

export async function createProviderPost(
  session: Session | null,
  providerId: number,
  body: { title?: string; body: string },
): Promise<void> {
  await apiFetchJson(`/api/v1/hub/providers/${providerId}/posts`, {
    session,
    method: "POST",
    body: JSON.stringify(body),
  });
}
