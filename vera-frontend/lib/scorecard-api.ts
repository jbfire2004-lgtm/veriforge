/**
 * Safety scorecard client → `/api/scorecard/*` → SaaS
 */

import { getVeriHubSession } from "@/lib/verihub-org-api";
import { getHiringClientSession } from "@/lib/hiring-client-api";

function pickToken(prefer: "org" | "hiring" | "any" = "any"): string | null {
  const org = getVeriHubSession()?.accessToken;
  const hc = getHiringClientSession()?.accessToken;
  if (prefer === "org") return org ?? null;
  if (prefer === "hiring") return hc ?? null;
  return org ?? hc ?? null;
}

async function scorecardFetch<T>(
  path: string,
  init: RequestInit = {},
  prefer: "org" | "hiring" | "any" = "any",
): Promise<T> {
  const token = pickToken(prefer);
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`/api/scorecard/${path.replace(/^\//, "")}`, {
    ...init,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.error === "string"
        ? data.error
        : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export type ComplianceBreakdownEntry = {
  bucket: string;
  weight: number;
  artifactId: string | null;
  rules?: Record<string, number>;
};

export type ScorecardView = {
  orgId: string;
  organization: { id: string; name: string; slug: string; industry?: string | null };
  complianceScore: number;
  complianceBreakdown: {
    base: number;
    required: Record<string, ComplianceBreakdownEntry>;
    customDelta: number;
    complianceDelta: number;
    weights: Record<string, Record<string, number>>;
    calculatedAt: string;
  };
  overallScore: number;
  globalScore?: number;
  projectScores?: Array<Record<string, unknown>>;
  calculatedAt: string;
};

export async function getSafetyScorecard(orgId: string) {
  return scorecardFetch<ScorecardView>(orgId, {}, "any");
}

export async function recalculateSafetyScorecard(orgId?: string) {
  const id = orgId ?? getVeriHubSession()?.orgId;
  if (!id) throw new Error("Not signed in to VeriHub");
  return scorecardFetch<ScorecardView>(
    "recalculate",
    {
      method: "POST",
      body: JSON.stringify({ orgId: id }),
    },
    "org",
  );
}

export function bucketLabel(bucket: string) {
  return bucket.replace(/_/g, " ");
}

export function weightClass(weight: number) {
  if (weight > 0) return "text-emerald-700";
  if (weight < 0) return "text-red-600";
  return "text-zinc-500";
}
