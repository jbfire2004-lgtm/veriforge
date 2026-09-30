import type { InterstellarReport } from "@vera/interstellar";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function expandInterstellar(companyId?: number) {
  return apiAxiosPost<InterstellarReport>("/api/v1/interstellar/expand", null, {
    params: companyId ? { companyId } : undefined,
  });
}

export async function fetchInterstellarDashboard() {
  return apiAxiosGet("/api/v1/interstellar/dashboard");
}

export async function fetchInterstellarReport() {
  return apiAxiosGet<InterstellarReport>("/api/v1/interstellar/report");
}
