import type { IndustryContextInput, IndustryEcosystemReport } from "@vera/industry-ecosystem";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function orchestrateIndustryEcosystem(companyId?: number) {
  return apiAxiosPost<IndustryEcosystemReport>("/api/v1/industry-ecosystem/orchestrate", null, {
    params: companyId ? { companyId } : undefined,
  });
}

export async function fetchIndustryDashboard() {
  return apiAxiosGet("/api/v1/industry-ecosystem/dashboard");
}

export async function fetchIndustryReport() {
  return apiAxiosGet<IndustryEcosystemReport>("/api/v1/industry-ecosystem/report");
}

export async function orchestrateIndustryOffline(ctx: IndustryContextInput) {
  return apiAxiosPost<IndustryEcosystemReport>(
    "/api/v1/industry-ecosystem/offline/orchestrate",
    ctx
  );
}
