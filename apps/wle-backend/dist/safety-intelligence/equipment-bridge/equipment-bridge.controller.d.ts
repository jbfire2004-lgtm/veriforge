import { EquipmentBridgeService } from './equipment-bridge.service';
export declare class EquipmentBridgeController {
    private readonly bridge;
    constructor(bridge: EquipmentBridgeService);
    emit(inspectionId: string, projectId: string | undefined, req: {
        user: {
            id: number;
        };
    }): Promise<{
        inspectionId: number;
        emittedCount: number;
        entries: any[];
    }>;
    listCail(equipmentId: string): Promise<{
        id: string;
        projectId: number;
        ownerCompanyId: number;
        assignedUserId: number | null;
        sourceType: import(".prisma/client").$Enums.CailSourceType;
        sourceId: string;
        sourceItemId: string;
        title: string;
        description: string | null;
        status: import(".prisma/client").$Enums.CailStatus;
        severity: import(".prisma/client").$Enums.CailSeverity;
        riskCategory: import(".prisma/client").$Enums.CailRiskCategory | null;
        dueDate: Date | null;
        createdAt: Date;
        updatedAt: Date;
        closedAt: Date | null;
        verifiedAt: Date | null;
        createdByUserId: number | null;
        verifiedByUserId: number | null;
        evidenceBefore: import(".prisma/client").Prisma.JsonValue;
        evidenceAfter: import(".prisma/client").Prisma.JsonValue;
        rootCauseCategory: string | null;
        rootCauseNotes: string | null;
        aiRootCauseSuggestions: import(".prisma/client").Prisma.JsonValue | null;
        aiCorrectiveActionSuggestions: import(".prisma/client").Prisma.JsonValue | null;
        aiClassification: import(".prisma/client").Prisma.JsonValue | null;
        lessonsLearnedGenerated: boolean;
        tags: import(".prisma/client").Prisma.JsonValue;
        siteId: number | null;
        locationNote: string | null;
        equipmentId: number | null;
        workerId: number | null;
        overdueAt: Date | null;
        timeToResolveHours: number | null;
    }[]>;
}
