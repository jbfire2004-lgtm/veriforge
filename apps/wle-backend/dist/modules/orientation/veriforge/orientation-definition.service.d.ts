import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../prisma/prisma.service';
import { AuditLogService } from '../../../audit/audit-log.service';
import type { CreateOrientationDefinitionInput, OrientationContentBlock, UpdateOrientationDefinitionInput } from './orientation.types';
export declare class OrientationDefinitionService {
    private readonly prisma;
    private readonly auditLog;
    constructor(prisma: PrismaService, auditLog: AuditLogService);
    create(input: CreateOrientationDefinitionInput): Promise<{
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
    }>;
    createFromUpload(input: {
        companyId: number;
        title: string;
        type: CreateOrientationDefinitionInput['type'];
        createdByUserId: number;
        sourceFileKey: string;
        sourceCoreFileId?: number;
        contentBlocks?: OrientationContentBlock[];
        metadata?: Record<string, unknown>;
    }): Promise<{
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
    }>;
    get(id: string, opts?: {
        companyId?: number;
    }): Promise<{
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
    }>;
    list(filters: {
        companyId: number;
        projectId?: number;
        type?: CreateOrientationDefinitionInput['type'];
        isPublished?: boolean;
    }): Promise<{
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
    }[]>;
    update(id: string, input: UpdateOrientationDefinitionInput, actor: {
        id: number;
        companyId?: number;
    }): Promise<{
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
    }>;
}
