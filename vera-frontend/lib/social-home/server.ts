import type { Session } from "next-auth";
import type { SocialFeedPage } from "@vera/api-contract";
import { API_URL } from "@/lib/api-fetch";

const emptyFeed: SocialFeedPage = { items: [], nextCursor: null };

export async function fetchSocialFeedServer(
  session: Session | null,
  opts?: { cursor?: string; limit?: number }
): Promise<SocialFeedPage> {
  const token = session?.accessToken;
  if (!token) return emptyFeed;

  const params = new URLSearchParams();
  if (opts?.cursor) params.set("cursor", opts.cursor);
  if (opts?.limit) params.set("limit", String(opts.limit));
  const q = params.toString();

  try {
    const res = await fetch(`${API_URL}/api/v1/social/feed${q ? `?${q}` : ""}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return emptyFeed;
    return (await res.json()) as SocialFeedPage;
  } catch {
    return emptyFeed;
  }
}
