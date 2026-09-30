/**
 * Analytics Dashboard client → `/api/analytics` → SaaS.
 */
import { getVeriHubSession } from "@/lib/verihub-org-api";
import { getHiringClientSession } from "@/lib/hiring-client-api";

export type AnalyticsScope = "contractor" | "client" | "admin";

export type AnalyticsKpis = {
  contractorCount: number;
  avgComplianceScore: number;
  avgDocumentsScore: number;
  avgAuditsScore: number;
  avgInsuranceScore: number;
  avgPvsScore: number;
  documentsTotal: number;
  documentsExpired: number;
  documentsExpiring: number;
  auditsInRange: number;
  openFindings: number;
  openCorrectiveActions: number;
  pvsVerified: number;
  pvsTotal: number;
  pvsCoveragePct: number;
  quickCheckRuns: number;
  riskGreen: number;
  riskYellow: number;
  riskRed: number;
};

export type AnalyticsDashboard = {
  scope: AnalyticsScope;
  range: { from: string; to: string };
  weights: {
    documents: number;
    audits: number;
    insurance: number;
    pvs: number;
  };
  kpis: AnalyticsKpis;
  charts: {
    documentExpiry: {
      labels: string[];
      expired: number[];
      expiring: number[];
      valid: number[];
    };
    auditTrends: {
      labels: string[];
      avgScore: number[];
      count: number[];
    };
    pvsCoverage: {
      labels: string[];
      verified: number[];
      other: number[];
    };
    insuranceCompliance: { labels: string[]; values: number[] };
    quickCheckRisk: { labels: string[]; values: number[] };
    complianceBreakdown: { key: string; label: string; value: number }[];
    complianceHistogram?: { labels: string[]; values: number[] };
  };
  contractors: {
    items: {
      contractorId: string;
      legalName: string;
      tradeName: string | null;
      complianceScore: number;
      insuranceStatus: string;
      safetyRating: number;
      region: string | null;
    }[];
    total: number;
    skip: number;
    take: number;
    page?: number;
    pageCount?: number;
  };
  recentQuickChecks: {
    id: string;
    contractorId: string;
    complianceScore: number;
    riskLevel: string;
    source: string;
    createdAt: string;
  }[];
};

function authHeader(): string | null {
  const org = getVeriHubSession();
  if (org?.accessToken) return `Bearer ${org.accessToken}`;
  const hc = getHiringClientSession();
  if (hc?.accessToken) return `Bearer ${hc.accessToken}`;
  return null;
}

async function analyticsFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  const auth = authHeader();
  if (auth) headers.set("Authorization", auth);
  const res = await fetch(`/api/analytics${path}`, { ...init, headers });
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

export async function fetchAnalyticsDashboard(params: {
  scope?: AnalyticsScope;
  from?: string;
  to?: string;
  skip?: number;
  take?: number;
  region?: string;
  q?: string;
  contractorId?: string;
  /** Prefer role-specific path */
  endpoint?: "dashboard" | "contractor" | "client" | "admin";
}) {
  const ep = params.endpoint || "dashboard";
  const qs = new URLSearchParams();
  if (params.scope && ep === "dashboard") qs.set("scope", params.scope);
  if (params.from) qs.set("from", params.from);
  if (params.to) qs.set("to", params.to);
  if (params.skip != null) qs.set("skip", String(params.skip));
  if (params.take != null) qs.set("take", String(params.take));
  if (params.region) qs.set("region", params.region);
  if (params.q) qs.set("q", params.q);
  if (params.contractorId) qs.set("contractorId", params.contractorId);
  const q = qs.toString();
  return analyticsFetch<AnalyticsDashboard>(`/${ep}${q ? `?${q}` : ""}`);
}
