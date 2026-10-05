import { LinkComplianceStatus } from '@prisma/client';
import { EquipmentCoreService } from './equipment-core.service';
import { CreateEquipmentCoreDto } from './dto/create-equipment-core.dto';
import { UpdateEquipmentCoreDto } from './dto/update-equipment-core.dto';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { CreateCalibrationDto } from './dto/create-calibration.dto';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { LockoutEquipmentDto } from './dto/lockout-equipment.dto';
import { AssignProjectDto } from './dto/assign-project.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';
import { ScanEquipmentQrDto } from './dto/scan-qr.dto';
export declare class EquipmentCoreController {
    private readonly equipment;
    constructor(equipment: EquipmentCoreService);
    list(companyId?: string, q?: string, activeOnly?: string, limit?: string, complianceStatus?: LinkComplianceStatus, compliant?: string): Promise<({
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
        equipmentLinks: {
            id: number;
            equipmentId: number;
            companyId: number;
            active: boolean;
            startDate: Date;
            endDate: Date | null;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
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
    dashboard(companyId?: string): Promise<{
        total: number;
        lockedOut: number;
        nonCompliant: number;
        needsInspection: number;
        compliant: number;
        needsAttention: number;
        recent: ({
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
            equipmentLinks: {
                id: number;
                equipmentId: number;
                companyId: number;
                active: boolean;
                startDate: Date;
                endDate: Date | null;
                complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
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
        atRisk: {
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
    search(q?: string, serial?: string, assetTag?: string, qr?: string, limit?: string): Promise<({
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
    categories(): Promise<({
        types: {
            id: number;
            categoryId: number;
            name: string;
            code: string | null;
            catalogTypeKey: string | null;
            createdAt: Date;
        }[];
    } & {
        id: number;
        companyId: number | null;
        name: string;
        code: string | null;
        description: string | null;
        createdAt: Date;
    })[]>;
    create(dto: CreateEquipmentCoreDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    scanQr(dto: ScanEquipmentQrDto): Promise<{
        linked: boolean;
        equipmentId: number;
        companyId: number;
        linkId: number;
        complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        equipmentName: string;
        walletUrl: string;
    }>;
    findOne(id: number): Promise<{
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
    update(id: number, dto: UpdateEquipmentCoreDto): Promise<{
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
    timeline(id: number): Promise<{
        at: string;
        type: string;
        title: string;
        detail?: string;
    }[]>;
    qr(id: number): Promise<{
        equipmentId: number;
        qrToken: string;
        content: string;
        url: string;
    }>;
    linkCompany(id: number, body: {
        companyId: number;
    }): Promise<{
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
    endCompany(id: number, body: {
        companyId: number;
    }): Promise<{
        equipmentId: number;
        companyId: number;
        reason: import("../vera-core/inactivation.service").EquipmentInactivationReason;
        deactivatedAt: Date;
    }>;
    assignProject(id: number, dto: AssignProjectDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    removeProject(id: number, dto: AssignProjectDto): Promise<{
        projectId: number;
        equipmentId: number;
        removedAt: Date;
    }>;
    assignWorker(id: number, dto: AssignWorkerDto): Promise<{
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
    }>;
    removeWorker(id: number, dto: AssignWorkerDto): Promise<{
        equipmentId: number;
        workerId: number;
        removed: boolean;
    }>;
    lockout(id: number, dto: LockoutEquipmentDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        equipmentId: number;
        companyId: number | null;
        reason: string;
        lockedAt: Date;
        unlockedAt: Date | null;
        lockedByUserId: number | null;
        unlockedByUserId: number | null;
    }>;
    unlock(id: number, body: {
        notes?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        equipmentId: number;
        unlocked: boolean;
    }>;
    maintenance(id: number, dto: CreateMaintenanceDto): Promise<{
        id: number;
        equipmentId: number;
        type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
        performedAt: Date;
        performedBy: number | null;
        notes: string | null;
        nextDueAt: Date | null;
        meterHours: number | null;
        createdAt: Date;
    }>;
    calibration(id: number, dto: CreateCalibrationDto): Promise<{
        id: number;
        equipmentId: number;
        calibratedAt: Date;
        calibratedBy: number | null;
        certificateNumber: string | null;
        expiresAt: Date | null;
        passed: boolean;
        notes: string | null;
        createdAt: Date;
    }>;
    attachment(id: number, dto: CreateAttachmentDto): Promise<{
        id: number;
        equipmentId: number;
        type: import(".prisma/client").$Enums.EquipmentAttachmentType;
        name: string;
        url: string;
        notes: string | null;
        createdAt: Date;
    }>;
}
