import { CailStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CailScopeService, type CailActor } from './cail-scope.service';
import type { CreateCailDto } from '../dto/create-cail.dto';
import type { UpdateCailDto } from '../dto/update-cail.dto';
import type { ResolveCailDto } from '../dto/resolve-cail.dto';
import { LessonsLearnedService } from '../lessons-learned/lessons-learned.service';
import { SafetyIntelligenceAiService } from '../ai/safety-intelligence-ai.service';
import { CailCopilotEnrichmentService } from './cail-copilot-enrichment.service';
import { NotificationsService } from '../../notifications/notifications.service';
import { VsiEventService } from '../events/vsi-event.service';
export declare class CailService {
    private readonly prisma;
    private readonly scope;
    private readonly lessonsLearned;
    private readonly ai;
    private readonly copilotEnrich;
    private readonly notifications;
    private readonly vsiEvents;
    constructor(prisma: PrismaService, scope: CailScopeService, lessonsLearned: LessonsLearnedService, ai: SafetyIntelligenceAiService, copilotEnrich: CailCopilotEnrichmentService, notifications: NotificationsService, vsiEvents: VsiEventService);
    private assertTransition;
    private log;
    list(actor: CailActor, filters: {
        projectId?: number;
        status?: CailStatus;
        sourceType?: string;
        ownerCompanyId?: number;
    }): Promise<({
        project: {
            id: number;
            name: string;
        };
        assignedUser: {
            id: number;
            username: string;
        };
        ownerCompany: {
            id: number;
            name: string;
        };
    } & {
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
    })[]>;
    getById(id: string, actor: CailActor): Promise<{
        project: {
            id: number;
            name: string;
            code: string;
        };
        attachments: {
            id: string;
            cailId: string;
            phase: string;
            fileName: string;
            storageKey: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            uploadedById: number | null;
            createdAt: Date;
        }[];
        createdBy: {
            id: number;
            username: string;
        };
        assignedUser: {
            id: number;
            username: string;
        };
        ownerCompany: {
            id: number;
            name: string;
        };
        verifiedBy: {
            id: number;
            username: string;
        };
        activityLogs: {
            id: string;
            cailId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
    } & {
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
    }>;
    create(dto: CreateCailDto, actor: CailActor): Promise<{
        project: {
            id: number;
            name: string;
            code: string;
        };
        attachments: {
            id: string;
            cailId: string;
            phase: string;
            fileName: string;
            storageKey: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            uploadedById: number | null;
            createdAt: Date;
        }[];
        createdBy: {
            id: number;
            username: string;
        };
        assignedUser: {
            id: number;
            username: string;
        };
        ownerCompany: {
            id: number;
            name: string;
        };
        verifiedBy: {
            id: number;
            username: string;
        };
        activityLogs: {
            id: string;
            cailId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
    } & {
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
    }>;
    update(id: string, dto: UpdateCailDto, actor: CailActor): Promise<{
        project: {
            id: number;
            name: string;
            code: string;
        };
        attachments: {
            id: string;
            cailId: string;
            phase: string;
            fileName: string;
            storageKey: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            uploadedById: number | null;
            createdAt: Date;
        }[];
        createdBy: {
            id: number;
            username: string;
        };
        assignedUser: {
            id: number;
            username: string;
        };
        ownerCompany: {
            id: number;
            name: string;
        };
        verifiedBy: {
            id: number;
            username: string;
        };
        activityLogs: {
            id: string;
            cailId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
    } & {
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
    }>;
    assign(id: string, data: {
        assignedUserId?: number;
        ownerCompanyId?: number;
    }, actor: CailActor): Promise<{
        project: {
            id: number;
            name: string;
            code: string;
        };
        attachments: {
            id: string;
            cailId: string;
            phase: string;
            fileName: string;
            storageKey: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            uploadedById: number | null;
            createdAt: Date;
        }[];
        createdBy: {
            id: number;
            username: string;
        };
        assignedUser: {
            id: number;
            username: string;
        };
        ownerCompany: {
            id: number;
            name: string;
        };
        verifiedBy: {
            id: number;
            username: string;
        };
        activityLogs: {
            id: string;
            cailId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
    } & {
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
    }>;
    analyzeWithAi(id: string, actor: CailActor): Promise<{
        entry: {
            project: {
                id: number;
                name: string;
                code: string;
            };
            attachments: {
                id: string;
                cailId: string;
                phase: string;
                fileName: string;
                storageKey: string | null;
                mimeType: string | null;
                dataUrl: string | null;
                uploadedById: number | null;
                createdAt: Date;
            }[];
            createdBy: {
                id: number;
                username: string;
            };
            assignedUser: {
                id: number;
                username: string;
            };
            ownerCompany: {
                id: number;
                name: string;
            };
            verifiedBy: {
                id: number;
                username: string;
            };
            activityLogs: {
                id: string;
                cailId: string;
                eventType: string;
                actorId: number | null;
                payload: Prisma.JsonValue | null;
                createdAt: Date;
            }[];
        } & {
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
        analysis: {
            generatedAt: string;
            engine: string;
            summary: string;
            rootCauseSuggestions: {
                category: string;
                description: string;
                confidence: number;
            }[];
            correctiveActionSuggestions: {
                title: string;
                description: string;
                actionType: "corrective";
                priority: "medium";
            }[];
            similarPatterns: string[];
            interventions: {
                type: string;
                message: string;
            }[];
            cailEnvelope: import("../ai/copilot/vsi-copilot.types").CailIntelligenceEnvelope;
            copilot: unknown;
            copilotRun: import("../ai/copilot/vsi-copilot.types").CopilotRunResponse;
        };
    }>;
    resolve(id: string, dto: ResolveCailDto, actor: CailActor): Promise<{
        project: {
            id: number;
            name: string;
            code: string;
        };
        attachments: {
            id: string;
            cailId: string;
            phase: string;
            fileName: string;
            storageKey: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            uploadedById: number | null;
            createdAt: Date;
        }[];
        createdBy: {
            id: number;
            username: string;
        };
        assignedUser: {
            id: number;
            username: string;
        };
        ownerCompany: {
            id: number;
            name: string;
        };
        verifiedBy: {
            id: number;
            username: string;
        };
        activityLogs: {
            id: string;
            cailId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
    } & {
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
    }>;
    verify(id: string, actor: CailActor, note?: string): Promise<{
        project: {
            id: number;
            name: string;
            code: string;
        };
        attachments: {
            id: string;
            cailId: string;
            phase: string;
            fileName: string;
            storageKey: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            uploadedById: number | null;
            createdAt: Date;
        }[];
        createdBy: {
            id: number;
            username: string;
        };
        assignedUser: {
            id: number;
            username: string;
        };
        ownerCompany: {
            id: number;
            name: string;
        };
        verifiedBy: {
            id: number;
            username: string;
        };
        activityLogs: {
            id: string;
            cailId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        lessonLearned: {
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
        };
    } & {
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
    }>;
    cancel(id: string, actor: CailActor, reason?: string): Promise<{
        project: {
            id: number;
            name: string;
            code: string;
        };
        attachments: {
            id: string;
            cailId: string;
            phase: string;
            fileName: string;
            storageKey: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            uploadedById: number | null;
            createdAt: Date;
        }[];
        createdBy: {
            id: number;
            username: string;
        };
        assignedUser: {
            id: number;
            username: string;
        };
        ownerCompany: {
            id: number;
            name: string;
        };
        verifiedBy: {
            id: number;
            username: string;
        };
        activityLogs: {
            id: string;
            cailId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
    } & {
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
    }>;
    getWorkflowDefinition(): {
        statuses: string[];
        transitions: Record<import(".prisma/client").$Enums.CailStatus, import(".prisma/client").$Enums.CailStatus[]>;
    };
}
