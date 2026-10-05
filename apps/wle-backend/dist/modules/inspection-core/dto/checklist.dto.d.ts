import { InspectionChecklistCategory, InspectionType } from '@prisma/client';
export declare class ChecklistItemDto {
    id: string;
    label: string;
    required?: boolean;
}
export declare class CreateChecklistDto {
    name: string;
    category: InspectionChecklistCategory;
    inspectionType: InspectionType;
    items: ChecklistItemDto[];
    intervalDays?: number;
    intervalHours?: number;
    active?: boolean;
}
export declare class UpdateChecklistDto {
    name?: string;
    category?: InspectionChecklistCategory;
    inspectionType?: InspectionType;
    items?: ChecklistItemDto[];
    intervalDays?: number;
    intervalHours?: number;
    active?: boolean;
}
