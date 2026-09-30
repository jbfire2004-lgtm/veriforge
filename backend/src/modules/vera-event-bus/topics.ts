import {
  DomainEvent,
  type DomainEventName,
} from '../api-platform/events/domain-events';

/**
 * Kafka / NATS topic names for Vera domain events.
 * Convention: `vera.<domain>.<action>` — stable across transports.
 */
export const VeraEventTopic = {
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
} as const;

export type VeraEventTopicName =
  (typeof VeraEventTopic)[keyof typeof VeraEventTopic];

/** Maps each domain event to its primary Kafka/NATS topic. */
export const DOMAIN_EVENT_TOPIC_MAP: Record<
  DomainEventName,
  VeraEventTopicName
> = {
  [DomainEvent.WORKER_CREATED]: VeraEventTopic.WORKER,
  [DomainEvent.WORKER_UPDATED]: VeraEventTopic.WORKER,
  [DomainEvent.WORKER_LINKED]: VeraEventTopic.WORKER,
  [DomainEvent.WORKER_UNLINKED]: VeraEventTopic.WORKER,
  [DomainEvent.WORKER_TRAINING_COMPLETED]: VeraEventTopic.TRAINING,
  [DomainEvent.ORIENTATION_COMPLETED]: VeraEventTopic.TRAINING,
  [DomainEvent.ORIENTATION_ASSIGNED]: VeraEventTopic.TRAINING,
  [DomainEvent.WORKER_ASSIGNED_TO_PROJECT]: VeraEventTopic.PROJECT,
  [DomainEvent.WORKER_REMOVED_FROM_PROJECT]: VeraEventTopic.PROJECT,
  [DomainEvent.EQUIPMENT_CREATED]: VeraEventTopic.PLATFORM,
  [DomainEvent.EQUIPMENT_UPDATED]: VeraEventTopic.PLATFORM,
  [DomainEvent.EQUIPMENT_LINKED]: VeraEventTopic.PLATFORM,
  [DomainEvent.EQUIPMENT_UNLINKED]: VeraEventTopic.PLATFORM,
  [DomainEvent.INSPECTION_COMPLETED]: VeraEventTopic.PLATFORM,
  [DomainEvent.INSPECTION_INCIDENT_DRAFTED]: VeraEventTopic.PLATFORM,
  [DomainEvent.INCIDENT_CREATED_FROM_INSPECTION]: VeraEventTopic.PLATFORM,
  [DomainEvent.TRAINING_UPLOADED]: VeraEventTopic.TRAINING,
  [DomainEvent.TRAINING_VALIDATED]: VeraEventTopic.TRAINING,
  [DomainEvent.TRAINING_VERIFIED]: VeraEventTopic.TRAINING,
  [DomainEvent.TRAINING_VERIFICATION_ATTENTION]: VeraEventTopic.TRAINING,
  [DomainEvent.TRAINING_VERIFICATION_RUN]: VeraEventTopic.TRAINING,
  [DomainEvent.TRAINING_CREDENTIAL_MINTED]: VeraEventTopic.TRAINING,
  [DomainEvent.EXPIRY_APPROACHING]: VeraEventTopic.EXPIRY,
  [DomainEvent.EXPIRY_PASSED]: VeraEventTopic.EXPIRY,
  [DomainEvent.WALLET_SYNCED]: VeraEventTopic.WALLET,
  [DomainEvent.WALLET_UPDATED]: VeraEventTopic.WALLET,
  [DomainEvent.WALLET_BUNDLE_SYNCED]: VeraEventTopic.WALLET,
  [DomainEvent.PROVIDER_SYNC_COMPLETED]: VeraEventTopic.PROVIDER,
  [DomainEvent.PROVIDER_SYNC_EVENT]: VeraEventTopic.PROVIDER,
  [DomainEvent.PROVIDER_SYNC_FAILED]: VeraEventTopic.PROVIDER,
  [DomainEvent.PROVIDER_COMPLETION_RECEIVED]: VeraEventTopic.PROVIDER,
  [DomainEvent.VERIFICATION_COMPLETED]: VeraEventTopic.TRAINING,
  [DomainEvent.TRAINING_INGESTION_COMPLETED]: VeraEventTopic.TRAINING,
  [DomainEvent.TRAINING_INGESTION_FAILED]: VeraEventTopic.TRAINING,
  [DomainEvent.PROVIDER_HUB_SUMMARY]: VeraEventTopic.PROVIDER,
  [DomainEvent.PROVIDER_APPROVED]: VeraEventTopic.PROVIDER,
  [DomainEvent.UNION_TRAINING_PUSHED]: VeraEventTopic.UNION,
  [DomainEvent.UNION_DISPATCH]: VeraEventTopic.UNION,
  [DomainEvent.UNION_HALL_ROSTER_UPDATE]: VeraEventTopic.UNION,
  [DomainEvent.PROJECT_ASSIGNED]: VeraEventTopic.PROJECT,
  [DomainEvent.PROJECT_CLOSED]: VeraEventTopic.PROJECT,
  [DomainEvent.PROJECT_UPDATED]: VeraEventTopic.PROJECT,
  [DomainEvent.COMPANY_UPDATED]: VeraEventTopic.COMPANY,
  [DomainEvent.COMPLIANCE_RECALC]: VeraEventTopic.COMPLIANCE,
  [DomainEvent.SYNC_BATCH]: VeraEventTopic.PLATFORM,
  [DomainEvent.CAIL_CREATED]: VeraEventTopic.PLATFORM,
  [DomainEvent.CAIL_ASSIGNED]: VeraEventTopic.PLATFORM,
  [DomainEvent.CAIL_RESOLVED]: VeraEventTopic.PLATFORM,
  [DomainEvent.CAIL_VERIFIED]: VeraEventTopic.PLATFORM,
  [DomainEvent.CAIL_OVERDUE]: VeraEventTopic.PLATFORM,
  [DomainEvent.LESSON_LEARNED_PUBLISHED]: VeraEventTopic.PLATFORM,
  [DomainEvent.VSI_DASHBOARD_INVALIDATE]: VeraEventTopic.PLATFORM,
  [DomainEvent.SAFETY_HUB_INVALIDATE]: VeraEventTopic.PLATFORM,
  [DomainEvent.SAFETY_EVIDENCE_INDEXED]: VeraEventTopic.PLATFORM,
  [DomainEvent.INVESTIGATION_UPDATED]: VeraEventTopic.PLATFORM,
  [DomainEvent.CAPA_CREATED]: VeraEventTopic.PLATFORM,
  [DomainEvent.CAPA_STATUS_CHANGED]: VeraEventTopic.PLATFORM,
  [DomainEvent.SUBSTANCE_TEST_COMPLETED]: VeraEventTopic.PLATFORM,
  [DomainEvent.PERMIT_CREATED]: VeraEventTopic.PERMIT,
  [DomainEvent.PERMIT_FIELDOS_PUSHED]: VeraEventTopic.PERMIT,
  [DomainEvent.PERMIT_FIELDOS_UPDATED]: VeraEventTopic.PERMIT,
  [DomainEvent.PERMIT_CLOSED]: VeraEventTopic.PERMIT,
  [DomainEvent.PERMIT_SAFETY_LINKED]: VeraEventTopic.PERMIT,
  [DomainEvent.PERMIT_CSS_IMPACT]: VeraEventTopic.PERMIT,
  [DomainEvent.PERMIT_DASHBOARD_INVALIDATE]: VeraEventTopic.PERMIT,
  [DomainEvent.CONTRACTOR_DISPATCH_SENT]: VeraEventTopic.PLATFORM,
  [DomainEvent.SMS_SCL_CLASSIFIED]: VeraEventTopic.PLATFORM,
  [DomainEvent.SMS_HECA_ESCALATION]: VeraEventTopic.PLATFORM,
  [DomainEvent.SMS_MANDATORY_INVESTIGATION]: VeraEventTopic.PLATFORM,
  [DomainEvent.SMS_WEEKLY_FORECAST]: VeraEventTopic.PLATFORM,
};

export function topicForEvent(eventName: DomainEventName): VeraEventTopicName {
  return DOMAIN_EVENT_TOPIC_MAP[eventName] ?? VeraEventTopic.PLATFORM;
}

/** Full subject: `vera.training.training.verified` */
export function natsSubjectForEvent(eventName: DomainEventName): string {
  const topic = topicForEvent(eventName);
  return `${topic}.${eventName.replace(/\./g, '_')}`;
}

/** Kafka key for partition affinity (company > project > entity). */
export function partitionKeyForEvent(event: {
  companyId?: number;
  projectId?: number;
  entityType?: string;
  entityId?: number | string;
}): string {
  if (event.companyId != null) return `company:${event.companyId}`;
  if (event.projectId != null) return `project:${event.projectId}`;
  if (event.entityType && event.entityId != null) {
    return `${event.entityType}:${event.entityId}`;
  }
  return 'global';
}
