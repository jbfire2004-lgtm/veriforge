export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface WorkerValidationContext {
  role?: string;
  safetyScore?: number;
  riskLevel?: string;
  completedTraining?: string[];
  activeRestrictions?: string[];
  signedJhaIds?: string[];
}

export interface EquipmentValidationContext {
  status?: string;
  conditionScore?: number;
  activeLockout?: boolean;
  expiredCertifications?: number;
}

export interface OfflineSyncAction {
  clientSyncId: string;
  action: string;
  payload: Record<string, unknown>;
}

export interface OfflineSyncResult {
  clientSyncId: string;
  ok: boolean;
  action: string;
  duplicate?: boolean;
  error?: string;
}

export interface StationValidationResult {
  granted: boolean;
  reason: string;
  gates: string[];
  logId: string;
}
