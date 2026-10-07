import type { ContractorComplianceEngineInput } from '../pm-contractor-portal/contractor-compliance-engine.types';

export type ClientPrequalificationFinalStatus =
  | 'Approved'
  | 'Conditional'
  | 'Rejected';

/** Primary prequalification output — structured JSON for clients and PM. */
export type ClientPrequalificationJson = {
  company_score: number;
  risk_flags: string[];
  missing_items: string[];
  final_status: ClientPrequalificationFinalStatus;
};

export type ClientPrequalificationAiInput = {
  membershipId?: string;
  contractorCompanyId?: number;
  primeCompanyId?: number;
  projectId?: number;
  engineInput?: ContractorComplianceEngineInput;
};

export type PrequalificationDimensionScores = {
  hse_metrics: number;
  insurance: number;
  wcb_wsib: number;
  safety_program: number;
};

export type PrequalificationReportSection = {
  title: string;
  score: number;
  status: 'pass' | 'warning' | 'fail';
  findings: string[];
};

export type ShareablePrequalificationReport = {
  report_id: string;
  company_name: string;
  generated_at: string;
  company_score: number;
  final_status: ClientPrequalificationFinalStatus;
  executive_summary: string;
  sections: {
    hse_metrics: PrequalificationReportSection;
    insurance: PrequalificationReportSection;
    wcb_wsib: PrequalificationReportSection;
    safety_program: PrequalificationReportSection;
  };
  risk_flags: string[];
  missing_items: string[];
  markdown: string;
  share_path: string;
};

export type ClientPrequalificationAiResult = ClientPrequalificationJson & {
  prequalification_id: string;
  source: 'rule_engine';
  model: null;
  dimension_scores: PrequalificationDimensionScores;
  spce_score?: number;
  report: ShareablePrequalificationReport;
  recommended_actions: string[];
};
