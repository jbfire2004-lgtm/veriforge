import type {
  VeriPmAssetDashboard,
  VeriPmCompanyDashboard,
  VeriPmDrillResponse,
  VeriPmProjectDashboard,
} from "./types";

const BASE = "/api/v1/veripm-dashboard";

function qs(query: Record<string, string | number | undefined | null>) {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(query)) {
    if (v != null && v !== "") p.set(k, String(v));
  }
  const s = p.toString();
  return s ? `?${s}` : "";
}

async function getJson<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { Accept: "application/json", ...init?.headers },
  });
  if (!res.ok) {
    throw new Error((await res.text().catch(() => "")) || `VERIPM error (${res.status})`);
  }
  return (await res.json()) as T;
}

export function fetchPmCompanyDashboard(opts: { companyId?: number; projectId?: number } = {}) {
  return getJson<VeriPmCompanyDashboard>(`${BASE}/company${qs(opts)}`);
}

export function fetchPmProjectDashboard(projectId: number) {
  return getJson<VeriPmProjectDashboard>(`${BASE}/project${qs({ projectId })}`);
}

export function fetchPmAssetDashboard(assetId: string) {
  return getJson<VeriPmAssetDashboard>(`${BASE}/asset${qs({ assetId })}`);
}

export function fetchPmDrill(
  metricKey: string,
  opts: { projectId?: number; assetId?: string } = {},
) {
  return getJson<VeriPmDrillResponse>(
    `${BASE}/drill${qs({ metricKey, ...opts })}`,
  );
}

export function emitPmDashboardEvent(eventName: string) {
  return getJson<VeriPmCompanyDashboard>(`${BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName }),
  });
}

export function fetchPmAssets() {
  return getJson<{ items: Array<{ id: string; name: string }> }>(`${BASE}/assets`);
}

export type * from "./types";
export { getPmFormula, VERIPM_FORMULAS } from "./formulas";
