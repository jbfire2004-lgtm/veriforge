import { EquipmentCatalogCategory, EquipmentSafetyStatus } from '@prisma/client';
export declare class CreateEquipmentCoreDto {
    name: string;
    serialNumber?: string;
    assetTag?: string;
    companyId?: number;
    categoryId?: number;
    typeId?: number;
    safetyStatus?: EquipmentSafetyStatus;
    photoUrl?: string;
    description?: string;
    manufacturer?: string;
    model?: string;
    yearMade?: number;
    catalogCategory?: EquipmentCatalogCategory;
    catalogTypeKey?: string;
    meterHours?: number;
}
