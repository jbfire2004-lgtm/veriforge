import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { BaseRepository, type PaginatedResult, type PaginationParams } from './base.repository';
export declare class EquipmentRepository extends BaseRepository {
    constructor(prisma: PrismaService);
    findById(id: number): Prisma.Prisma__EquipmentClient<{
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
    }, null, import("@prisma/client/runtime/library").DefaultArgs>;
    list(where: Prisma.EquipmentWhereInput, pagination?: PaginationParams): Promise<PaginatedResult<unknown>>;
}
