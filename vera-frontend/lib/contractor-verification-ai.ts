import { apiFetchJson } from "./api-client";

/** Structured verifier output from the AI Contractor Verification Engine. */
export type ContractorVerificationJson = {
  authenticity_score: number;
  compliance_score: number;
  risk_flags: string[];
  missing_items: string[];
  recommended_actions: string[];
  final_status: "Approved" | "Conditionally Approved" | "Rejected";
};

export type ContractorVerificationResult = ContractorVerificationJson & {
  verification_id: string;
  source: string;
  model: string | null;
  expired_items: string[];
  inconsistent_data_flags: string[];
  pm_summary: string;
  verifier_guidance: string[];
  required_documents: string[];
  engine_detail: import("./pm-contractor-portal").ContractorComplianceEngineOutput;
};

export async function verifyContractorMembership(
  membershipId: string,
  workScope?: import("./pm-contractor-portal").ContractorComplianceEngineInput["work_scope"],
) {
  return apiFetchJson<ContractorVerificationResult>(
    `/api/ai/contractor/verify/membership/${membershipId}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(workScope ? { work_scope: workScope } : {}),
    },
  );
}

export async function verifyContractorPackage(
  body: {
    membershipId?: string;
    engineInput?: import("./pm-contractor-portal").ContractorComplianceEngineInput;
    work_scope?: import("./pm-contractor-portal").ContractorComplianceEngineInput["work_scope"];
  },
) {
  return apiFetchJson<ContractorVerificationResult>(`/api/ai/contractor/verify`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
