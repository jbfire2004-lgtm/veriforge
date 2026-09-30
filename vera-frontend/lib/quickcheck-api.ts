/**
 * QuickCheck client → `/api/quickcheck` → SaaS.
 */
import { getVeriHubSession } from "@/lib/verihub-org-api";
import { getHiringClientSession } from "@/lib/hiring-client-api";

export type QuickCheckRiskLevel = "green" | "yellow" | "red";

export type QuickCheckMissingItem = {
  code: string;
  label: string;
  severity: "critical" | "major" | "minor";
  source: "documents" | "audits" | "pvs" | "insurance";
};

export type QuickCheckResult = {
  runId: string;
  contractorId: string;
  complianceScore: number;
  riskLevel: QuickCheckRiskLevel;
  riskLabel: string;
  riskDescription: string;
  missingItems: QuickCheckMissingItem[];
  breakdown: {
    documentsScore: number;
    auditsScore: number;
    insuranceScore: number;
    pvsScore: number;
    insuranceStatus: string;
    weights: {
      documents: number;
      audits: number;
      insurance: number;
      pvs: number;
    };
    documentCount: number;
    auditCount: number;
    pvsCount: number;
  };
  checks: { id: string; label: string; ok: boolean; detail: string }[];
  source: string;
  generatedAt: string;
};

export type QuickCheckRunRow = {
  id: string;
  contractorId: string;
  complianceScore: number;
  riskLevel: QuickCheckRiskLevel;
  source: string;
  createdAt: string;
};

function authHeader(): string | null {
  const org = getVeriHubSession();
  if (org?.accessToken) return `Bearer ${org.accessToken}`;
  const hc = getHiringClientSession();
  if (hc?.accessToken) return `Bearer ${hc.accessToken}`;
  return null;
}

async function qcFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const auth = authHeader();
  if (auth) headers.set("Authorization", auth);
  const res = await fetch(`/api/quickcheck${path}`, { ...init, headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(
      typeof data.error === "string"
        ? data.error
        : `Request failed (${res.status})`,
    );
  }
  return data as T;
}

export async function runQuickCheck(
  contractorId: string,
  source: string = "api",
) {
  return qcFetch<QuickCheckResult>("/", {
    method: "POST",
    body: JSON.stringify({ contractorId, source }),
  });
}

export async function fetchQuickCheck(
  contractorId: string,
  source: string = "page",
) {
  const qs = new URLSearchParams({ source });
  return qcFetch<QuickCheckResult>(`/${contractorId}?${qs}`);
}

export async function listQuickCheckRuns(contractorId: string) {
  return qcFetch<{ items: QuickCheckRunRow[]; total: number }>(
    `/${contractorId}/runs`,
  );
}

export async function fetchQuickCheckAnalytics(contractorId: string) {
  return qcFetch<{
    runCount: number;
    avgScore: number | null;
    byRisk: { green: number; yellow: number; red: number };
    trend: { at: string; score: number; riskLevel: QuickCheckRiskLevel }[];
  }>(`/${contractorId}/analytics`);
}
