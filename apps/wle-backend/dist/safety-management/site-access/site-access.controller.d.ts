import { SiteAccessService } from './site-access.service';
export declare class SiteAccessController {
    private readonly siteAccess;
    constructor(siteAccess: SiteAccessService);
    listRules(projectId: string): Promise<{
        id: string;
        companyId: number | null;
        projectId: number;
        accessPointId: string | null;
        zoneCode: string;
        zoneType: import(".prisma/client").$Enums.PmAccessZoneType;
        requiresFlhaHours: number;
        requiresTrainingCodes: import(".prisma/client").Prisma.JsonValue;
        requiresOrientation: boolean;
        requiresJha: boolean;
        requiresSdsAck: boolean;
        requiresPermitIds: import(".prisma/client").Prisma.JsonValue;
        requiredPpe: import(".prisma/client").Prisma.JsonValue;
        requirementsJson: import(".prisma/client").Prisma.JsonValue;
        equipmentCategoryIds: import(".prisma/client").Prisma.JsonValue;
        timeWindowStart: string | null;
        timeWindowEnd: string | null;
        highRisk: boolean;
        active: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    upsertRule(body: {
        projectId: number;
        zoneCode?: string;
        requiresFlhaHours?: number;
        requiresTrainingCodes?: string[];
        requiresOrientation?: boolean;
    }): Promise<{
        id: string;
        companyId: number | null;
        projectId: number;
        accessPointId: string | null;
        zoneCode: string;
        zoneType: import(".prisma/client").$Enums.PmAccessZoneType;
        requiresFlhaHours: number;
        requiresTrainingCodes: import(".prisma/client").Prisma.JsonValue;
        requiresOrientation: boolean;
        requiresJha: boolean;
        requiresSdsAck: boolean;
        requiresPermitIds: import(".prisma/client").Prisma.JsonValue;
        requiredPpe: import(".prisma/client").Prisma.JsonValue;
        requirementsJson: import(".prisma/client").Prisma.JsonValue;
        equipmentCategoryIds: import(".prisma/client").Prisma.JsonValue;
        timeWindowStart: string | null;
        timeWindowEnd: string | null;
        highRisk: boolean;
        active: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    evaluate(body: {
        workerId: number;
        projectId: number;
        zoneCode?: string;
    }): Promise<import("./site-access.service").SiteAccessEvaluation>;
    grant(req: {
        user?: {
            userId?: number;
        };
    }, body: {
        workerId: number;
        projectId: number;
        zoneCode?: string;
        expiresInHours?: number;
    }): Promise<{
        id: string;
        workerId: number;
        projectId: number;
        zoneCode: string;
        grantedAt: Date;
        grantedByUserId: number | null;
        expiresAt: Date | null;
        revokedAt: Date | null;
        sourceFormId: string | null;
        evaluationJson: import(".prisma/client").Prisma.JsonValue | null;
    }>;
    listGrants(projectId: string, workerId?: string): Promise<({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
    } & {
        id: string;
        workerId: number;
        projectId: number;
        zoneCode: string;
        grantedAt: Date;
        grantedByUserId: number | null;
        expiresAt: Date | null;
        revokedAt: Date | null;
        sourceFormId: string | null;
        evaluationJson: import(".prisma/client").Prisma.JsonValue | null;
    })[]>;
    revoke(id: string): Promise<{
        id: string;
        workerId: number;
        projectId: number;
        zoneCode: string;
        grantedAt: Date;
        grantedByUserId: number | null;
        expiresAt: Date | null;
        revokedAt: Date | null;
        sourceFormId: string | null;
        evaluationJson: import(".prisma/client").Prisma.JsonValue | null;
    }>;
}
