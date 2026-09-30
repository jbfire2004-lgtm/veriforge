import { apiGetSafe, type ApiGetResult } from "@/lib/api";
import type { DashboardWidgetsBundle } from "./types";

const BASE = "/api/v1/dashboard/widgets";

export async function loadDashboardWidgetsBundle(filters?: {
  companyId?: number;
  unionHallId?: number;
}): Promise<ApiGetResult<DashboardWidgetsBundle>> {
  const params = new URLSearchParams();
  if (filters?.companyId != null) params.set("companyId", String(filters.companyId));
  if (filters?.unionHallId != null) params.set("unionHallId", String(filters.unionHallId));
  const q = params.toString();
  return apiGetSafe<DashboardWidgetsBundle>(`${BASE}${q ? `?${q}` : ""}`);
}

/** Default polling interval for real-time dashboard refresh (ms). */
export const DASHBOARD_REFRESH_INTERVAL_MS = 60_000;
