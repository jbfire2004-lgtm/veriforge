import { apiFetchJson } from "@/lib/api-fetch";
import type { SocialFeedPage } from "@vera/api-contract";

export async function fetchSocialFeed(opts?: {
  cursor?: string | null;
  limit?: number;
}): Promise<SocialFeedPage> {
  const params = new URLSearchParams();
  if (opts?.cursor) params.set("cursor", opts.cursor);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const q = params.toString();
  return apiFetchJson<SocialFeedPage>(
    `/api/v1/social/feed${q ? `?${q}` : ""}`
  );
}

export async function likePost(postId: string) {
  return apiFetchJson(`/api/v1/social/posts/like`, {
    method: "POST",
    body: JSON.stringify({ postId }),
  });
}

export async function unlikePost(postId: string) {
  return apiFetchJson(`/api/v1/social/posts/unlike`, {
    method: "POST",
    body: JSON.stringify({ postId }),
  });
}

export async function commentOnPost(
  postId: string,
  body: string,
  parentId?: string
) {
  return apiFetchJson(`/api/v1/social/posts/comment`, {
    method: "POST",
    body: JSON.stringify({ postId, body, parentId }),
  });
}

export async function sharePost(postId: string) {
  return apiFetchJson(`/api/v1/social/posts/share`, {
    method: "POST",
    body: JSON.stringify({ postId }),
  });
}

export async function reportPost(postId: string, reason: string) {
  return apiFetchJson(`/api/v1/social/posts/report`, {
    method: "POST",
    body: JSON.stringify({ postId, reason }),
  });
}

export async function followTarget(
  targetType: "COMPANY" | "PROVIDER" | "USER",
  targetId: string
) {
  return apiFetchJson(`/api/v1/social/follow`, {
    method: "POST",
    body: JSON.stringify({ targetType, targetId }),
  });
}

export async function fetchTrendingPosts() {
  return apiFetchJson(`/api/v1/social/feed/trending`);
}

export async function fetchSponsoredAds() {
  return apiFetchJson(`/api/v1/social/ads/sponsored`);
}

export async function fetchSuggestedProviders() {
  return apiFetchJson(`/api/v1/social/feed/suggestions/providers`);
}
