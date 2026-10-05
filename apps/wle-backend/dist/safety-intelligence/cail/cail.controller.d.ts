import { CailStatus, UserRole } from '@prisma/client';
import { CailService } from './cail.service';
import { CailScopeService } from './cail-scope.service';
import { CreateCailDto } from '../dto/create-cail.dto';
import { UpdateCailDto } from '../dto/update-cail.dto';
import { ResolveCailDto } from '../dto/resolve-cail.dto';
import { AssignCailDto } from '../dto/assign-cail.dto';
export declare class CailController {
    private readonly cail;
    private readonly scope;
    constructor(cail: CailService, scope: CailScopeService);
    private actor;
    list(req: {
        user: {
            id: number;
            role: UserRole;
        };
    }, projectId?: string, status?: CailStatus, sourceType?: string, ownerCompanyId?: string): Promise<({
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
    })[]>;
    getWorkflow(): {
        statuses: string[];
        transitions: Record<import(".prisma/client").$Enums.CailStatus, import(".prisma/client").$Enums.CailStatus[]>;
    };
    getOne(id: string, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
    }>;
    create(dto: CreateCailDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
    }>;
    update(id: string, dto: UpdateCailDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
    }>;
    assign(id: string, dto: AssignCailDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
    }>;
    resolve(id: string, dto: ResolveCailDto, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
    }>;
    verify(id: string, note: string | undefined, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
    }>;
    cancel(id: string, reason: string | undefined, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
    }>;
    analyzeAi(id: string, req: {
        user: {
            id: number;
            role: UserRole;
        };
    }): Promise<{
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
                payload: import(".prisma/client").Prisma.JsonValue | null;
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
}
