export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type PermitType =
  | 'hot_work'
  | 'confined_space'
  | 'excavation'
  | 'electrical'
  | 'general';

export type WorkPermitStatus =
  | 'draft'
  | 'pending_approval'
  | 'approved'
  | 'active'
  | 'suspended'
  | 'closed'
  | 'expired';

export type SafetyRequirementType =
  | 'jha'
  | 'training'
  | 'sds'
  | 'equipment_cert'
  | 'hazard_control';

export interface SafetyGateCheck {
  requirementType: SafetyRequirementType;
  satisfied: boolean;
  reason: string;
  linkedId?: string;
  metadata?: Record<string, unknown>;
}

export interface SafetyGateResult {
  passed: boolean;
  checks: SafetyGateCheck[];
  blockReasons: string[];
}

export interface ApprovalDecision {
  outcome: 'approved' | 'rejected';
  role: string;
  notes?: string;
}

export interface PermitEventPayload {
  permitId: string;
  companyId: string;
  projectId: string;
  permitType: PermitType;
  status: WorkPermitStatus;
  pmTaskId?: string | null;
  workerId?: string | null;
}

export type OfflineSyncActionType =
  | 'create'
  | 'request_approval'
  | 'approve'
  | 'activate'
  | 'suspend'
  | 'close';

export interface OfflineSyncAction {
  clientSyncId: string;
  action: OfflineSyncActionType;
  payload: Record<string, unknown>;
  createdAt?: string;
}

export interface OfflineSyncResult {
  clientSyncId: string;
  ok: boolean;
  action: OfflineSyncActionType;
  permitId?: string;
  error?: string;
  duplicate?: boolean;
}
