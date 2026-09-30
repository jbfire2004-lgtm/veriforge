export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export interface SifHecaResult {
  riskScore: number;
  sifScore: number;
  sifPotential: boolean;
  hecaCategory: string;
  supervisorReviewRequired: boolean;
  requireCapa: boolean;
  explanation: string[];
}

export interface JhaScoreResult extends SifHecaResult {
  jhaId: string;
  version: number;
  hazardCount: number;
  controlCount: number;
  signatureCount: number;
  missingControls: string[];
  weakControls: string[];
  blockSubmission: boolean;
  blockReasons: string[];
}

export type OfflineSyncActionType =
  | 'create_jha'
  | 'add_hazards'
  | 'add_controls'
  | 'sign'
  | 'approve';

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
  jhaId?: string;
  error?: string;
  duplicate?: boolean;
}

export interface CapaHookResult {
  triggered: boolean;
  capaId?: string;
  error?: string;
}

export type JhaSnapshot = {
  id: string;
  companyId: string;
  projectId: string;
  title: string;
  description: string | null;
  status: string;
  riskScore: number;
  sifScore: number;
  hecaCategory: string;
  version: number;
  createdBy: string;
  approvedBy: string | null;
  hazards: Array<{
    id: string;
    hazardId: string;
    severity: number;
    likelihood: number;
    sifPotential: boolean;
    hecaCategory: string;
  }>;
  controls: Array<{
    id: string;
    controlId: string;
    controlStrength: number;
  }>;
  signatures: Array<{
    id: string;
    workerId: string;
    signedAt: string;
  }>;
};
