import { PrismaService } from '../../prisma/prisma.service';
import { PmProjectSafetyContextService } from '../../pm-project-safety-context/pm-project-safety-context.service';
export declare class ProjectSafetyContextService {
    private readonly prisma;
    private readonly pmContext?;
    constructor(prisma: PrismaService, pmContext?: PmProjectSafetyContextService);
    getContext(projectId: number): Promise<{
        projectId: number;
        ownerCompanyId: number;
        companyName: string;
        siteIds: number[];
        siteName: string;
        profile: {
            id: string;
            version: number;
            status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
            riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
            requiredJhaTypes: import(".prisma/client").Prisma.JsonValue;
            requiredTraining: import(".prisma/client").Prisma.JsonValue;
            enforcementRules: import(".prisma/client").Prisma.JsonValue;
            publishedAt: string;
            completenessScore: number;
        };
        hazardLibraryCount: number;
        controlLibraryCount: number;
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
        openCailCount: number;
        riskSnapshot: {
            score: number;
            band: string;
            computedAt: string;
        };
        cailInsights: import("../../pm-project-safety-context/pm-project-safety-cail-intelligence.service").ProjectSafetyCailInsight[];
        integrations: {
            jhaFlha: boolean;
            siteAccess: boolean;
            safetyStations: boolean;
            emergency: boolean;
        };
    } | {
        projectId: number;
        ownerCompanyId: number;
        siteIds: number[];
        siteName: string;
        companyName: string;
        activeWorkerCount: number;
        openCailCount: number;
        overdueCailCount: number;
        sifOpenCount: number;
        lastInspectionAt: string;
        lastFlhaAt: string;
        riskSnapshot: {
            score: number;
            band: string;
            computedAt: string;
        };
        requiredForms: string[];
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
    }>;
}
