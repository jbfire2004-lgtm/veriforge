import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { OrientationRequirementService } from './orientation-requirement.service';
import type { OrientationMustCompleteBefore } from './orientation.types';
export declare class OrientationRequirementController {
    private readonly requirements;
    private readonly tenant;
    constructor(requirements: OrientationRequirementService, tenant: TenantScopeService);
    create(req: {
        user: SecurityActor;
    }, body: {
        orientationId: string;
        companyId?: number;
        projectId?: number;
        siteId?: number;
        tradeId?: string;
        unionDispatchType?: string;
        mustCompleteBefore: OrientationMustCompleteBefore;
        isActive?: boolean;
    }): Promise<{
        orientation: {
            id: string;
            companyId: number;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            contentMode: import(".prisma/client").$Enums.OrientationContentMode;
            contentBlocks: import(".prisma/client").Prisma.JsonValue;
            createdByUserId: number;
            createdByType: import(".prisma/client").$Enums.OrientationCreatedByType;
            version: string;
            isPublished: boolean;
            expiryRules: import(".prisma/client").Prisma.JsonValue;
            metadata: import(".prisma/client").Prisma.JsonValue;
            sourceFileKey: string | null;
            sourceCoreFileId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        orientationId: string;
        companyId: number;
        projectId: number | null;
        siteId: number | null;
        tradeId: string | null;
        unionDispatchType: string | null;
        mustCompleteBefore: import(".prisma/client").$Enums.OrientationMustCompleteBefore;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(req: {
        user: SecurityActor;
    }, companyIdRaw?: string, projectIdRaw?: string, workerIdRaw?: string, isActiveRaw?: string): Promise<({
        orientation: {
            id: string;
            companyId: number;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            contentMode: import(".prisma/client").$Enums.OrientationContentMode;
            contentBlocks: import(".prisma/client").Prisma.JsonValue;
            createdByUserId: number;
            createdByType: import(".prisma/client").$Enums.OrientationCreatedByType;
            version: string;
            isPublished: boolean;
            expiryRules: import(".prisma/client").Prisma.JsonValue;
            metadata: import(".prisma/client").Prisma.JsonValue;
            sourceFileKey: string | null;
            sourceCoreFileId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        orientationId: string;
        companyId: number;
        projectId: number | null;
        siteId: number | null;
        tradeId: string | null;
        unionDispatchType: string | null;
        mustCompleteBefore: import(".prisma/client").$Enums.OrientationMustCompleteBefore;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    update(id: string, req: {
        user: SecurityActor;
    }, body: {
        projectId?: number | null;
        siteId?: number | null;
        tradeId?: string | null;
        unionDispatchType?: string | null;
        mustCompleteBefore?: OrientationMustCompleteBefore;
        isActive?: boolean;
    }): Promise<{
        orientation: {
            id: string;
            companyId: number;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            contentMode: import(".prisma/client").$Enums.OrientationContentMode;
            contentBlocks: import(".prisma/client").Prisma.JsonValue;
            createdByUserId: number;
            createdByType: import(".prisma/client").$Enums.OrientationCreatedByType;
            version: string;
            isPublished: boolean;
            expiryRules: import(".prisma/client").Prisma.JsonValue;
            metadata: import(".prisma/client").Prisma.JsonValue;
            sourceFileKey: string | null;
            sourceCoreFileId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        orientationId: string;
        companyId: number;
        projectId: number | null;
        siteId: number | null;
        tradeId: string | null;
        unionDispatchType: string | null;
        mustCompleteBefore: import(".prisma/client").$Enums.OrientationMustCompleteBefore;
        isActive: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
