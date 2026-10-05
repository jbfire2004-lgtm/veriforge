import { PrismaService } from '../prisma/prisma.service';
import { CreateCompanyDto } from './dto/create-company.dto';
import { UpdateCompanyDto } from './dto/update-company.dto';
import { Phase1MonitoringService } from '../common/monitoring/phase1-monitoring.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
export type CompanyActor = {
    id: number;
    role: string;
};
export declare class CompaniesService {
    private prisma;
    private readonly monitoring;
    private readonly events?;
    constructor(prisma: PrismaService, monitoring: Phase1MonitoringService, events?: EventBusService);
    findAll(actor: CompanyActor): Promise<{
        id: number;
        name: string;
        logoUrl: string | null;
        city: string | null;
        province: string | null;
        industry: string | null;
        lat: number | null;
        lng: number | null;
        createdAt: Date;
    }[] | {
        id: number;
        name: string;
        logoUrl: string;
        createdAt: Date;
    }[]>;
    findOne(id: number, actor: CompanyActor): Promise<{
        equipment: ({
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: import(".prisma/client").Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
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
        incidents: {
            id: number;
            title: string;
            description: string | null;
            category: string | null;
            latitude: number | null;
            longitude: number | null;
            metadata: import(".prisma/client").Prisma.JsonValue | null;
            status: string;
            severity: string;
            workerId: number | null;
            equipmentId: number | null;
            companyId: number | null;
            siteId: number | null;
            createdById: number | null;
            assignedToId: number | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        documents: {
            id: number;
            type: string;
            name: string;
            url: string;
            description: string | null;
            workerId: number | null;
            equipmentId: number | null;
            companyId: number | null;
            tags: string[];
            version: number;
            deleted: boolean;
            createdAt: Date;
        }[];
        workers: ({
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
            credentials: ({
                certification: {
                    id: number;
                    name: string;
                    code: string | null;
                    description: string | null;
                };
            } & {
                id: number;
                workerId: number;
                name: string;
                value: string;
                createdAt: Date;
                expiresAt: Date | null;
                issuedAt: Date;
                certificationId: number | null;
            })[];
            incidents: {
                id: number;
                title: string;
                description: string | null;
                category: string | null;
                latitude: number | null;
                longitude: number | null;
                metadata: import(".prisma/client").Prisma.JsonValue | null;
                status: string;
                severity: string;
                workerId: number | null;
                equipmentId: number | null;
                companyId: number | null;
                siteId: number | null;
                createdById: number | null;
                assignedToId: number | null;
                createdAt: Date;
                updatedAt: Date;
            }[];
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
        })[];
    } & {
        id: number;
        name: string;
        logoUrl: string | null;
        city: string | null;
        province: string | null;
        industry: string | null;
        lat: number | null;
        lng: number | null;
        createdAt: Date;
    }>;
    create(dto: CreateCompanyDto): Promise<{
        id: number;
        name: string;
        logoUrl: string | null;
        city: string | null;
        province: string | null;
        industry: string | null;
        lat: number | null;
        lng: number | null;
        createdAt: Date;
    }>;
    update(id: number, dto: UpdateCompanyDto): Promise<{
        id: number;
        name: string;
        logoUrl: string | null;
        city: string | null;
        province: string | null;
        industry: string | null;
        lat: number | null;
        lng: number | null;
        createdAt: Date;
    }>;
    remove(id: number): Promise<{
        status: string;
        deletedId: number;
    }>;
    complianceSummary(id: number, actor?: CompanyActor): Promise<{
        companyId: number;
        companyName: string;
        expiredTrainingCount: number;
        expiringTrainingCount: number;
        expiredCredentialsCount: number;
        workerIncidentsCount: number;
        equipmentIncidentsCount: number;
        status: string;
    }>;
    analytics(id: number): Promise<{
        totalWorkers: number;
        expiredTraining: number;
        expiredCredentials: number;
        expiringSoon: number;
        workerIncidents: number;
        equipmentIncidents: number;
        months: string[];
        incidentTrend: number[];
        expiryTrend: number[];
    }>;
}
