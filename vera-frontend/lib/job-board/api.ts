import type {
  JobBoardApplication,
  JobBoardJobDetail,
  JobBoardJobList,
  JobBoardWorkerProfile,
} from "@vera/api-contract";
import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-fetch";

const BASE = "/api/v1/job-board";

export async function fetchJobs(params?: {
  page?: number;
  pageSize?: number;
  trade?: string;
  location?: string;
  payMin?: number;
  payMax?: number;
  experienceLevel?: string;
  ticket?: string;
  q?: string;
}): Promise<JobBoardJobList> {
  const qs = new URLSearchParams();
  if (params?.page) qs.set("page", String(params.page));
  if (params?.pageSize) qs.set("pageSize", String(params.pageSize));
  if (params?.trade) qs.set("trade", params.trade);
  if (params?.location) qs.set("location", params.location);
  if (params?.payMin != null) qs.set("payMin", String(params.payMin));
  if (params?.payMax != null) qs.set("payMax", String(params.payMax));
  if (params?.experienceLevel) qs.set("experienceLevel", params.experienceLevel);
  if (params?.ticket) qs.set("ticket", params.ticket);
  if (params?.q) qs.set("q", params.q);
  const query = qs.toString();
  return apiFetchJson(`${BASE}/jobs${query ? `?${query}` : ""}`, { requireAuth: false });
}

export async function fetchJob(slug: string): Promise<JobBoardJobDetail> {
  return apiFetchJson(`${BASE}/jobs/${slug}`, { requireAuth: false });
}

export async function fetchWorkerProfile(
  workerId: number,
): Promise<JobBoardWorkerProfile> {
  return apiFetchJson(`${BASE}/workers/${workerId}`, { requireAuth: false });
}

export async function fetchJobBoardSitemap(): Promise<
  { slug: string; updatedAt: string }[]
> {
  return apiFetchJson(`${BASE}/sitemap`, { requireAuth: false });
}

export async function applyToJob(
  session: Session,
  jobId: string,
  coverMessage?: string,
): Promise<JobBoardApplication> {
  return apiFetchJson(`${BASE}/apply`, {
    method: "POST",
    body: JSON.stringify({ jobId, coverMessage }),
    session,
  });
}
