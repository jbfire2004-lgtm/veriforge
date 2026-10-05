import { RegistryService } from './registry.service';
import { CompanyLinksService } from './company-links.service';
import { EquipmentLinksService } from './equipment-links.service';
import { ProjectsService } from './projects.service';
import { UnionHallsService } from './union-halls.service';
import { UnionHallTrainingService } from './union-hall-training.service';
import { LinkUnionHallProviderDto, PushUnionHallTrainingDto, UnionHallTrainingNotesDto } from './dto/union-hall-training.dto';
import { WalletsService } from './wallets.service';
import { TrainingPipelineService } from './training-pipeline.service';
import { InspectionsCoreService } from './inspections-core.service';
import { CompetencyCoreService } from './competency-core.service';
import { VeraPlatformService } from './vera-platform.service';
import { CoreReadinessService } from './core-readiness.service';
import { CoreDocumentsService } from './core-documents.service';
import { ProviderIntegrationHubService } from './provider-integration-hub.service';
import { VeraCoreHubService } from './vera-core-hub.service';
import { TrainingIngestionService } from '../../training-ingestion/training-ingestion.service';
import { DigitalTwinService } from '../digital-twin/digital-twin.service';
import { LinkEquipmentByQrDto } from './dto/link-equipment-qr.dto';
import { SearchWorkersDto } from './dto/search-workers.dto';
import { LinkWorkerDto, LinkWorkerByQrDto } from './dto/link-worker.dto';
import { MergeWorkerDto } from './dto/merge-worker.dto';
import { CreateProjectDto, AssignToProjectDto } from './dto/create-project.dto';
import { CreateUnionHallDto, AddUnionMemberDto, DispatchWorkerDto } from './dto/union-hall.dto';
import { TrainingIngestDto } from './dto/training-ingest.dto';
import { CreateInspectionDto } from './dto/create-inspection.dto';
import { CompetencyEvaluateDto } from './dto/competency-evaluate.dto';
import { toSecurityActor } from '../../security/actor.util';
import { PermissionService } from '../../security/permission.service';
import { TenantScopeService } from '../../security/tenant-scope.service';
export declare class VeraCoreController {
    private readonly registry;
    private readonly companyLinks;
    private readonly equipmentLinks;
    private readonly projects;
    private readonly unionHalls;
    private readonly unionHallTraining;
    private readonly wallets;
    private readonly trainingPipeline;
    private readonly inspections;
    private readonly competency;
    private readonly platform;
    private readonly readiness;
    private readonly permissions;
    private readonly tenant;
    private readonly documents;
    private readonly trainingIngestion;
    private readonly digitalTwin;
    private readonly providerHub;
    private readonly hub;
    constructor(registry: RegistryService, companyLinks: CompanyLinksService, equipmentLinks: EquipmentLinksService, projects: ProjectsService, unionHalls: UnionHallsService, unionHallTraining: UnionHallTrainingService, wallets: WalletsService, trainingPipeline: TrainingPipelineService, inspections: InspectionsCoreService, competency: CompetencyCoreService, platform: VeraPlatformService, readiness: CoreReadinessService, permissions: PermissionService, tenant: TenantScopeService, documents: CoreDocumentsService, trainingIngestion: TrainingIngestionService, digitalTwin: DigitalTwinService, providerHub: ProviderIntegrationHubService, hub: VeraCoreHubService);
    hubMetrics(companyId?: string, req?: {
        user?: {
            id: number;
        };
    }): Promise<import("./vera-core-hub.service").VeraCoreHubMetrics>;
    platformSummary(companyId?: string): Promise<{
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
    platformNotifyDue(companyId?: string): Promise<{
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
    searchWorkers(query: SearchWorkersDto): Promise<({
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
            visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
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
    workerProfile(id: number): Promise<{
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
            visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
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
            lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
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
    workerDuplicates(id: number): Promise<{
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
    mergeWorkers(dto: MergeWorkerDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
            visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
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
            lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
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
    searchEquipment(q?: string, serial?: string, assetTag?: string, qr?: string, limit?: string): Promise<({
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
        loadChartJson: import(".prisma/client").Prisma.JsonValue;
        pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
    })[]>;
    equipmentProfile(id: number): Promise<{
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
        loadChartJson: import(".prisma/client").Prisma.JsonValue;
        pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
    mergeEquipment(body: {
        survivorId: number;
        mergedId: number;
        reason?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
        loadChartJson: import(".prisma/client").Prisma.JsonValue;
        pmSafetyMetadataJson: import(".prisma/client").Prisma.JsonValue;
        deletedAt: Date | null;
    }>;
    companyWorkers(companyId: number, activeOnly?: string): Promise<({
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
        id: number;
        workerId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        role: string | null;
        trade: string | null;
        visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
    })[]>;
    linkWorker(dto: LinkWorkerDto): Promise<{
        id: number;
        workerId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        role: string | null;
        trade: string | null;
        visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
    }>;
    linkWorkerByQr(dto: LinkWorkerByQrDto): Promise<{
        id: number;
        workerId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        role: string | null;
        trade: string | null;
        visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
    }>;
    endWorkerAssignment(workerId: number, companyId: number): Promise<{
        workerId: number;
        companyId: number;
        reason: import("./inactivation.service").WorkerInactivationReason;
        deactivatedAt: Date;
    }>;
    activateWorker(workerId: number, companyId: number): Promise<{
        id: number;
        workerId: number;
        companyId: number;
        active: boolean;
        startDate: Date;
        endDate: Date | null;
        role: string | null;
        trade: string | null;
        visibilityRules: import(".prisma/client").Prisma.JsonValue | null;
    }>;
    companyEquipment(companyId: number, activeOnly?: string): Promise<({
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
    })[]>;
    linkEquipment(body: {
        equipmentId: number;
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
    linkEquipmentByQr(body: LinkEquipmentByQrDto): Promise<{
        linked: boolean;
        equipmentId: number;
        companyId: number;
        linkId: number;
        complianceStatus: import(".prisma/client").$Enums.LinkComplianceStatus;
        equipmentName: string;
        walletUrl: string;
        summary: {
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
        };
    }>;
    endEquipmentAssignment(equipmentId: number, companyId: number): Promise<{
        equipmentId: number;
        companyId: number;
        reason: import("./inactivation.service").EquipmentInactivationReason;
        deactivatedAt: Date;
    }>;
    listProjects(companyId: number): Promise<({
        site: {
            id: number;
            name: string;
            code: string | null;
            region: string | null;
            latitude: number | null;
            longitude: number | null;
            active: boolean;
            createdAt: Date;
        };
    } & {
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
    })[]>;
    createProject(dto: CreateProjectDto): Promise<{
        site: {
            id: number;
            name: string;
            code: string | null;
            region: string | null;
            latitude: number | null;
            longitude: number | null;
            active: boolean;
            createdAt: Date;
        };
    } & {
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
    }>;
    assignWorker(projectId: number, dto: AssignToProjectDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        workerId: number;
        projectId: number;
        companyId: number;
        assignedBy: number | null;
        assignedAt: Date;
        status: import(".prisma/client").$Enums.AssignmentStatus;
        role: string | null;
        endedAt: Date | null;
    }>;
    assignEquipment(projectId: number, dto: AssignToProjectDto, req: {
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
    removeWorker(projectId: number, dto: AssignToProjectDto): Promise<{
        projectId: number;
        workerId: number;
        removedAt: Date;
    }>;
    closeProject(projectId: number): Promise<{
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
    }>;
    listUnionHalls(): Promise<{
        id: number;
        name: string;
        localNumber: string | null;
        region: string | null;
        createdAt: Date;
    }[]>;
    createUnionHall(dto: CreateUnionHallDto): Promise<{
        id: number;
        name: string;
        localNumber: string | null;
        region: string | null;
        createdAt: Date;
    }>;
    unionMembers(id: number): Promise<({
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
        id: number;
        unionHallId: number;
        workerId: number;
        memberNumber: string | null;
        status: import(".prisma/client").$Enums.UnionMembershipStatus;
        joinedAt: Date;
        endedAt: Date | null;
    })[]>;
    addMember(id: number, dto: AddUnionMemberDto): Promise<{
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
    }>;
    dispatch(id: number, dto: DispatchWorkerDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: number;
        unionHallId: number;
        workerId: number;
        companyId: number;
        dispatchedBy: number | null;
        dispatchedAt: Date;
        notes: string | null;
        recalledAt: Date | null;
    }>;
    recall(id: number, dto: DispatchWorkerDto): Promise<{
        unionHallId: number;
        workerId: number;
        companyId: number;
        recalled: boolean;
    }>;
    unionHallTrainingDashboard(id: number, req: {
        user: {
            id: number;
            role: string;
            unionHallId?: number;
        };
    }): Promise<{
        unionHallId: number;
        unionHallName: string;
        counts: {
            pending: number;
            accepted: number;
            pushed: number;
            rejected: number;
        };
        providerTrainingHistory: {
            receiptId: number;
            status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
            acceptedAt: string;
            validatedAt: string;
            pushedAt: string;
            trainingRecordId: number;
            workerId: number;
            workerName: string;
            courseName: string;
            providerName: string;
            providerId: number;
            instructorName: string;
            instructorQualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            issuedAt: string;
            expiresAt: string;
            validationOutcome: string;
            certificateQrToken: string;
        }[];
        providers: {
            providerId: number;
            name: string;
            code: string;
            approvalStatus: import(".prisma/client").$Enums.ProviderApprovalStatus;
            active: boolean;
            complianceStatus: import(".prisma/client").$Enums.ProviderComplianceLevel;
            complianceScore: number;
            complianceAssessedAt: string;
            gaps: import(".prisma/client").Prisma.JsonValue;
        }[];
        instructors: {
            instructorId: number;
            firstName: string;
            lastName: string;
            providerId: number;
            providerName: string;
            qualificationStatus: import(".prisma/client").InstructorQualificationStatus;
            qualificationExpiresAt: string | null;
        }[];
    }>;
    unionHallPendingTraining(id: number, req: {
        user: {
            id: number;
            role: string;
            unionHallId?: number;
        };
    }): Promise<{
        receiptId: number;
        status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
        acceptedAt: string;
        validatedAt: string;
        pushedAt: string;
        trainingRecordId: number;
        workerId: number;
        workerName: string;
        courseName: string;
        providerName: string;
        providerId: number;
        instructorName: string;
        instructorQualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
        issuedAt: string;
        expiresAt: string;
        validationOutcome: string;
        certificateQrToken: string;
    }[]>;
    linkUnionHallProvider(id: number, dto: LinkUnionHallProviderDto, req: {
        user: {
            id: number;
            role: string;
            unionHallId?: number;
        };
    }): Promise<{
        trainingProvider: {
            id: number;
            name: string;
            code: string | null;
            email: string | null;
            phone: string | null;
            website: string | null;
            address: string | null;
            logoUrl: string | null;
            qrToken: string | null;
            approvalStatus: import(".prisma/client").$Enums.ProviderApprovalStatus;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: number;
        unionHallId: number;
        trainingProviderId: number;
        active: boolean;
        createdAt: Date;
    }>;
    acceptUnionHallTraining(id: number, recordId: number, dto: UnionHallTrainingNotesDto, req: {
        user: {
            id: number;
            role: string;
            unionHallId?: number;
        };
    }): Promise<{
        trainingRecord: {
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
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
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
            trainingProvider: {
                id: number;
                name: string;
            };
            project: {
                site: {
                    id: number;
                    name: string;
                    code: string | null;
                    region: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    active: boolean;
                    createdAt: Date;
                };
            } & {
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
            instructor: {
                id: number;
                firstName: string;
                lastName: string;
                qualificationExpiresAt: Date;
                qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            };
            course: {
                standards: {
                    id: number;
                    courseId: number;
                    standardKey: string;
                    title: string;
                    description: string | null;
                    required: boolean;
                    minScore: number | null;
                }[];
            } & {
                id: number;
                providerId: number;
                certificationId: number | null;
                code: string;
                name: string;
                description: string | null;
                durationHours: number | null;
                validityDays: number | null;
                contentText: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            validationResults: {
                id: number;
                subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
                outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
                score: number | null;
                jurisdictionCode: string | null;
                matchedStandardCodes: string[];
                missingStandardCodes: string[];
                details: import(".prisma/client").Prisma.JsonValue | null;
                validatedAt: Date;
                validatedBy: number | null;
                trainingRecordId: number | null;
                trainingProviderId: number | null;
                instructorId: number | null;
                courseId: number | null;
                certificateQrToken: string | null;
            }[];
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
            lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        };
    } & {
        id: number;
        unionHallId: number;
        trainingRecordId: number;
        status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
        acceptedAt: Date | null;
        acceptedByUserId: number | null;
        validatedAt: Date | null;
        pushedAt: Date | null;
        pushedCompanyId: number | null;
        pushedProjectId: number | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    rejectUnionHallTraining(id: number, recordId: number, dto: UnionHallTrainingNotesDto, req: {
        user: {
            id: number;
            role: string;
            unionHallId?: number;
        };
    }): Promise<{
        trainingRecord: {
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
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
            certification: {
                id: number;
                name: string;
                code: string | null;
                description: string | null;
            };
            trainingProvider: {
                id: number;
                name: string;
            };
            project: {
                site: {
                    id: number;
                    name: string;
                    code: string | null;
                    region: string | null;
                    latitude: number | null;
                    longitude: number | null;
                    active: boolean;
                    createdAt: Date;
                };
            } & {
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
            instructor: {
                id: number;
                firstName: string;
                lastName: string;
                qualificationExpiresAt: Date;
                qualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            };
            course: {
                standards: {
                    id: number;
                    courseId: number;
                    standardKey: string;
                    title: string;
                    description: string | null;
                    required: boolean;
                    minScore: number | null;
                }[];
            } & {
                id: number;
                providerId: number;
                certificationId: number | null;
                code: string;
                name: string;
                description: string | null;
                durationHours: number | null;
                validityDays: number | null;
                contentText: string | null;
                active: boolean;
                createdAt: Date;
                updatedAt: Date;
            };
            validationResults: {
                id: number;
                subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
                outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
                score: number | null;
                jurisdictionCode: string | null;
                matchedStandardCodes: string[];
                missingStandardCodes: string[];
                details: import(".prisma/client").Prisma.JsonValue | null;
                validatedAt: Date;
                validatedBy: number | null;
                trainingRecordId: number | null;
                trainingProviderId: number | null;
                instructorId: number | null;
                courseId: number | null;
                certificateQrToken: string | null;
            }[];
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
            lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        };
    } & {
        id: number;
        unionHallId: number;
        trainingRecordId: number;
        status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
        acceptedAt: Date | null;
        acceptedByUserId: number | null;
        validatedAt: Date | null;
        pushedAt: Date | null;
        pushedCompanyId: number | null;
        pushedProjectId: number | null;
        notes: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validateUnionHallTraining(id: number, recordId: number, req: {
        user: {
            id: number;
            role: string;
            unionHallId?: number;
        };
    }): Promise<{
        validation: import("../training-standards-compliance/training-standards-compliance.service").ValidationReport;
        receiptId: number;
    }>;
    pushUnionHallTraining(id: number, recordId: number, dto: PushUnionHallTrainingDto, req: {
        user: {
            id: number;
            role: string;
            unionHallId?: number;
        };
    }): Promise<{
        receipt: {
            receiptId: number;
            status: import(".prisma/client").$Enums.UnionHallTrainingStatus;
            acceptedAt: string;
            validatedAt: string;
            pushedAt: string;
            trainingRecordId: number;
            workerId: number;
            workerName: string;
            courseName: string;
            providerName: string;
            providerId: number;
            instructorName: string;
            instructorQualificationStatus: import(".prisma/client").$Enums.InstructorQualificationStatus;
            issuedAt: string;
            expiresAt: string;
            validationOutcome: string;
            certificateQrToken: string;
        };
        wallet: import("./training-wallet.mapper").WalletTrainingRecordDto;
    }>;
    workerWallet(id: number): Promise<{
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
    workerWalletFull(id: number): Promise<{
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
    equipmentWallet(id: number): Promise<{
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
    equipmentWalletFull(id: number): Promise<{
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
    trainingIngest(dto: TrainingIngestDto): Promise<{
        ok: boolean;
        error: string;
        workerId?: undefined;
        trainingRecord?: undefined;
        walletTraining?: undefined;
    } | {
        ok: boolean;
        workerId: number;
        trainingRecord: {
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
            lastVerificationChecks: import(".prisma/client").Prisma.JsonValue | null;
            verifiedAt: Date | null;
            ingestionRunId: number | null;
        };
        walletTraining: import("./training-wallet.mapper").WalletTrainingRecordDto;
        error?: undefined;
    }>;
    createInspection(dto: CreateInspectionDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
        lockoutTriggered: boolean;
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
        nextInspectionDate: Date | null;
    }>;
    equipmentInspections(id: number): Promise<{
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
    }[]>;
    competencyEvaluate(dto: CompetencyEvaluateDto, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    }>;
    workerCompetency(id: number): Promise<({
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
    })[]>;
    readinessSummary(companyId: string | undefined, req: {
        user: Parameters<typeof toSecurityActor>[0];
    }): Promise<{
        generatedAt: string;
        companyId: number;
        dimensions: import("./readiness-scoring").ReadinessDimensionPayload[];
        companyAssessments: {
            spce: {
                overallScore: number;
                overallStatus: string;
                evaluatedAt: string;
                state: import("./readiness-scoring").ReadinessVisualState;
            };
            smartGap: {
                overallScore: number;
                overallStatus: string;
                evaluatedAt: string;
                state: import("./readiness-scoring").ReadinessVisualState;
            };
        };
        workerAssessments: {
            trainingAssessment: {
                evaluated: number;
                missing: number;
                passing: number;
                atRisk: number;
                failing: number;
                averageScore: number;
                complianceRate: number;
                state: import("./readiness-scoring").ReadinessVisualState;
            } | null;
            safetyKnowledge: {
                evaluated: number;
                missing: number;
                passing: number;
                atRisk: number;
                failing: number;
                averageScore: number;
                complianceRate: number;
                state: import("./readiness-scoring").ReadinessVisualState;
            } | null;
        };
        competency: {
            worker: {
                total: number;
                current: number;
                expired: number;
                failed: number;
                missing: number;
                complianceRate: number;
                state: import("./readiness-scoring").ReadinessVisualState;
            };
            equipment: {
                total: number;
                compliant: number;
                nonCompliant: number;
                overdueInspection: number;
                complianceRate: number;
                state: import("./readiness-scoring").ReadinessVisualState;
            };
        };
        predictiveSafety: {
            tierAllowed: boolean;
            overallRiskIndex: number | null;
            overallRiskLevel: string | null;
            highRiskWorkers: number;
            highRiskTasks: number;
            weekStart: string | null;
            state: import("./readiness-scoring").ReadinessVisualState | null;
        };
        fitTests: {
            totalWorkers: number;
            current: number;
            expired: number;
            expiring30: number;
            missing: number;
            failed: number;
            complianceRate: number;
            state: import("./readiness-scoring").ReadinessVisualState;
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
            state: import("./readiness-scoring").ReadinessVisualState;
        };
        equipment: {
            total: number;
            compliant: number;
            nonCompliant: number;
            overdueInspection: number;
            complianceRate: number;
            score: number;
            state: import("./readiness-scoring").ReadinessVisualState;
        };
        training: {
            score: number;
            state: import("./readiness-scoring").ReadinessVisualState;
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
    workerReadiness(id: number, req: {
        user: Parameters<typeof toSecurityActor>[0];
    }): Promise<{
        workerId: number;
        worker: {
            id: number;
            companyId: number;
            firstName: string;
            lastName: string;
        };
        isCompliant: boolean;
        score: number;
        state: import("./readiness-scoring").ReadinessVisualState;
        issues: {
            type: import("../../verification/verification.service").VerificationIssueType;
            courseName: string;
            expiresAt: Date | null;
        }[];
        dimensions: import("./readiness-scoring").ReadinessDimensionPayload[];
        trainingAssessment: {
            runId: string;
            overallScore: number;
            overallStatus: string;
            evaluatedAt: string;
            state: import("./readiness-scoring").ReadinessVisualState;
        };
        safetyKnowledge: {
            overallScore: number;
            overallStatus: string;
            evaluatedAt: string;
            state: import("./readiness-scoring").ReadinessVisualState;
        };
        fitTest: {
            pass: boolean;
            statusLabel: string;
            result: string;
            performedAt: string;
            expiresAt: string | null;
            expired: boolean;
            expiringSoon: boolean;
            state: import("./readiness-scoring").ReadinessVisualState;
        };
        competency: {
            total: number;
            current: number;
            expired: number;
            failed: number;
            complianceRate: number;
            state: import("./readiness-scoring").ReadinessVisualState;
        };
        training: {
            total: number;
            expired: number;
            expiring30: number;
            state: import("./readiness-scoring").ReadinessVisualState;
            records: {
                id: number;
                certification: string | number;
                issuedAt: string;
                expiresAt: string;
                status: string;
            }[];
        };
    }>;
    equipmentReadiness(id: number, req: {
        user: Parameters<typeof toSecurityActor>[0];
    }): Promise<{
        equipmentId: number;
        equipment: {
            id: number;
            name: string;
            serialNumber: string;
            assetTag: string;
        };
        complianceStatus: string;
        score: number;
        state: import("./readiness-scoring").ReadinessVisualState;
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
    listDocuments(purpose?: string, companyId?: string, projectId?: string, linkedProjectId?: string, limit?: string, mine?: string, req?: {
        user?: {
            id: number;
            companyId?: number | null;
        };
    }): Promise<{
        id: number;
        originalName: string;
        mimeType: string;
        sizeBytes: number;
        publicUrl: string;
        purpose: string;
        companyId: number;
        companyName: string;
        projectId: number;
        projectName: string;
        projectCode: string;
        createdAt: string;
        completedAt: string;
        uploadedBy: import("./document-storage.schema").DocumentStorageUploadedBy;
        ingestionRun: {
            id: number;
            status: string;
            ocrConfidence: number;
        };
        file_id: number;
        file_name: string;
        file_type: string;
        uploaded_by: import("./document-storage.schema").DocumentStorageUploadedBy | null;
        uploaded_at: string;
        linked_project_id: number | null;
    }[]>;
    trainingIngestionRuns(companyId: number, status?: string, limit?: string): Promise<({
        coreFile: {
            id: number;
            originalName: string;
            publicUrl: string;
        };
        createdRecords: {
            id: number;
            workerId: number;
        }[];
    } & {
        id: number;
        companyId: number;
        status: string;
        sourceChannel: string;
        sourceMime: string;
        originalFilename: string;
        sizeBytes: number;
        coreFileId: number | null;
        ocrText: string | null;
        ocrExtracted: import(".prisma/client").Prisma.JsonValue | null;
        ocrConfidence: number | null;
        metadataSnapshot: import(".prisma/client").Prisma.JsonValue | null;
        validationErrors: import(".prisma/client").Prisma.JsonValue | null;
        resultSummary: import(".prisma/client").Prisma.JsonValue | null;
        errorMessage: string | null;
        createdAt: Date;
        completedAt: Date | null;
    })[]>;
    trainingVerificationQueue(companyId: number, limit?: string): Promise<({
        trainingRecord: {
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
            certification: {
                id: number;
                name: string;
                code: string;
            };
            id: number;
            workerId: number;
            certificationId: number;
            expiresAt: Date;
            issuedAt: Date;
            ingestionRun: {
                coreFile: {
                    id: number;
                    originalName: string;
                    publicUrl: string;
                };
                id: number;
            };
        };
    } & {
        id: number;
        subjectType: import(".prisma/client").$Enums.TrainingValidationSubject;
        outcome: import(".prisma/client").$Enums.TrainingValidationOutcome;
        score: number | null;
        jurisdictionCode: string | null;
        matchedStandardCodes: string[];
        missingStandardCodes: string[];
        details: import(".prisma/client").Prisma.JsonValue | null;
        validatedAt: Date;
        validatedBy: number | null;
        trainingRecordId: number | null;
        trainingProviderId: number | null;
        instructorId: number | null;
        courseId: number | null;
        certificateQrToken: string | null;
    })[]>;
    providerHubSummary(companyId: number, req: {
        user: Parameters<typeof toSecurityActor>[0];
    }): Promise<import("./provider-integration-hub.types").ProviderIntegrationHubSummary>;
    hydrateTwins(companyId: number): Promise<DigitalTwin[]>;
    twinsDashboard(): TwinDashboardBundle;
}
