/** Domain events (§7). */
export const DomainEvent = {
  WORKER_CREATED: 'worker.created',
  WORKER_UPDATED: 'worker.updated',
  WORKER_LINKED: 'worker.linked',
  WORKER_UNLINKED: 'worker.unlinked',
  EQUIPMENT_CREATED: 'equipment.created',
  EQUIPMENT_UPDATED: 'equipment.updated',
  EQUIPMENT_LINKED: 'equipment.linked',
  EQUIPMENT_UNLINKED: 'equipment.unlinked',
  INSPECTION_COMPLETED: 'inspection.completed',
  INSPECTION_INCIDENT_DRAFTED: 'inspection.incident_drafted',
  INCIDENT_CREATED_FROM_INSPECTION: 'incident.created_from_inspection',
  TRAINING_UPLOADED: 'training.uploaded',
  /** Worker finished a training course (record created / completed). */
  WORKER_TRAINING_COMPLETED: 'worker.training.completed',
  TRAINING_VALIDATED: 'training.validated',
  /** Training passed full verification pipeline. */
  TRAINING_VERIFIED: 'training.verified',
  TRAINING_VERIFICATION_ATTENTION: 'training.verification_attention',
  TRAINING_VERIFICATION_RUN: 'training.verification.run',
  TRAINING_CREDENTIAL_MINTED: 'training.credential.minted',
  WALLET_SYNCED: 'wallet.synced',
  WALLET_UPDATED: 'wallet.updated',
  WALLET_BUNDLE_SYNCED: 'wallet.bundle_synced',
  PROVIDER_SYNC_COMPLETED: 'provider.sync.completed',
  PROVIDER_SYNC_EVENT: 'provider.sync.event',
  PROVIDER_SYNC_FAILED: 'provider.sync.failed',
  PROVIDER_COMPLETION_RECEIVED: 'provider.completion.received',
  COMPANY_UPDATED: 'company.updated',
  PROJECT_UPDATED: 'project.updated',
  EXPIRY_APPROACHING: 'training.expiry.approaching',
  EXPIRY_PASSED: 'training.expiry.passed',
  WORKER_ASSIGNED_TO_PROJECT: 'worker.assigned.project',
  WORKER_REMOVED_FROM_PROJECT: 'worker.removed.project',
  UNION_HALL_ROSTER_UPDATE: 'union.hall.roster_update',
  VERIFICATION_COMPLETED: 'verification.completed',
  TRAINING_INGESTION_COMPLETED: 'training_ingestion.completed',
  TRAINING_INGESTION_FAILED: 'training_ingestion.failed',
  PROVIDER_HUB_SUMMARY: 'provider.hub.summary_generated',
  PROVIDER_APPROVED: 'provider.approved',
  UNION_TRAINING_PUSHED: 'union.training.pushed',
  UNION_DISPATCH: 'union.dispatch',
  PROJECT_ASSIGNED: 'project.assigned',
  PROJECT_CLOSED: 'project.closed',
  COMPLIANCE_RECALC: 'compliance.recalc',
  SYNC_BATCH: 'sync.batch',
  CAIL_CREATED: 'cail.created',
  CAIL_ASSIGNED: 'cail.assigned',
  CAIL_RESOLVED: 'cail.resolved',
  CAIL_VERIFIED: 'cail.verified',
  CAIL_OVERDUE: 'cail.overdue',
  LESSON_LEARNED_PUBLISHED: 'lesson_learned.published',
  VSI_DASHBOARD_INVALIDATE: 'vsi.dashboard.invalidate',
  SAFETY_HUB_INVALIDATE: 'safety_hub.invalidate',
  SAFETY_EVIDENCE_INDEXED: 'safety_hub.evidence_indexed',
  INVESTIGATION_UPDATED: 'investigation.updated',
  CAPA_CREATED: 'capa.created',
  CAPA_STATUS_CHANGED: 'capa.status_changed',
  SUBSTANCE_TEST_COMPLETED: 'substance_test.completed',
  /** VERIPM ↔ FieldOS permit lifecycle */
  PERMIT_CREATED: 'permit.created',
  PERMIT_FIELDOS_PUSHED: 'permit.fieldos.pushed',
  PERMIT_FIELDOS_UPDATED: 'permit.fieldos.updated',
  PERMIT_CLOSED: 'permit.closed',
  PERMIT_SAFETY_LINKED: 'permit.safety.linked',
  PERMIT_CSS_IMPACT: 'permit.css.impact',
  PERMIT_DASHBOARD_INVALIDATE: 'permit.dashboard.invalidate',
  CONTRACTOR_DISPATCH_SENT: 'contractor.dispatch_sent',
  SMS_SCL_CLASSIFIED: 'sms.scl_classified',
  SMS_HECA_ESCALATION: 'sms.heca_escalation',
  SMS_MANDATORY_INVESTIGATION: 'sms.mandatory_investigation',
  SMS_WEEKLY_FORECAST: 'sms.weekly_forecast',
  ORIENTATION_COMPLETED: 'orientation.completed',
  ORIENTATION_ASSIGNED: 'orientation.assigned',
} as const;

export type DomainEventName = (typeof DomainEvent)[keyof typeof DomainEvent];

export type DomainEventPayload = {
  name: DomainEventName;
  occurredAt: string;
  actorId?: number;
  companyId?: number;
  projectId?: number;
  entityType?: string;
  entityId?: number | string;
  data?: Record<string, unknown>;
};
