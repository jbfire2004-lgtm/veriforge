export type CompanyComplianceOverallStatus =
  | 'compliant'
  | 'at_risk'
  | 'non_compliant';

export type CompanyComplianceEngineStatus = 'pass' | 'fail' | 'warning';

export type CompanyComplianceFlagType = 'critical' | 'major' | 'minor';

export type CompanyComplianceEngineDto = {
  id: string;
  name: string;
  status: CompanyComplianceEngineStatus;
  score: number;
  weight: number;
  category: string;
  details?: string;
};

export type CompanyComplianceFlagDto = {
  id: string;
  type: CompanyComplianceFlagType;
  label: string;
  description?: string;
  createdAt: string;
};

export type CompanyComplianceOverviewDto = {
  companyId: string;
  overallStatus: CompanyComplianceOverallStatus;
  lastEvaluatedAt: string;
  engines: CompanyComplianceEngineDto[];
  flags: CompanyComplianceFlagDto[];
};

export type CompanyScoreGrade = 'A' | 'B' | 'C' | 'D' | 'F';

export type CompanyScoreTrend = 'improving' | 'declining' | 'stable';

export type CompanyScoreBreakdownDto = {
  id: string;
  label: string;
  score: number;
  weight: number;
  category: string;
  rationale?: string;
};

export type CompanyScoreDto = {
  companyId: string;
  isnStyleScore: number;
  grade: CompanyScoreGrade;
  trend: CompanyScoreTrend;
  lastUpdatedAt: string;
  breakdown: CompanyScoreBreakdownDto[];
};
