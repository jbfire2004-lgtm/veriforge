import { API_URL, getAccessToken } from "./api-fetch";
import { fetchJson } from "./core";
import type {
  CompanyAssessmentLatest,
  CompanyAssessmentSummary,
  SgaeAssessmentResult,
  SpceAssessmentResult,
} from "./assessment-engines-types";

const BASE = API_URL + "/api/v1/assessment-engines";

export type TrainingAssessmentSummary = {
  runId: string;
  evaluatedAt: string;
  overallScore: number;
  overallStatus: string;
  result: unknown;
};

type RunTrainingResponse = { runId: string; result: unknown };
type RunCompanyAssessmentResponse<T> = { runId: string; result: T };

export async function runWorkerTrainingAssessment(
  workerId: number,
  projectId?: number,
) {
  const q =
    projectId != null ? "?projectId=" + encodeURIComponent(String(projectId)) : "";
  return fetchJson(BASE + "/training/worker/" + workerId + q, {
    method: "POST",
  }) as Promise<RunTrainingResponse>;
}

export async function getLatestWorkerTrainingAssessment(workerId: number) {
  return fetchJson(BASE + "/training/worker/" + workerId + "/latest") as Promise<
    TrainingAssessmentSummary | null
  >;
}

export async function getLatestCompanySpce(companyId: number) {
  return fetchJson(BASE + "/safety-program/company/" + companyId + "/latest") as Promise<
    CompanyAssessmentLatest<SpceAssessmentResult> | null
  >;
}

export async function getLatestCompanySmartGap(companyId: number) {
  return fetchJson(BASE + "/smart-gap/company/" + companyId + "/latest") as Promise<
    CompanyAssessmentLatest<SgaeAssessmentResult> | null
  >;
}

export type AssessmentHistoryPoint = {
  id: string;
  overallScore: number;
  overallStatus: string;
  evaluatedAt: string;
};

export async function getCompanySpceHistory(companyId: number, limit = 6) {
  return fetchJson(
    BASE + "/safety-program/company/" + companyId + "/history?limit=" + limit,
  ) as Promise<AssessmentHistoryPoint[]>;
}

export async function getCompanySmartGapHistory(companyId: number, limit = 6) {
  return fetchJson(
    BASE + "/smart-gap/company/" + companyId + "/history?limit=" + limit,
  ) as Promise<AssessmentHistoryPoint[]>;
}

export async function runCompanySpceAssessment(companyId: number) {
  return fetchJson(BASE + "/safety-program/company/" + companyId, {
    method: "POST",
  }) as Promise<RunCompanyAssessmentResponse<SpceAssessmentResult>>;
}

export function spcePdfUrl(companyId: number) {
  return BASE + "/safety-program/company/" + companyId + "/export.pdf";
}

export function smartGapPdfUrl(companyId: number, projectId?: number) {
  const q =
    projectId != null ? "?projectId=" + encodeURIComponent(String(projectId)) : "";
  return BASE + "/smart-gap/company/" + companyId + "/export.pdf" + q;
}

export async function downloadAssessmentPdf(url: string, filename: string) {
  const token = await getAccessToken();
  const res = await fetch(url, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) throw new Error("PDF export failed");
  const blob = await res.blob();
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(objectUrl);
}

export function trainingAssessmentPdfUrl(workerId: number) {
  return BASE + "/training/worker/" + workerId + "/export.pdf";
}

export async function downloadTrainingAssessmentPdf(workerId: number) {
  const token = await getAccessToken();
  const res = await fetch(trainingAssessmentPdfUrl(workerId), {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) throw new Error("PDF export failed");
  return res.blob();
}

export async function runCompanySmartGapAnalysis(
  companyId: number,
  hiringClientId?: number,
  projectId?: number,
) {
  const q = new URLSearchParams();
  q.set("hiringClientId", String(hiringClientId ?? companyId));
  if (projectId) q.set("projectId", String(projectId));
  return fetchJson(BASE + "/smart-gap/company/" + companyId + "?" + q, {
    method: "POST",
  }) as Promise<RunCompanyAssessmentResponse<SgaeAssessmentResult>>;
}

export type { CompanyAssessmentSummary, SpceAssessmentResult, SgaeAssessmentResult };
