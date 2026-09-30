export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface WorkerSafetyScore {
  workerId: string;
  companyId: string;
  score: number;
  riskLevel: string;
  components: {
    trainingCompliance: number;
    authorizationValidity: number;
    restrictionImpact: number;
    exposureRisk: number;
    incidentHistory: number;
    correctiveActionLoad: number;
    accessCompliance: number;
  };
  gaps: string[];
}
