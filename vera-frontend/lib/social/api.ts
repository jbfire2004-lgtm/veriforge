import type {
  SocialActivityList,
  SocialFeedComment,
  SocialFollowStatus,
  SocialUserSummary,
} from "@vera/api-contract";
import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/api/v1/social";

export async function socialInteract(
  session: Session,
  body: {
    feedItemId: string;
    type: "LIKE" | "COMMENT" | "SHARE";
    body?: string;
    parentId?: string;
  },
): Promise<void> {
  await apiFetchJson(`${BASE}/interact`, {
    method: "POST",
    body: JSON.stringify(body),
    session,
  });
}

export async function fetchSocialComments(
  session: Session,
  feedItemId: string,
): Promise<SocialFeedComment[]> {
  return apiFetchJson(
    `${BASE}/comments?feedItemId=${encodeURIComponent(feedItemId)}`,
    { session },
  );
}

export async function followUser(
  session: Session,
  userId: number,
): Promise<SocialFollowStatus> {
  return apiFetchJson(`${BASE}/follow/${userId}`, {
    method: "POST",
    session,
  });
}

export async function unfollowUser(
  session: Session,
  userId: number,
): Promise<SocialFollowStatus> {
  return apiFetchJson(`${BASE}/follow/${userId}`, {
    method: "DELETE",
    session,
  });
}

export async function fetchFollowStatus(
  session: Session,
  userId: number,
): Promise<SocialFollowStatus> {
  return apiFetchJson(`${BASE}/follow/${userId}/status`, { session });
}

export async function fetchFollowing(session: Session): Promise<SocialUserSummary[]> {
  return apiFetchJson(`${BASE}/following`, { session });
}

export async function fetchFollowers(session: Session): Promise<SocialUserSummary[]> {
  return apiFetchJson(`${BASE}/followers`, { session });
}

export async function fetchActivity(
  session: Session,
  params?: { cursor?: string; limit?: number; scope?: "me" | "following" | "all" },
): Promise<SocialActivityList> {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.scope) qs.set("scope", params.scope);
  const q = qs.toString();
  return apiFetchJson(`${BASE}/activity${q ? `?${q}` : ""}`, { session });
}
