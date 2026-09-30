export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type CorrectiveActionStatus =
  | 'draft'
  | 'open'
  | 'assigned'
  | 'in_progress'
  | 'pending_verification'
  | 'verified'
  | 'closed'
  | 'cancelled';

export type ModuleLinkType =
  | 'jha'
  | 'inspection'
  | 'incident'
  | 'hazard'
  | 'control'
  | 'equipment'
  | 'sif_heca'
  | 'training'
  | 'site_access';

export interface ModuleLink {
  moduleType: ModuleLinkType;
  linkedId: string;
  metadata?: Record<string, unknown>;
}

export interface EvidenceAttachment {
  fileName?: string;
  mimeType?: string;
  storageKey?: string;
  dataUrl?: string;
  phase?: string;
}

export interface PriorityResult {
  severity: string;
  priority: string;
  dueDate: Date;
  explainability: string[];
}

export interface EscalationTrigger {
  level: number;
  reason: string;
  shouldNotify: boolean;
}

export type OfflineSyncActionType =
  | 'create'
  | 'assign'
  | 'escalate'
  | 'verify'
  | 'add_attachment';

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
  correctiveActionId?: string;
  error?: string;
  duplicate?: boolean;
}
