import type { FeedPage } from "@vera/api-contract";
import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";

export type HubFeedFilter = "all" | "network" | "company" | "projects" | "providers";

export async function fetchHubFeedPage(
  session: Session | null,
  params?: {
    filter?: HubFeedFilter;
    cursor?: string;
    limit?: number;
    refresh?: boolean;
  },
): Promise<FeedPage> {
  const qs = new URLSearchParams();
  if (params?.filter) qs.set("filter", params.filter);
  if (params?.cursor) qs.set("cursor", params.cursor);
  if (params?.limit) qs.set("limit", String(params.limit));
  if (params?.refresh) qs.set("refresh", "true");
  const q = qs.toString();
  return apiFetchJson<FeedPage>(`/api/v1/hub/feed${q ? `?${q}` : ""}`, { session });
}

export async function createHubPost(
  session: Session | null,
  body: { title?: string; body: string },
): Promise<void> {
  await apiFetchJson("/api/v1/hub/feed/posts", {
    session,
    method: "POST",
    body: JSON.stringify({ body: body.body, title: body.title }),
  });
}
