import { API_URL, getAccessToken } from "./api-fetch";
import { fetchJson } from "./core";

const BASE = `${API_URL}/api/v1/assessment-engines/fit-test`;
const LEGACY_BASE = `${API_URL}/api/v1/fit-tests`;

export const FIT_TEST_TYPES = ["N95", "Half-face", "Full-face", "PAPR", "SCBA"] as const;
export const FIT_TEST_METHODS = ["Qualitative", "Quantitative"] as const;

/** @deprecated use FIT_TEST_TYPES */
export const RESPIRATOR_TYPES = FIT_TEST_TYPES;

export type FitTestResult = "PASS" | "FAIL" | "CONDITIONAL";

export type FitTestRun = {
  id: number;
  workerId: number;
  tenantId: number | null;
  testType: string | null;
  testMethod: string | null;
  result: FitTestResult;
  performedAt: string;
  expiresAt: string | null;
  notes: string | null;
  evidenceFilesJson: unknown;
  createdById: number | null;
};

export type FitTestEvaluation = {
  pass: boolean;
  statusLabel: string;
  expiresAt: string | null;
  daysUntilExpiry: number | null;
  expired: boolean;
  expiringSoon: boolean;
};

export type FitTestSummary = {
  latest: FitTestRun;
  evaluation: FitTestEvaluation;
  readinessScore: number;
} | null;

export type FitTestCompanySummary = {
  totalWorkers: number;
  current: number;
  expired: number;
  expiring30: number;
  missing: number;
  failed: number;
  complianceRate: number;
};

export async function evaluateFitTest(body: {
  result: FitTestResult;
  performedAt?: string;
  expiresAt?: string | null;
  validityYears?: number;
}) {
  return fetchJson<{ evaluation: FitTestEvaluation; validityYears: number }>(
    `${LEGACY_BASE}/evaluate`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

export async function getWorkerFitTestSummary(workerId: number) {
  return fetchJson<FitTestSummary>(`${BASE}/worker/${workerId}/latest`);
}

export async function listWorkerFitTestHistory(workerId: number) {
  return fetchJson<FitTestRun[]>(`${BASE}/worker/${workerId}/history`);
}

/** @deprecated use listWorkerFitTestHistory */
export async function listWorkerFitTests(workerId: number) {
  return listWorkerFitTestHistory(workerId);
}

export async function runWorkerFitTest(
  workerId: number,
  body: {
    testType?: string;
    testMethod?: string;
    result: FitTestResult;
    notes?: string;
    performedAt?: string;
    expiresAt?: string | null;
    evidenceFilesJson?: unknown;
    validityYears?: number;
    tenantId?: number;
  },
) {
  return fetchJson<{ run: FitTestRun; evaluation: FitTestEvaluation }>(
    `${BASE}/worker/${workerId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
  );
}

/** @deprecated use runWorkerFitTest */
export async function recordWorkerFitTest(
  workerId: number,
  body: Parameters<typeof runWorkerFitTest>[1],
) {
  const out = await runWorkerFitTest(workerId, body);
  return { record: out.run, evaluation: out.evaluation };
}

export function fitTestPdfUrl(workerId: number) {
  return `${BASE}/worker/${workerId}/export.pdf`;
}

export async function downloadFitTestPdf(workerId: number) {
  const token = await getAccessToken();
  const res = await fetch(fitTestPdfUrl(workerId), {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("PDF export failed");
  return res.blob();
}

export function fitTestStatusTone(
  status: string,
): "success" | "warning" | "danger" | "neutral" {
  const normalized = status.toUpperCase();
  if (normalized === "PASS") return "success";
  if (normalized === "EXPIRED" || normalized === "FAIL") return "danger";
  if (normalized === "CONDITIONAL") return "warning";
  return "neutral";
}

export function formatFitTestDate(iso?: string | null) {
  if (!iso) return null;
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleDateString();
}

/** @deprecated use FitTestRun */
export type FitTestRecord = FitTestRun;

/** @deprecated use FitTestResult */
export type FitTestOutcome = FitTestResult;
