import { PrismaService } from '../../prisma/prisma.service';
import { VerificationService } from '../../verification/verification.service';
import { DashboardWidgetsService } from '../dashboard-widgets/dashboard-widgets.service';
import { ReportingCoreService } from '../reporting-core/reporting-core.service';
import { TrainingAssessmentRunnerService } from '../assessment-engines/training-assessment-runner.service';
import { AssessmentEnginesService } from '../assessment-engines/assessment-engines.service';
import { SafetyKnowledgeService } from '../safety-knowledge/safety-knowledge.service';
import { FitTestService } from '../fit-test/fit-test.service';
import { AcpAccessService } from '../../acp/acp-access.service';
import { type ReadinessDimensionPayload, type ReadinessVisualState } from './readiness-scoring';
type AssessmentRollup = {
    evaluated: number;
    missing: number;
    passing: number;
    atRisk: number;
    failing: number;
    averageScore: number;
    complianceRate: number;
    state: ReadinessVisualState;
};
export declare class CoreReadinessService {
    private readonly reporting;
    private readonly widgets;
    private readonly verification;
    private readonly prisma;
    private readonly trainingAssessment;
    private readonly assessmentEngines;
    private readonly safetyKnowledge;
    private readonly fitTests;
    private readonly acpAccess;
    constructor(reporting: ReportingCoreService, widgets: DashboardWidgetsService, verification: VerificationService, prisma: PrismaService, trainingAssessment: TrainingAssessmentRunnerService, assessmentEngines: AssessmentEnginesService, safetyKnowledge: SafetyKnowledgeService, fitTests: FitTestService, acpAccess: AcpAccessService);
    summary(companyId?: number, userId?: number): Promise<{
        generatedAt: string;
        companyId: number;
        dimensions: ReadinessDimensionPayload[];
        companyAssessments: {
            spce: {
                overallScore: number;
                overallStatus: string;
                evaluatedAt: string;
                state: ReadinessVisualState;
            } | null;
            smartGap: {
                overallScore: number;
                overallStatus: string;
                evaluatedAt: string;
                state: ReadinessVisualState;
            } | null;
        };
        workerAssessments: {
            trainingAssessment: AssessmentRollup | null;
            safetyKnowledge: AssessmentRollup | null;
        };
        competency: {
            worker: {
                total: number;
                current: number;
                expired: number;
                failed: number;
                missing: number;
                complianceRate: number;
                state: ReadinessVisualState;
            };
            equipment: {
                total: number;
                compliant: number;
                nonCompliant: number;
                overdueInspection: number;
                complianceRate: number;
                state: ReadinessVisualState;
            };
        };
        predictiveSafety: {
            tierAllowed: boolean;
            overallRiskIndex: number | null;
            overallRiskLevel: string | null;
            highRiskWorkers: number;
            highRiskTasks: number;
            weekStart: string | null;
            state: ReadinessVisualState | null;
        };
        fitTests: {
            totalWorkers: number;
            current: number;
            expired: number;
            expiring30: number;
            missing: number;
            failed: number;
            complianceRate: number;
            state: ReadinessVisualState;
        };
        workers: {
            totalWorkers: number;
            compliant: number;
            nonCompliant: number;
            expiringSoon: number;
            complianceRate: number;
            topIssues: {
                label: string;
                count: number;
            }[];
            score: number;
            state: ReadinessVisualState;
        };
        equipment: {
            total: number;
            compliant: number;
            nonCompliant: number;
            overdueInspection: number;
            complianceRate: number;
            score: number;
            state: ReadinessVisualState;
        };
        training: {
            score: number;
            state: ReadinessVisualState;
            expired: number;
            expiring30: number;
            expiring60: number;
            expiring90: number;
            highRisk: number;
            gaps: number;
        };
        projects: import("../dashboard-widgets/dashboard-widgets.types").ProjectReadinessWidgetData;
        overview: {
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
    }>;
    workerScore(workerId: number): Promise<{
        workerId: number;
        worker: {
            id: number;
            companyId: number;
            firstName: string;
            lastName: string;
        };
        isCompliant: boolean;
        score: number;
        state: ReadinessVisualState;
        issues: {
            type: import("../../verification/verification.service").VerificationIssueType;
            courseName: string;
            expiresAt: Date | null;
        }[];
        dimensions: ReadinessDimensionPayload[];
        trainingAssessment: {
            runId: string;
            overallScore: number;
            overallStatus: string;
            evaluatedAt: string;
            state: ReadinessVisualState;
        };
        safetyKnowledge: {
            overallScore: number;
            overallStatus: string;
            evaluatedAt: string;
            state: ReadinessVisualState;
        };
        fitTest: {
            pass: boolean;
            statusLabel: string;
            result: string;
            performedAt: string;
            expiresAt: string | null;
            expired: boolean;
            expiringSoon: boolean;
            state: ReadinessVisualState;
        };
        competency: {
            total: number;
            current: number;
            expired: number;
            failed: number;
            complianceRate: number;
            state: ReadinessVisualState;
        };
        training: {
            total: number;
            expired: number;
            expiring30: number;
            state: ReadinessVisualState;
            records: {
                id: number;
                certification: string | number;
                issuedAt: string;
                expiresAt: string;
                status: string;
            }[];
        };
    }>;
    equipmentScore(equipmentId: number): Promise<{
        equipmentId: number;
        equipment: {
            id: number;
            name: string;
            serialNumber: string;
            assetTag: string;
        };
        complianceStatus: string;
        score: number;
        state: ReadinessVisualState;
        overdueInspection: number;
        inspections: {
            id: number;
            status: string;
            completedAt: string;
            nextInspectionDate: string;
        }[];
        trainingRequirements: {
            certification: string | number;
            certificationId: number;
        }[];
    }>;
    private companyWorkerIds;
    private rollupWorkerAssessmentEngine;
    private companyCompetencySummary;
    private isPredictiveTierAllowed;
    private predictiveSafetySummary;
    private startOfWeek;
    private buildCompanyDimensions;
}
export {};
