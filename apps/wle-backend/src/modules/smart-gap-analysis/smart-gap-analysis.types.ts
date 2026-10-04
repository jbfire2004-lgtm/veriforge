import type { SpceAssessmentResult } from '../safety-program-compliance/safety-program-compliance.types';
import type { TaeAssessmentResult } from '../training-assessment/training-assessment.types';

export type SgaeCategory =
  | 'Policy'
  | 'Procedure'
  | 'Training'
  | 'FieldPractice'
  | 'Records';

export type SgaeFieldDataSummary = {
  jhaCountLast90Days?: number;
  flhaCountLast90Days?: number;
  inspectionCountLast90Days?: number;
  incidentCountLast90Days?: number;
  highSeverityIncidentsLast12Months?: number;
  openCorrectiveActions?: number;
  overdueCorrectiveActions?: number;
  /** Optional benchmark for activity deductions */
  expectedJhaPer90Days?: number;
  workerCount?: number;
};

export type SgaeStandardProfile = {
  id: string;
  name: string;
  categories?: string[];
};

export type SgaeAssessmentInput = {
  context: {
    jurisdiction?: string;
    dateNow: string;
  };
  company: { id: string; name?: string };
  hiringClient: { id: string; name?: string };
  spceResults: SpceAssessmentResult;
  taeResults: TaeAssessmentResult[];
  fieldDataSummary?: SgaeFieldDataSummary | null;
  standardProfiles?: SgaeStandardProfile[];
};

export type SgaeCategoryScores = Record<SgaeCategory, number>;

export type SgaeComplianceAssessment = {
  assessment: 'Strong' | 'Moderate' | 'Weak';
  notes: string;
};

export type SgaeRoadmapItem = {
  id: string;
  sourceEngine: 'SPCE' | 'TAE';
  category: SgaeCategory;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  recommendedDueDays: number;
  blockingForOnboarding: boolean;
};

export type SgaeAssessmentResult = {
  companyId: string;
  hiringClientId: string;
  overallGapScore: number;
  overallStatus: 'Acceptable' | 'ConditionallyAcceptable' | 'NotAcceptable';
  categoryScores: SgaeCategoryScores;
  categoryNotes: Partial<Record<SgaeCategory, string>>;
  legislativeCompliance: SgaeComplianceAssessment;
  hiringClientCompliance: SgaeComplianceAssessment;
  correctiveActionRoadmap: SgaeRoadmapItem[];
};
