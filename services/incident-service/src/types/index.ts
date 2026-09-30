export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type IncidentStatus = 'reported' | 'under_investigation' | 'investigated' | 'closed';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export interface SifHecaResult {
  riskScore: number;
  sifScore: number;
  sifPotential: boolean;
  hecaCategory: string;
  supervisorReviewRequired: boolean;
  requireCapa: boolean;
  explanation: string[];
}

export interface WitnessInput {
  name?: string;
  contact?: string;
  workerId?: string;
  statement?: string;
}

export interface GateCheck {
  passed: boolean;
  reason: string;
  gate: string;
}

export interface SafetyGateContext {
  workerSafetyOk?: boolean;
  activeEmergency?: boolean;
  sifPotential: boolean;
  witnessCount: number;
  severity: string;
  investigationComplete?: boolean;
  correctiveActionsLinked?: number;
  closing?: boolean;
}

export interface SafetyGateResult {
  passed: boolean;
  reason: string;
  gates: string[];
  checks: GateCheck[];
}

export type OfflineSyncActionType =
  | 'report'
  | 'investigate'
  | 'close'
  | 'link_corrective_action'
  | 'add_witness';

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
  incidentId?: string;
  error?: string;
  duplicate?: boolean;
}

export interface IncidentEventPayload {
  incidentId: string;
  companyId: string;
  projectId: string;
  incidentNumber: string;
  severity: string;
  status: string;
  sifPotential: boolean;
  hecaCategory?: string | null;
  reportedBy?: string;
  investigatedBy?: string;
  closedBy?: string;
}
