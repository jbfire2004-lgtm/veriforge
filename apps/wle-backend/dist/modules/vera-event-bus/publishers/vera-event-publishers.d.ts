import type { DomainEventPayload } from '../../api-platform/events/domain-events';
export declare function workerTrainingCompletedEvent(input: {
    trainingRecordId: number;
    workerId: number;
    companyId?: number;
    projectId?: number;
    certificationId?: number;
    actorId?: number;
}): DomainEventPayload;
export declare function trainingVerifiedEvent(input: {
    trainingRecordId: number;
    workerId: number;
    companyId?: number;
    projectId?: number;
    overallStatus: string;
    actorId?: number;
}): DomainEventPayload;
export declare function walletUpdatedEvent(input: {
    workerId: number;
    companyId?: number;
    reason: string;
    trainingRecordId?: number;
}): DomainEventPayload;
export declare function expiryApproachingEvent(input: {
    trainingRecordId: number;
    workerId: number;
    companyId: number;
    expiresAt: string;
    courseName: string;
}): DomainEventPayload;
export declare function expiryPassedEvent(input: {
    trainingRecordId: number;
    workerId: number;
    companyId: number;
    expiresAt: string;
    courseName: string;
}): DomainEventPayload;
export declare function workerAssignedEvent(input: {
    projectId: number;
    workerId: number;
    companyId?: number;
    assignedBy?: number;
}): DomainEventPayload;
export declare function workerRemovedEvent(input: {
    projectId: number;
    workerId: number;
    companyId?: number;
}): DomainEventPayload;
export declare function unionHallRosterUpdateEvent(input: {
    unionHallId: number;
    workerId?: number;
    trainingRecordId?: number;
    action: string;
}): DomainEventPayload;
export declare function providerSyncEvent(input: {
    providerId: number;
    companyId?: number;
    status: string;
    recordsPushed?: number;
    runId?: number;
}): DomainEventPayload;
