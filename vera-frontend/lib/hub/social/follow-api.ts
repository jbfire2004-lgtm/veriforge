import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";

export type HubFollowTargetType = "COMPANY" | "PROVIDER";

export type HubSuggestions = {
  people: Array<{
    userId: number;
    displayName: string;
    headline?: string | null;
    reason: string;
  }>;
  companies: Array<{
    companyId: number;
    name: string;
    tagline?: string | null;
    logoUrl?: string | null;
    industry?: string | null;
  }>;
  providers: Array<{
    providerId: number;
    name: string;
    bio?: string | null;
    logoUrl?: string | null;
  }>;
};

export async function fetchFollowStatus(
  session: Session | null,
  targetType: HubFollowTargetType,
  targetId: string,
): Promise<{ following: boolean }> {
  const qs = new URLSearchParams({ targetType, targetId });
  return apiFetchJson(`/api/v1/hub/follows/status?${qs}`, { session });
}

export async function followHubTarget(
  session: Session | null,
  targetType: HubFollowTargetType,
  targetId: string,
): Promise<void> {
  await apiFetchJson("/api/v1/hub/follows", {
    session,
    method: "POST",
    body: JSON.stringify({ targetType, targetId }),
  });
}

export async function unfollowHubTarget(
  session: Session | null,
  targetType: HubFollowTargetType,
  targetId: string,
): Promise<void> {
  await apiFetchJson("/api/v1/hub/follows/unfollow", {
    session,
    method: "POST",
    body: JSON.stringify({ targetType, targetId }),
  });
}

export async function fetchHubSuggestions(
  session: Session | null,
): Promise<HubSuggestions> {
  return apiFetchJson<HubSuggestions>("/api/v1/hub/suggestions", { session });
}
