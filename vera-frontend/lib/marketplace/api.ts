import type { MarketplaceContextInput, MarketplaceReport } from "@vera/marketplace";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export async function runMarketplace(companyId?: number) {
  return apiAxiosPost<MarketplaceReport>("/api/v1/marketplace/run", null, {
    params: companyId ? { companyId } : undefined,
  });
}

export async function fetchMarketplaceDashboard() {
  return apiAxiosGet("/api/v1/marketplace/dashboard");
}

export async function fetchMarketplaceReport() {
  return apiAxiosGet<MarketplaceReport>("/api/v1/marketplace/report");
}

export async function runMarketplaceOffline(ctx: MarketplaceContextInput) {
  return apiAxiosPost<MarketplaceReport>("/api/v1/marketplace/offline/run", ctx);
}
