import { EquipmentCoreService } from '../../equipment-core/equipment-core.service';
import { EquipmentLinksService } from '../../vera-core/equipment-links.service';
import { ProjectsService } from '../../vera-core/projects.service';
import { EquipmentRepository } from '../repositories/equipment.repository';
import { EventBusService } from '../events/event-bus.service';
export declare class EquipmentApiService {
    private readonly equipmentCore;
    private readonly equipmentLinks;
    private readonly projects;
    private readonly equipmentRepo;
    private readonly events;
    constructor(equipmentCore: EquipmentCoreService, equipmentLinks: EquipmentLinksService, projects: ProjectsService, equipmentRepo: EquipmentRepository, events: EventBusService);
    getEquipment(id: number): Promise<{
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
    list(companyId?: number, page?: number, pageSize?: number): Promise<import("../repositories").PaginatedResult<unknown>>;
    create(body: Record<string, unknown>): Promise<{
        isLockedOut: boolean;
        isSafe: boolean;
        activeCompanyLink: {
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
        };
        assignedOperators: ({
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
            checklist: import(".prisma/client").Prisma.JsonValue | null;
            passed: boolean | null;
            completedAt: Date | null;
            signature: string | null;
            meterReading: number | null;
            photos: import(".prisma/client").Prisma.JsonValue | null;
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
        calibrations: {
            id: number;
            equipmentId: number;
            calibratedAt: Date;
            calibratedBy: number | null;
            certificateNumber: string | null;
            expiresAt: Date | null;
            passed: boolean;
            notes: string | null;
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
        complianceHistory: {
            id: number;
            equipmentId: number;
            companyId: number | null;
            status: import(".prisma/client").$Enums.LinkComplianceStatus;
            assessedAt: Date;
            assessedByUserId: number | null;
            notes: string | null;
            inspectionId: number | null;
        }[];
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
    update(id: number, body: Record<string, unknown>): Promise<{
        isLockedOut: boolean;
        isSafe: boolean;
        activeCompanyLink: {
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
        };
        assignedOperators: ({
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
            checklist: import(".prisma/client").Prisma.JsonValue | null;
            passed: boolean | null;
            completedAt: Date | null;
            signature: string | null;
            meterReading: number | null;
            photos: import(".prisma/client").Prisma.JsonValue | null;
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
        calibrations: {
            id: number;
            equipmentId: number;
            calibratedAt: Date;
            calibratedBy: number | null;
            certificateNumber: string | null;
            expiresAt: Date | null;
            passed: boolean;
            notes: string | null;
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
        complianceHistory: {
            id: number;
            equipmentId: number;
            companyId: number | null;
            status: import(".prisma/client").$Enums.LinkComplianceStatus;
            assessedAt: Date;
            assessedByUserId: number | null;
            notes: string | null;
            inspectionId: number | null;
        }[];
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
    linkCompany(equipmentId: number, companyId: number): Promise<{
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
            loadChartJson: import(".prisma/client").Prisma.JsonValue;
            pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
            deletedAt: Date | null;
        };
    } & {
        id: number;
        equipmentId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
    }>;
    assignProject(equipmentId: number, projectId: number): Promise<{
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
            loadChartJson: import(".prisma/client").Prisma.JsonValue;
            pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
            deletedAt: Date | null;
        };
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
    }>;
    lockout(equipmentId: number, reason?: string, userId?: number): Promise<{
        id: number;
        equipmentId: number;
        companyId: number | null;
        reason: string;
        lockedAt: Date;
        unlockedAt: Date | null;
        lockedByUserId: number | null;
        unlockedByUserId: number | null;
    }>;
    unlock(equipmentId: number, notes?: string, userId?: number): Promise<{
        equipmentId: number;
        unlocked: boolean;
    }>;
    getWallet(equipmentId: number): Promise<{
        type: "equipment";
        equipmentId: number;
        qrToken: string;
        qrContent: string;
        inspectionHistory: {
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
            checklist: import(".prisma/client").Prisma.JsonValue | null;
            passed: boolean | null;
            completedAt: Date | null;
            signature: string | null;
            meterReading: number | null;
            photos: import(".prisma/client").Prisma.JsonValue | null;
            correctiveActions: string | null;
            lockoutTriggered: boolean;
            nextInspectionDate: Date | null;
        }[];
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
        assignedWorkers: {
            companyId: number;
            id: number;
            firstName: string;
            lastName: string;
            status: string;
            photoUrl: string | null;
            userId: number | null;
            email: string | null;
            phone: string | null;
            dateOfBirth: Date | null;
            qrToken: string | null;
            unionNumber: string | null;
        }[];
        assignedProjects: ({
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
        companyHistory: ({
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
        complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        lastInspectionAt: Date;
        nextInspectionAt: Date;
        lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
        competencyRequired: boolean;
        trainingRequired: boolean;
        complianceUpdatedAt: Date;
        lockedOut: boolean;
        lockoutReason: string;
        walletUrl: string;
    }>;
}
