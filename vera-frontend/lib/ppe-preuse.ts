import { apiFetchJson } from "./api-client";
import type { PpePreUseItemSubmission } from "./ppe-preuse-checklist";

const BASE = "/api/v1/pm/ppe-preuse";

export type PpePreUseSummary = {
  id: string;
  projectId: number;
  companyId: number;
  workerUserId: number;
  inspectedAt: string;
  locationNote?: string | null;
  taskType?: string | null;
  overallResult: "pass" | "fail" | "conditional";
  items: PpePreUseItemSubmission[];
  deficiencies?: string | null;
  removedFromService: boolean;
  acknowledgedSafeToWork: boolean;
  project?: { id: number; name: string };
  company?: { id: number; name: string };
  workerUser?: { id: number; username: string; email?: string | null };
  worker?: { id: number; firstName: string; lastName: string } | null;
};

export async function fetchPpePreUseList(filters?: {
  projectId?: number;
  companyId?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.projectId) params.set("projectId", String(filters.projectId));
  if (filters?.companyId) params.set("companyId", String(filters.companyId));
  const q = params.toString() ? `?${params.toString()}` : "";
  return apiFetchJson<PpePreUseSummary[]>(`${BASE}${q}`);
}

export async function fetchPpePreUse(id: string) {
  return apiFetchJson<PpePreUseSummary>(`${BASE}/${id}`);
}

export async function createPpePreUse(body: {
  projectId: number;
  companyId?: number;
  workerId?: number;
  locationNote?: string;
  taskType?: string;
  items: PpePreUseItemSubmission[];
  deficiencies?: string;
  removedFromService?: boolean;
  acknowledgedSafeToWork?: boolean;
}) {
  return apiFetchJson<PpePreUseSummary>(BASE, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
