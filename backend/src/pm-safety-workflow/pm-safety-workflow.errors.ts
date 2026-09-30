import { BadRequestException } from '@nestjs/common';
import type { PmSafetyWorkflowStatus } from '@prisma/client';
import type { PmSafetyAction } from './pm-safety-workflow.types';
import { transitionActionsFrom } from './pm-safety-workflow.types';

export const PM_SAFETY_ERROR = {
  INVALID_TRANSITION: 'PM_SAFETY_INVALID_TRANSITION',
  ACTOR_FORBIDDEN: 'PM_SAFETY_ACTOR_FORBIDDEN',
} as const;

/** Canonical 400 body for illegal state-machine edges (contract-stable `code`). */
export function pmSafetyInvalidTransition(params: {
  status: PmSafetyWorkflowStatus;
  action: PmSafetyAction;
}): BadRequestException {
  const allowedActions = transitionActionsFrom(params.status);
  return new BadRequestException({
    code: PM_SAFETY_ERROR.INVALID_TRANSITION,
    message: `Transition "${params.action}" is not valid from status ${params.status}`,
    status: params.status,
    action: params.action,
    allowedActions,
  });
}
