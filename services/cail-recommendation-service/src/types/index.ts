export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type RecommendationTypeName =
  | 'control'
  | 'training'
  | 'corrective_action'
  | 'equipment_maintenance'
  | 'jha_improvement'
  | 'inspection_focus'
  | 'pm_schedule_adjustment';

export type EntityTypeName =
  | 'worker'
  | 'equipment'
  | 'project'
  | 'company'
  | 'hazard'
  | 'control'
  | 'jha'
  | 'inspection'
  | 'corrective_action'
  | 'schedule';

export interface RecommendationContext {
  overdueCapa?: number;
  openCapa?: number;
  criticalHazards?: number;
  weakControls?: number;
  trainingExpired?: number;
  trainingExpiring?: number;
  accessDenials30d?: number;
  equipmentFailures?: number;
  lockoutActive?: boolean;
  repeatDeficiencies?: number;
  jhaSignatureGap?: number;
  hazardCoverageGap?: number;
  scheduleConflicts?: number;
  safetyBlockedSlots?: number;
  projectScore?: number;
  emergencyActive?: boolean;
  violations?: Array<{ ruleId: string; severity: string; message: string; module?: string }>;
  patterns?: Array<{ category: string; title: string; description: string; severity: string; evidence?: string[] }>;
}

export interface RecommendationDraft {
  recommendationType: RecommendationTypeName;
  title: string;
  reason: string;
  evidence: string[];
  requiredActions: string[];
  confidence: number;
}

export interface RecommendationRequest {
  companyId: string;
  recommendationType?: RecommendationTypeName;
  entityType: EntityTypeName;
  entityId: string;
  projectId?: string;
  workerId?: string;
  equipmentId?: string;
  context?: RecommendationContext;
}

export interface RecommendationRecord {
  id: string;
  companyId: string;
  projectId: string | null;
  workerId: string | null;
  equipmentId: string | null;
  entityType: string;
  entityId: string;
  recommendationType: string;
  recommendationText: string;
  evidence: {
    title: string;
    reason: string;
    factors: string[];
    requiredActions: string[];
  };
  confidence: number;
  createdAt: string;
}
