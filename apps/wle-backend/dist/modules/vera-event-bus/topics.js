"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOMAIN_EVENT_TOPIC_MAP = exports.VeraEventTopic = void 0;
exports.topicForEvent = topicForEvent;
exports.natsSubjectForEvent = natsSubjectForEvent;
exports.partitionKeyForEvent = partitionKeyForEvent;
const domain_events_1 = require("../api-platform/events/domain-events");
exports.VeraEventTopic = {
    TRAINING: 'vera.training',
    WALLET: 'vera.wallet',
    COMPANY: 'vera.company',
    PROJECT: 'vera.project',
    PROVIDER: 'vera.provider',
    EXPIRY: 'vera.expiry',
    WORKER: 'vera.worker',
    UNION: 'vera.union',
    COMPLIANCE: 'vera.compliance',
    PERMIT: 'vera.permit',
    PLATFORM: 'vera.platform',
};
exports.DOMAIN_EVENT_TOPIC_MAP = {
    [domain_events_1.DomainEvent.WORKER_CREATED]: exports.VeraEventTopic.WORKER,
    [domain_events_1.DomainEvent.WORKER_UPDATED]: exports.VeraEventTopic.WORKER,
    [domain_events_1.DomainEvent.WORKER_LINKED]: exports.VeraEventTopic.WORKER,
    [domain_events_1.DomainEvent.WORKER_UNLINKED]: exports.VeraEventTopic.WORKER,
    [domain_events_1.DomainEvent.WORKER_TRAINING_COMPLETED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.ORIENTATION_COMPLETED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.ORIENTATION_ASSIGNED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.WORKER_ASSIGNED_TO_PROJECT]: exports.VeraEventTopic.PROJECT,
    [domain_events_1.DomainEvent.WORKER_REMOVED_FROM_PROJECT]: exports.VeraEventTopic.PROJECT,
    [domain_events_1.DomainEvent.EQUIPMENT_CREATED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.EQUIPMENT_UPDATED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.EQUIPMENT_LINKED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.EQUIPMENT_UNLINKED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.INSPECTION_COMPLETED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.INSPECTION_INCIDENT_DRAFTED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.INCIDENT_CREATED_FROM_INSPECTION]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.TRAINING_UPLOADED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.TRAINING_VALIDATED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.TRAINING_VERIFIED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.TRAINING_VERIFICATION_ATTENTION]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.TRAINING_VERIFICATION_RUN]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.TRAINING_CREDENTIAL_MINTED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.EXPIRY_APPROACHING]: exports.VeraEventTopic.EXPIRY,
    [domain_events_1.DomainEvent.EXPIRY_PASSED]: exports.VeraEventTopic.EXPIRY,
    [domain_events_1.DomainEvent.WALLET_SYNCED]: exports.VeraEventTopic.WALLET,
    [domain_events_1.DomainEvent.WALLET_UPDATED]: exports.VeraEventTopic.WALLET,
    [domain_events_1.DomainEvent.WALLET_BUNDLE_SYNCED]: exports.VeraEventTopic.WALLET,
    [domain_events_1.DomainEvent.PROVIDER_SYNC_COMPLETED]: exports.VeraEventTopic.PROVIDER,
    [domain_events_1.DomainEvent.PROVIDER_SYNC_EVENT]: exports.VeraEventTopic.PROVIDER,
    [domain_events_1.DomainEvent.PROVIDER_SYNC_FAILED]: exports.VeraEventTopic.PROVIDER,
    [domain_events_1.DomainEvent.PROVIDER_COMPLETION_RECEIVED]: exports.VeraEventTopic.PROVIDER,
    [domain_events_1.DomainEvent.VERIFICATION_COMPLETED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.TRAINING_INGESTION_COMPLETED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.TRAINING_INGESTION_FAILED]: exports.VeraEventTopic.TRAINING,
    [domain_events_1.DomainEvent.PROVIDER_HUB_SUMMARY]: exports.VeraEventTopic.PROVIDER,
    [domain_events_1.DomainEvent.PROVIDER_APPROVED]: exports.VeraEventTopic.PROVIDER,
    [domain_events_1.DomainEvent.UNION_TRAINING_PUSHED]: exports.VeraEventTopic.UNION,
    [domain_events_1.DomainEvent.UNION_DISPATCH]: exports.VeraEventTopic.UNION,
    [domain_events_1.DomainEvent.UNION_HALL_ROSTER_UPDATE]: exports.VeraEventTopic.UNION,
    [domain_events_1.DomainEvent.PROJECT_ASSIGNED]: exports.VeraEventTopic.PROJECT,
    [domain_events_1.DomainEvent.PROJECT_CLOSED]: exports.VeraEventTopic.PROJECT,
    [domain_events_1.DomainEvent.PROJECT_UPDATED]: exports.VeraEventTopic.PROJECT,
    [domain_events_1.DomainEvent.COMPANY_UPDATED]: exports.VeraEventTopic.COMPANY,
    [domain_events_1.DomainEvent.COMPLIANCE_RECALC]: exports.VeraEventTopic.COMPLIANCE,
    [domain_events_1.DomainEvent.SYNC_BATCH]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.CAIL_CREATED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.CAIL_ASSIGNED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.CAIL_RESOLVED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.CAIL_VERIFIED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.CAIL_OVERDUE]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.LESSON_LEARNED_PUBLISHED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.VSI_DASHBOARD_INVALIDATE]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.SAFETY_HUB_INVALIDATE]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.SAFETY_EVIDENCE_INDEXED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.INVESTIGATION_UPDATED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.CAPA_CREATED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.CAPA_STATUS_CHANGED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.SUBSTANCE_TEST_COMPLETED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.PERMIT_CREATED]: exports.VeraEventTopic.PERMIT,
    [domain_events_1.DomainEvent.PERMIT_FIELDOS_PUSHED]: exports.VeraEventTopic.PERMIT,
    [domain_events_1.DomainEvent.PERMIT_FIELDOS_UPDATED]: exports.VeraEventTopic.PERMIT,
    [domain_events_1.DomainEvent.PERMIT_CLOSED]: exports.VeraEventTopic.PERMIT,
    [domain_events_1.DomainEvent.PERMIT_SAFETY_LINKED]: exports.VeraEventTopic.PERMIT,
    [domain_events_1.DomainEvent.PERMIT_CSS_IMPACT]: exports.VeraEventTopic.PERMIT,
    [domain_events_1.DomainEvent.PERMIT_DASHBOARD_INVALIDATE]: exports.VeraEventTopic.PERMIT,
    [domain_events_1.DomainEvent.CONTRACTOR_DISPATCH_SENT]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.SMS_SCL_CLASSIFIED]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.SMS_HECA_ESCALATION]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.SMS_MANDATORY_INVESTIGATION]: exports.VeraEventTopic.PLATFORM,
    [domain_events_1.DomainEvent.SMS_WEEKLY_FORECAST]: exports.VeraEventTopic.PLATFORM,
};
function topicForEvent(eventName) {
    var _a;
    return (_a = exports.DOMAIN_EVENT_TOPIC_MAP[eventName]) !== null && _a !== void 0 ? _a : exports.VeraEventTopic.PLATFORM;
}
function natsSubjectForEvent(eventName) {
    const topic = topicForEvent(eventName);
    return `${topic}.${eventName.replace(/\./g, '_')}`;
}
function partitionKeyForEvent(event) {
    if (event.companyId != null)
        return `company:${event.companyId}`;
    if (event.projectId != null)
        return `project:${event.projectId}`;
    if (event.entityType && event.entityId != null) {
        return `${event.entityType}:${event.entityId}`;
    }
    return 'global';
}
//# sourceMappingURL=topics.js.map