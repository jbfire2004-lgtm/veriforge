/** Canonical safety-critical audit action keys. */
export const AuditAction = {
  // Inspections
  INSPECTION_CREATED: 'inspection.created',
  INSPECTION_SUBMITTED: 'inspection.submitted',
  INSPECTION_ESCALATED: 'inspection.escalated',
  INSPECTION_AUTO_CAPA: 'inspection.auto_capa',
  INSPECTION_AUTO_INCIDENT: 'inspection.auto_incident',
  INSPECTION_AUTO_MEETING: 'inspection.auto_meeting',

  // Assessments
  ASSESSMENT_TAE_RUN: 'assessment.tae.run',
  ASSESSMENT_SKE_RUN: 'assessment.ske.run',
  ASSESSMENT_SPCE_RUN: 'assessment.spce.run',
  ASSESSMENT_SGAE_RUN: 'assessment.sgae.run',
  ASSESSMENT_COMPETENCY_RECORD: 'assessment.competency.record',
  ASSESSMENT_EQUIPMENT_COMPETENCY: 'assessment.equipment_competency.record',
  ASSESSMENT_FIT_TEST_RECORD: 'assessment.fit_test.record',

  // PM incidents (safety events)
  INCIDENT_CREATED: 'incident.created',
  INCIDENT_STATUS_CHANGED: 'incident.status_changed',
  INCIDENT_RCA_ADDED: 'incident.rca_added',

  // Wallet / QR / verification
  VERIFICATION_SUCCESS: 'verification.success',
  VERIFICATION_FAILED: 'verification.failed',
  QR_SCAN_SUCCESS: 'qr.scan.success',
  QR_SCAN_FAILED: 'qr.scan.failed',

  // Admin / ACP
  ADMIN_ROLE_CHANGED: 'admin.role_changed',
  ACP_ROLE_CREATED: 'acp.role.created',
  ACP_ROLE_UPDATED: 'acp.role.updated',
  ACP_ROLE_DELETED: 'acp.role.deleted',
  ACP_USER_ROLE_ASSIGNED: 'acp.user_role.assigned',
  ACP_USER_ROLE_REMOVED: 'acp.user_role.removed',
  ACP_PERMISSIONS_UPDATED: 'acp.permissions.updated',

  // Templates
  TEMPLATE_CREATED: 'template.created',
  TEMPLATE_UPDATED: 'template.updated',
  TEMPLATE_PUBLISHED: 'template.published',
  TEMPLATE_ARCHIVED: 'template.archived',

  // VeriAgent (AI egress — metadata only, never payloads)
  AI_EGRESS: 'ai.egress',
  AI_EGRESS_DENIED: 'ai.egress.denied',

  // VeriForge Orientation System
  ORIENTATION_DEFINITION_CREATED: 'orientation.definition.created',
  ORIENTATION_DEFINITION_UPDATED: 'orientation.definition.updated',
  ORIENTATION_REQUIREMENT_CREATED: 'orientation.requirement.created',
  ORIENTATION_REQUIREMENT_UPDATED: 'orientation.requirement.updated',
  ORIENTATION_COMPLETION_RECORDED: 'orientation.completion.recorded',
  ORIENTATION_DELIVERY_ASSIGNED: 'orientation.delivery.assigned',
} as const;

export type AuditActionKey = (typeof AuditAction)[keyof typeof AuditAction];

export const AuditEntityType = {
  PM_INSPECTION: 'PmInspection',
  PM_INSPECTION_TEMPLATE: 'PmInspectionTemplate',
  PM_SAFETY_EVENT: 'PmSafetyEvent',
  PM_CORRECTIVE_ACTION: 'PmCorrectiveAction',
  PM_SAFETY_MEETING: 'PmSafetyMeeting',
  VERA_ASSESSMENT_RUN: 'VeraAssessmentRun',
  COMPETENCY_EVALUATION: 'CompetencyEvaluation',
  FIT_TEST_RUN: 'FitTestRun',
  WORKER: 'Worker',
  EQUIPMENT: 'Equipment',
  TRAINING_RECORD: 'TrainingRecord',
  USER: 'User',
  ACP_ROLE: 'AcpRole',
  ACP_USER_ROLE: 'AcpUserRole',
  QR_SCAN: 'QrScan',
  /** Persisted audit entity type — do not rename (appears in audit logs). Env uses `VERA_AGENT_*`. */
  VERI_AGENT: 'VeriAgent',
  ORIENTATION_DEFINITION: 'OrientationDefinition',
  ORIENTATION_REQUIREMENT: 'OrientationRequirement',
  ORIENTATION_COMPLETION: 'OrientationCompletion',
  ORIENTATION_DELIVERY: 'OrientationDeliveryLink',
} as const;

export type AuditEntityTypeKey =
  (typeof AuditEntityType)[keyof typeof AuditEntityType];
