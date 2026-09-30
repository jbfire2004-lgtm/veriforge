import type {
  ExpertProfile,
  ExpertQaQuestionDetail,
  ExpertQaQuestionList,
} from "@vera/api-contract";
import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/api/v1/expert-qa";

export async function fetchExpertQuestions(params?: {
  page?: number;
  trade?: string;
  tag?: string;
  q?: string;
  sort?: string;
}): Promise<ExpertQaQuestionList> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.trade) qs.set("trade", params.trade);
  if (params?.tag) qs.set("tag", params.tag);
  if (params?.q) qs.set("q", params.q);
  if (params?.sort) qs.set("sort", params.sort);
  const q = qs.toString();
  return apiFetchJson(`${BASE}/questions${q ? `?${q}` : ""}`, { requireAuth: false });
}

export async function fetchExpertQuestion(slug: string): Promise<ExpertQaQuestionDetail> {
  return apiFetchJson(`${BASE}/questions/${slug}`, { requireAuth: false });
}

export async function fetchExpertProfile(userId: number): Promise<ExpertProfile | null> {
  return apiFetchJson(`${BASE}/experts/${userId}`, { requireAuth: false });
}

export async function askQuestion(
  session: Session,
  body: Record<string, unknown>,
): Promise<ExpertQaQuestionDetail> {
  return apiFetchJson(`${BASE}/questions`, {
    method: "POST",
    body: JSON.stringify(body),
    session,
  });
}

export async function postAnswer(
  session: Session,
  questionId: string,
  body: string,
): Promise<void> {
  await apiFetchJson(`${BASE}/answers`, {
    method: "POST",
    body: JSON.stringify({ questionId, body }),
    session,
  });
}

export async function voteAnswer(
  answerId: string,
  value: 1 | -1,
  voterKey: string,
): Promise<number> {
  return apiFetchJson(`${BASE}/answers/vote`, {
    method: "POST",
    body: JSON.stringify({ answerId, value, voterKey }),
    requireAuth: false,
  });
}

export async function acceptAnswer(
  session: Session,
  questionId: string,
  answerId: string,
): Promise<void> {
  await apiFetchJson(`${BASE}/answers/accept`, {
    method: "POST",
    body: JSON.stringify({ questionId, answerId }),
    session,
  });
}

export async function fetchExpertQaSitemap(): Promise<{ slug: string; updatedAt: string }[]> {
  return apiFetchJson(`${BASE}/sitemap`, { requireAuth: false });
}
