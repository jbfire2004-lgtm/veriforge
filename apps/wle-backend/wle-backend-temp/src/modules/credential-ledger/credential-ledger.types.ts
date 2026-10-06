import {
  CredentialLedgerActorType,
  CredentialLedgerEventType,
  TrainingValidationOutcome,
} from '@prisma/client';

export type CredentialLifecycleStatus =
  | 'valid'
  | 'expired'
  | 'revoked'
  | 'needs_review'
  | 'pending';

export type LedgerAppendInput = {
  eventType: CredentialLedgerEventType;
  credentialId: number;
  actorId?: number | null;
  actorType?: CredentialLedgerActorType;
  workerId?: number | null;
  providerId?: number | null;
  projectId?: number | null;
  companyId?: number | null;
  correlationId?: string | null;
  /** Override timestamp for historical backfill (defaults to now). */
  occurredAt?: Date;
  payload?: Record<string, unknown>;
};

export type CredentialLedgerEventView = {
  id: number;
  occurredAt: string;
  actorId: number | null;
  actorType: CredentialLedgerActorType;
  eventType: CredentialLedgerEventType;
  credentialId: number;
  workerId: number | null;
  providerId: number | null;
  projectId: number | null;
  companyId: number | null;
  correlationId: string | null;
  payload: Record<string, unknown>;
};

export type VerificationChainResponse = {
  credentialId: number;
  status: CredentialLifecycleStatus;
  worker: {
    id: number;
    firstName: string;
    lastName: string;
    email: string | null;
  } | null;
  provider: {
    id: number;
    name: string;
  } | null;
  trainingProvider: {
    id: number;
    name: string;
  } | null;
  certification: {
    id: number;
    name: string;
    code: string | null;
  } | null;
  issuedAt: string | null;
  expiresAt: string | null;
  certificateNumber: string | null;
  latestValidationOutcome: TrainingValidationOutcome | null;
  events: CredentialLedgerEventView[];
};

export type RecordCredentialContext = {
  credentialId: number;
  workerId?: number | null;
  providerId?: number | null;
  trainingProviderId?: number | null;
  projectId?: number | null;
  companyId?: number | null;
  actorId?: number | null;
  actorType?: CredentialLedgerActorType;
  correlationId?: string | null;
  payload?: Record<string, unknown>;
};
