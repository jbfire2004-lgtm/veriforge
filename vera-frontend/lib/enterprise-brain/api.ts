import type { EnterpriseBrainReport } from "@vera/enterprise-brain";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function thinkEnterpriseBrain(
  companyId: number,
  projectId?: number,
  unionHallId?: number
) {
  return apiAxiosPost<EnterpriseBrainReport>("/api/v1/brain/think", null, {
    params: { companyId, projectId, unionHallId },
  });
}

export async function fetchBrainDashboard() {
  return apiAxiosGet("/api/v1/brain/dashboard");
}

export async function fetchBrainReport() {
  return apiAxiosGet<EnterpriseBrainReport>("/api/v1/brain/report");
}
