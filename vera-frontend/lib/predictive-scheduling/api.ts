import type { PredictiveSchedulingReport, SchedulingContextInput } from "@vera/predictive-scheduling";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function optimizeScheduling(
  companyId: number,
  projectId?: number,
  unionHallId?: number
) {
  return apiAxiosPost<PredictiveSchedulingReport>("/api/v1/scheduling/optimize", null, {
    params: { companyId, projectId, unionHallId },
  });
}

export async function fetchSchedulingDashboard() {
  return apiAxiosGet("/api/v1/scheduling/dashboard");
}

export async function fetchSchedulingReport() {
  return apiAxiosGet<PredictiveSchedulingReport>("/api/v1/scheduling/report");
}

export async function optimizeSchedulingOffline(ctx: SchedulingContextInput) {
  return apiAxiosPost<PredictiveSchedulingReport>(
    "/api/v1/scheduling/offline/optimize",
    ctx
  );
}
