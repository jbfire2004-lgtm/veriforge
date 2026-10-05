import { ProjectsService } from '../../vera-core/projects.service';
import { ProjectRepository } from '../repositories/project.repository';
import { ReportingCoreService } from '../../reporting-core/reporting-core.service';
import { EventBusService } from '../events/event-bus.service';
export declare class ProjectApiService {
    private readonly projects;
    private readonly projectRepo;
    private readonly reporting;
    private readonly events;
    constructor(projects: ProjectsService, projectRepo: ProjectRepository, reporting: ReportingCoreService, events: EventBusService);
    create(data: Parameters<ProjectsService['create']>[0]): Promise<{
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
    get(id: number): Promise<{
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
    assignWorker(projectId: number, workerId: number, assignedBy?: number): Promise<{
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
    assignEquipment(projectId: number, equipmentId: number, assignedBy?: number): Promise<{
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
    readiness(companyId?: number, projectId?: number): Promise<{
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
    close(id: number): Promise<{
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
}
