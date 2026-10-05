import { PmDeficiencySeverity } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { InactivationService } from '../modules/vera-core/inactivation.service';
export declare class PmInspectionsEquipmentService {
    private readonly prisma;
    private readonly inactivation;
    constructor(prisma: PrismaService, inactivation: InactivationService);
    evaluateEquipmentBlock(inspectionId: string): Promise<{
        blocked: boolean;
        reason?: string;
    }>;
    applyLockoutIfNeeded(inspectionId: string, actorUserId: number): Promise<boolean>;
    static severityRequiresLockout(severity: PmDeficiencySeverity): boolean;
}
