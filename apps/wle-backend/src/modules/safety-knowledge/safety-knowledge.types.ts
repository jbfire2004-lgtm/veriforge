export type SkeKnowledgeDomain =
  | 'RegulatoryTraining'
  | 'CompanyTraining'
  | 'SiteOrientation'
  | 'PolicyAcknowledgment'
  | 'FieldSafetyPractice';

export type SkeDomainResult = {
  domain: SkeKnowledgeDomain;
  score: number;
  status: 'Proficient' | 'Developing' | 'Deficient';
  gaps: string[];
};

export type SkeAssessmentInput = {
  context: { dateNow: string; jurisdiction?: string };
  worker: { id: string; name?: string; companyId?: string };
  requiredCourses: Array<{ code: string; name: string }>;
  trainingRecords: Array<{
    courseCode: string;
    verified: boolean;
    expired: boolean;
    expiringSoon: boolean;
  }>;
  orientationComplete: boolean;
  policyAcknowledgments: { required: number; completed: number };
  fieldActivity: {
    flhaCount90d: number;
    bboCount90d: number;
    inspections90d: number;
  };
};

export type SkeAssessmentResult = {
  workerId: string;
  overallScore: number;
  overallStatus: 'Proficient' | 'Developing' | 'Deficient';
  domains: SkeDomainResult[];
  recommendations: string[];
};
