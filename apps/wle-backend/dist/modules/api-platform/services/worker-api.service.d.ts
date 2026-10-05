import { WorkersService } from '../../../workers/workers.service';
import { RegistryService } from '../../vera-core/registry.service';
import { CompanyLinksService } from '../../vera-core/company-links.service';
import { ProjectsService } from '../../vera-core/projects.service';
import { WalletsService } from '../../vera-core/wallets.service';
import { TrainingPipelineService } from '../../vera-core/training-pipeline.service';
import { WorkerTrainingHydrationService } from '../../../workers/worker-training-hydration.service';
import { WorkerProjectReadinessService } from '../../../workers/worker-project-readiness.service';
import { WorkerRepository } from '../repositories/worker.repository';
import { EventBusService } from '../events/event-bus.service';
import type { CreateWorkerDto } from '../../../workers/dto/create-worker.dto';
import type { UpdateWorkerDto } from '../../../workers/dto/update-worker.dto';
export declare class WorkerApiService {
    private readonly workers;
    private readonly registry;
    private readonly companyLinks;
    private readonly projects;
    private readonly wallets;
    private readonly trainingPipeline;
    private readonly trainingHydration;
    private readonly projectReadiness;
    private readonly workerRepo;
    private readonly events;
    constructor(workers: WorkersService, registry: RegistryService, companyLinks: CompanyLinksService, projects: ProjectsService, wallets: WalletsService, trainingPipeline: TrainingPipelineService, trainingHydration: WorkerTrainingHydrationService, projectReadiness: WorkerProjectReadinessService, workerRepo: WorkerRepository, events: EventBusService);
    getWorker(id: number): Promise<{
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
    searchWorkers(query: {
        q?: string;
        companyId?: number;
        page?: number;
        pageSize?: number;
    }): Promise<import("../repositories").PaginatedResult<unknown>>;
    createWorker(body: CreateWorkerDto): Promise<{
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
    updateWorker(id: number, body: UpdateWorkerDto): Promise<{
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
    linkCompany(workerId: number, companyId: number, role?: string, trade?: string): Promise<{
        trainingSummary: any;
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
    unlinkCompany(workerId: number, companyId: number): Promise<{
        ok: boolean;
    }>;
    assignProject(workerId: number, projectId: number): Promise<{
        trainingSummary: any;
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
    getWallet(workerId: number): Promise<{
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
        training: import("../../vera-core/training-wallet.mapper").WalletTrainingRecordDto[];
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
    getWorkerTraining(workerId: number, options?: {
        roleType?: string;
        requiredCodes?: string[];
        projectId?: number;
    }): Promise<import("../../../workers/worker-training-hydration.service").WorkerTrainingHydration>;
    getWorkerProjectReadiness(workerId: number, projectId: number): Promise<import("../../../workers/worker-project-readiness.types").WorkerProjectReadinessResult>;
    uploadTraining(body: Record<string, unknown>): Promise<{
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
        walletTraining: import("../../vera-core/training-wallet.mapper").WalletTrainingRecordDto;
        error?: undefined;
    }>;
}
