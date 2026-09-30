import type { IntelligenceBundle, NlpResponse } from "@vera/intelligence";
import { apiAxiosGet, apiAxiosPost } from "@/lib/api-axios";

export type IntelligenceQuery = {
  companyId?: number;
  projectId?: number;
  workerId?: number;
  equipmentId?: number;
};

export async function fetchIntelligenceBundle(
  query: IntelligenceQuery
): Promise<IntelligenceBundle & { scope?: IntelligenceQuery }> {
  return apiAxiosGet<IntelligenceBundle & { scope?: IntelligenceQuery }>(
    "/api/v1/intelligence/bundle",
    { params: query }
  );
}

export async function askVera(question: string, companyId?: number): Promise<NlpResponse> {
  return apiAxiosPost<NlpResponse>("/api/v1/intelligence/ask", { question, companyId });
}
