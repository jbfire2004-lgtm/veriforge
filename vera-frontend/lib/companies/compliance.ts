import { apiGet } from "@/lib/api";

export type CompanyComplianceOverallStatus =
  | "compliant"
  | "at_risk"
  | "non_compliant";

export type CompanyComplianceEngineStatus = "pass" | "fail" | "warning";

export type CompanyComplianceFlagType = "critical" | "major" | "minor";

export type CompanyComplianceResponse = {
  companyId: string;
  overallStatus: CompanyComplianceOverallStatus;
  lastEvaluatedAt: string;
  engines: Array<{
    id: string;
    name: string;
    status: CompanyComplianceEngineStatus;
    score: number;
    weight: number;
    category: string;
    details?: string;
  }>;
  flags: Array<{
    id: string;
    type: CompanyComplianceFlagType;
    label: string;
    description?: string;
    createdAt: string;
  }>;
};

export type CompanyScoreResponse = {
  companyId: string;
  isnStyleScore: number;
  grade: "A" | "B" | "C" | "D" | "F";
  trend: "improving" | "declining" | "stable";
  lastUpdatedAt: string;
  breakdown: Array<{
    id: string;
    label: string;
    score: number;
    weight: number;
    category: string;
    rationale?: string;
  }>;
};

/** Full compliance engines package (ISN-style overview). */
export async function getCompanyCompliance(
  companyId: string,
): Promise<CompanyComplianceResponse> {
  return apiGet<CompanyComplianceResponse>(
    `/companies/${companyId}/compliance/overview`,
  );
}

/** ISN-style company score with weighted breakdown. */
export async function getCompanyScore(
  companyId: string,
): Promise<CompanyScoreResponse> {
  return apiGet<CompanyScoreResponse>(`/companies/${companyId}/score`);
}
