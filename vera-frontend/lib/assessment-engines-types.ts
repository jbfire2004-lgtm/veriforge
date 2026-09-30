export type SpceRequirementResult = {
  requirementId: string;
  category: string;
  type: string;
  score: number;
  status: "Accepted" | "ConditionallyAccepted" | "Rejected";
  existenceStatus: "Present" | "Missing";
  currencyStatus: "Current" | "Outdated" | "NotConfigured";
  structureStatus: "Complete" | "Partial" | "Missing";
  legislationStatus: "Referenced" | "NotReferenced" | "NotApplicable";
  trainingAlignmentStatus: "Aligned" | "NotAligned" | "NotConfigured";
  fieldAlignmentStatus: "Aligned" | "NotAligned" | "NotConfigured";
  submissionIds: string[];
};

export type SpceCorrectiveAction = {
  id: string;
  requirementId: string;
  companyId: string;
  category: string;
  description: string;
  priority: "High" | "Medium" | "Low";
  recommendedDueDays: number;
  blockingForPrequalification: boolean;
};

export type SpceAssessmentResult = {
  companyId: string;
  overallScore: number;
  overallStatus: "Accepted" | "ConditionallyAccepted" | "Rejected";
  requirementResults: SpceRequirementResult[];
  correctiveActions: SpceCorrectiveAction[];
};

export type SgaeCategory =
  | "Policy"
  | "Procedure"
  | "Training"
  | "FieldPractice"
  | "Records";

export type SgaeComplianceAssessment = {
  assessment: "Strong" | "Moderate" | "Weak";
  notes: string;
};

export type SgaeRoadmapItem = {
  id: string;
  sourceEngine: "SPCE" | "TAE";
  category: SgaeCategory;
  description: string;
  priority: "High" | "Medium" | "Low";
  recommendedDueDays: number;
  blockingForOnboarding: boolean;
};

export type SgaeAssessmentResult = {
  companyId: string;
  hiringClientId: string;
  overallGapScore: number;
  overallStatus: "Acceptable" | "ConditionallyAcceptable" | "NotAcceptable";
  categoryScores: Record<SgaeCategory, number>;
  categoryNotes: Partial<Record<SgaeCategory, string>>;
  legislativeCompliance: SgaeComplianceAssessment;
  hiringClientCompliance: SgaeComplianceAssessment;
  correctiveActionRoadmap: SgaeRoadmapItem[];
};

export type CompanyAssessmentSummary = {
  overallScore: number;
  overallStatus: string;
  evaluatedAt: string;
};

export type CompanyAssessmentLatest<T> = CompanyAssessmentSummary & {
  resultJson: T;
};
