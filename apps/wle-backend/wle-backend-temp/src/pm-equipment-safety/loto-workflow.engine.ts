import { BadRequestException } from '@nestjs/common';
import { PmEquipmentLotoStatus } from '@prisma/client';

const TRANSITIONS: Record<PmEquipmentLotoStatus, PmEquipmentLotoStatus[]> = {
  active: ['verified', 'cancelled'],
  verified: ['removed', 'cancelled'],
  removed: [],
  cancelled: [],
};

export class LotoWorkflowEngine {
  assertTransition(from: PmEquipmentLotoStatus, to: PmEquipmentLotoStatus) {
    const allowed = TRANSITIONS[from] ?? [];
    if (!allowed.includes(to)) {
      throw new BadRequestException(`Invalid LOTO transition: ${from} → ${to}`);
    }
  }
}
