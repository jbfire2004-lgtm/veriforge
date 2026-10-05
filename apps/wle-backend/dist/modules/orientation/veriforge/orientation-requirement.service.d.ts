import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../audit/audit-log.service';
import type { CreateOrientationRequirementInput, ResolveRequirementsInput } from './orientation.types';
export declare class OrientationRequirementService {
    private readonly prisma;
    private readonly auditLog;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    create(input: CreateOrientationRequirementInput, actor: {
        id: number;
        companyId?: number;
    }): Promise<{
        orientation: {
            id: string;
            companyId: number;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            contentMode: import(".prisma/client").$Enums.OrientationContentMode;
            contentBlocks: Prisma.JsonValue;
            createdByUserId: number;
            createdByType: import(".prisma/client").$Enums.OrientationCreatedByType;
            version: string;
            isPublished: boolean;
            expiryRules: Prisma.JsonValue;
            metadata: Prisma.JsonValue;
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
    list(filters: {
        companyId: number;
        projectId?: number;
        workerId?: number;
        isActive?: boolean;
    }): Promise<({
        orientation: {
            id: string;
            companyId: number;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            contentMode: import(".prisma/client").$Enums.OrientationContentMode;
            contentBlocks: Prisma.JsonValue;
            createdByUserId: number;
            createdByType: import(".prisma/client").$Enums.OrientationCreatedByType;
            version: string;
            isPublished: boolean;
            expiryRules: Prisma.JsonValue;
            metadata: Prisma.JsonValue;
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
    update(id: string, input: Partial<CreateOrientationRequirementInput> & {
        isActive?: boolean;
    }, actor: {
        id: number;
        companyId?: number;
    }): Promise<{
        orientation: {
            id: string;
            companyId: number;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            contentMode: import(".prisma/client").$Enums.OrientationContentMode;
            contentBlocks: Prisma.JsonValue;
            createdByUserId: number;
            createdByType: import(".prisma/client").$Enums.OrientationCreatedByType;
            version: string;
            isPublished: boolean;
            expiryRules: Prisma.JsonValue;
            metadata: Prisma.JsonValue;
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
    resolveForWorker(input: ResolveRequirementsInput): Promise<({
        orientation: {
            id: string;
            companyId: number;
            title: string;
            type: import(".prisma/client").$Enums.OrientationDefinitionType;
            contentMode: import(".prisma/client").$Enums.OrientationContentMode;
            contentBlocks: Prisma.JsonValue;
            createdByUserId: number;
            createdByType: import(".prisma/client").$Enums.OrientationCreatedByType;
            version: string;
            isPublished: boolean;
            expiryRules: Prisma.JsonValue;
            metadata: Prisma.JsonValue;
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
}
