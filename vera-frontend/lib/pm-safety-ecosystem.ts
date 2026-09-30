import { apiFetchJson } from "./api-client";

const BASE = `/api/v1/pm/safety-ecosystem`;

export type SafetyEcosystemStatus = {
  version: string;
  integration: string;
  eventBus: string;
  pillars: Array<{ id: string; label: string }>;
  modules: Array<{
    id: string;
    api: string;
    ui: string;
    capabilities: string[];
  }>;
  offlineSyncTypes: string[];
};

export async function getSafetyEcosystemStatus() {
  return apiFetchJson<SafetyEcosystemStatus>(`${BASE}/status`);
}
