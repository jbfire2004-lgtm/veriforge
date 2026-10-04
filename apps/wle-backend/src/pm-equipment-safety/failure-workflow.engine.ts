import { BadRequestException } from '@nestjs/common';
import { PmEquipmentFailureStatus } from '@prisma/client';

const TRANSITIONS: Record<
  PmEquipmentFailureStatus,
  PmEquipmentFailureStatus[]
> = {
  reported: ['supervisor_review', 'locked_out'],
  supervisor_review: ['owner_review', 'locked_out', 'capa_open'],
  owner_review: ['capa_open', 'locked_out'],
  locked_out: ['capa_open'],
  capa_open: ['verified'],
  verified: ['closed'],
  closed: [],
};

export class FailureWorkflowEngine {
  assertTransition(
    from: PmEquipmentFailureStatus,
    to: PmEquipmentFailureStatus,
  ) {
    const allowed = TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(
        `Invalid failure transition: ${from} → ${to}`,
      );
    }
  }

  requiresSupervisorReview(
    severity: 'low' | 'medium' | 'high' | 'critical',
  ): boolean {
    return severity !== 'low';
  }
}
