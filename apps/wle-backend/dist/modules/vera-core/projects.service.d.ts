import { AdoptionEventService } from '../adoption-analytics/adoption-event.service';
import { OrientationLinkingService } from '../orientation/orientation-linking.service';
import { OrientationAccessService } from '../orientation/orientation-access.service';
import { ProjectStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { InactivationService } from './inactivation.service';
import { CompetencyService } from '../competency/competency.service';
import { EventBusService } from '../api-platform/events/event-bus.service';
export declare class ProjectsService {
    private readonly prisma;
    private readonly inactivation;
    private readonly competency;
    private readonly adoption?;
    private readonly orientationLinking?;
    private readonly orientationAccess?;
    private readonly events?;
    constructor(prisma: PrismaService, inactivation: InactivationService, competency: CompetencyService, adoption?: AdoptionEventService, orientationLinking?: OrientationLinkingService, orientationAccess?: OrientationAccessService, events?: EventBusService);
    listByCompany(companyId: number, status?: ProjectStatus): Promise<({
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
    create(data: {
        companyId: number;
        name: string;
        code?: string;
        siteId?: number;
        startDate?: Date;
    }): Promise<{
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
    assignWorker(projectId: number, workerId: number, assignedBy?: number, equipmentId?: number): Promise<{
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
    removeWorker(projectId: number, workerId: number): Promise<{
        projectId: number;
        workerId: number;
        removedAt: Date;
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
    removeEquipment(projectId: number, equipmentId: number): Promise<{
        projectId: number;
        equipmentId: number;
        removedAt: Date;
    }>;
    close(projectId: number): Promise<{
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
