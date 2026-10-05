import { PmSiteAccessControlService } from './pm-site-access-control.service';
import { PmSiteAccessCailIntelligenceService } from './pm-site-access-cail-intelligence.service';
export declare class PmSiteAccessControlController {
    private readonly access;
    private readonly cail;
    constructor(access: PmSiteAccessControlService, cail: PmSiteAccessCailIntelligenceService);
    validate(body: {
        workerId: number;
        projectId: number;
        zoneCode?: string;
        equipmentId?: number;
        accessPointId?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<import("./pm-site-access-control.service").AccessValidationResult>;
    listPoints(companyId: string, projectId?: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        projectId: number | null;
        siteId: number | null;
        pointType: import(".prisma/client").$Enums.PmAccessPointType;
        name: string;
        zoneCode: string;
        description: string | null;
        geoJson: import(".prisma/client").Prisma.JsonValue | null;
        active: boolean;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    createPoint(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        siteId: number | null;
        pointType: import(".prisma/client").$Enums.PmAccessPointType;
        name: string;
        zoneCode: string;
        description: string | null;
        geoJson: import(".prisma/client").Prisma.JsonValue | null;
        active: boolean;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listRules(projectId: string): import(".prisma/client").Prisma.PrismaPromise<{
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
    upsertRule(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
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
    createOverride(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number;
        workerId: number | null;
        equipmentId: number | null;
        zoneCode: string | null;
        overrideType: import(".prisma/client").$Enums.PmAccessOverrideType;
        reason: string;
        expiresAt: Date;
        supervisorUserId: number | null;
        safetyUserId: number | null;
        supervisorSignature: string | null;
        safetySignature: string | null;
        active: boolean;
        revokedAt: Date | null;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    listOverrides(projectId: string): import(".prisma/client").Prisma.PrismaPromise<{
        id: string;
        companyId: number;
        projectId: number;
        workerId: number | null;
        equipmentId: number | null;
        zoneCode: string | null;
        overrideType: import(".prisma/client").$Enums.PmAccessOverrideType;
        reason: string;
        expiresAt: Date;
        supervisorUserId: number | null;
        safetyUserId: number | null;
        supervisorSignature: string | null;
        safetySignature: string | null;
        active: boolean;
        revokedAt: Date | null;
        clientSyncId: string | null;
        createdAt: Date;
    }[]>;
    revokeOverride(id: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number;
        workerId: number | null;
        equipmentId: number | null;
        zoneCode: string | null;
        overrideType: import(".prisma/client").$Enums.PmAccessOverrideType;
        reason: string;
        expiresAt: Date;
        supervisorUserId: number | null;
        safetyUserId: number | null;
        supervisorSignature: string | null;
        safetySignature: string | null;
        active: boolean;
        revokedAt: Date | null;
        clientSyncId: string | null;
        createdAt: Date;
    }>;
    analytics(projectId: string): Promise<{
        attempts30d: number;
        denials30d: number;
        overrides30d: number;
        compliancePct: number;
        denialRate: number;
        overrideRate: number;
        projectAccessScore: number;
        trends: {
            denialByZone: {
                zoneCode: string;
                count: number;
            }[];
            topDeniedWorkers: {
                workerId: number;
                denials: number;
            }[];
            equipmentDenials30d: number;
        };
        zoneComplianceScores: ({
            zoneCode: string;
            zoneRiskScore: number;
            predictiveDenialLikelihood: number;
            zoneType?: undefined;
            denialRate30d?: undefined;
            highRisk?: undefined;
            denials: number;
        } | {
            zoneCode: string;
            zoneType: import(".prisma/client").$Enums.PmAccessZoneType;
            zoneRiskScore: number;
            predictiveDenialLikelihood: number;
            denialRate30d: number;
            highRisk: boolean;
            denials: number;
        })[];
        workerComplianceScores: {
            workerId: number;
            complianceScore: number;
        }[];
        leadingIndicators: {
            overrideRate: number;
        };
        cailInsights: import("./pm-site-access-cail-intelligence.service").AccessCailInsight[];
    }>;
    intelligence(projectId: string): Promise<import("./pm-site-access-cail-intelligence.service").AccessCailInsight[]>;
    syncBundle(projectId: string): Promise<{
        syncedAt: string;
        projectId: number;
        accessPoints: {
            id: string;
            companyId: number;
            projectId: number | null;
            siteId: number | null;
            pointType: import(".prisma/client").$Enums.PmAccessPointType;
            name: string;
            zoneCode: string;
            description: string | null;
            geoJson: import(".prisma/client").Prisma.JsonValue | null;
            active: boolean;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        zoneRules: {
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
        }[];
        roster: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: number;
            workerId: number;
            projectId: number;
            companyId: number;
            assignedBy: number | null;
            assignedAt: Date;
            status: import(".prisma/client").$Enums.AssignmentStatus;
            role: string | null;
            endedAt: Date | null;
        })[];
        activeOverrides: {
            id: string;
            companyId: number;
            projectId: number;
            workerId: number | null;
            equipmentId: number | null;
            zoneCode: string | null;
            overrideType: import(".prisma/client").$Enums.PmAccessOverrideType;
            reason: string;
            expiresAt: Date;
            supervisorUserId: number | null;
            safetyUserId: number | null;
            supervisorSignature: string | null;
            safetySignature: string | null;
            active: boolean;
            revokedAt: Date | null;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
    }>;
    stationValidate(body: Record<string, unknown>): Promise<import("./pm-site-access-control.service").AccessValidationResult>;
    offlineSync(body: {
        projectId: number;
        attempts?: Array<Record<string, unknown>>;
        overrides?: Array<Record<string, unknown>>;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        syncedAt: string;
        attempts: number;
        overrides: number;
        projectId: number;
    }>;
}
