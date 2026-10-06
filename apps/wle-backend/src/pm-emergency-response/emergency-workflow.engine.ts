import { BadRequestException } from '@nestjs/common';
import { PmEmergencyEventStatus, PmEmergencyPlanStatus } from '@prisma/client';

const PLAN_TRANSITIONS: Record<PmEmergencyPlanStatus, PmEmergencyPlanStatus[]> =
  {
    draft: ['review', 'archived'],
    review: ['approved', 'draft', 'archived'],
    approved: ['published', 'review', 'archived'],
    published: ['archived'],
    archived: [],
  };

const EVENT_TRANSITIONS: Record<
  PmEmergencyEventStatus,
  PmEmergencyEventStatus[]
> = {
  declared: ['active', 'muster_in_progress', 'cancelled'],
  active: ['muster_in_progress', 'evacuation_in_progress', 'cancelled'],
  muster_in_progress: [
    'evacuation_in_progress',
    'supervisor_review',
    'all_clear',
  ],
  evacuation_in_progress: ['supervisor_review', 'all_clear'],
  supervisor_review: ['all_clear', 'closed'],
  all_clear: ['closed'],
  closed: [],
  cancelled: [],
};

export class EmergencyWorkflowEngine {
  assertPlanTransition(from: PmEmergencyPlanStatus, to: PmEmergencyPlanStatus) {
    const allowed = PLAN_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(`Invalid plan transition: ${from} → ${to}`);
    }
  }

  assertEventTransition(
    from: PmEmergencyEventStatus,
    to: PmEmergencyEventStatus,
  ) {
    const allowed = EVENT_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Invalid event transition: ${from} → ${to}`,
      );
    }
  }
}
