export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type InspectionStatus =
  | 'draft'
  | 'scheduled'
  | 'in_progress'
  | 'submitted'
  | 'failed'
  | 'passed'
  | 'closed';

export type FindingType = 'pass' | 'fail' | 'na' | 'observation';

export interface ChecklistItem {
  key: string;
  label: string;
  weight?: number;
  required?: boolean;
  critical?: boolean;
}

export interface InspectionFindingInput {
  itemKey: string;
  findingType: FindingType;
  severity?: string;
  description?: string;
  photoUrl?: string;
  hazardId?: string;
  controlId?: string;
  correctiveActionId?: string;
  metadata?: Record<string, unknown>;
}

export interface ScoreComponent {
  key: string;
  weight: number;
  value: number;
  points: number;
}

export interface ScoreResult {
  score: number;
  maxScore: number;
  passThreshold: number;
  passed: boolean;
  components: ScoreComponent[];
}

export interface GateCheck {
  passed: boolean;
  reason: string;
  gate: string;
}

export interface SafetyGateResult {
  passed: boolean;
  reason: string;
  gates: string[];
  checks: GateCheck[];
}

export interface SafetyGateContext {
  equipmentSafe?: boolean;
  equipmentScore?: number;
  hazardControlsActive?: boolean;
  openCriticalFindings?: number;
  checklistComplete?: boolean;
  token?: string;
}

export type OfflineSyncActionType =
  | 'create'
  | 'update'
  | 'submit_findings'
  | 'complete'
  | 'safety_gate';

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
  inspectionId?: string;
  error?: string;
  duplicate?: boolean;
}

export interface InspectionEventPayload {
  inspectionId: string;
  companyId: string;
  projectId: string;
  status: InspectionStatus;
  score?: number | null;
  checklistType?: string;
}
