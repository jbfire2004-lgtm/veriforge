import { Injectable } from '@nestjs/common';
import { EquipmentSafetyStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InactivationService } from '../modules/vera-core/inactivation.service';

@Injectable()
export class PmSafetyEventsEquipmentService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly inactivation: InactivationService,
  ) {}

  async applyLockoutsForEvent(eventId: string, actorUserId: number) {
    const links = await this.prisma.pmSafetyEventEquipment.findMany({
      where: { eventId },
      include: { equipment: true },
    });
    const event = await this.prisma.pmSafetyEvent.findUnique({
      where: { id: eventId },
    });
    if (!event) return [];

    const locked: number[] = [];
    const shouldLock =
      event.eventType === 'equipment_failure' ||
      event.severity === 'critical' ||
      event.severity === 'high';

    if (!shouldLock) return locked;

    for (const link of links) {
      const reason = `Safety event ${event.title}: ${
        link.failureNotes ?? 'equipment involved'
      }`;
      await this.inactivation.lockoutEquipment(link.equipmentId, reason);
      await this.prisma.equipment.update({
        where: { id: link.equipmentId },
        data: {
          safetyStatus: EquipmentSafetyStatus.UNSAFE,
          lockedOutAt: new Date(),
          lockoutReason: reason,
        },
      });
      await this.prisma.pmSafetyEventEquipment.update({
        where: { id: link.id },
        data: { lockoutApplied: true },
      });
      locked.push(link.equipmentId);
    }
    return locked;
  }
}
