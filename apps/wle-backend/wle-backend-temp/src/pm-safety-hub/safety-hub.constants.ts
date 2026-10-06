import { PmSafetyHubDomain } from '@prisma/client';
import { DomainEvent } from '../modules/api-platform/events/domain-events';

export const SAFETY_HUB_DOMAIN_LABELS: Record<PmSafetyHubDomain, string> = {
  inspection: 'Inspections',
  investigation: 'Investigations',
  corrective_action: 'Corrective actions',
  predictive: 'Predictive analytics',
  contractor: 'Contractor compliance',
  substance_testing: 'Drug & alcohol testing',
  competency: 'Worker competency',
  equipment: 'Equipment safety',
};

export const SAFETY_HUB_MODULE_LINKS: Record<
  PmSafetyHubDomain,
  { href: string; label: string }
> = {
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

export const HUB_INVALIDATION_EVENTS: string[] = [
  DomainEvent.INSPECTION_COMPLETED,
  DomainEvent.CAIL_CREATED,
  DomainEvent.CAIL_ASSIGNED,
  DomainEvent.CAIL_RESOLVED,
  DomainEvent.CAIL_VERIFIED,
  DomainEvent.CAIL_OVERDUE,
  DomainEvent.INVESTIGATION_UPDATED,
  DomainEvent.CAPA_CREATED,
  DomainEvent.CAPA_STATUS_CHANGED,
  DomainEvent.SUBSTANCE_TEST_COMPLETED,
  DomainEvent.CONTRACTOR_DISPATCH_SENT,
  DomainEvent.SAFETY_EVIDENCE_INDEXED,
  DomainEvent.COMPLIANCE_RECALC,
  DomainEvent.SAFETY_HUB_INVALIDATE,
  DomainEvent.SAFETY_EVIDENCE_INDEXED,
];

export const SAFETY_NOTIFICATION_PREFIXES = [
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
