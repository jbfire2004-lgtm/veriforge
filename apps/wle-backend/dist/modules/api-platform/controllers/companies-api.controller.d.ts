import { CompanyApiService } from '../services/company-api.service';
export declare class CompaniesApiController {
    private readonly companies;
    constructor(companies: CompanyApiService);
    create(body: Record<string, unknown>): Promise<{
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
    update(id: number, body: Record<string, unknown>): Promise<{
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
    get(id: number): Promise<{
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
    workers(id: number): import(".prisma/client").Prisma.PrismaPromise<{
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
    equipment(id: number): import(".prisma/client").Prisma.PrismaPromise<({
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
    })[]>;
    compliance(id: number): Promise<{
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
}
