export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface ZoneAccessRules {
  requiredTraining?: string[];
  requiredPpe?: string[];
  requiredCompetencies?: string[];
  requiredEquipmentAuthorization?: string[];
  minSafetyScore?: number;
  blockedRoles?: string[];
}

export interface WorkerValidationContext {
  role?: string;
  safetyScore?: number;
  riskLevel?: string;
  completedTraining?: string[];
  competencies?: string[];
  equipmentAuthorizations?: string[];
  activeRestrictions?: string[];
}

export interface EquipmentValidationContext {
  status?: string;
  conditionScore?: number;
  activeLockout?: boolean;
  expiredCertifications?: number;
}

export interface AccessValidationInput {
  companyId: string;
  accessPointId: string;
  workerId: string;
  equipmentId?: string;
  workerContext?: WorkerValidationContext;
  equipmentContext?: EquipmentValidationContext;
  zoneRules?: ZoneAccessRules;
}

export interface AccessValidationResult {
  granted: boolean;
  reason: string;
  gates: string[];
  attemptId: string;
}

export interface WorkerAccessSummary {
  workerId: string;
  companyId: string;
  totalAttempts: number;
  grantedCount: number;
  deniedCount: number;
  activeOverrides: number;
  recentAttempts: Array<{
    id: string;
    accessPointId: string;
    equipmentId: string | null;
    result: string;
    reason: string | null;
    timestamp: string;
  }>;
}

export interface EquipmentAccessSummary {
  equipmentId: string;
  companyId: string;
  totalAttempts: number;
  grantedCount: number;
  deniedCount: number;
  recentAttempts: Array<{
    id: string;
    accessPointId: string;
    workerId: string;
    result: string;
    reason: string | null;
    timestamp: string;
  }>;
}
