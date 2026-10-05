import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { InspectionCoreService } from '../inspection-core/inspection-core.service';
import { CompetencyService } from '../competency/competency.service';
import { ToolsPpeCoreService } from '../tools-ppe-core/tools-ppe-core.service';
import { MaintenanceCalibrationCoreService } from '../maintenance-calibration-core/maintenance-calibration-core.service';
import { NotificationSchedulerService } from '../notification-engine/notification-scheduler.service';
export declare class VeraPlatformService {
    private readonly reporting;
    private readonly equipmentCompliance;
    private readonly inspections;
    private readonly competency;
    private readonly toolsPpe;
    private readonly maintenanceCalibration;
    private readonly notificationScheduler;
    constructor(reporting: ReportingCoreService, equipmentCompliance: EquipmentComplianceService, inspections: InspectionCoreService, competency: CompetencyService, toolsPpe: ToolsPpeCoreService, maintenanceCalibration: MaintenanceCalibrationCoreService, notificationScheduler: NotificationSchedulerService);
    getPlatformSummary(companyId?: number): Promise<{
        companyId: number;
        generatedAt: string;
        modules: {
            reporting: {
                companyId: number;
                workers: {
                    summary: {
                        totalWorkers: number;
                        evaluated: number;
                        compliant: number;
                        nonCompliant: number;
                        expiringSoon: number;
                        complianceRate: number;
                    };
                };
                equipment: {
                    summary: {
                        total: number;
                        compliant: number;
                        needsAttention: number;
                        nonCompliant: number;
                        lockedOut: number;
                        overdueInspection: number;
                        complianceRate: number;
                    };
                    chart: {
                        labels: string[];
                        values: number[];
                    };
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
                };
                competency: {
                    summary: {
                        totalEvaluations: number;
                        passing: number;
                        expiringSoon: number;
                        expired: number;
                        operatorLinks: number;
                        passRate: number;
                    };
                    chart: {
                        labels: string[];
                        values: number[];
                    };
                    recent: ({
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
                        evaluator: {
                            id: number;
                            username: string;
                            email: string;
                            password: string;
                            role: import(".prisma/client").$Enums.UserRole;
                            companyId: number | null;
                            unionHallId: number | null;
                            trainingProviderId: number | null;
                            acpTenantId: string | null;
                            active: boolean;
                            createdAt: Date;
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
                inspections: {
                    summary: {
                        totalInspections: number;
                        passed: number;
                        failed: number;
                        pending: number;
                        lockedOutEquipment: number;
                        dueWithin7Days: number;
                        passRate: number;
                    };
                    chart: {
                        labels: string[];
                        values: number[];
                    };
                    recent: {
                        inspectorId: number;
                        inspector: {
                            id: number;
                            username: string;
                            email: string;
                        };
                        supervisorId: number;
                        supervisor: {
                            id: number;
                            username: string;
                            email: string;
                        };
                        worker: {
                            id: number;
                            firstName: string;
                            lastName: string;
                        };
                        equipment: {
                            id: number;
                            companyId: number;
                            name: string;
                            catalogTypeKey: string;
                        };
                        checklistTemplate: {
                            id: number;
                            seedKey: string | null;
                            name: string;
                            category: import(".prisma/client").$Enums.InspectionChecklistCategory;
                            inspectionType: import(".prisma/client").$Enums.InspectionType;
                            items: import(".prisma/client").Prisma.JsonValue;
                            intervalDays: number | null;
                            intervalHours: number | null;
                            active: boolean;
                            seedVersion: number;
                            createdAt: Date;
                            updatedAt: Date;
                        };
                        id: number;
                        workerId: number | null;
                        equipmentId: number | null;
                        siteId: number | null;
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
                };
                projects: {
                    summary: {
                        totalProjects: number;
                        ready: number;
                        atRisk: number;
                        notReady: number;
                        averageReadiness: number;
                    };
                };
                companies: {
                    company: {
                        id: number;
                        name: string;
                    };
                    overallScore: number;
                    readinessStatus: "READY" | "AT_RISK" | "NOT_READY";
                    workers: {
                        totalWorkers: number;
                        evaluated: number;
                        compliant: number;
                        nonCompliant: number;
                        expiringSoon: number;
                        complianceRate: number;
                    };
                    equipment: {
                        total: number;
                        compliant: number;
                        needsAttention: number;
                        nonCompliant: number;
                        lockedOut: number;
                        overdueInspection: number;
                        complianceRate: number;
                    };
                    inspections: {
                        totalInspections: number;
                        passed: number;
                        failed: number;
                        pending: number;
                        lockedOutEquipment: number;
                        dueWithin7Days: number;
                        passRate: number;
                    };
                    projects: {
                        totalProjects: number;
                        ready: number;
                        atRisk: number;
                        notReady: number;
                        averageReadiness: number;
                    };
                } | {
                    rows: {
                        companyId: number;
                        companyName: string;
                        workerCount: number;
                        equipmentCount: number;
                        equipmentComplianceRate: number;
                    }[];
                };
                unionDispatch: {
                    summary: {
                        totalDispatches: number;
                        activeDispatches: number;
                        recalledDispatches: number;
                        activeMembers: number;
                    };
                    chart: {
                        labels: string[];
                        values: number[];
                    };
                    byCompany: {
                        companyId: number;
                        companyName: string;
                        count: number;
                    }[];
                    byHall: {
                        unionHallId: any;
                        unionHallName: string;
                        count: any;
                    }[];
                    recent: ({
                        worker: {
                            id: number;
                            firstName: string;
                            lastName: string;
                        };
                        company: {
                            id: number;
                            name: string;
                        };
                        unionHall: {
                            id: number;
                            name: string;
                        };
                    } & {
                        id: number;
                        unionHallId: number;
                        workerId: number;
                        companyId: number;
                        dispatchedBy: number | null;
                        dispatchedAt: Date;
                        notes: string | null;
                        recalledAt: Date | null;
                    })[];
                };
                generatedAt: string;
            };
            equipment: {
                total: number;
                compliant: number;
                needsAttention: number;
                nonCompliant: number;
                lockedOut: number;
                overdueInspection: number;
            };
            inspections: {
                total: number;
                passed: number;
                failed: number;
                dueWithin7Days: number;
            };
            competency: {
                totalEvaluations: number;
                passing: number;
                expiringSoon: number;
                expired: number;
            };
            toolsPpe: {
                toolCount: number;
                toolsInspectionDue: number;
                ppeCount: number;
                ppeExpired: number;
                ppeExpiringSoon: number;
                activeToolAssignments: number;
                activePpeAssignments: number;
            };
            maintenanceCalibration: {
                maintenanceRecordCount: number;
                calibrationRecordCount: number;
                maintenanceDueWithin14Days: number;
                calibrationDueWithin14Days: number;
                maintenanceOverdue: number;
                calibrationOverdue: number;
                recentMaintenance: ({
                    equipment: {
                        id: number;
                        companyId: number;
                        name: string;
                    };
                } & {
                    id: number;
                    equipmentId: number;
                    type: import(".prisma/client").$Enums.EquipmentMaintenanceType;
                    performedAt: Date;
                    performedBy: number | null;
                    notes: string | null;
                    nextDueAt: Date | null;
                    meterHours: number | null;
                    createdAt: Date;
                })[];
                recentCalibration: ({
                    equipment: {
                        id: number;
                        companyId: number;
                        name: string;
                    };
                } & {
                    id: number;
                    equipmentId: number;
                    calibratedAt: Date;
                    calibratedBy: number | null;
                    certificateNumber: string | null;
                    expiresAt: Date | null;
                    passed: boolean;
                    notes: string | null;
                    createdAt: Date;
                })[];
            };
        };
        links: {
            equipmentCompliance: string;
            inspections: string;
            competency: string;
            toolsPpe: string;
            maintenance: string;
            reporting: string;
            notifications: string;
        };
    }>;
    runScheduledNotifications(companyId?: number): Promise<{
        inspections: {
            notified: number;
            equipmentCount: number;
        };
        training: import("../notification-engine/notification-scheduler.types").ExpiryRunMetrics;
        competency: {
            notified: number;
            evaluations: number;
        };
        equipmentCerts: import("../notification-engine/notification-scheduler.types").ExpiryRunMetrics;
        fitTests: {
            notified: number;
            tests: number;
        };
        ppe: {
            notified: number;
            ppeCount: number;
        };
        maintenance: {
            notified: number;
            equipmentCount: number;
        };
        calibration: {
            notified: number;
            equipmentCount: number;
        };
        workerAssignments: {
            notified: number;
            starting: number;
            ending: number;
        };
        equipmentAssignments: {
            notified: number;
            equipmentProjects: number;
            operators: number;
        };
    }>;
}
