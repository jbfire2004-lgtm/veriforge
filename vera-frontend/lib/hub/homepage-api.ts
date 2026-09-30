import type { HomepagePayload } from "@vera/api-contract";
import { apiFetchJson } from "@/lib/api-fetch";
import type { Session } from "next-auth";

export type HomepageQuery = {
  cursor?: string;
  limit?: number;
  region?: string;
  refresh?: boolean;
};

export async function fetchHomepage(
  session: Session | null,
  query: HomepageQuery = {},
): Promise<HomepagePayload> {
  const params = new URLSearchParams();
  if (query.cursor) params.set("cursor", query.cursor);
  if (query.limit != null) params.set("limit", String(query.limit));
  if (query.region) params.set("region", query.region);
  if (query.refresh) params.set("refresh", "true");
  const qs = params.toString();
  const path = `/api/v1/hub/homepage${qs ? `?${qs}` : ""}`;
  return apiFetchJson<HomepagePayload>(path, { session, timeoutMs: 8_000 });
}
