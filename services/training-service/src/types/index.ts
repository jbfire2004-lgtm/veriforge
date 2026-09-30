export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface WorkerTrainingSummary {
  workerId: string;
  companyId: string;
  role?: string;
  records: unknown[];
  matrixCompliance: {
    requiredCount: number;
    completedCount: number;
    compliant: boolean;
    missingCourses: string[];
  };
  competencyScore: number;
  expiredCount: number;
  expiringSoonCount: number;
}
