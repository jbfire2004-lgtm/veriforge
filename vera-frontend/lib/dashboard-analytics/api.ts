/**
 * VERICore Dashboard API client (preview routes under /api/v1/dashboard-analytics).
 */

import type {
  AnalyticsMetric,
  RevisionPayload,
  ScopeType,
  UniversalDrillResponse,
} from "./types";

const BASE = "/api/v1/dashboard-analytics";

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
    throw new Error((await res.text().catch(() => "")) || `Analytics error (${res.status})`);
  }
  return (await res.json()) as T;
}

export function fetchAnalyticsRevision() {
  return getJson<RevisionPayload>(`${BASE}/revision`);
}

export function fetchMetricCatalog(domain?: string) {
  return getJson<{ items: typeof import("./catalog").METRIC_CATALOG }>(
    `${BASE}/catalog${qs({ domain })}`,
  );
}

export function fetchScopeMetrics(scopeType: ScopeType, scopeId: string, domain?: string) {
  return getJson<{ items: AnalyticsMetric[] }>(
    `${BASE}/metrics${qs({ scopeType, scopeId, domain })}`,
  );
}

export function fetchUniversalDrill(opts: {
  metricId: string;
  scopeType: ScopeType;
  scopeId: string;
  domain?: string;
}) {
  return getJson<UniversalDrillResponse>(
    `${BASE}/drill${qs(opts)}`,
  );
}

export function emitAnalyticsApiEvent(eventName: string, meta?: Record<string, string>) {
  return getJson<RevisionPayload>(`${BASE}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ eventName, ...meta }),
  });
}
