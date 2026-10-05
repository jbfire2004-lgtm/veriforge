import { EquipmentWalletService } from '../equipment-wallet/equipment-wallet.service';
import { ToolsPpeCoreService } from '../tools-ppe-core/tools-ppe-core.service';
import { RegistryService } from './registry.service';
import { TrainingWalletIntegrationService } from './training-wallet-integration.service';
export declare class WalletsService {
    private readonly registry;
    private readonly toolsPpe;
    private readonly equipmentWallet;
    private readonly walletIntegration;
    constructor(registry: RegistryService, toolsPpe: ToolsPpeCoreService, equipmentWallet: EquipmentWalletService, walletIntegration: TrainingWalletIntegrationService);
    getWorkerWallet(workerId: number): Promise<{
        type: "worker";
        workerId: number;
        qrToken: string;
        qrContent: string;
        verifyUrl: string;
        walletUrl: string;
        qrJson: {
            type: string;
            id: number;
            token: string;
        };
        training: import("./training-wallet.mapper").WalletTrainingRecordDto[];
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
        } & {
            id: number;
            workerId: number;
            companyId: number;
            active: boolean;
            startDate: Date;
            endDate: Date | null;
            role: string | null;
            trade: string | null;
            visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
        })[];
        projectHistory: ({
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
        unionHalls: ({
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
        equipmentCompetency: ({
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
            evidencePhotos: import(".prisma/client").Prisma.JsonValue | null;
            workerSignature: string | null;
            evaluatorSignature: string | null;
            createdAt: Date;
        })[];
        walletItems: {
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
        toolsAssigned: ({
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
            tool: {
                id: number;
                companyId: number;
                name: string;
                serialNumber: string | null;
                assetTag: string | null;
                category: string | null;
                status: import(".prisma/client").$Enums.ToolStatus;
                inspectionIntervalDays: number;
                lastInspectionAt: Date | null;
                nextInspectionAt: Date | null;
                qrToken: string | null;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            toolId: number;
            workerId: number | null;
            projectId: number | null;
            companyId: number;
            status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
            assignedBy: number | null;
            assignedAt: Date;
            returnedAt: Date | null;
        })[];
        ppeAssigned: ({
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
            ppe: {
                id: number;
                companyId: number;
                name: string;
                ppeType: import(".prisma/client").$Enums.PpeType;
                serialNumber: string | null;
                status: import(".prisma/client").$Enums.PpeStatus;
                issuedAt: Date;
                expiresAt: Date;
                condition: string | null;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
        } & {
            id: number;
            ppeId: number;
            workerId: number;
            projectId: number | null;
            companyId: number;
            status: import(".prisma/client").$Enums.ToolsPpeAssignmentStatus;
            assignedBy: number | null;
            assignedAt: Date;
            returnedAt: Date | null;
        })[];
    }>;
    getEquipmentWallet(equipmentId: number): Promise<{
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
    getEquipmentWalletFull(equipmentId: number): Promise<{
        type: "equipment";
        equipment: {
            id: number;
            photoUrl: string;
            name: string;
            serialNumber: string;
            assetTag: string;
            catalogTypeKey: string;
        };
        qr: {
            equipmentId: number;
            equipmentName: string;
            serialNumber: string;
            assetTag: string;
            qrToken: string;
            qrContent: string;
            scanUrl: string;
            verifyUrl: string;
            walletUrl: string;
        };
        inspections: {
            id: number;
            inspectionType: import(".prisma/client").$Enums.InspectionType;
            kind: import(".prisma/client").$Enums.InspectionKind;
            passed: boolean;
            status: string;
            lockoutTriggered: boolean;
            completedAt: Date;
            nextInspectionDate: Date;
            createdAt: Date;
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
            inspectorId: number;
            inspector: {
                id: number;
                username: string;
                email: string;
            };
            checklistName: string;
        }[];
        competency: {
            equipmentId: number;
            competencyRequired: boolean;
            resolvedRules: import("../competency/competency.service").ResolvedCompetencyRules;
            assetRequirement: {
                source: "equipment";
                minPassingScore: number;
                expiryDays: number;
                requireEvaluation: boolean;
                certification: {
                    id: number;
                    name: string;
                    code: string | null;
                    description: string | null;
                };
            };
            typeRequirement: {
                source: "type";
                equipmentTypeId: number;
                equipmentTypeName: string;
                minPassingScore: number;
                expiryDays: number;
                requireEvaluation: boolean;
                certification: {
                    id: number;
                    name: string;
                    code: string | null;
                    description: string | null;
                };
            };
            recentEvaluations: ({
                worker: {
                    id: number;
                    firstName: string;
                    lastName: string;
                };
                evaluator: {
                    id: number;
                    username: string;
                    email: string;
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
                evidencePhotos: import(".prisma/client").Prisma.JsonValue | null;
                workerSignature: string | null;
                evaluatorSignature: string | null;
                createdAt: Date;
            })[];
        };
        assignedWorkers: {
            equipmentLinkId: number;
            companyId: number;
            companyName: string;
            worker: {
                id: number;
                email: string;
                firstName: string;
                lastName: string;
                phone: string;
            };
            assignedAt: Date;
        }[];
        assignedProjects: {
            id: number;
            equipmentId: number;
            projectId: number;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            assignedAt: Date;
            endedAt: Date;
            project: {
                company: {
                    id: number;
                    name: string;
                };
                id: number;
                companyId: number;
                status: import(".prisma/client").$Enums.ProjectStatus;
                name: string;
                code: string;
            };
        }[];
        compliance: {
            equipmentId: number;
            complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            linkComplianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
            lastInspectionAt: Date;
            nextInspectionAt: Date;
            lockoutStatus: import(".prisma/client").$Enums.EquipmentLockoutStatus;
            lockedOut: boolean;
            lockoutReason: string;
            safetyStatus: import(".prisma/client").$Enums.EquipmentSafetyStatus;
            competencyRequired: boolean;
            trainingRequired: boolean;
            complianceUpdatedAt: Date;
            activeCompany: {
                id: number;
                name: string;
            };
            history: {
                id: number;
                equipmentId: number;
                companyId: number | null;
                status: import(".prisma/client").$Enums.LinkComplianceStatus;
                assessedAt: Date;
                assessedByUserId: number | null;
                notes: string | null;
                inspectionId: number | null;
            }[];
        };
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
        maintenance: {
            equipmentId: number;
            maintenanceSchedules: {
                id: number;
                equipmentId: number;
                type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
                intervalDays: number;
                intervalHours: number | null;
                nextDueAt: Date | null;
                lastPerformedAt: Date | null;
                active: boolean;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
            calibrationSchedules: {
                id: number;
                equipmentId: number;
                intervalDays: number;
                nextDueAt: Date | null;
                lastCalibratedAt: Date | null;
                active: boolean;
                notes: string | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
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
            calibrationRecords: {
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
            nextMaintenanceDue: Date;
            nextCalibrationDue: Date;
            maintenanceOverdue: boolean;
            calibrationOverdue: boolean;
        };
    }>;
}
