export type SpceRequirementType =
  | 'Policy'
  | 'Procedure'
  | 'Form'
  | 'TrainingConfig'
  | 'Recordkeeping';

export type SpceProgramRequirement = {
  id: string;
  category: string;
  type: SpceRequirementType;
  description: string;
  requiredSections?: string[];
  linkedLegislation?: string[];
  weight: number;
};

export type SpceDocument = {
  fileId: string;
  fileName?: string;
  mimeType?: string;
  revisionDate?: string;
  effectiveDate?: string;
  tags?: string[];
  parsedSections?: string[];
  legislationRefs?: string[];
  contentSummary?: string;
};

export type SpceTrainingConfig = {
  trainingCode: string;
  requiredForRoles?: string[];
  validityDays?: number;
};

export type SpceLinkedForm = {
  formId: string;
  name?: string;
  type?: string;
};

export type SpceCompanySubmission = {
  id: string;
  companyId: string;
  requirementId: string;
  documents?: SpceDocument[];
  linkedTrainingConfigs?: SpceTrainingConfig[];
  linkedForms?: SpceLinkedForm[];
};

export type SpceAssessmentInput = {
  context: {
    jurisdiction?: string;
    dateNow: string;
  };
  hiringClientProgramRequirements: SpceProgramRequirement[];
  companySubmissions: SpceCompanySubmission[];
};

export type SpceRequirementResult = {
  requirementId: string;
  category: string;
  type: SpceRequirementType;
  score: number;
  status: 'Accepted' | 'ConditionallyAccepted' | 'Rejected';
  existenceStatus: 'Present' | 'Missing';
  currencyStatus: 'Current' | 'Outdated' | 'NotConfigured';
  structureStatus: 'Complete' | 'Partial' | 'Missing';
  legislationStatus: 'Referenced' | 'NotReferenced' | 'NotApplicable';
  trainingAlignmentStatus: 'Aligned' | 'NotAligned' | 'NotConfigured';
  fieldAlignmentStatus: 'Aligned' | 'NotAligned' | 'NotConfigured';
  submissionIds: string[];
};

export type SpceCorrectiveAction = {
  id: string;
  requirementId: string;
  companyId: string;
  category: SpceRequirementType;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  recommendedDueDays: number;
  blockingForPrequalification: boolean;
};

export type SpceAssessmentResult = {
  companyId: string;
  overallScore: number;
  overallStatus: 'Accepted' | 'ConditionallyAccepted' | 'Rejected';
  requirementResults: SpceRequirementResult[];
  correctiveActions: SpceCorrectiveAction[];
};
