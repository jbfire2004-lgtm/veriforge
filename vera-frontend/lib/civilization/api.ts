import type { CivilizationContextInput, CivilizationReport } from "@vera/civilization";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function governCivilization(companyId?: number) {
  return apiAxiosPost<CivilizationReport>("/api/v1/civilization/govern", null, {
    params: companyId ? { companyId } : undefined,
  });
}

export async function fetchCivilizationDashboard() {
  return apiAxiosGet("/api/v1/civilization/dashboard");
}

export async function fetchCivilizationReport() {
  return apiAxiosGet<CivilizationReport>("/api/v1/civilization/report");
}

export async function governCivilizationOffline(ctx: CivilizationContextInput) {
  return apiAxiosPost<CivilizationReport>("/api/v1/civilization/offline/govern", ctx);
}
