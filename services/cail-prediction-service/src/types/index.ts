export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export type PredictionTypeName =
  | 'incident_likelihood'
  | 'equipment_failure'
  | 'hazard_emergence'
  | 'sif_heca_potential'
  | 'training_lapse'
  | 'capa_overdue'
  | 'access_denial'
  | 'emergency_likelihood';

export type EntityTypeName =
  | 'worker'
  | 'equipment'
  | 'project'
  | 'company'
  | 'hazard'
  | 'corrective_action'
  | 'access'
  | 'emergency'
  | 'training';

export interface PredictionSignals {
  workerScore?: number;
  openCapa?: number;
  sifExposures?: number;
  incidents90d?: number;
  failures90d?: number;
  inspectionFailures?: number;
  openCount?: number;
  overdueCount?: number;
  avgDaysToDue?: number;
  escalationMax?: number;
  expired?: number;
  expiring7d?: number;
  unpublishedHazards?: number;
  weakControls?: number;
  sifHazards?: number;
  hecaFlags?: number;
  denials30d?: number;
  grantRate?: number;
  overdueTraining?: number;
  emergencyActive?: boolean;
  drillRecencyDays?: number;
  planCompleteness?: number;
  projectScore?: number;
  criticalHazards?: number;
}

export interface InferenceOutput {
  predictionType: string;
  probability: number;
  riskLevel: RiskLevel;
  factors: string[];
  confidence: number;
}

export interface PredictionRequest {
  companyId: string;
  predictionType: PredictionTypeName;
  entityType: EntityTypeName;
  entityId: string;
  moduleType?: string;
  projectId?: string;
  workerId?: string;
  equipmentId?: string;
  signals?: PredictionSignals;
}

export interface PredictionRecord {
  id: string;
  companyId: string;
  projectId: string | null;
  workerId: string | null;
  equipmentId: string | null;
  entityType: string;
  entityId: string;
  moduleType: string;
  predictionType: string;
  predictionValue: number;
  confidence: number;
  riskLevel: string;
  factors: string[];
  modelKey: string;
  createdAt: string;
}
