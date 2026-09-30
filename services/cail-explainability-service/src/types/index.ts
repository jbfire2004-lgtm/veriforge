export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type ExplainTargetType = 'prediction' | 'score' | 'recommendation';

export interface ScoreComponent {
  key: string;
  weight: number;
  value: number;
  deduction: number;
}

export interface ExplainInput {
  companyId: string;
  targetType: ExplainTargetType;
  predictionId?: string;
  scoreId?: string;
  recommendationId?: string;
  projectId?: string;
  entityType?: string;
  entityId?: string;
  predictionType?: string;
  scoreType?: string;
  recommendationType?: string;
  probability?: number;
  scoreValue?: number;
  riskLevel?: string;
  factors?: string[];
  evidence?: string[];
  components?: ScoreComponent[];
  confidence?: number;
  requiredActions?: string[];
  recommendationTitle?: string;
  recommendationReason?: string;
  dataSources?: string[];
}

export interface ContributingData {
  targetType: ExplainTargetType;
  targetId: string;
  summary: string;
  why: Record<string, unknown>;
  confidence: number;
  evidence: string[];
  contributingFactors: {
    hazard: string[];
    control: string[];
    worker: string[];
    equipment: string[];
    project: string[];
  };
  recommendedActions: string[];
  dataSources: string[];
  scoreId?: string;
  recommendationId?: string;
  entityType?: string;
  entityId?: string;
  projectId?: string;
}

export interface ExplainabilityRecord {
  id: string;
  companyId: string;
  predictionId: string | null;
  explanationText: string;
  contributingData: ContributingData;
  humanReadable: string;
  createdAt: string;
}
