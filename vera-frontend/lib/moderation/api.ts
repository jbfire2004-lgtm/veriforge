import type {
  ExpertVerificationRequest,
  ModerationAutoRule,
  ModerationCaseList,
} from "@vera/api-contract";
import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/api/v1/moderation";
const ADMIN = "/api/v1/admin/moderation";

export async function reportPost(
  session: Session,
  body: {
    targetType: string;
    targetId: string;
    reason: string;
    details?: string;
  },
): Promise<{ caseId: string }> {
  return apiFetchJson(`${BASE}/report/post`, {
    method: "POST",
    body: JSON.stringify(body),
    session,
  });
}

export async function reportUser(
  session: Session,
  body: { userId: number; reason: string; details?: string },
): Promise<{ caseId: string }> {
  return apiFetchJson(`${BASE}/report/user`, {
    method: "POST",
    body: JSON.stringify(body),
    session,
  });
}

export async function applyExpertVerification(
  session: Session,
  body: { statement: string; tradeEvidence?: string },
): Promise<ExpertVerificationRequest> {
  return apiFetchJson(`${BASE}/expert-verification/apply`, {
    method: "POST",
    body: JSON.stringify(body),
    session,
  });
}

export async function adminModerationStats(session: Session) {
  return apiFetchJson<{
    open: number;
    inReview: number;
    autoFlaggedOpen: number;
    socialPostFlagsOpen?: number;
  }>(`${ADMIN}/stats`, { session });
}

export async function adminSocialPostFlags(session: Session, page = 1) {
  return apiFetchJson<{
    items: import("@vera/api-contract").SocialPostModerationFlag[];
    total: number;
    page: number;
    pageSize: number;
  }>(`${ADMIN}/social-flags?page=${page}`, { session });
}

export async function adminResolveSocialFlag(
  session: Session,
  flagId: string,
  action: "DISMISS" | "HIDE_POST",
  note?: string
) {
  return apiFetchJson(`${ADMIN}/social-flags/${flagId}`, {
    method: "PATCH",
    body: JSON.stringify({ action, note }),
    session,
  });
}

export async function adminModerationQueue(
  session: Session,
  params?: { status?: string; page?: number },
): Promise<ModerationCaseList> {
  const qs = new URLSearchParams();
  if (params?.status) qs.set("status", params.status);
  if (params?.page) qs.set("page", String(params.page));
  const q = qs.toString();
  return apiFetchJson(`${ADMIN}/queue${q ? `?${q}` : ""}`, { session });
}

export async function adminResolveCase(
  session: Session,
  caseId: string,
  body: { status: string; resolution?: string; resolutionNote?: string },
): Promise<void> {
  await apiFetchJson(`${ADMIN}/cases/${caseId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    session,
  });
}

export async function adminListAutoRules(session: Session): Promise<ModerationAutoRule[]> {
  return apiFetchJson(`${ADMIN}/rules`, { session });
}

export async function adminUpsertAutoRule(
  session: Session,
  body: Record<string, unknown>,
): Promise<ModerationAutoRule> {
  return apiFetchJson(`${ADMIN}/rules`, {
    method: "POST",
    body: JSON.stringify(body),
    session,
  });
}

export async function adminListExpertVerification(
  session: Session,
): Promise<ExpertVerificationRequest[]> {
  return apiFetchJson(`${ADMIN}/expert-verification`, { session });
}

export async function adminReviewExpertVerification(
  session: Session,
  requestId: string,
  body: { status: "APPROVED" | "REJECTED"; reviewNote?: string },
): Promise<void> {
  await apiFetchJson(`${ADMIN}/expert-verification/${requestId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
    session,
  });
}
