import { BadRequestException, Injectable } from '@nestjs/common';
import { SafetyFormStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SAFETY_FORM_TRANSITIONS } from '../engine/form-engine.types';

@Injectable()
export class SafetyFormWorkflowsService {
  constructor(private readonly prisma: PrismaService) {}

  assertTransition(from: SafetyFormStatus, to: SafetyFormStatus): void {
    const allowed = SAFETY_FORM_TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(`Cannot transition from ${from} to ${to}`);
    }
  }

  async transition(
    formId: string,
    to: SafetyFormStatus,
    actorId?: number,
    note?: string,
  ) {
    const form = await this.prisma.safetyForm.findUniqueOrThrow({
      where: { id: formId },
    });
    this.assertTransition(form.status, to);

    const updated = await this.prisma.safetyForm.update({
      where: { id: formId },
      data: {
        status: to,
        reviewedById:
          to === 'APPROVED' || to === 'REJECTED' ? actorId : form.reviewedById,
        reviewedAt:
          to === 'APPROVED' || to === 'REJECTED' ? new Date() : form.reviewedAt,
        submittedAt: to === 'SUBMITTED' ? new Date() : form.submittedAt,
        submittedById: to === 'SUBMITTED' ? actorId : form.submittedById,
      },
    });

    await this.prisma.safetyFormAuditLog.create({
      data: {
        formId,
        eventType: `transition:${form.status}->${to}`,
        actorId,
        payload: note ? { note } : undefined,
      },
    });

    return updated;
  }

  getDefinition() {
    return {
      statuses: Object.keys(SAFETY_FORM_TRANSITIONS),
      transitions: SAFETY_FORM_TRANSITIONS,
    };
  }
}
