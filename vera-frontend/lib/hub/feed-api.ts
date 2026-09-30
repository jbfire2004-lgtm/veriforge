import type {
  FeedComment,
  FeedItemWithEngagement,
  FeedPage,
} from "@vera/api-contract";
import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";
import { resolveApiWsOrigin } from "@/lib/dev-ports";

export async function fetchFeedPage(
  session: Session | null,
  params?: { cursor?: string; limit?: number; refresh?: boolean },
): Promise<FeedPage> {
  const qs = new URLSearchParams();
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.refresh) qs.set("refresh", "true");
  const q = qs.toString();
  return apiFetchJson<FeedPage>(`/api/v1/feed${q ? `?${q}` : ""}`, { session });
}

export async function interactFeed(
  session: Session | null,
  body: {
    feedItemId: string;
    type: "LIKE" | "COMMENT" | "SHARE";
    body?: string;
    parentId?: string;
  },
): Promise<void> {
  await apiFetchJson("/api/v1/feed/interact", {
    session,
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function fetchFeedComments(
  session: Session | null,
  feedItemId: string,
): Promise<FeedComment[]> {
  return apiFetchJson<FeedComment[]>(
    `/api/v1/feed/comments?feedItemId=${encodeURIComponent(feedItemId)}`,
    { session },
  );
}

export async function syncVeraCoreFeed(
  session: Session | null,
): Promise<{
  synced: number;
  counts: Record<string, number>;
}> {
  return apiFetchJson("/api/v1/feed/sync/vera-core", { session, method: "POST" });
}

export function feedWsUrl(accessToken: string): string {
  const base = resolveApiWsOrigin();
  return `${base.replace(/\/$/, "")}/feed/live?token=${encodeURIComponent(accessToken)}`;
}

export type { FeedItemWithEngagement, FeedPage };
