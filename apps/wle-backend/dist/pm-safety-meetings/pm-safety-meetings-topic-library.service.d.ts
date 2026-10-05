import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
export declare class PmSafetyMeetingsTopicLibraryService {
    private readonly prisma;
    private readonly suggestEngine;
    constructor(prisma: PrismaService);
    ensureCategories(companyId: number, projectId?: number): Promise<void>;
    listTopics(companyId: number, projectId?: number, categoryCode?: string): Promise<({
        category: {
            id: string;
            companyId: number;
            projectId: number | null;
            code: import(".prisma/client").$Enums.TopicLibraryCategoryCode;
            name: string;
            description: string | null;
            sortOrder: number;
            active: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        companyId: number;
        projectId: number | null;
        categoryId: string | null;
        scope: import(".prisma/client").$Enums.TopicLibraryScope;
        title: string;
        summary: string | null;
        discussionPoints: Prisma.JsonValue;
        requiredControls: Prisma.JsonValue;
        requiredAttachments: Prisma.JsonValue;
        isHighRisk: boolean;
        requiresSifReview: boolean;
        sifHecaTags: Prisma.JsonValue;
        sourceRefs: Prisma.JsonValue;
        usageCount: number;
        active: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    createTopic(data: {
        companyId: number;
        projectId?: number;
        categoryId?: string;
        title: string;
        summary?: string;
        discussionPoints?: unknown[];
        requiredControls?: unknown[];
        isHighRisk?: boolean;
    }): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        categoryId: string | null;
        scope: import(".prisma/client").$Enums.TopicLibraryScope;
        title: string;
        summary: string | null;
        discussionPoints: Prisma.JsonValue;
        requiredControls: Prisma.JsonValue;
        requiredAttachments: Prisma.JsonValue;
        isHighRisk: boolean;
        requiresSifReview: boolean;
        sifHecaTags: Prisma.JsonValue;
        sourceRefs: Prisma.JsonValue;
        usageCount: number;
        active: boolean;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    suggestTopics(projectId: number, companyId: number): Promise<import("./topic-suggest.engine").TopicSuggestion[]>;
    private projectRiskScore;
}
