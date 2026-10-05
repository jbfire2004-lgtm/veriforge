export declare class OpenIncidentInvestigationDto {
    projectId: number;
    narrative?: string;
    immediateActions?: string;
    leadInvestigatorId?: number;
}
export declare class UpdateIncidentInvestigationDto {
    narrative?: string;
    immediateActions?: string;
    investigationStatus?: string;
}
declare class CapaItemDto {
    title: string;
    description?: string;
    ownerCompanyId: number;
    assignedUserId?: number;
    actionType?: string;
}
export declare class BulkIncidentCapaDto {
    items: CapaItemDto[];
}
export {};
