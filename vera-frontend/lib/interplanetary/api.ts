import type { InterplanetaryContextInput, InterplanetaryReport } from "@vera/interplanetary";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function operateInterplanetary(companyId?: number) {
  return apiAxiosPost<InterplanetaryReport>("/api/v1/interplanetary/operate", null, {
    params: companyId ? { companyId } : undefined,
  });
}

export async function fetchInterplanetaryDashboard() {
  return apiAxiosGet("/api/v1/interplanetary/dashboard");
}

export async function fetchInterplanetaryReport() {
  return apiAxiosGet<InterplanetaryReport>("/api/v1/interplanetary/report");
}

export async function operateInterplanetaryOffline(ctx: InterplanetaryContextInput) {
  return apiAxiosPost<InterplanetaryReport>("/api/v1/interplanetary/offline/operate", ctx);
}
