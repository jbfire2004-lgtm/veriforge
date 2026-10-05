import { ForbiddenException } from '@nestjs/common';
import type { UserRole } from '@prisma/client';
import { PM_SAFETY_ERROR } from './pm-safety-workflow.errors';
import type { PmSafetyAction } from './pm-safety-workflow.types';

/**
 * Actor matrix (non-ADMIN):
 * - **Supervisor**: formal review — start_review, approve, reject
 * - **Project Manager**: draft lifecycle — submit, revise; operational — close; cancel with supervisor
 * - **Worker**: submit / revise (field edits), not review or cancel
 * - **ADMIN**: all (handled before this function)
 */
export function assertActorMayPerformAction(
  action: PmSafetyAction,
  role: UserRole,
): void {
  if (role === 'ADMIN') {
    return;
  }

  const isSupervisor = role === 'SUPERVISOR';
  const isPm = role === 'PROJECT_MANAGER';
  const isWorker = role === 'WORKER';

  let allowed = false;
  switch (action) {
    case 'submit':
    case 'revise':
      allowed = isPm || isWorker;
      break;
    case 'close':
      allowed = isPm || isSupervisor;
      break;
    case 'cancel':
      allowed = isPm || isSupervisor;
      break;
    case 'start_review':
    case 'approve':
    case 'reject':
      allowed = isSupervisor;
      break;
    default:
      allowed = false;
  }

  if (!allowed) {
    throw new ForbiddenException({
      code: PM_SAFETY_ERROR.ACTOR_FORBIDDEN,
      message: `Role ${role} is not permitted to perform action "${action}"`,
      action,
      role,
    });
  }
}
