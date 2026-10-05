import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';

export const SMS_WORKFLOW_ENTITIES = [
  'flha',
  'jha',
  'inspection',
  'audit',
  'corrective-action',
  'investigation',
] as const;

export type SmsWorkflowEntity = (typeof SMS_WORKFLOW_ENTITIES)[number];

export const SMS_WORKFLOW_API_SURFACE = {
  basePath: '/api/v1/pm/sms/workflows',
  entities: SMS_WORKFLOW_ENTITIES,
  operations: ['list', 'create', 'get', 'patch', 'submit'] as const,
  legacyPaths: {
    flha: '/api/v1/pm/jha-flha',
    jha: '/api/v1/pm/jha-flha',
    inspection: '/api/v1/pm/inspections',
    audit: '/api/v1/pm/inspections',
    correctiveAction: '/api/v1/pm/corrective-actions',
    investigation: '/api/v1/pm/incidents/:eventId/investigation',
    sclHecaEnergy: '/api/v1/pm/sms',
  },
  statusEnums: {
    flha: [
      'DRAFT',
      'SUBMITTED',
      'UNDER_REVIEW',
      'APPROVED',
      'LOCKED',
      'REJECTED',
    ],
    inspection: [
      'draft',
      'in_progress',
      'submitted',
      'review_required',
      'approved',
      'rejected',
      'closed',
    ],
    correctiveAction: [
      'draft',
      'open',
      'assigned',
      'in_progress',
      'verification_pending',
      'verified',
      'closed',
      'cancelled',
    ],
    investigation: [
      'not_started',
      'evidence_gathering',
      'analysis',
      'root_cause',
      'capa_planning',
      'review',
      'closed',
    ],
  },
} as const;

export function parseSmsWorkflowEntity(value: string): SmsWorkflowEntity {
  if (!(SMS_WORKFLOW_ENTITIES as readonly string[]).includes(value)) {
    throw new BadRequestException({
      code: 'INVALID_ENTITY',
      message: `Unknown SMS workflow entity "${value}". Valid entities: ${SMS_WORKFLOW_ENTITIES.join(
        ', ',
      )}`,
    });
  }
  return value as SmsWorkflowEntity;
}

export function notImplemented(feature: string): never {
  throw new HttpException(
    {
      code: 'NOT_IMPLEMENTED',
      message: `${feature} is not implemented yet. See GET /api/v1/pm/sms/workflows for supported operations.`,
    },
    HttpStatus.NOT_IMPLEMENTED,
  );
}
