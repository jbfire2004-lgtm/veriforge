import type { DomainEventPayload } from '../../api-platform/events/domain-events';
import { DomainEvent } from '../../api-platform/events/domain-events';

/** Canonical publisher helpers — consistent payload shapes. */
export function workerTrainingCompletedEvent(input: {
  trainingRecordId: number;
  workerId: number;
  companyId?: number;
  projectId?: number;
  certificationId?: number;
  actorId?: number;
}): DomainEventPayload {
  return {
    name: DomainEvent.WORKER_TRAINING_COMPLETED,
    occurredAt: new Date().toISOString(),
    companyId: input.companyId,
    projectId: input.projectId,
    entityType: 'training_record',
    entityId: input.trainingRecordId,
    actorId: input.actorId,
    data: {
      workerId: input.workerId,
      certificationId: input.certificationId ?? null,
    },
  };
}

export function trainingVerifiedEvent(input: {
  trainingRecordId: number;
  workerId: number;
  companyId?: number;
  projectId?: number;
  overallStatus: string;
  actorId?: number;
}): DomainEventPayload {
  return {
    name: DomainEvent.TRAINING_VERIFIED,
    occurredAt: new Date().toISOString(),
    companyId: input.companyId,
    projectId: input.projectId,
    entityType: 'training_record',
    entityId: input.trainingRecordId,
    actorId: input.actorId,
    data: { workerId: input.workerId, overallStatus: input.overallStatus },
  };
}

export function walletUpdatedEvent(input: {
  workerId: number;
  companyId?: number;
  reason: string;
  trainingRecordId?: number;
}): DomainEventPayload {
  return {
    name: DomainEvent.WALLET_UPDATED,
    occurredAt: new Date().toISOString(),
    companyId: input.companyId,
    entityType: 'worker',
    entityId: input.workerId,
    data: {
      workerId: input.workerId,
      reason: input.reason,
      trainingRecordId: input.trainingRecordId ?? null,
    },
  };
}

export function expiryApproachingEvent(input: {
  trainingRecordId: number;
  workerId: number;
  companyId: number;
  expiresAt: string;
  courseName: string;
}): DomainEventPayload {
  return {
    name: DomainEvent.EXPIRY_APPROACHING,
    occurredAt: new Date().toISOString(),
    companyId: input.companyId,
    entityType: 'training_record',
    entityId: input.trainingRecordId,
    data: {
      workerId: input.workerId,
      expiresAt: input.expiresAt,
      courseName: input.courseName,
    },
  };
}

export function expiryPassedEvent(input: {
  trainingRecordId: number;
  workerId: number;
  companyId: number;
  expiresAt: string;
  courseName: string;
}): DomainEventPayload {
  return {
    name: DomainEvent.EXPIRY_PASSED,
    occurredAt: new Date().toISOString(),
    companyId: input.companyId,
    entityType: 'training_record',
    entityId: input.trainingRecordId,
    data: {
      workerId: input.workerId,
      expiresAt: input.expiresAt,
      courseName: input.courseName,
    },
  };
}

export function workerAssignedEvent(input: {
  projectId: number;
  workerId: number;
  companyId?: number;
  assignedBy?: number;
}): DomainEventPayload {
  return {
    name: DomainEvent.WORKER_ASSIGNED_TO_PROJECT,
    occurredAt: new Date().toISOString(),
    companyId: input.companyId,
    projectId: input.projectId,
    entityType: 'worker',
    entityId: input.workerId,
    actorId: input.assignedBy,
    data: { workerId: input.workerId, projectId: input.projectId },
  };
}

export function workerRemovedEvent(input: {
  projectId: number;
  workerId: number;
  companyId?: number;
}): DomainEventPayload {
  return {
    name: DomainEvent.WORKER_REMOVED_FROM_PROJECT,
    occurredAt: new Date().toISOString(),
    companyId: input.companyId,
    projectId: input.projectId,
    entityType: 'worker',
    entityId: input.workerId,
    data: { workerId: input.workerId, projectId: input.projectId },
  };
}

export function unionHallRosterUpdateEvent(input: {
  unionHallId: number;
  workerId?: number;
  trainingRecordId?: number;
  action: string;
}): DomainEventPayload {
  return {
    name: DomainEvent.UNION_HALL_ROSTER_UPDATE,
    occurredAt: new Date().toISOString(),
    entityType: 'union_hall',
    entityId: input.unionHallId,
    data: {
      unionHallId: input.unionHallId,
      workerId: input.workerId ?? null,
      trainingRecordId: input.trainingRecordId ?? null,
      action: input.action,
    },
  };
}

export function providerSyncEvent(input: {
  providerId: number;
  companyId?: number;
  status: string;
  recordsPushed?: number;
  runId?: number;
}): DomainEventPayload {
  return {
    name: DomainEvent.PROVIDER_SYNC_EVENT,
    occurredAt: new Date().toISOString(),
    companyId: input.companyId,
    entityType: 'provider_sync_run',
    entityId: input.runId ?? input.providerId,
    data: {
      providerId: input.providerId,
      status: input.status,
      recordsPushed: input.recordsPushed ?? 0,
    },
  };
}
