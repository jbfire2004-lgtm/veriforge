import { TenantScopeService } from '../../../security/tenant-scope.service';
import type { SecurityActor } from '../../../security/security.types';
import { OrientationDefinitionService } from './orientation-definition.service';
import type { OrientationDefinitionType } from './orientation.types';
export declare class OrientationDefinitionController {
    private readonly definitions;
    private readonly tenant;
    constructor(definitions: OrientationDefinitionService, tenant: TenantScopeService);
    create(req: {
        user: SecurityActor;
    }, body: {
        companyId?: number;
        title: string;
        type: OrientationDefinitionType;
        contentMode?: 'uploaded' | 'native' | 'hybrid';
        contentBlocks?: unknown[];
        version?: string;
        isPublished?: boolean;
        expiryRules?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
    }): Promise<{
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
    }>;
    upload(req: {
        user: SecurityActor;
    }, file: Express.Multer.File | undefined, body: {
        companyId?: number;
        title?: string;
        type?: OrientationDefinitionType;
    }): Promise<{
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
    }>;
    list(req: {
        user: SecurityActor;
    }, companyIdRaw?: string, projectIdRaw?: string, type?: OrientationDefinitionType, isPublishedRaw?: string): Promise<{
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
    }[]>;
    get(req: {
        user: SecurityActor;
    }, id: string, companyIdRaw?: string): Promise<{
        requirements: {
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
        }[];
    } & {
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
    }>;
    update(id: string, req: {
        user: SecurityActor;
    }, body: {
        title?: string;
        type?: OrientationDefinitionType;
        contentMode?: 'uploaded' | 'native' | 'hybrid';
        contentBlocks?: unknown[];
        isPublished?: boolean;
        expiryRules?: Record<string, unknown>;
        metadata?: Record<string, unknown>;
        bumpVersion?: boolean;
    }): Promise<{
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
    }>;
}
