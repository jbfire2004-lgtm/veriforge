import type {
  SafetyBlogCategory,
  SafetyBlogComment,
  SafetyBlogPostDetail,
  SafetyBlogPostList,
  SafetyBlogPostSummary,
  SafetyBlogTag,
} from "@vera/api-contract";
import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/api/v1/safety-blog";

export async function fetchSafetyBlogPosts(params?: {
  page?: number;
  pageSize?: number;
  categorySlug?: string;
  tagSlug?: string;
  featured?: boolean;
  q?: string;
}): Promise<SafetyBlogPostList> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params?.categorySlug) qs.set("categorySlug", params.categorySlug);
  if (params?.tagSlug) qs.set("tagSlug", params.tagSlug);
  if (params?.featured) qs.set("featured", "true");
  if (params?.q) qs.set("q", params.q);
  const q = qs.toString();
  return apiFetchJson<SafetyBlogPostList>(`${BASE}/posts${q ? `?${q}` : ""}`, {
    requireAuth: false,
  });
}

export async function fetchSafetyBlogPost(
  slug: string,
): Promise<SafetyBlogPostDetail> {
  return apiFetchJson<SafetyBlogPostDetail>(`${BASE}/posts/${slug}`, {
    requireAuth: false,
  });
}

export async function fetchTrendingPosts(
  limit = 6,
): Promise<SafetyBlogPostSummary[]> {
  return apiFetchJson<SafetyBlogPostSummary[]>(
    `${BASE}/posts/trending?limit=${limit}`,
    { requireAuth: false },
  );
}

export async function fetchSafetyBlogCategories(): Promise<SafetyBlogCategory[]> {
  return apiFetchJson<SafetyBlogCategory[]>(`${BASE}/categories`, {
    requireAuth: false,
  });
}

export async function fetchSafetyBlogTags(): Promise<SafetyBlogTag[]> {
  return apiFetchJson<SafetyBlogTag[]>(`${BASE}/tags`, {
    requireAuth: false,
  });
}

export async function fetchSafetyBlogComments(
  slug: string,
): Promise<SafetyBlogComment[]> {
  return apiFetchJson<SafetyBlogComment[]>(`${BASE}/posts/${slug}/comments`, {
    requireAuth: false,
  });
}

export async function postSafetyBlogComment(body: {
  postId: string;
  parentId?: string;
  authorName?: string;
  body: string;
}): Promise<SafetyBlogComment> {
  return apiFetchJson<SafetyBlogComment>(`${BASE}/comments`, {
    method: "POST",
    body: JSON.stringify(body),
    requireAuth: false,
  });
}

export async function upvoteComment(
  commentId: string,
  voterKey: string,
): Promise<number> {
  return apiFetchJson<number>(`${BASE}/comments/${commentId}/upvote`, {
    method: "POST",
    body: JSON.stringify({ voterKey }),
    requireAuth: false,
  });
}

export async function fetchSitemapEntries(): Promise<
  { slug: string; updatedAt: string }[]
> {
  return apiFetchJson(`${BASE}/sitemap`, { requireAuth: false });
}

// Admin
export async function adminFetchPosts(
  session: Session,
  params?: { page?: number; status?: string },
): Promise<SafetyBlogPostList> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.status) qs.set("status", params.status);
  const q = qs.toString();
  return apiFetchJson(`/api/v1/admin/safety-blog/posts${q ? `?${q}` : ""}`, {
    session,
  });
}

export async function adminSavePost(
  session: Session,
  data: Record<string, unknown>,
  id?: string,
): Promise<SafetyBlogPostDetail> {
  if (id) {
    return apiFetchJson(`/api/v1/admin/safety-blog/posts/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
      session,
    });
  }
  return apiFetchJson(`/api/v1/admin/safety-blog/posts`, {
    method: "POST",
    body: JSON.stringify(data),
    session,
  });
}

export async function adminDeletePost(
  session: Session,
  id: string,
): Promise<void> {
  await apiFetchJson(`/api/v1/admin/safety-blog/posts/${id}`, {
    method: "DELETE",
    session,
  });
}
