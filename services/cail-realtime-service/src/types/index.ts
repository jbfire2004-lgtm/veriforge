export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface RealtimeSignals {
  profileScore?: number;
  overdueCapa?: number;
  workerCriticalCapa?: number;
  denials30d?: number;
  sifExposures?: number;
  openCapa?: number;
  openIncidents?: number;
  safetyStatus?: string;
  lockoutStatus?: string;
  failures90d?: number;
  inspectionFailures?: number;
  projectCriticalCapa?: number;
  emergencyActive?: boolean;
  sifHazardOpen?: number;
  projectScore?: number;
  criticalHazards?: number;
  expiredTraining?: number;
  accessDenials30d?: number;
}

export interface TaskGateRequirements {
  requiredSkills?: string[];
  requiredEquipment?: string[];
  requiredTraining?: string[];
  requiredControls?: string[];
  requiredPpe?: string[];
  requiredJha?: string[];
}

export interface TaskGateContext {
  assignedWorkers?: string[];
  assignedEquipment?: string[];
  workerSkills?: string[];
  completedTraining?: string[];
  appliedControls?: string[];
  confirmedPpe?: string[];
  activeJhaTypes?: string[];
}

export interface GateOverride {
  ruleType: string;
  ruleKey: string;
}

export interface RealtimePredictRequest {
  companyId: string;
  projectId?: string;
  workerId?: string;
  equipmentId?: string;
  predictionType?: string;
  signals?: RealtimeSignals;
}

export interface RealtimeScoreRequest {
  companyId: string;
  projectId?: string;
  workerId?: string;
  equipmentId?: string;
  scoreType?: string;
  signals?: RealtimeSignals;
}

export interface RealtimeGateRequest {
  companyId: string;
  projectId?: string;
  workerId?: string;
  equipmentId?: string;
  zoneCode?: string;
  signals?: RealtimeSignals;
  taskRequirements?: TaskGateRequirements;
  taskGateContext?: TaskGateContext;
  activeOverrides?: GateOverride[];
  useCase?: 'site_access' | 'safety_station' | 'emergency' | 'pm_gating' | 'general';
}

export interface CachedModel {
  modelId: string;
  version: number;
  algorithm: string;
  loadedAt: number;
}
