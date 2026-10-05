import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';
import { CailScopeService, type CailActor } from '../cail/cail-scope.service';
import { LessonEmbeddingService } from './lesson-embedding.service';
import { VsiEventService } from '../events/vsi-event.service';
export declare class LessonsLearnedService {
    private readonly prisma;
    private readonly ai;
    private readonly scope;
    private readonly embeddings;
    private readonly vsiEvents;
    constructor(prisma: PrismaService, ai: SafetyIntelligenceAiService, scope: CailScopeService, embeddings: LessonEmbeddingService, vsiEvents: VsiEventService);
    materializeFromCail(cailId: string): Promise<{
        id: string;
        cailId: string;
        projectId: number;
        companyId: number;
        sourceType: import(".prisma/client").$Enums.CailSourceType;
        title: string;
        summary: string;
        rootCause: string | null;
        correctiveAction: string | null;
        beforeEvidence: Prisma.JsonValue;
        afterEvidence: Prisma.JsonValue;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        timeToCloseHours: number | null;
        tags: Prisma.JsonValue;
        aiClusterId: string | null;
        aiInsights: Prisma.JsonValue | null;
        embedding: Prisma.JsonValue | null;
        embeddingModel: string | null;
        publishedAt: Date;
        createdAt: Date;
    }>;
    recluster(projectId: number, actor: CailActor): Promise<{
        projectId: number;
        clusters: import("./lesson-embedding.service").EmbeddingCluster[];
        lessonCount: number;
    }>;
    list(actor: CailActor, filters: {
        projectId?: number;
        companyId?: number;
    }): Promise<({
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
        beforeEvidence: Prisma.JsonValue;
        afterEvidence: Prisma.JsonValue;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        timeToCloseHours: number | null;
        tags: Prisma.JsonValue;
        aiClusterId: string | null;
        aiInsights: Prisma.JsonValue | null;
        embedding: Prisma.JsonValue | null;
        embeddingModel: string | null;
        publishedAt: Date;
        createdAt: Date;
    })[]>;
    getById(id: string, actor: CailActor): Promise<{
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
            evidenceBefore: Prisma.JsonValue;
            evidenceAfter: Prisma.JsonValue;
            rootCauseCategory: string | null;
            rootCauseNotes: string | null;
            aiRootCauseSuggestions: Prisma.JsonValue | null;
            aiCorrectiveActionSuggestions: Prisma.JsonValue | null;
            aiClassification: Prisma.JsonValue | null;
            lessonsLearnedGenerated: boolean;
            tags: Prisma.JsonValue;
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
        beforeEvidence: Prisma.JsonValue;
        afterEvidence: Prisma.JsonValue;
        severity: import(".prisma/client").$Enums.CailSeverity | null;
        timeToCloseHours: number | null;
        tags: Prisma.JsonValue;
        aiClusterId: string | null;
        aiInsights: Prisma.JsonValue | null;
        embedding: Prisma.JsonValue | null;
        embeddingModel: string | null;
        publishedAt: Date;
        createdAt: Date;
    }>;
    clusters(projectId: number): Promise<{
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
}
