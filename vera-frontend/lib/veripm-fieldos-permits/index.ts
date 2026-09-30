import { apiFetchJson } from "@/lib/api-client";
import type { VeripmFieldOsPermit, VeripmPermitStatus } from "./types";

const BASE = "/api/v1/pm/fieldos-permits";
const PREVIEW = "/api/v1/veripm-fieldos-permits";

async function tryNest<T>(fn: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await fn();
  } catch {
    return fallback();
  }
}

export function fetchFieldOsPermits(opts?: {
  projectId?: number;
  companyId?: number;
  status?: VeripmPermitStatus;
}) {
  const q = new URLSearchParams();
  if (opts?.projectId) q.set("projectId", String(opts.projectId));
  if (opts?.companyId) q.set("companyId", String(opts.companyId));
  if (opts?.status) q.set("status", opts.status);
  const qs = q.toString() ? `?${q}` : "";
  return tryNest(
    () =>
      apiFetchJson<{
        permits: VeripmFieldOsPermit[];
        total: number;
        countsByStatus: Record<string, number>;
        dashboardRevision: number;
      }>(`${BASE}${qs}`),
    () => fetch(`${PREVIEW}${qs}`).then((r) => r.json()),
  );
}

export function fetchFieldOsPermit(permitId: string) {
  return tryNest(
    () => apiFetchJson(`${BASE}/${permitId}`),
    () => fetch(`${PREVIEW}/${permitId}`).then((r) => r.json()),
  );
}

export function fetchPermitMetrics(opts?: { projectId?: number; companyId?: number }) {
  const q = new URLSearchParams();
  if (opts?.projectId) q.set("projectId", String(opts.projectId));
  if (opts?.companyId) q.set("companyId", String(opts.companyId));
  const qs = q.toString() ? `?${q}` : "";
  return tryNest(
    () => apiFetchJson(`${BASE}/metrics${qs}`),
    () => fetch(`${PREVIEW}/metrics${qs}`).then((r) => r.json()),
  );
}

export function createFieldOsPermit(body: {
  projectId: number;
  companyId?: number;
  permitType: string;
  title?: string;
  jobId?: string;
  assetId?: string;
  contractorId?: number;
  workOrderIds?: string[];
}) {
  return tryNest(
    () =>
      apiFetchJson<VeripmFieldOsPermit>(BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    () =>
      fetch(PREVIEW, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
  );
}

export function simulateFieldOsWebhook(body: {
  task_id: string;
  external_permit_id?: string;
  status: string;
  signatures?: Array<{ role: string; name?: string; signedAt?: string }>;
  photos?: Array<{ id: string; url: string; caption?: string }>;
  notes?: string[];
  hazard_controls_applied?: string[];
  completed_at?: string | null;
}) {
  return tryNest(
    () =>
      apiFetchJson(`${BASE}/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }),
    () =>
      fetch(`${PREVIEW}/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }).then((r) => r.json()),
  );
}

export type * from "./types";
export {
  listPermits,
  getPermit,
  createPermit,
  applyWebhook,
  permitMetrics,
  projectPermitLoad,
  drillPermits,
  getPermitRevision,
  countByStatus,
} from "./store";
export { computePermitCssDelta, FIELDOS_PERMIT_FIELD_MAP } from "./css-impact";
