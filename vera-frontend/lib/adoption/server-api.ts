import "server-only";

import type {
  AdoptionMapCompany,
  FeedbackRequest,
  GrowthStatsResponse,
  ModuleUsageResponse,
} from "@vera/api-contract";
import { adminServerGet } from "@/lib/admin-server-api";

const ADMIN = "/api/v1/admin";

export function adminFetchAdoptionMap() {
  return adminServerGet<AdoptionMapCompany[]>(`${ADMIN}/adoption-map`);
}

export function adminFetchGrowthStats() {
  return adminServerGet<GrowthStatsResponse>(`${ADMIN}/growth-stats`);
}

export function adminFetchModuleUsage() {
  return adminServerGet<ModuleUsageResponse>(`${ADMIN}/module-usage`);
}

export function adminFetchFeedback() {
  return adminServerGet<FeedbackRequest[]>(`${ADMIN}/feedback`);
}
