import { PrismaService } from '../../prisma/prisma.service';
import { CompetencyService } from '../competency/competency.service';
import { MaintenanceCalibrationCoreService } from '../maintenance-calibration-core/maintenance-calibration-core.service';
export declare class EquipmentWalletService {
    private readonly prisma;
    private readonly competency;
    private readonly maintenanceCalibration;
    constructor(prisma: PrismaService, competency: CompetencyService, maintenanceCalibration: MaintenanceCalibrationCoreService);
    getQr(equipmentId: number): Promise<{
        equipmentId: number;
        equipmentName: string;
        serialNumber: string;
        assetTag: string;
        qrToken: string;
        qrContent: string;
        scanUrl: string;
        verifyUrl: string;
        walletUrl: string;
    }>;
    getInspectionHistory(equipmentId: number): Promise<{
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
    }[]>;
    getCompetencyRequirements(equipmentId: number): Promise<{
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
    }>;
    getAssignedWorkers(equipmentId: number): Promise<{
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
    }[]>;
    getAssignedProjects(equipmentId: number): Promise<{
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
    }[]>;
    getComplianceStatus(equipmentId: number): Promise<{
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
    }>;
    getFullWallet(equipmentId: number): Promise<{
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
    getMaintenanceCalibration(equipmentId: number): Promise<{
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
    }>;
    private assertExists;
    private ensureEquipmentQrToken;
}
