export type ContractorProfile = {
  name?: string;
  industry?: string;
  size?: 'small' | 'medium' | 'large' | string;
  regions?: string[];
  work_types?: string[];
};

export type SafetyStats = {
  TRIF?: number;
  LTIF?: number;
  DART?: number;
  recordable_rate?: number;
  year?: number;
};

export type SubmittedDocument = {
  type: string;
  name?: string;
  status?: 'current' | 'expired' | 'draft' | 'partial' | string;
  expires_at?: string;
  notes?: string;
};

export type AuditResult = {
  date?: string;
  score?: number;
  findings?: string[];
  auditor?: string;
};

export type IncidentHistoryItem = {
  date?: string;
  type?: string;
  severity?: string;
  summary?: string;
};

export type WorkScope = {
  tasks?: string[];
  risk_profile?: string;
  duration?: string;
  location?: string;
};

export type OrgRequirement = {
  code: string;
  label: string;
  category?: string;
  required?: boolean;
};

export type ContractorComplianceEngineInput = {
  contractor_profile: ContractorProfile;
  safety_stats?: SafetyStats;
  certifications_and_programs?: string[];
  submitted_documents?: SubmittedDocument[];
  audit_results?: AuditResult[];
  incident_history?: IncidentHistoryItem[];
  client_specific_requirements?: string[];
  org_minimum_requirements?: OrgRequirement[];
  work_scope: WorkScope;
  primeCompanyId?: number;
  contractorCompanyId?: number;
  projectId?: number;
};

export type ContractorRiskProfile = {
  inherent_risk_level: 'low' | 'medium' | 'high' | 'critical';
  risk_score: number;
  risk_factors: string[];
  sif_exposure: boolean;
  work_scope_summary: string;
};

export type ComplianceGap = {
  requirement: string;
  status: 'missing' | 'weak' | 'expired' | 'partial';
  category: string;
  priority: 'high' | 'medium' | 'low';
  remediation: string;
};

export type PerformanceAssessment = {
  stats_rating: 'strong' | 'acceptable' | 'concerning' | 'unknown';
  stats_notes: string;
  incident_trend: 'improving' | 'stable' | 'deteriorating' | 'unknown';
  incident_notes: string;
  audit_rating: 'strong' | 'acceptable' | 'concerning' | 'unknown';
  audit_notes: string;
  overall_performance: 'strong' | 'acceptable' | 'concerning' | 'unknown';
};

export type ContractorComplianceCondition = {
  type: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
};

export type ContractorComplianceEngineOutput = {
  risk_profile: ContractorRiskProfile;
  compliance_gaps: ComplianceGap[];
  performance_assessment: PerformanceAssessment;
  approval_status: 'approve' | 'conditional' | 'reject';
  conditions: ContractorComplianceCondition[];
  contractor_feedback: string;
  internal_summary: string;
};
