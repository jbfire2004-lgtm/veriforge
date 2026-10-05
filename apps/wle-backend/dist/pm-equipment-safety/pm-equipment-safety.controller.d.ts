import { PmEquipmentOperationalStatus, PmEquipmentSafetyCategory, PmEquipmentFailureStatus } from '@prisma/client';
import { TenantScopeService } from '../security/tenant-scope.service';
import type { SecurityActor } from '../security/security.types';
import { PmEquipmentSafetyService } from './pm-equipment-safety.service';
import { PmEquipmentCailIntelligenceService } from './pm-equipment-cail-intelligence.service';
export declare class PmEquipmentSafetyController {
    private readonly equipment;
    private readonly cail;
    private readonly tenant;
    constructor(equipment: PmEquipmentSafetyService, cail: PmEquipmentCailIntelligenceService, tenant: TenantScopeService);
    private actor;
    private parseOptionalCompanyId;
    private pickProfileUpdate;
    listProfiles(req: {
        user?: SecurityActor;
    }, companyId?: string, projectId?: string, safetyCategory?: PmEquipmentSafetyCategory, operationalStatus?: PmEquipmentOperationalStatus): Promise<({
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
        pmConditionScores: {
            id: string;
            equipmentId: number;
            projectId: number | null;
            score: number;
            riskBand: string;
            factorsJson: import(".prisma/client").Prisma.JsonValue;
            sourceModule: string | null;
            sourceId: string | null;
            scoredAt: Date;
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
    })[]>;
    getProfile(id: string, req: {
        user?: SecurityActor;
    }): Promise<{
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
    updateProfile(id: string, body: Record<string, unknown>, req: {
        user?: SecurityActor;
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
    recalculateCondition(id: string, req: {
        user?: SecurityActor;
    }, projectId?: string): Promise<import("./equipment-condition.engine").ConditionResult>;
    listCertifications(id: string, req: {
        user?: SecurityActor;
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
    }[]>;
    createCertification(body: Record<string, unknown>, req: {
        user?: SecurityActor;
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
    approveCertification(id: string, req: {
        user?: SecurityActor;
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
    flagExpired(req: {
        user?: SecurityActor;
    }, companyId?: string): Promise<{
        expiredCount: number;
    }>;
    registerInspection(body: Record<string, unknown>, req: {
        user?: SecurityActor;
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
    reportFailure(body: Record<string, unknown>, req: {
        user?: SecurityActor;
    }): Promise<{
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
    }>;
    transitionFailure(id: string, status: PmEquipmentFailureStatus, req: {
        user?: SecurityActor;
    }): Promise<{
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
    }>;
    listLoto(equipmentId: string, req: {
        user?: SecurityActor;
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
    }[]>;
    createLoto(body: Record<string, unknown>, req: {
        user?: SecurityActor;
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
    verifyLoto(id: string, req: {
        user?: SecurityActor;
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
    removeLoto(id: string, req: {
        user?: SecurityActor;
    }): Promise<{
        removed: boolean;
    }>;
    listAuthorizations(req: {
        user?: SecurityActor;
    }, companyId?: string, workerId?: string, equipmentId?: string): Promise<({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            name: string;
        };
    } & {
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
    })[]>;
    grantAuthorization(body: Record<string, unknown>, req: {
        user?: SecurityActor;
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
    validateAuth(req: {
        user?: SecurityActor;
    }, workerId: string, equipmentId: string): Promise<{
        authorized: boolean;
        reason: string;
        authId?: undefined;
        expiresAt?: undefined;
    } | {
        authorized: boolean;
        authId: string;
        expiresAt: Date;
        reason?: undefined;
    }>;
    validateAssignment(body: {
        workerId: number;
        equipmentId: number;
        projectId?: number;
    }, req: {
        user?: SecurityActor;
    }): Promise<import("./equipment-assignment.engine").AssignmentRuleResult>;
    workerAccess(req: {
        user?: SecurityActor;
    }, workerId: string, projectId: string): Promise<{
        allowed: boolean;
        blockedEquipmentCount: number;
        reasons: string[];
    }>;
    analytics(projectId: string): Promise<{
        equipmentCount: number;
        lockedOut: number;
        overdueInspection: number;
        expiredCerts: number;
        openFailures: number;
        avgConditionScore: number;
        projectEquipmentScore: number;
        certificationCompliancePct: number;
        inspectionCompliancePct: number;
        equipmentComplianceScore: number;
        trends: {
            failures90d: number;
            failureByType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmEquipmentFailureGroupByOutputType, "failureType"[]> & {
                _count: number;
            })[];
            lockoutRate90d: number;
        };
        leadingIndicators: {
            failureRate: number;
            lockoutRate: number;
            inspectionCompliancePct: number;
        };
        cailInsights: import("./pm-equipment-cail-intelligence.service").EquipmentCailInsight[];
    }>;
    intelligence(projectId: string): Promise<import("./pm-equipment-cail-intelligence.service").EquipmentCailInsight[]>;
    operatorRisk(workerId: string, projectId: string, req: {
        user?: SecurityActor;
    }): Promise<{
        workerId: number;
        failureCount: number;
        openCapa: number;
        score: number;
        band: string;
    }>;
    syncBundle(projectId: string): Promise<{
        syncedAt: string;
        projectId: number;
        equipment: ({
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
            pmConditionScores: {
                id: string;
                equipmentId: number;
                projectId: number | null;
                score: number;
                riskBand: string;
                factorsJson: import(".prisma/client").Prisma.JsonValue;
                sourceModule: string | null;
                sourceId: string | null;
                scoredAt: Date;
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
        })[];
        authorizations: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
            equipment: {
                id: number;
                name: string;
            };
        } & {
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
        })[];
    }>;
    applySync(projectId: string, body: Record<string, unknown>, req: {
        user?: SecurityActor;
    }): Promise<{
        inspections: number;
        loto: number;
        failures: number;
        auths: number;
    }>;
    stationPayload(companyId: string, req: {
        user?: SecurityActor;
    }): Promise<{
        generatedAt: string;
        equipment: {
            id: number;
            name: string;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            nextInspectionAt: Date;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
        }[];
        activeLoto: {
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
        inspectionReminders: {
            id: number;
            name: string;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            nextInspectionAt: Date;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            operationalStatus: import(".prisma/client").$Enums.PmEquipmentOperationalStatus;
        }[];
    }>;
}
