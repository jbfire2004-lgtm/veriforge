import { apiFetchJson } from "./api-client";

export type ClientPrequalificationFinalStatus = "Approved" | "Conditional" | "Rejected";

export type ClientPrequalificationJson = {
  company_score: number;
  risk_flags: string[];
  missing_items: string[];
  final_status: ClientPrequalificationFinalStatus;
};

export type ShareablePrequalificationReport = {
  report_id: string;
  company_name: string;
  generated_at: string;
  company_score: number;
  final_status: ClientPrequalificationFinalStatus;
  executive_summary: string;
  sections: {
    hse_metrics: { title: string; score: number; status: string; findings: string[] };
    insurance: { title: string; score: number; status: string; findings: string[] };
    wcb_wsib: { title: string; score: number; status: string; findings: string[] };
    safety_program: { title: string; score: number; status: string; findings: string[] };
  };
  risk_flags: string[];
  missing_items: string[];
  markdown: string;
  share_path: string;
};

export type ClientPrequalificationResult = ClientPrequalificationJson & {
  prequalification_id: string;
  source: "rule_engine";
  model: null;
  dimension_scores: {
    hse_metrics: number;
    insurance: number;
    wcb_wsib: number;
    safety_program: number;
  };
  spce_score?: number;
  report: ShareablePrequalificationReport;
  recommended_actions: string[];
};

export async function evaluateClientPrequalificationMembership(membershipId: string) {
  return apiFetchJson<ClientPrequalificationResult>(
    `/api/ai/client-prequalification/evaluate/membership/${membershipId}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" },
  );
}

export async function evaluateClientPrequalification(body: {
  membershipId?: string;
  contractorCompanyId?: number;
  primeCompanyId?: number;
  projectId?: number;
  engineInput?: import("./pm-contractor-portal").ContractorComplianceEngineInput;
}) {
  return apiFetchJson<ClientPrequalificationResult>("/api/ai/client-prequalification/evaluate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}
