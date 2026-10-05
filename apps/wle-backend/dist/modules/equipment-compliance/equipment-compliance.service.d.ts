import { LinkComplianceStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export type ComplianceTrigger = 'INSPECTION' | 'COMPETENCY' | 'TRAINING' | 'LOCKOUT' | 'UNLOCK' | 'MAINTENANCE' | 'CALIBRATION' | 'MANUAL' | 'SCHEDULED';
export type RecalculateOptions = {
    trigger: ComplianceTrigger;
    assessedByUserId?: number;
    notes?: string;
    inspectionId?: number;
    forceStatus?: LinkComplianceStatus;
};
export declare class EquipmentComplianceService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    recalculate(equipmentId: number, opts: RecalculateOptions): Promise<{
        equipmentId: number;
        complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
        lastInspectionAt: Date;
        nextInspectionAt: Date;
        competencyRequired: boolean;
        trainingRequired: boolean;
        complianceUpdatedAt: Date;
        trigger: ComplianceTrigger;
    }>;
    recalculateForCertification(certificationId: number): Promise<{
        recalculated: number;
    }>;
    dashboard(companyId?: number): Promise<{
        total: number;
        compliant: number;
        needsAttention: number;
        nonCompliant: number;
        lockedOut: number;
        overdueInspection: number;
        recent: {
            company: {
                id: number;
                name: string;
            };
            id: number;
            name: string;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date;
            nextInspectionAt: Date;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
        }[];
    }>;
    private computeStatus;
}
