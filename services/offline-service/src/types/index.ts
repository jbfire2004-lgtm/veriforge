export interface AuthJwtPayload {
  user_id: string;
  company_id: string;
  email?: string;
  roles?: string[];
}

export type ConflictResolutionStrategy = 'prefer_local' | 'prefer_server' | 'merge';

export interface OfflineSyncAction {
  type: string;
  recordId?: string;
  payload: Record<string, unknown>;
  clientVersion?: number;
  lastModified?: string;
}

export interface SyncActionResult {
  type: string;
  recordId: string;
  ok: boolean;
  workflowState: string;
  error?: string;
  conflictId?: string;
}
