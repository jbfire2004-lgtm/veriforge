import { UserRole } from '@prisma/client';
import { CailScopeService } from '../cail/cail-scope.service';
import { LessonsLearnedService } from './lessons-learned.service';
export declare class LessonsLearnedController {
    private readonly lessons;
    private readonly scope;
    constructor(lessons: LessonsLearnedService, scope: CailScopeService);
    list(req: {
        user: {
            id: number;
            role: UserRole;
        };
    }, projectId?: string, companyId?: string): Promise<({
        company: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cail: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            sourceType: import(".prisma/client").$Enums.CailSourceType;
        };
    } & {
        id: string;
        cailId: string;
        projectId: number;
        companyId: number;
        sourceType: import(".prisma/client").$Enums.CailSourceType;
        title: string;
        summary: string;
        rootCause: string | null;
        correctiveAction: string | null;
        beforeEvidence: import(".prisma/client").Prisma.JsonValue;
        afterEvidence: import(".prisma/client").Prisma.JsonValue;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        timeToCloseHours: number | null;
        tags: import(".prisma/client").Prisma.JsonValue;
        aiClusterId: string | null;
        aiInsights: import(".prisma/client").Prisma.JsonValue | null;
        embedding: import(".prisma/client").Prisma.JsonValue | null;
        embeddingModel: string | null;
        publishedAt: Date;
        createdAt: Date;
    })[]>;
    clusters(projectId: string): Promise<{
        label: string;
        meetingTopics: string[];
        clusterId: string;
        count: number;
        lessons: {
            id: string;
            title: string;
            severity: import(".prisma/client").$Enums.CailSeverity;
            sourceType: import(".prisma/client").$Enums.CailSourceType;
            aiClusterId: string;
        }[];
    }[]>;
    recluster(projectId: string, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        projectId: number;
        clusters: import("./lesson-embedding.service").EmbeddingCluster[];
        lessonCount: number;
    }>;
    getOne(id: string, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
        company: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cail: {
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
        };
    } & {
        id: string;
        cailId: string;
        projectId: number;
        companyId: number;
        sourceType: import(".prisma/client").$Enums.CailSourceType;
        title: string;
        summary: string;
        rootCause: string | null;
        correctiveAction: string | null;
        beforeEvidence: import(".prisma/client").Prisma.JsonValue;
        afterEvidence: import(".prisma/client").Prisma.JsonValue;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        timeToCloseHours: number | null;
        tags: import(".prisma/client").Prisma.JsonValue;
        aiClusterId: string | null;
        aiInsights: import(".prisma/client").Prisma.JsonValue | null;
        embedding: import(".prisma/client").Prisma.JsonValue | null;
        embeddingModel: string | null;
        publishedAt: Date;
        createdAt: Date;
    }>;
    fromCail(cailId: string): Promise<{
        id: string;
        cailId: string;
        projectId: number;
        companyId: number;
        sourceType: import(".prisma/client").$Enums.CailSourceType;
        title: string;
        summary: string;
        rootCause: string | null;
        correctiveAction: string | null;
        beforeEvidence: import(".prisma/client").Prisma.JsonValue;
        afterEvidence: import(".prisma/client").Prisma.JsonValue;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        timeToCloseHours: number | null;
        tags: import(".prisma/client").Prisma.JsonValue;
        aiClusterId: string | null;
        aiInsights: import(".prisma/client").Prisma.JsonValue | null;
        embedding: import(".prisma/client").Prisma.JsonValue | null;
        embeddingModel: string | null;
        publishedAt: Date;
        createdAt: Date;
    }>;
}
