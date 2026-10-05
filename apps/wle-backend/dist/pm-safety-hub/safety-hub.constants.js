"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAFETY_NOTIFICATION_PREFIXES = exports.HUB_INVALIDATION_EVENTS = exports.SAFETY_HUB_MODULE_LINKS = exports.SAFETY_HUB_DOMAIN_LABELS = void 0;
const domain_events_1 = require("../modules/api-platform/events/domain-events");
exports.SAFETY_HUB_DOMAIN_LABELS = {
    inspection: 'Inspections',
    investigation: 'Investigations',
    corrective_action: 'Corrective actions',
    predictive: 'Predictive analytics',
    contractor: 'Contractor compliance',
    substance_testing: 'Drug & alcohol testing',
    competency: 'Worker competency',
    equipment: 'Equipment safety',
};
exports.SAFETY_HUB_MODULE_LINKS = {
    inspection: { href: '/pm/inspections', label: 'Inspections' },
    investigation: { href: '/pm/incidents', label: 'Incidents & investigations' },
    corrective_action: {
        href: '/pm/unified-corrective-action',
        label: 'Corrective actions',
    },
    predictive: {
        href: '/pm/predictive-safety-analytics',
        label: 'Predictive analytics',
    },
    contractor: { href: '/contractor', label: 'Contractor portal' },
    substance_testing: {
        href: '/pm/substance-testing',
        label: 'Substance testing',
    },
    competency: { href: '/pm/worker-safety-profile', label: 'Worker competency' },
    equipment: { href: '/pm/equipment-safety', label: 'Equipment safety' },
};
exports.HUB_INVALIDATION_EVENTS = [
    domain_events_1.DomainEvent.INSPECTION_COMPLETED,
    domain_events_1.DomainEvent.CAIL_CREATED,
    domain_events_1.DomainEvent.CAIL_ASSIGNED,
    domain_events_1.DomainEvent.CAIL_RESOLVED,
    domain_events_1.DomainEvent.CAIL_VERIFIED,
    domain_events_1.DomainEvent.CAIL_OVERDUE,
    domain_events_1.DomainEvent.INVESTIGATION_UPDATED,
    domain_events_1.DomainEvent.CAPA_CREATED,
    domain_events_1.DomainEvent.CAPA_STATUS_CHANGED,
    domain_events_1.DomainEvent.SUBSTANCE_TEST_COMPLETED,
    domain_events_1.DomainEvent.CONTRACTOR_DISPATCH_SENT,
    domain_events_1.DomainEvent.SAFETY_EVIDENCE_INDEXED,
    domain_events_1.DomainEvent.COMPLIANCE_RECALC,
    domain_events_1.DomainEvent.SAFETY_HUB_INVALIDATE,
    domain_events_1.DomainEvent.SAFETY_EVIDENCE_INDEXED,
];
exports.SAFETY_NOTIFICATION_PREFIXES = [
    'cail',
    'inspection',
    'contractor',
    'substance',
    'capa',
    'corrective',
    'equipment',
    'competency',
    'training',
    'predictive',
    'safety_hub',
];
//# sourceMappingURL=safety-hub.constants.js.map