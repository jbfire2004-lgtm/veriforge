import type {
  ContractorComplianceEngineInput,
  ContractorComplianceEngineOutput,
} from '../pm-contractor-portal/contractor-compliance-engine.types';

export type ContractorVerificationFinalStatus =
  | 'Approved'
  | 'Conditionally Approved'
  | 'Rejected';

/** Primary verifier output — always returned as structured JSON. */
export type ContractorVerificationJson = {
  authenticity_score: number;
  compliance_score: number;
  risk_flags: string[];
  missing_items: string[];
  recommended_actions: string[];
  final_status: ContractorVerificationFinalStatus;
};

export type ContractorVerificationAiInput = {
  membershipId?: string;
  engineInput?: ContractorComplianceEngineInput;
};

export type DocumentAuthenticityDetail = {
  document: string;
  score: number;
  signals: string[];
};

export type ContractorVerificationAiResult = ContractorVerificationJson & {
  verification_id: string;
  source: 'rule_engine';
  model: string | null;
  expired_items: string[];
  inconsistent_data_flags: string[];
  pm_summary: string;
  verifier_guidance: string[];
  required_documents: string[];
  engine_detail: ContractorComplianceEngineOutput;
};
