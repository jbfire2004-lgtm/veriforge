import type { GlobalNetworkReport, NetworkContextInput } from "@vera/global-network";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function analyzeGlobalNetwork(companyId?: number) {
  return apiAxiosPost<GlobalNetworkReport>("/api/v1/global-network/analyze", null, {
    params: companyId ? { companyId } : undefined,
  });
}

export async function fetchGlobalNetworkDashboard() {
  return apiAxiosGet("/api/v1/global-network/dashboard");
}

export async function fetchGlobalNetworkReport() {
  return apiAxiosGet<GlobalNetworkReport>("/api/v1/global-network/report");
}

export async function analyzeGlobalNetworkOffline(ctx: NetworkContextInput) {
  return apiAxiosPost<GlobalNetworkReport>("/api/v1/global-network/offline/analyze", ctx);
}
