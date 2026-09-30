import { apiFetchJson, type VeraApiContext } from "./api-client";

const BASE = `/api/v1/pm/safety-meetings`;

type MeetingApiContext = VeraApiContext;

export type SafetyMeeting = {
  id: string;
  title: string;
  meetingType: string;
  status: string;
  scheduledAt?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  locationNote?: string | null;
  qualityScore?: number | null;
  engagementScore?: number | null;
  requiresSupervisorReview: boolean;
  reviewStatus: string;
  topics: Array<{
    id: string;
    title: string;
    isHighRisk: boolean;
    notes?: string | null;
    discussionPoints?: unknown;
    requiredControls?: unknown;
    sourceModule?: string | null;
  }>;
  attendees: Array<{
    id: string;
    workerId: number;
    status: string;
    checkedInAt?: string | null;
    worker?: { firstName: string; lastName: string };
  }>;
  signatures: Array<{
    id: string;
    role: string;
    signerWorkerId?: number | null;
    signedAt?: string;
  }>;
  correctiveLinks: Array<{
    correctiveAction: { id: string; title: string; status: string };
  }>;
};

export type TopicSuggestion = {
  title: string;
  categoryCode: string;
  reason: string;
  priority: number;
  isHighRisk: boolean;
  sourceModule: string;
  sourceId: string;
};

export async function listSafetyMeetings(
  projectId: number,
  filters?: { status?: string; meetingType?: string },
  ctx?: MeetingApiContext,
) {
  const q = new URLSearchParams({ projectId: String(projectId) });
  if (filters?.status) q.set("status", filters.status);
  if (filters?.meetingType) q.set("meetingType", filters.meetingType);
  return apiFetchJson<SafetyMeeting[]>(`${BASE}?${q}`, {
    session: ctx?.session,
  });
}

export async function getSafetyMeeting(
  id: string,
  ctx?: MeetingApiContext,
) {
  return apiFetchJson<SafetyMeeting>(`${BASE}/${id}`, {
    session: ctx?.session,
  });
}

export async function createSafetyMeeting(
  body: Record<string, unknown>,
  ctx?: MeetingApiContext,
) {
  return apiFetchJson<SafetyMeeting>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function publishMeeting(id: string) {
  return apiFetchJson<SafetyMeeting>(`${BASE}/${id}/publish`, { method: "POST" });
}

export async function startMeeting(id: string) {
  return apiFetchJson<SafetyMeeting>(`${BASE}/${id}/start`, { method: "POST" });
}

export async function completeMeeting(id: string) {
  return apiFetchJson<SafetyMeeting>(`${BASE}/${id}/complete`, { method: "POST" });
}

export async function checkInAttendee(
  meetingId: string,
  workerId: number,
  ctx?: MeetingApiContext,
) {
  return apiFetchJson(`${BASE}/${meetingId}/attendees/${workerId}/check-in`, {
    method: "POST",
    session: ctx?.session,
  });
}

export async function addMeetingAttendee(
  meetingId: string,
  workerId: number,
  ctx?: MeetingApiContext,
) {
  return apiFetchJson(`${BASE}/${meetingId}/attendees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ workerId }),
    session: ctx?.session,
  });
}

export type MeetingSignOnResult = {
  meeting: SafetyMeeting;
  attendee: {
    id: string;
    workerId: number;
    status: string;
    checkedInAt?: string | null;
  };
  signature: { id: string; role: string };
  presence: {
    workerId: number;
    projectId: number;
    markedPresentAt?: string | null;
    source: string;
  };
};

/** Roster + check-in + worker signature — primary field sign-on. */
export async function signOnToSafetyMeeting(
  meetingId: string,
  body: {
    workerId: number;
    signatureData?: string;
    signerName?: string;
  },
  ctx?: MeetingApiContext,
) {
  return apiFetchJson<MeetingSignOnResult>(`${BASE}/${meetingId}/sign-on`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function addMeetingSignature(
  meetingId: string,
  body: Record<string, unknown>,
  ctx?: MeetingApiContext,
) {
  return apiFetchJson(`${BASE}/${meetingId}/signatures`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session: ctx?.session,
  });
}

export async function suggestTopics(
  projectId: number,
  companyId: number,
  ctx?: MeetingApiContext,
) {
  const q = new URLSearchParams({
    projectId: String(projectId),
    companyId: String(companyId),
  });
  return apiFetchJson<TopicSuggestion[]>(`${BASE}/topics/suggest?${q}`, {
    session: ctx?.session,
  });
}

export async function listTopicLibrary(
  companyId: number,
  projectId?: number,
) {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId) q.set("projectId", String(projectId));
  return apiFetchJson(`${BASE}/topics?${q}`);
}

export async function getMeetingAnalytics(projectId: number) {
  return apiFetchJson(`${BASE}/analytics/project/${projectId}`);
}

export async function scoreMeeting(id: string) {
  return apiFetchJson(`${BASE}/${id}/intelligence/score`);
}

export async function syncSafetyMeetingOffline(
  payload: Record<string, unknown>,
) {
  return apiFetchJson<SafetyMeeting>(`${BASE}/sync`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
