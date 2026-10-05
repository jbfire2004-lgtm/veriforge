import { PrismaService } from '../prisma/prisma.service';
import { InactivationService } from '../modules/vera-core/inactivation.service';
export declare class PmSafetyEventsEquipmentService {
    private readonly prisma;
    private readonly inactivation;
    constructor(prisma: PrismaService, inactivation: InactivationService);
    applyLockoutsForEvent(eventId: string, actorUserId: number): Promise<number[]>;
}
