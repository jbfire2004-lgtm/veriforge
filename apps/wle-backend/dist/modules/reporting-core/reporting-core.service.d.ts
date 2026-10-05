import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { VerificationService } from '../../verification/verification.service';
import { CompetencyService } from '../competency/competency.service';
import { EquipmentComplianceService } from '../equipment-compliance/equipment-compliance.service';
import { InspectionCoreService } from '../inspection-core/inspection-core.service';
export declare class ReportingCoreService {
    private readonly prisma;
    private readonly verification;
    private readonly equipmentComplianceSvc;
    private readonly competency;
    private readonly inspection;
    constructor(prisma: PrismaService, verification: VerificationService, equipmentComplianceSvc: EquipmentComplianceService, competency: CompetencyService, inspection: InspectionCoreService);
    overview(companyId?: number): Promise<{
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
                    loadChartJson: Prisma.JsonValue;
                    pmSafetyMetadataJson: Prisma.JsonValue;
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
                evidencePhotos: Prisma.JsonValue | null;
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
                    items: Prisma.JsonValue;
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
    }>;
    workerComplianceSummary(companyId?: number): Promise<{
        summary: {
            totalWorkers: number;
            evaluated: number;
            compliant: number;
            nonCompliant: number;
            expiringSoon: number;
            complianceRate: number;
        };
    }>;
    workerCompliance(companyId?: number, limit?: number): Promise<{
        summary: {
            totalWorkers: number;
            evaluated: number;
            compliant: number;
            nonCompliant: number;
            expiringSoon: number;
            complianceRate: number;
        };
        chart: {
            labels: string[];
            values: number[];
        };
        rows: {
            workerId: number;
            workerName: string;
            companyId: number | null;
            companyName: string | null;
            isCompliant: boolean;
            issueCount: number;
            expiringSoon: boolean;
        }[];
    }>;
    equipmentCompliance(companyId?: number): Promise<{
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
    }>;
    competencyStatus(companyId?: number): Promise<{
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
                loadChartJson: Prisma.JsonValue;
                pmSafetyMetadataJson: Prisma.JsonValue;
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
            evidencePhotos: Prisma.JsonValue | null;
            workerSignature: string | null;
            evaluatorSignature: string | null;
            createdAt: Date;
        })[];
    }>;
    inspectionStatus(companyId?: number): Promise<{
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
                items: Prisma.JsonValue;
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
    }>;
    projectReadinessSummary(companyId?: number): Promise<{
        summary: {
            totalProjects: number;
            ready: number;
            atRisk: number;
            notReady: number;
            averageReadiness: number;
        };
    }>;
    projectReadiness(companyId?: number, projectId?: number): Promise<{
        summary: {
            totalProjects: number;
            ready: number;
            atRisk: number;
            notReady: number;
            averageReadiness: number;
        };
        chart: {
            labels: string[];
            values: number[];
        };
        rows: {
            projectId: number;
            projectName: string;
            projectCode: string;
            companyId: number;
            companyName: string;
            totalWorkers: number;
            compliantWorkers: number;
            totalEquipment: number;
            compliantEquipment: number;
            readinessScore: number;
            readinessStatus: "READY" | "AT_RISK" | "NOT_READY";
        }[];
    }>;
    companyReadiness(companyId: number): Promise<{
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
    }>;
    companiesReadinessSummary(limit?: number): Promise<{
        rows: {
            companyId: number;
            companyName: string;
            workerCount: number;
            equipmentCount: number;
            equipmentComplianceRate: number;
        }[];
    }>;
    unionDispatchStatus(unionHallId?: number, companyId?: number, from?: Date, to?: Date): Promise<{
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
    }>;
    exportWorkersCsv(companyId?: number): Promise<string>;
    exportEquipmentCsv(companyId?: number): Promise<string>;
    exportProjectsCsv(companyId?: number): Promise<string>;
    exportUnionDispatchCsv(unionHallId?: number, companyId?: number, from?: Date, to?: Date): Promise<string>;
}
