import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
export declare class RegistryService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private token;
    searchWorkers(query: {
        q?: string;
        phone?: string;
        email?: string;
        dateOfBirth?: string;
        limit?: number;
    }): Promise<({
        companyLinks: ({
            company: {
                id: number;
                name: string;
                logoUrl: string | null;
                city: string | null;
                province: string | null;
                industry: string | null;
                lat: number | null;
                lng: number | null;
                createdAt: Date;
            };
        } & {
            id: number;
            workerId: number;
            companyId: number;
            active: boolean;
            startDate: Date;
            endDate: Date | null;
            role: string | null;
            trade: string | null;
            visibilityRules: Prisma.JsonValue | null;
        })[];
    } & {
        id: number;
        firstName: string;
        lastName: string;
        status: string;
        companyId: number | null;
        photoUrl: string | null;
        userId: number | null;
        email: string | null;
        phone: string | null;
        dateOfBirth: Date | null;
        qrToken: string | null;
        unionNumber: string | null;
    })[]>;
    findDuplicateWorkers(workerId: number): Promise<{
        id: number;
        firstName: string;
        lastName: string;
        status: string;
        companyId: number | null;
        photoUrl: string | null;
        userId: number | null;
        email: string | null;
        phone: string | null;
        dateOfBirth: Date | null;
        qrToken: string | null;
        unionNumber: string | null;
    }[]>;
    mergeWorkers(survivorId: number, mergedId: number, mergedByUserId?: number, reason?: string): Promise<{
        companyLinks: ({
            company: {
                id: number;
                name: string;
                logoUrl: string | null;
                city: string | null;
                province: string | null;
                industry: string | null;
                lat: number | null;
                lng: number | null;
                createdAt: Date;
            };
        } & {
            id: number;
            workerId: number;
            companyId: number;
            active: boolean;
            startDate: Date;
            endDate: Date | null;
            role: string | null;
            trade: string | null;
            visibilityRules: Prisma.JsonValue | null;
        })[];
        trainingRecords: ({
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            workerId: number;
            certificationId: number;
            providerId: number | null;
            trainingProviderId: number | null;
            courseId: number | null;
            instructorId: number | null;
            companyId: number | null;
            projectId: number | null;
            expiresAt: Date | null;
            issuedAt: Date;
            certificateNumber: string | null;
            certificateUrl: string | null;
            certificateQrToken: string | null;
            certificateSignedAt: Date | null;
            certificateSignedByInstructorId: number | null;
            completedAt: Date | null;
            lastVerificationStatus: string | null;
            lastVerificationChecks: Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        })[];
        competencyEvaluations: ({
            equipment: {
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
                loadChartJson: Prisma.JsonValue;
                pmSafetyMetadataJson: Prisma.JsonValue;
                deletedAt: Date | null;
            };
        } & {
            id: number;
            workerId: number;
            equipmentId: number;
            evaluatorUserId: number | null;
            equipmentTypeKey: string;
            score: number;
            passed: boolean;
            evaluationDate: Date;
            expiresAt: Date | null;
            notes: string | null;
            evidenceNotes: string | null;
            evidencePhotos: Prisma.JsonValue | null;
            workerSignature: string | null;
            evaluatorSignature: string | null;
            createdAt: Date;
        })[];
        workerWalletItems: {
            id: number;
            workerId: number;
            catalogTypeKey: string;
            equipmentId: number | null;
            companyId: number | null;
            trainingRecordId: number | null;
            status: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        unionMemberships: ({
            unionHall: {
                id: number;
                name: string;
                localNumber: string | null;
                region: string | null;
                createdAt: Date;
            };
        } & {
            id: number;
            unionHallId: number;
            workerId: number;
            memberNumber: string | null;
            status: import(".prisma/client").$Enums.UnionMembershipStatus;
            joinedAt: Date;
            endedAt: Date | null;
        })[];
        projectAssignments: ({
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
        } & {
            id: number;
            workerId: number;
            projectId: number;
            companyId: number;
            assignedBy: number | null;
            assignedAt: Date;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            role: string | null;
            endedAt: Date | null;
        })[];
    } & {
        id: number;
        firstName: string;
        lastName: string;
        status: string;
        companyId: number | null;
        photoUrl: string | null;
        userId: number | null;
        email: string | null;
        phone: string | null;
        dateOfBirth: Date | null;
        qrToken: string | null;
        unionNumber: string | null;
    }>;
    getWorkerProfile(workerId: number): Promise<{
        companyLinks: ({
            company: {
                id: number;
                name: string;
                logoUrl: string | null;
                city: string | null;
                province: string | null;
                industry: string | null;
                lat: number | null;
                lng: number | null;
                createdAt: Date;
            };
        } & {
            id: number;
            workerId: number;
            companyId: number;
            active: boolean;
            startDate: Date;
            endDate: Date | null;
            role: string | null;
            trade: string | null;
            visibilityRules: Prisma.JsonValue | null;
        })[];
        trainingRecords: ({
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            workerId: number;
            certificationId: number;
            providerId: number | null;
            trainingProviderId: number | null;
            courseId: number | null;
            instructorId: number | null;
            companyId: number | null;
            projectId: number | null;
            expiresAt: Date | null;
            issuedAt: Date;
            certificateNumber: string | null;
            certificateUrl: string | null;
            certificateQrToken: string | null;
            certificateSignedAt: Date | null;
            certificateSignedByInstructorId: number | null;
            completedAt: Date | null;
            lastVerificationStatus: string | null;
            lastVerificationChecks: Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        })[];
        competencyEvaluations: ({
            equipment: {
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
                loadChartJson: Prisma.JsonValue;
                pmSafetyMetadataJson: Prisma.JsonValue;
                deletedAt: Date | null;
            };
        } & {
            id: number;
            workerId: number;
            equipmentId: number;
            evaluatorUserId: number | null;
            equipmentTypeKey: string;
            score: number;
            passed: boolean;
            evaluationDate: Date;
            expiresAt: Date | null;
            notes: string | null;
            evidenceNotes: string | null;
            evidencePhotos: Prisma.JsonValue | null;
            workerSignature: string | null;
            evaluatorSignature: string | null;
            createdAt: Date;
        })[];
        workerWalletItems: {
            id: number;
            workerId: number;
            catalogTypeKey: string;
            equipmentId: number | null;
            companyId: number | null;
            trainingRecordId: number | null;
            status: string;
            notes: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        unionMemberships: ({
            unionHall: {
                id: number;
                name: string;
                localNumber: string | null;
                region: string | null;
                createdAt: Date;
            };
        } & {
            id: number;
            unionHallId: number;
            workerId: number;
            memberNumber: string | null;
            status: import(".prisma/client").$Enums.UnionMembershipStatus;
            joinedAt: Date;
            endedAt: Date | null;
        })[];
        projectAssignments: ({
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
        } & {
            id: number;
            workerId: number;
            projectId: number;
            companyId: number;
            assignedBy: number | null;
            assignedAt: Date;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            role: string | null;
            endedAt: Date | null;
        })[];
    } & {
        id: number;
        firstName: string;
        lastName: string;
        status: string;
        companyId: number | null;
        photoUrl: string | null;
        userId: number | null;
        email: string | null;
        phone: string | null;
        dateOfBirth: Date | null;
        qrToken: string | null;
        unionNumber: string | null;
    }>;
    searchEquipment(query: {
        q?: string;
        serial?: string;
        assetTag?: string;
        qr?: string;
        limit?: number;
    }): Promise<({
        equipmentLinks: ({
            company: {
                id: number;
                name: string;
                logoUrl: string | null;
                city: string | null;
                province: string | null;
                industry: string | null;
                lat: number | null;
                lng: number | null;
                createdAt: Date;
            };
        } & {
            id: number;
            equipmentId: number;
            companyId: number;
            active: boolean;
            startDate: Date;
            endDate: Date | null;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        })[];
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
        loadChartJson: Prisma.JsonValue;
        pmSafetyMetadataJson: Prisma.JsonValue;
        deletedAt: Date | null;
    })[]>;
    mergeEquipment(survivorId: number, mergedId: number, mergedByUserId?: number, reason?: string): Promise<{
        inspections: {
            id: number;
            workerId: number | null;
            equipmentId: number | null;
            siteId: number | null;
            supervisorId: number | null;
            checklistId: number | null;
            status: string;
            notes: string | null;
            createdAt: Date;
            kind: import(".prisma/client").$Enums.InspectionKind;
            inspectionType: import(".prisma/client").$Enums.InspectionType;
            checklist: Prisma.JsonValue | null;
            passed: boolean | null;
            completedAt: Date | null;
            signature: string | null;
            meterReading: number | null;
            photos: Prisma.JsonValue | null;
            correctiveActions: string | null;
            lockoutTriggered: boolean;
            nextInspectionDate: Date | null;
        }[];
        projectAssignments: ({
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
        } & {
            id: number;
            equipmentId: number;
            projectId: number;
            companyId: number;
            assignedBy: number | null;
            assignedAt: Date;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            endedAt: Date | null;
        })[];
        equipmentLinks: ({
            company: {
                id: number;
                name: string;
                logoUrl: string | null;
                city: string | null;
                province: string | null;
                industry: string | null;
                lat: number | null;
                lng: number | null;
                createdAt: Date;
            };
            assignedWorkers: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                    status: string;
                    companyId: number | null;
                    photoUrl: string | null;
                    userId: number | null;
                    email: string | null;
                    phone: string | null;
                    dateOfBirth: Date | null;
                    qrToken: string | null;
                    unionNumber: string | null;
                };
            } & {
                equipmentLinkId: number;
                workerId: number;
                assignedAt: Date;
            })[];
        } & {
            id: number;
            equipmentId: number;
            companyId: number;
            active: boolean;
            startDate: Date;
            endDate: Date | null;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        })[];
        trainingRequirements: ({
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            equipmentId: number;
            certificationId: number;
        })[];
        competencyRequirements: ({
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            equipmentId: number;
            minPassingScore: number;
            expiryDays: number | null;
            requireEvaluation: boolean;
            certificationId: number | null;
        })[];
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
        loadChartJson: Prisma.JsonValue;
        pmSafetyMetadataJson: Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
    getEquipmentProfile(equipmentId: number): Promise<{
        inspections: {
            id: number;
            workerId: number | null;
            equipmentId: number | null;
            siteId: number | null;
            supervisorId: number | null;
            checklistId: number | null;
            status: string;
            notes: string | null;
            createdAt: Date;
            kind: import(".prisma/client").$Enums.InspectionKind;
            inspectionType: import(".prisma/client").$Enums.InspectionType;
            checklist: Prisma.JsonValue | null;
            passed: boolean | null;
            completedAt: Date | null;
            signature: string | null;
            meterReading: number | null;
            photos: Prisma.JsonValue | null;
            correctiveActions: string | null;
            lockoutTriggered: boolean;
            nextInspectionDate: Date | null;
        }[];
        projectAssignments: ({
            project: {
                id: number;
                companyId: number;
                siteId: number | null;
                name: string;
                code: string | null;
                client: string | null;
                status: import(".prisma/client").$Enums.ProjectStatus;
                startDate: Date | null;
                endDate: Date | null;
                createdAt: Date;
            };
        } & {
            id: number;
            equipmentId: number;
            projectId: number;
            companyId: number;
            assignedBy: number | null;
            assignedAt: Date;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            endedAt: Date | null;
        })[];
        equipmentLinks: ({
            company: {
                id: number;
                name: string;
                logoUrl: string | null;
                city: string | null;
                province: string | null;
                industry: string | null;
                lat: number | null;
                lng: number | null;
                createdAt: Date;
            };
            assignedWorkers: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                    status: string;
                    companyId: number | null;
                    photoUrl: string | null;
                    userId: number | null;
                    email: string | null;
                    phone: string | null;
                    dateOfBirth: Date | null;
                    qrToken: string | null;
                    unionNumber: string | null;
                };
            } & {
                equipmentLinkId: number;
                workerId: number;
                assignedAt: Date;
            })[];
        } & {
            id: number;
            equipmentId: number;
            companyId: number;
            active: boolean;
            startDate: Date;
            endDate: Date | null;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        })[];
        trainingRequirements: ({
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            equipmentId: number;
            certificationId: number;
        })[];
        competencyRequirements: ({
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
        } & {
            id: number;
            equipmentId: number;
            minPassingScore: number;
            expiryDays: number | null;
            requireEvaluation: boolean;
            certificationId: number | null;
        })[];
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
        loadChartJson: Prisma.JsonValue;
        pmSafetyMetadataJson: Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
    ensureWorkerQrToken(workerId: number): Promise<string>;
    ensureEquipmentQrToken(equipmentId: number): Promise<string>;
}
