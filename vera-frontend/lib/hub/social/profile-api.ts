import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";

export type HubProfileSkill = {
  skill: string;
  level?: string | null;
  endorsementCount: number;
};

export type HubProfileTraining = {
  name: string;
  status: string;
  expiresAt?: string | null;
};

export type HubProfileExperience = {
  projectId?: number;
  projectName: string;
  role?: string;
  startDate?: string | null;
  endDate?: string | null;
};

export type HubProfile = {
  id: string;
  userId: number;
  workerId?: number | null;
  displayName: string;
  headline?: string | null;
  about?: string | null;
  photoUrl?: string | null;
  location?: { city?: string | null; region?: string | null };
  primaryTrade?: string | null;
  visibility: string;
  profileCompleteness: number;
  reputationScore: number;
  skills: HubProfileSkill[];
  training: HubProfileTraining[];
  experience: HubProfileExperience[];
  connectionStatus: "none" | "pending" | "connected" | "self";
  pendingConnectionId?: string | null;
  incomingConnectionRequest?: boolean;
  openToWork?: boolean;
};

export type UpdateHubProfileInput = {
  headline?: string;
  about?: string;
  photoUrl?: string;
  locationCity?: string;
  locationRegion?: string;
  primaryTrade?: string;
  visibility?: "PUBLIC" | "CONNECTIONS" | "COMPANY";
};

export async function fetchHubProfile(
  session: Session | null,
  userId: number,
): Promise<HubProfile> {
  return apiFetchJson<HubProfile>(`/api/v1/hub/profiles/${userId}`, { session });
}

export async function fetchMyHubProfile(session: Session | null): Promise<HubProfile> {
  return apiFetchJson<HubProfile>("/api/v1/hub/profiles/me", { session });
}

export async function updateMyHubProfile(
  session: Session | null,
  body: UpdateHubProfileInput,
): Promise<void> {
  await apiFetchJson("/api/v1/hub/profiles/me", {
    session,
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export async function requestHubConnection(
  session: Session | null,
  addresseeUserId: number,
  message?: string,
): Promise<void> {
  await apiFetchJson("/api/v1/hub/connections/request", {
    session,
    method: "POST",
    body: JSON.stringify({ addresseeUserId, message }),
  });
}

export async function acceptHubConnection(
  session: Session | null,
  connectionId: string,
): Promise<void> {
  await apiFetchJson(`/api/v1/hub/connections/${connectionId}/accept`, {
    session,
    method: "POST",
  });
}

export async function declineHubConnection(
  session: Session | null,
  connectionId: string,
): Promise<void> {
  await apiFetchJson(`/api/v1/hub/connections/${connectionId}/decline`, {
    session,
    method: "POST",
  });
}
