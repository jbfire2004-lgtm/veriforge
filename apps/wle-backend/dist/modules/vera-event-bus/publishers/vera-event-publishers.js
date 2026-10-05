"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.workerTrainingCompletedEvent = workerTrainingCompletedEvent;
exports.trainingVerifiedEvent = trainingVerifiedEvent;
exports.walletUpdatedEvent = walletUpdatedEvent;
exports.expiryApproachingEvent = expiryApproachingEvent;
exports.expiryPassedEvent = expiryPassedEvent;
exports.workerAssignedEvent = workerAssignedEvent;
exports.workerRemovedEvent = workerRemovedEvent;
exports.unionHallRosterUpdateEvent = unionHallRosterUpdateEvent;
exports.providerSyncEvent = providerSyncEvent;
const domain_events_1 = require("../../api-platform/events/domain-events");
function workerTrainingCompletedEvent(input) {
    var _a;
    return {
        name: domain_events_1.DomainEvent.WORKER_TRAINING_COMPLETED,
        occurredAt: new Date().toISOString(),
        companyId: input.companyId,
        projectId: input.projectId,
        entityType: 'training_record',
        entityId: input.trainingRecordId,
        actorId: input.actorId,
        data: {
            workerId: input.workerId,
            certificationId: (_a = input.certificationId) !== null && _a !== void 0 ? _a : null,
        },
    };
}
function trainingVerifiedEvent(input) {
    return {
        name: domain_events_1.DomainEvent.TRAINING_VERIFIED,
        occurredAt: new Date().toISOString(),
        companyId: input.companyId,
        projectId: input.projectId,
        entityType: 'training_record',
        entityId: input.trainingRecordId,
        actorId: input.actorId,
        data: { workerId: input.workerId, overallStatus: input.overallStatus },
    };
}
function walletUpdatedEvent(input) {
    var _a;
    return {
        name: domain_events_1.DomainEvent.WALLET_UPDATED,
        occurredAt: new Date().toISOString(),
        companyId: input.companyId,
        entityType: 'worker',
        entityId: input.workerId,
        data: {
            workerId: input.workerId,
            reason: input.reason,
            trainingRecordId: (_a = input.trainingRecordId) !== null && _a !== void 0 ? _a : null,
        },
    };
}
function expiryApproachingEvent(input) {
    return {
        name: domain_events_1.DomainEvent.EXPIRY_APPROACHING,
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
function expiryPassedEvent(input) {
    return {
        name: domain_events_1.DomainEvent.EXPIRY_PASSED,
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
function workerAssignedEvent(input) {
    return {
        name: domain_events_1.DomainEvent.WORKER_ASSIGNED_TO_PROJECT,
        occurredAt: new Date().toISOString(),
        companyId: input.companyId,
        projectId: input.projectId,
        entityType: 'worker',
        entityId: input.workerId,
        actorId: input.assignedBy,
        data: { workerId: input.workerId, projectId: input.projectId },
    };
}
function workerRemovedEvent(input) {
    return {
        name: domain_events_1.DomainEvent.WORKER_REMOVED_FROM_PROJECT,
        occurredAt: new Date().toISOString(),
        companyId: input.companyId,
        projectId: input.projectId,
        entityType: 'worker',
        entityId: input.workerId,
        data: { workerId: input.workerId, projectId: input.projectId },
    };
}
function unionHallRosterUpdateEvent(input) {
    var _a, _b;
    return {
        name: domain_events_1.DomainEvent.UNION_HALL_ROSTER_UPDATE,
        occurredAt: new Date().toISOString(),
        entityType: 'union_hall',
        entityId: input.unionHallId,
        data: {
            unionHallId: input.unionHallId,
            workerId: (_a = input.workerId) !== null && _a !== void 0 ? _a : null,
            trainingRecordId: (_b = input.trainingRecordId) !== null && _b !== void 0 ? _b : null,
            action: input.action,
        },
    };
}
function providerSyncEvent(input) {
    var _a, _b;
    return {
        name: domain_events_1.DomainEvent.PROVIDER_SYNC_EVENT,
        occurredAt: new Date().toISOString(),
        companyId: input.companyId,
        entityType: 'provider_sync_run',
        entityId: (_a = input.runId) !== null && _a !== void 0 ? _a : input.providerId,
        data: {
            providerId: input.providerId,
            status: input.status,
            recordsPushed: (_b = input.recordsPushed) !== null && _b !== void 0 ? _b : 0,
        },
    };
}
//# sourceMappingURL=vera-event-publishers.js.map