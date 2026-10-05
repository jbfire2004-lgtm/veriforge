import { PmEquipmentSafetyService } from './pm-equipment-safety.service';
import { PmEquipmentCailIntelligenceService } from './pm-equipment-cail-intelligence.service';
export declare class PmEquipmentController {
    private readonly equipment;
    private readonly cail;
    constructor(equipment: PmEquipmentSafetyService, cail: PmEquipmentCailIntelligenceService);
    offlineSync(body: {
        projectId: number;
        inspections?: Array<Record<string, unknown>>;
        lotoCreates?: Array<Record<string, unknown>>;
        failures?: Array<Record<string, unknown>>;
        authorizations?: Array<Record<string, unknown>>;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        inspections: number;
        loto: number;
        failures: number;
        auths: number;
    }>;
    register(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        name: string;
        serialNumber: string | null;
        assetTag: string | null;
        qrToken: string | null;
        safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
        companyId: number | null;
        categoryId: number | null;
        typeId: number | null;
        photoUrl: string | null;
        description: string | null;
        manufacturer: string | null;
        model: string | null;
        yearMade: number | null;
        lockedOutAt: Date | null;
        lockoutReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
        catalogTypeKey: string | null;
        meterHours: number;
        complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        lastInspectionAt: Date | null;
        nextInspectionAt: Date | null;
        lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
        competencyRequired: boolean;
        trainingRequired: boolean;
        complianceUpdatedAt: Date | null;
        operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
        safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
        capacity: string | null;
        loadChartJson: import(".prisma/client").Prisma.JsonValue;
        pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
    score(id: number, projectId?: string): Promise<{
        equipmentId: number;
        conditionScore: number;
        riskBand: "medium" | "low" | "high" | "critical";
        factors: Record<string, number>;
        status: "active" | "in_service" | "out_of_service" | "locked_out";
        nextInspectionDue: Date;
        lastInspectionDate: Date;
        lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
        complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
    }>;
    predict(id: number): Promise<{
        equipmentId: number;
        score: number;
        band: string;
        conditionScore?: undefined;
        riskBand?: undefined;
        predictiveFailureLikelihood?: undefined;
        recommendedActions?: undefined;
        explainability?: undefined;
    } | {
        equipmentId: number;
        conditionScore: number;
        riskBand: "medium" | "low" | "high" | "critical";
        predictiveFailureLikelihood: number;
        recommendedActions: string[];
        explainability: string[];
        score?: undefined;
        band?: undefined;
    }>;
    inspection(id: number, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        items: {
            id: string;
            equipmentInspectionId: string;
            itemKey: string;
            label: string;
            passed: boolean | null;
            score: number | null;
            notes: string | null;
            deficiencySeverity: string | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        equipmentId: number;
        pmInspectionId: string | null;
        cadence: import(".prisma/client").$Enums.PmEquipmentInspectionCadence;
        conditionScore: number | null;
        passed: boolean | null;
        requiresSupervisorReview: boolean;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    certification(id: number, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        equipmentId: number;
        certificationType: import(".prisma/client").$Enums.PmEquipmentCertificationType;
        status: import(".prisma/client").$Enums.PmEquipmentCertificationStatus;
        certificateNumber: string | null;
        issuedAt: Date | null;
        expiresAt: Date | null;
        storageKey: string | null;
        approvedByUserId: number | null;
        approvedAt: Date | null;
        reviewDueAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    authorize(id: number, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        workerId: number;
        equipmentId: number | null;
        authType: import(".prisma/client").$Enums.PmWorkerEquipmentAuthType;
        equipmentCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
        expiresAt: Date | null;
        active: boolean;
        issuedAt: Date;
        issuedByUserId: number | null;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    lockout(id: number, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        equipmentId: number;
        status: import(".prisma/client").$Enums.PmEquipmentLotoStatus;
        reason: string;
        stepsJson: import(".prisma/client").Prisma.JsonValue;
        authorizedWorkerIds: import(".prisma/client").Prisma.JsonValue;
        verifiedAt: Date | null;
        verifiedByUserId: number | null;
        removedAt: Date | null;
        removedByUserId: number | null;
        legacyLockoutId: number | null;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    unlock(id: number, req: {
        user: {
            id: number;
        };
    }): Promise<{
        equipmentId: number;
        lockoutsRemoved: number;
    }>;
    get(id: number): Promise<{
        attachments: {
            id: number;
            equipmentId: number;
            type: import(".prisma/client").$Enums.EquipmentAttachmentType;
            name: string;
            url: string;
            notes: string | null;
            createdAt: Date;
        }[];
        category: {
            id: number;
            companyId: number | null;
            name: string;
            code: string | null;
            description: string | null;
            createdAt: Date;
        };
        type: {
            id: number;
            categoryId: number;
            name: string;
            code: string | null;
            catalogTypeKey: string | null;
            createdAt: Date;
        };
        maintenanceRecords: {
            id: number;
            equipmentId: number;
            type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
            performedAt: Date;
            performedBy: number | null;
            notes: string | null;
            nextDueAt: Date | null;
            meterHours: number | null;
            createdAt: Date;
        }[];
        lockoutHistory: {
            id: number;
            equipmentId: number;
            companyId: number | null;
            reason: string;
            lockedAt: Date;
            unlockedAt: Date | null;
            lockedByUserId: number | null;
            unlockedByUserId: number | null;
        }[];
        pmCertifications: {
            id: string;
            companyId: number;
            equipmentId: number;
            certificationType: import(".prisma/client").$Enums.PmEquipmentCertificationType;
            status: import(".prisma/client").$Enums.PmEquipmentCertificationStatus;
            certificateNumber: string | null;
            issuedAt: Date | null;
            expiresAt: Date | null;
            storageKey: string | null;
            approvedByUserId: number | null;
            approvedAt: Date | null;
            reviewDueAt: Date | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pmEquipmentInspections: {
            id: string;
            companyId: number;
            projectId: number;
            equipmentId: number;
            pmInspectionId: string | null;
            cadence: import(".prisma/client").$Enums.PmEquipmentInspectionCadence;
            conditionScore: number | null;
            passed: boolean | null;
            requiresSupervisorReview: boolean;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pmFailures: {
            id: string;
            companyId: number;
            projectId: number | null;
            equipmentId: number;
            failureType: import(".prisma/client").$Enums.PmEquipmentFailureType;
            status: import(".prisma/client").$Enums.PmEquipmentFailureStatus;
            title: string;
            description: string | null;
            hazardCreated: boolean;
            safetyEventId: string | null;
            correctiveActionId: string | null;
            reportedByUserId: number | null;
            supervisorReviewedAt: Date | null;
            ownerReviewedAt: Date | null;
            lockedOutAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        pmLotoEvents: {
            id: string;
            companyId: number;
            equipmentId: number;
            status: import(".prisma/client").$Enums.PmEquipmentLotoStatus;
            reason: string;
            stepsJson: import(".prisma/client").Prisma.JsonValue;
            authorizedWorkerIds: import(".prisma/client").Prisma.JsonValue;
            verifiedAt: Date | null;
            verifiedByUserId: number | null;
            removedAt: Date | null;
            removedByUserId: number | null;
            legacyLockoutId: number | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        workerAuthorizations: {
            id: string;
            companyId: number;
            workerId: number;
            equipmentId: number | null;
            authType: import(".prisma/client").$Enums.PmWorkerEquipmentAuthType;
            equipmentCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
            expiresAt: Date | null;
            active: boolean;
            issuedAt: Date;
            issuedByUserId: number | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: number;
        name: string;
        serialNumber: string | null;
        assetTag: string | null;
        qrToken: string | null;
        safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
        companyId: number | null;
        categoryId: number | null;
        typeId: number | null;
        photoUrl: string | null;
        description: string | null;
        manufacturer: string | null;
        model: string | null;
        yearMade: number | null;
        lockedOutAt: Date | null;
        lockoutReason: string | null;
        createdAt: Date;
        updatedAt: Date;
        catalogCategory: import(".prisma/client").$Enums.EquipmentCatalogCategory | null;
        catalogTypeKey: string | null;
        meterHours: number;
        complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        lastInspectionAt: Date | null;
        nextInspectionAt: Date | null;
        lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
        competencyRequired: boolean;
        trainingRequired: boolean;
        complianceUpdatedAt: Date | null;
        operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
        safetyCategory: import(".prisma/client").$Enums.PmEquipmentSafetyCategory | null;
        capacity: string | null;
        loadChartJson: import(".prisma/client").Prisma.JsonValue;
        pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
}
