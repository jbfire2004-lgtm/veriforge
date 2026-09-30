import type { Session } from "next-auth";
import { apiFetchJson } from "@/lib/api-client";
import type { ScoredHazardSuggestion } from "@/lib/hazard-control-catalog";

const HAZARDS_BASE = "/api/v1/hazards";

export type AiHazardIdentifyResult = {
  source: "stub";
  model: string | null;
  message: string;
  hazards: ScoredHazardSuggestion[];
  matchedTaskProfiles: string[];
  warnings: string[];
};

/** AI-powered hazard identification (stub — rule engine until LLM is configured). */
export async function identifyHazardsWithAi(
  companyId: number,
  projectId: number | undefined,
  body: {
    taskDescription: string;
    workScope?: string;
    locationNote?: string;
    equipment?: string[];
  },
  session?: Session | null,
): Promise<AiHazardIdentifyResult> {
  const q = new URLSearchParams({ companyId: String(companyId) });
  if (projectId != null) q.set("projectId", String(projectId));
  return apiFetchJson<AiHazardIdentifyResult>(`${HAZARDS_BASE}/ai-identify?${q}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    session,
  });
}
