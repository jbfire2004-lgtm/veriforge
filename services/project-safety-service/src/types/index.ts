export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface ProjectSafetyScore {
  projectId: string;
  companyId: string;
  score: number;
  riskLevel: string;
  components: {
    profileCompleteness: number;
    hazardCoverage: number;
    controlAdequacy: number;
    zoneCompliance: number;
    trainingCoverage: number;
    emergencyReadiness: number;
  };
  sifExposure: boolean;
  gaps: string[];
  version: number;
}
