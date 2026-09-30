/**
 * Compliance engine client → `/api/compliance/*` → SaaS
 * Uses VeriHub org JWT and/or hiring-client JWT from localStorage.
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

async function complianceFetch<T = unknown>(
  path: string,
  init: RequestInit = {},
  prefer: "org" | "hiring" | "any" = "any",
): Promise<T> {
  const token = pickToken(prefer);
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");
  if (token) headers.set("Authorization", `Bearer ${token}`);
  const res = await fetch(`/api/compliance/${path.replace(/^\//, "")}`, {
    ...init,
    headers,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message =
      typeof data?.message === "string"
        ? data.message
        : typeof data?.error === "string"
          ? data.error
          : `Request failed (${res.status})`;
    throw new Error(message);
  }
  return data as T;
}

export type ComplianceArtifact = {
  id: string;
  type: string;
  label: string | null;
  fileUrl: string;
  expiryDate: string | null;
  status: string;
  reviewNotes?: string | null;
};

export async function uploadComplianceArtifact(body: {
  type: string;
  fileUrl: string;
  expiryDate?: string | null;
  label?: string;
}) {
  return complianceFetch<{ artifact: ComplianceArtifact }>(
    "upload",
    { method: "POST", body: JSON.stringify(body) },
    "org",
  );
}

export async function getOrgCompliance(orgId: string) {
  return complianceFetch<{
    organization: { id: string; name: string; slug: string };
    artifacts: ComplianceArtifact[];
    scorecard: {
      complianceScore: number;
      overallScore: number;
      complianceBreakdown: unknown;
    };
    reminders: {
      artifactId: string;
      type: string;
      kind: string;
      expiryDate: string | null;
    }[];
    requiredTypes: string[];
  }>(orgId, {}, "any");
}

export async function listPendingCompliance() {
  return complianceFetch<{
    items: (ComplianceArtifact & {
      organization: { id: string; name: string; slug: string };
    })[];
    total: number;
  }>("pending", {}, "hiring");
}

export async function reviewComplianceArtifact(
  id: string,
  decision: "approve" | "reject",
  notes?: string,
) {
  return complianceFetch(`${id}/review`, {
    method: "POST",
    body: JSON.stringify({ decision, notes }),
  }, "hiring");
}

export async function updateComplianceArtifact(
  id: string,
  body: Record<string, unknown>,
) {
  return complianceFetch(`${id}/update`, {
    method: "POST",
    body: JSON.stringify(body),
  }, "org");
}
