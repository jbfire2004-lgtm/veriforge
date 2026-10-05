import { EquipmentComplianceService } from './equipment-compliance.service';
export declare class EquipmentComplianceController {
    private readonly compliance;
    constructor(compliance: EquipmentComplianceService);
    dashboard(companyId?: string): Promise<{
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
    recalculate(equipmentId: number): Promise<{
        equipmentId: number;
        complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
        lastInspectionAt: Date;
        nextInspectionAt: Date;
        competencyRequired: boolean;
        trainingRequired: boolean;
        complianceUpdatedAt: Date;
        trigger: import("./equipment-compliance.service").ComplianceTrigger;
    }>;
}
