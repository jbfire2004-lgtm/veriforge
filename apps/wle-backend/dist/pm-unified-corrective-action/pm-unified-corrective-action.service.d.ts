import { PmCorrectiveActionLinkType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { PmUnifiedHazardControlService } from '../pm-unified-hazard-control/pm-unified-hazard-control.service';
import { PmWorkerSafetyProfileService } from '../pm-worker-safety-profile/pm-worker-safety-profile.service';
import { PmUnifiedCorrectiveActionCailService } from './pm-unified-corrective-action-cail.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';
export declare class PmUnifiedCorrectiveActionService {
    private readonly prisma;
    private readonly capa;
    private readonly auto;
    private readonly cail;
    private readonly hazardControl?;
    private readonly workerSafety?;
    private readonly ecosystem?;
    private readonly generation;
    private readonly enforcement;
    private readonly publish;
    private readonly crossModule;
    private readonly assignmentRules;
    constructor(prisma: PrismaService, capa: PmCorrectiveActionsService, auto: PmCapaAutoGenerateService, cail: PmUnifiedCorrectiveActionCailService, hazardControl?: PmUnifiedHazardControlService, workerSafety?: PmWorkerSafetyProfileService, ecosystem?: SafetyEcosystemEventsService);
    private unifiedAudit;
    getDashboard(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<{
        companyId: number;
        projectId: number;
        metrics: {
            total: number;
            open: number;
            overdue: number;
            critical: number;
            escalated: number;
            companyCapaScore: number;
        };
        cail: {
            insights: import("./pm-unified-corrective-action-cail.service").UnifiedCapaInsight[];
        };
    }>;
    createUnified(input: {
        companyId: number;
        projectId: number;
        siteId?: number;
        sourceModule: string;
        sourceId: string;
        sourceItemId?: string;
        title: string;
        description?: string;
        severity?: string;
        actionType?: string;
        hazardId?: string;
        controlId?: string;
        rootCauseId?: string;
        equipmentId?: number;
        workerId?: number;
        createdByUserId: number;
        assignUserId?: number;
        clientSyncId?: string;
        links?: Array<{
            linkType: PmCorrectiveActionLinkType;
            linkedId: string;
        }>;
        publish?: boolean;
    }, actorId?: number): Promise<{
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    publishAction(actionId: string, actorId: number): Promise<{
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addLink(actionId: string, linkType: PmCorrectiveActionLinkType, linkedId: string, meta?: Record<string, unknown>): Promise<{
        id: string;
        actionId: string;
        linkType: import(".prisma/client").$Enums.PmCorrectiveActionLinkType;
        linkedId: string;
        linkedMeta: Prisma.JsonValue;
        createdAt: Date;
    }>;
    generateFromAllModules(projectId: number, actorId: number): Promise<{
        projectId: number;
        results: Record<string, unknown>;
    }>;
    generateFromSource(source: string, sourceId: string, actorId: number, extras?: {
        rootCauseId?: string;
        deficiencyId?: string;
    }): Promise<{
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    } | ({
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    updateUnified(actionId: string, body: {
        title?: string;
        description?: string;
        severityLevel?: string;
        priorityLevel?: string;
        dueAt?: string;
        hazardId?: string;
        controlId?: string;
        equipmentId?: number;
        workerId?: number;
    }, actorId?: number): Promise<{
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    autoAssign(actionId: string, actorId?: number): Promise<{
        actionId: string;
        suggestions: import("../pm-corrective-actions/capa-assignment.engine").AssigneeSuggestion[];
    }>;
    submitForVerification(actionId: string, actorId: number): Promise<{
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    markInProgress(actionId: string, actorId?: number): Promise<{
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addSignature(actionId: string, data: {
        role: string;
        signatureData?: string;
    }, actorId?: number): Promise<{
        id: string;
        actionId: string;
        role: string;
        signerUserId: number | null;
        signatureData: string | null;
        signedAt: Date;
    }>;
    jhaApprovalGate(jhaFlhaId: string): Promise<import("./cross-module-integration.engine").IntegrationGateResult>;
    pmTaskStartGate(projectId: number, workerId?: number): Promise<import("./cross-module-integration.engine").IntegrationGateResult>;
    revokeExpiredOverrides(): Promise<{
        revoked: number;
    }>;
    getAction(actionId: string): Promise<{
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    applyOfflineSync(companyId: number, projectId: number, payload: {
        actions?: Array<Record<string, unknown>>;
        verifications?: Array<{
            actionId: string;
            outcome: 'approve' | 'reject';
            role: string;
            notes?: string;
        }>;
        attachments?: Array<{
            actionId: string;
            fileName?: string;
            mimeType?: string;
            dataUrl?: string;
            phase?: string;
            clientSyncId?: string;
        }>;
        clientSyncId?: string;
    }, actorId: number): Promise<{
        ok: boolean;
        applied: string[];
        serverState: {
            syncedAt: string;
            actions: ({
                equipment: {
                    id: number;
                    name: string;
                };
                project: {
                    id: number;
                    name: string;
                };
                cailEntry: {
                    id: string;
                    status: import(".prisma/client").$Enums.CailStatus;
                    severity: import(".prisma/client").$Enums.CailSeverity;
                    dueDate: Date;
                };
                attachments: {
                    id: string;
                    actionId: string;
                    storageKey: string | null;
                    fileName: string | null;
                    mimeType: string | null;
                    dataUrl: string | null;
                    coreFileId: number | null;
                    phase: string;
                    clientSyncId: string | null;
                    createdAt: Date;
                }[];
                assignees: ({
                    user: {
                        id: number;
                        username: string;
                    };
                } & {
                    id: string;
                    actionId: string;
                    userId: number | null;
                    workerId: number | null;
                    role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
                    delegatedFrom: string | null;
                    assignedAt: Date;
                    acceptedAt: Date | null;
                })[];
                escalations: {
                    id: string;
                    actionId: string;
                    level: number;
                    reason: string;
                    escalatedToUserId: number | null;
                    triggeredAt: Date;
                    resolvedAt: Date | null;
                    payload: Prisma.JsonValue | null;
                }[];
                verifications: {
                    id: string;
                    actionId: string;
                    verifierUserId: number;
                    role: string;
                    outcome: string;
                    notes: string | null;
                    evidenceJson: Prisma.JsonValue;
                    verifiedAt: Date;
                }[];
            } & {
                id: string;
                cailEntryId: string;
                companyId: number;
                projectId: number;
                siteId: number | null;
                sourceModule: string;
                sourceId: string;
                sourceItemId: string;
                deficiencyId: string | null;
                actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
                description: string | null;
                severityScore: number;
                priorityScore: number;
                escalationLevel: number;
                dueAt: Date | null;
                overdueAt: Date | null;
                equipmentId: number | null;
                workerId: number | null;
                subcontractorCompanyId: number | null;
                requiresVerification: boolean;
                verifiedAt: Date | null;
                closedAt: Date | null;
                createdByUserId: number;
                verifiedByUserId: number | null;
                parentActionId: string | null;
                hazardId: string | null;
                controlId: string | null;
                rootCauseId: string | null;
                publishVersion: number;
                publishedAt: Date | null;
                severityLevel: string;
                priorityLevel: string;
                evidenceRequirementsJson: Prisma.JsonValue;
                verificationRequirementsJson: Prisma.JsonValue;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
            hazardControl: {
                syncedAt: string;
                hazards: ({
                    energySources: {
                        id: string;
                        hazardId: string;
                        energyType: import(".prisma/client").$Enums.PmUnifiedEnergyType;
                        exposureLevel: number;
                        highEnergyFlag: boolean;
                        severityScore: number;
                        autoDetected: boolean;
                    }[];
                    controlLinks: ({
                        control: {
                            id: string;
                            companyId: number;
                            projectId: number | null;
                            workPackageId: string | null;
                            taskId: string | null;
                            parentControlId: string | null;
                            scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                            controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
                            title: string;
                            description: string;
                            controlStrength: number;
                            hierarchyLevel: number;
                            requiredTraining: Prisma.JsonValue;
                            requiredEquipmentIds: Prisma.JsonValue;
                            requiredPpe: Prisma.JsonValue;
                            requiredPermitTypes: Prisma.JsonValue;
                            sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                            sourceId: string | null;
                            legacyCompanyControlId: string | null;
                            legacyProjectControlId: string | null;
                            version: number;
                            status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                            publishedAt: Date | null;
                            active: boolean;
                            clientSyncId: string | null;
                            deletedAt: Date | null;
                            createdAt: Date;
                            updatedAt: Date;
                        };
                    } & {
                        id: string;
                        hazardId: string;
                        controlId: string;
                        effectivenessScore: number | null;
                        required: boolean;
                        verified: boolean;
                    })[];
                    trainingReqs: {
                        id: string;
                        hazardId: string;
                        trainingCode: string;
                        required: boolean;
                    }[];
                    ppeReqs: {
                        id: string;
                        hazardId: string;
                        ppeType: string;
                    }[];
                } & {
                    id: string;
                    companyId: number;
                    projectId: number | null;
                    workPackageId: string | null;
                    taskId: string | null;
                    workerId: number | null;
                    parentHazardId: string | null;
                    scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                    hazardType: import(".prisma/client").$Enums.PmUnifiedHazardType;
                    category: import(".prisma/client").$Enums.PmUnifiedHazardCategory;
                    subcategory: string | null;
                    title: string;
                    description: string;
                    severity: number;
                    likelihood: number;
                    riskScore: number;
                    sifPotential: boolean;
                    hecaCategoryKey: string | null;
                    sifScore: number | null;
                    supervisorReviewRequired: boolean;
                    requiredTraining: Prisma.JsonValue;
                    requiredEquipmentIds: Prisma.JsonValue;
                    requiredPpe: Prisma.JsonValue;
                    requiredPermitTypes: Prisma.JsonValue;
                    sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                    sourceId: string | null;
                    legacyCompanyHazardId: string | null;
                    legacyProjectHazardId: string | null;
                    version: number;
                    status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                    publishedAt: Date | null;
                    active: boolean;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                })[];
                controls: ({
                    verifications: {
                        id: string;
                        controlId: string;
                        stepOrder: number;
                        description: string;
                        verifiedAt: Date | null;
                        verifiedById: number | null;
                    }[];
                    hazardLinks: {
                        id: string;
                        hazardId: string;
                        controlId: string;
                        effectivenessScore: number | null;
                        required: boolean;
                        verified: boolean;
                    }[];
                } & {
                    id: string;
                    companyId: number;
                    projectId: number | null;
                    workPackageId: string | null;
                    taskId: string | null;
                    parentControlId: string | null;
                    scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                    controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
                    title: string;
                    description: string;
                    controlStrength: number;
                    hierarchyLevel: number;
                    requiredTraining: Prisma.JsonValue;
                    requiredEquipmentIds: Prisma.JsonValue;
                    requiredPpe: Prisma.JsonValue;
                    requiredPermitTypes: Prisma.JsonValue;
                    sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                    sourceId: string | null;
                    legacyCompanyControlId: string | null;
                    legacyProjectControlId: string | null;
                    version: number;
                    status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                    publishedAt: Date | null;
                    active: boolean;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                })[];
                energyWheel: {
                    id: string;
                    hazardId: string;
                    energyType: import(".prisma/client").$Enums.PmUnifiedEnergyType;
                    exposureLevel: number;
                    highEnergyFlag: boolean;
                    severityScore: number;
                    autoDetected: boolean;
                }[];
                projectSafety: {
                    context: {
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
                            requiredJhaTypes: Prisma.JsonValue;
                            requiredTraining: Prisma.JsonValue;
                            enforcementRules: Prisma.JsonValue;
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
                            requiresTrainingCodes: Prisma.JsonValue;
                            requiresOrientation: boolean;
                            requiresJha: boolean;
                            requiresSdsAck: boolean;
                            requiresPermitIds: Prisma.JsonValue;
                            requiredPpe: Prisma.JsonValue;
                            requirementsJson: Prisma.JsonValue;
                            equipmentCategoryIds: Prisma.JsonValue;
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
                        cailInsights: import("../pm-project-safety-context/pm-project-safety-cail-intelligence.service").ProjectSafetyCailInsight[];
                        integrations: {
                            jhaFlha: boolean;
                            siteAccess: boolean;
                            safetyStations: boolean;
                            emergency: boolean;
                        };
                    };
                    profile: {
                        id: string;
                        companyId: number;
                        projectId: number;
                        version: number;
                        status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                        riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
                        projectType: string | null;
                        scopeOfWorkJson: Prisma.JsonValue;
                        requiredJhaTypes: Prisma.JsonValue;
                        requiredInspections: Prisma.JsonValue;
                        requiredTraining: Prisma.JsonValue;
                        requiredEquipmentCerts: Prisma.JsonValue;
                        requiredPpe: Prisma.JsonValue;
                        requiredEmergencyPlans: Prisma.JsonValue;
                        requiredSdsAcks: Prisma.JsonValue;
                        requiredToolboxTalks: Prisma.JsonValue;
                        enforcementRulesJson: Prisma.JsonValue;
                        zoneRulesJson: Prisma.JsonValue;
                        equipmentRulesJson: Prisma.JsonValue;
                        trainingRulesJson: Prisma.JsonValue;
                        emergencyRulesJson: Prisma.JsonValue;
                        environmentalJson: Prisma.JsonValue;
                        subcontractorIds: Prisma.JsonValue;
                        autoGenerated: boolean;
                        publishedAt: Date | null;
                        publishedById: number | null;
                        clientSyncId: string | null;
                        deletedAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                    hazards: {
                        id: string;
                        companyId: number;
                        projectId: number;
                        profileId: string | null;
                        category: import(".prisma/client").$Enums.PmProjectHazardCategory;
                        subcategory: string | null;
                        title: string;
                        description: string;
                        severity: number;
                        likelihood: number;
                        sifPotential: boolean;
                        hecaCategoryKey: string | null;
                        requiredControlIds: Prisma.JsonValue;
                        sourceType: string | null;
                        sourceId: string | null;
                        version: number;
                        status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                        publishedAt: Date | null;
                        active: boolean;
                        clientSyncId: string | null;
                        deletedAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                    }[];
                    controls: {
                        id: string;
                        companyId: number;
                        projectId: number;
                        profileId: string | null;
                        controlType: import(".prisma/client").$Enums.PmProjectControlType;
                        title: string;
                        description: string;
                        hazardCategoryKeys: Prisma.JsonValue;
                        ppeRequired: boolean;
                        equipmentRuleJson: Prisma.JsonValue;
                        version: number;
                        status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                        publishedAt: Date | null;
                        active: boolean;
                        clientSyncId: string | null;
                        deletedAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                    }[];
                    overrides: {
                        id: string;
                        companyId: number;
                        projectId: number;
                        profileId: string | null;
                        ruleType: import(".prisma/client").$Enums.PmProjectSafetyOverrideRuleType;
                        ruleKey: string;
                        overrideJson: Prisma.JsonValue;
                        reason: string;
                        expiresAt: Date | null;
                        approvedById: number | null;
                        active: boolean;
                        clientSyncId: string | null;
                        createdAt: Date;
                    }[];
                    zoneRules: {
                        id: string;
                        companyId: number | null;
                        projectId: number;
                        accessPointId: string | null;
                        zoneCode: string;
                        zoneType: import(".prisma/client").$Enums.PmAccessZoneType;
                        requiresFlhaHours: number;
                        requiresTrainingCodes: Prisma.JsonValue;
                        requiresOrientation: boolean;
                        requiresJha: boolean;
                        requiresSdsAck: boolean;
                        requiresPermitIds: Prisma.JsonValue;
                        requiredPpe: Prisma.JsonValue;
                        requirementsJson: Prisma.JsonValue;
                        equipmentCategoryIds: Prisma.JsonValue;
                        timeWindowStart: string | null;
                        timeWindowEnd: string | null;
                        highRisk: boolean;
                        active: boolean;
                        deletedAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                    }[];
                    syncedAt: string;
                };
            };
        };
    }>;
    getCailBundle(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<{
        insights: import("./pm-unified-corrective-action-cail.service").UnifiedCapaInsight[];
        predictions: {
            title: string;
            source: string;
            confidence: number;
        }[];
        workerRiskScores: {
            workerId: number;
            openCount: number;
            overdueCount: number;
            riskScore: number;
        }[];
        equipmentRiskScores: {
            equipmentId: number;
            openCount: number;
            riskScore: number;
        }[];
        chronicDeficiencies: {
            sourceId: string;
            sourceModule: string;
            repeatCount: number;
        }[];
        weakControls: {
            hazardId: string;
            controlId: string;
            effectivenessScore: number | null;
        }[];
        companyCapaScore: number;
        projectCapaScore: number;
        overdueRiskScore: number;
    }>;
    getAnalyticsTrends(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<{
        trends: {
            created30d: number;
            closed30d: number;
            escalations30d: number;
        };
        overdueRiskScore: number;
        leadingIndicators: {
            overdueRate: number;
            criticalOpen: number;
        };
        companyId: number;
        projectId: number;
        metrics: {
            total: number;
            open: number;
            overdue: number;
            critical: number;
            escalated: number;
            companyCapaScore: number;
        };
        cail: {
            insights: import("./pm-unified-corrective-action-cail.service").UnifiedCapaInsight[];
        };
    } | {
        trends: {
            created30d: number;
            closed30d: number;
            escalations30d: number;
        };
        overdueRiskScore: number;
        leadingIndicators: {
            overdueRate: number;
            criticalOpen: number;
        };
        projectAnalytics: {
            total: number;
            open: number;
            overdue: number;
            verified: number;
            closureRate: number;
            byType: (Prisma.PickEnumerable<Prisma.PmCorrectiveActionGroupByOutputType, "actionType"[]> & {
                _count: number;
            })[];
            leadingIndicatorScore: number;
        };
        companyId: number;
        projectId: number;
        metrics: {
            total: number;
            open: number;
            overdue: number;
            critical: number;
            escalated: number;
            companyCapaScore: number;
        };
        cail: {
            insights: import("./pm-unified-corrective-action-cail.service").UnifiedCapaInsight[];
        };
    }>;
    workerCapaList(workerId: number, projectId?: number): Promise<({
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    equipmentCapaList(equipmentId: number, projectId?: number): Promise<({
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    unifiedEnforcement(filters: {
        companyId: number;
        projectId?: number;
        workerId?: number;
        equipmentId?: number;
    }): Promise<import("./capa-enforcement.engine").UnifiedEnforcementResult>;
    createOverride(body: {
        companyId: number;
        projectId?: number;
        actionId?: string;
        ruleType: string;
        ruleKey: string;
        reason: string;
        expiresAt: string;
    }, actorId: number): Promise<{
        id: string;
        companyId: number;
        projectId: number | null;
        actionId: string | null;
        ruleType: string;
        ruleKey: string;
        reason: string;
        expiresAt: Date;
        approvedById: number | null;
        active: boolean;
        createdAt: Date;
    }>;
    runEscalationSweep(projectId: number): Promise<any[]>;
    assign(actionId: string, data: {
        userId?: number;
        workerId?: number;
        role?: 'primary' | 'secondary';
    }, actorId?: number): Promise<{
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    verify(actionId: string, input: {
        outcome: 'approve' | 'reject';
        role: string;
        notes?: string;
    }, verifierUserId: number): Promise<{
        equipment: {
            id: number;
            name: string;
        };
        project: {
            id: number;
            name: string;
        };
        cailEntry: {
            id: string;
            status: import(".prisma/client").$Enums.CailStatus;
            severity: import(".prisma/client").$Enums.CailSeverity;
            dueDate: Date;
        };
        auditLogs: {
            id: string;
            actionId: string;
            eventType: string;
            actorId: number | null;
            payload: Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            actionId: string;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        assignees: ({
            user: {
                id: number;
                username: string;
            };
        } & {
            id: string;
            actionId: string;
            userId: number | null;
            workerId: number | null;
            role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
            delegatedFrom: string | null;
            assignedAt: Date;
            acceptedAt: Date | null;
        })[];
        escalations: {
            id: string;
            actionId: string;
            level: number;
            reason: string;
            escalatedToUserId: number | null;
            triggeredAt: Date;
            resolvedAt: Date | null;
            payload: Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: Prisma.JsonValue;
            verifiedAt: Date;
        }[];
    } & {
        id: string;
        cailEntryId: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        sourceModule: string;
        sourceId: string;
        sourceItemId: string;
        deficiencyId: string | null;
        actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
        status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
        title: string;
        description: string | null;
        severityScore: number;
        priorityScore: number;
        escalationLevel: number;
        dueAt: Date | null;
        overdueAt: Date | null;
        equipmentId: number | null;
        workerId: number | null;
        subcontractorCompanyId: number | null;
        requiresVerification: boolean;
        verifiedAt: Date | null;
        closedAt: Date | null;
        createdByUserId: number;
        verifiedByUserId: number | null;
        parentActionId: string | null;
        hazardId: string | null;
        controlId: string | null;
        rootCauseId: string | null;
        publishVersion: number;
        publishedAt: Date | null;
        severityLevel: string;
        priorityLevel: string;
        evidenceRequirementsJson: Prisma.JsonValue;
        verificationRequirementsJson: Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    closeDeficiencyOnVerify(actionId: string): Promise<void>;
    buildOfflineBundle(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<{
        syncedAt: string;
        actions: ({
            equipment: {
                id: number;
                name: string;
            };
            project: {
                id: number;
                name: string;
            };
            cailEntry: {
                id: string;
                status: import(".prisma/client").$Enums.CailStatus;
                severity: import(".prisma/client").$Enums.CailSeverity;
                dueDate: Date;
            };
            attachments: {
                id: string;
                actionId: string;
                storageKey: string | null;
                fileName: string | null;
                mimeType: string | null;
                dataUrl: string | null;
                coreFileId: number | null;
                phase: string;
                clientSyncId: string | null;
                createdAt: Date;
            }[];
            assignees: ({
                user: {
                    id: number;
                    username: string;
                };
            } & {
                id: string;
                actionId: string;
                userId: number | null;
                workerId: number | null;
                role: import(".prisma/client").$Enums.PmCapaAssigneeRole;
                delegatedFrom: string | null;
                assignedAt: Date;
                acceptedAt: Date | null;
            })[];
            escalations: {
                id: string;
                actionId: string;
                level: number;
                reason: string;
                escalatedToUserId: number | null;
                triggeredAt: Date;
                resolvedAt: Date | null;
                payload: Prisma.JsonValue | null;
            }[];
            verifications: {
                id: string;
                actionId: string;
                verifierUserId: number;
                role: string;
                outcome: string;
                notes: string | null;
                evidenceJson: Prisma.JsonValue;
                verifiedAt: Date;
            }[];
        } & {
            id: string;
            cailEntryId: string;
            companyId: number;
            projectId: number;
            siteId: number | null;
            sourceModule: string;
            sourceId: string;
            sourceItemId: string;
            deficiencyId: string | null;
            actionType: import(".prisma/client").$Enums.PmCorrectiveActionType;
            status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
            title: string;
            description: string | null;
            severityScore: number;
            priorityScore: number;
            escalationLevel: number;
            dueAt: Date | null;
            overdueAt: Date | null;
            equipmentId: number | null;
            workerId: number | null;
            subcontractorCompanyId: number | null;
            requiresVerification: boolean;
            verifiedAt: Date | null;
            closedAt: Date | null;
            createdByUserId: number;
            verifiedByUserId: number | null;
            parentActionId: string | null;
            hazardId: string | null;
            controlId: string | null;
            rootCauseId: string | null;
            publishVersion: number;
            publishedAt: Date | null;
            severityLevel: string;
            priorityLevel: string;
            evidenceRequirementsJson: Prisma.JsonValue;
            verificationRequirementsJson: Prisma.JsonValue;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        hazardControl: {
            syncedAt: string;
            hazards: ({
                energySources: {
                    id: string;
                    hazardId: string;
                    energyType: import(".prisma/client").$Enums.PmUnifiedEnergyType;
                    exposureLevel: number;
                    highEnergyFlag: boolean;
                    severityScore: number;
                    autoDetected: boolean;
                }[];
                controlLinks: ({
                    control: {
                        id: string;
                        companyId: number;
                        projectId: number | null;
                        workPackageId: string | null;
                        taskId: string | null;
                        parentControlId: string | null;
                        scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                        controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
                        title: string;
                        description: string;
                        controlStrength: number;
                        hierarchyLevel: number;
                        requiredTraining: Prisma.JsonValue;
                        requiredEquipmentIds: Prisma.JsonValue;
                        requiredPpe: Prisma.JsonValue;
                        requiredPermitTypes: Prisma.JsonValue;
                        sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                        sourceId: string | null;
                        legacyCompanyControlId: string | null;
                        legacyProjectControlId: string | null;
                        version: number;
                        status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                        publishedAt: Date | null;
                        active: boolean;
                        clientSyncId: string | null;
                        deletedAt: Date | null;
                        createdAt: Date;
                        updatedAt: Date;
                    };
                } & {
                    id: string;
                    hazardId: string;
                    controlId: string;
                    effectivenessScore: number | null;
                    required: boolean;
                    verified: boolean;
                })[];
                trainingReqs: {
                    id: string;
                    hazardId: string;
                    trainingCode: string;
                    required: boolean;
                }[];
                ppeReqs: {
                    id: string;
                    hazardId: string;
                    ppeType: string;
                }[];
            } & {
                id: string;
                companyId: number;
                projectId: number | null;
                workPackageId: string | null;
                taskId: string | null;
                workerId: number | null;
                parentHazardId: string | null;
                scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                hazardType: import(".prisma/client").$Enums.PmUnifiedHazardType;
                category: import(".prisma/client").$Enums.PmUnifiedHazardCategory;
                subcategory: string | null;
                title: string;
                description: string;
                severity: number;
                likelihood: number;
                riskScore: number;
                sifPotential: boolean;
                hecaCategoryKey: string | null;
                sifScore: number | null;
                supervisorReviewRequired: boolean;
                requiredTraining: Prisma.JsonValue;
                requiredEquipmentIds: Prisma.JsonValue;
                requiredPpe: Prisma.JsonValue;
                requiredPermitTypes: Prisma.JsonValue;
                sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                sourceId: string | null;
                legacyCompanyHazardId: string | null;
                legacyProjectHazardId: string | null;
                version: number;
                status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                publishedAt: Date | null;
                active: boolean;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
            controls: ({
                verifications: {
                    id: string;
                    controlId: string;
                    stepOrder: number;
                    description: string;
                    verifiedAt: Date | null;
                    verifiedById: number | null;
                }[];
                hazardLinks: {
                    id: string;
                    hazardId: string;
                    controlId: string;
                    effectivenessScore: number | null;
                    required: boolean;
                    verified: boolean;
                }[];
            } & {
                id: string;
                companyId: number;
                projectId: number | null;
                workPackageId: string | null;
                taskId: string | null;
                parentControlId: string | null;
                scopeLevel: import(".prisma/client").$Enums.PmUnifiedHazardScope;
                controlType: import(".prisma/client").$Enums.PmUnifiedControlType;
                title: string;
                description: string;
                controlStrength: number;
                hierarchyLevel: number;
                requiredTraining: Prisma.JsonValue;
                requiredEquipmentIds: Prisma.JsonValue;
                requiredPpe: Prisma.JsonValue;
                requiredPermitTypes: Prisma.JsonValue;
                sourceType: import(".prisma/client").$Enums.PmUnifiedHcIngestSource;
                sourceId: string | null;
                legacyCompanyControlId: string | null;
                legacyProjectControlId: string | null;
                version: number;
                status: import(".prisma/client").$Enums.PmUnifiedHcPublishStatus;
                publishedAt: Date | null;
                active: boolean;
                clientSyncId: string | null;
                deletedAt: Date | null;
                createdAt: Date;
                updatedAt: Date;
            })[];
            energyWheel: {
                id: string;
                hazardId: string;
                energyType: import(".prisma/client").$Enums.PmUnifiedEnergyType;
                exposureLevel: number;
                highEnergyFlag: boolean;
                severityScore: number;
                autoDetected: boolean;
            }[];
            projectSafety: {
                context: {
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
                        requiredJhaTypes: Prisma.JsonValue;
                        requiredTraining: Prisma.JsonValue;
                        enforcementRules: Prisma.JsonValue;
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
                        requiresTrainingCodes: Prisma.JsonValue;
                        requiresOrientation: boolean;
                        requiresJha: boolean;
                        requiresSdsAck: boolean;
                        requiresPermitIds: Prisma.JsonValue;
                        requiredPpe: Prisma.JsonValue;
                        requirementsJson: Prisma.JsonValue;
                        equipmentCategoryIds: Prisma.JsonValue;
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
                    cailInsights: import("../pm-project-safety-context/pm-project-safety-cail-intelligence.service").ProjectSafetyCailInsight[];
                    integrations: {
                        jhaFlha: boolean;
                        siteAccess: boolean;
                        safetyStations: boolean;
                        emergency: boolean;
                    };
                };
                profile: {
                    id: string;
                    companyId: number;
                    projectId: number;
                    version: number;
                    status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                    riskLevel: import(".prisma/client").$Enums.PmProjectSafetyRiskLevel;
                    projectType: string | null;
                    scopeOfWorkJson: Prisma.JsonValue;
                    requiredJhaTypes: Prisma.JsonValue;
                    requiredInspections: Prisma.JsonValue;
                    requiredTraining: Prisma.JsonValue;
                    requiredEquipmentCerts: Prisma.JsonValue;
                    requiredPpe: Prisma.JsonValue;
                    requiredEmergencyPlans: Prisma.JsonValue;
                    requiredSdsAcks: Prisma.JsonValue;
                    requiredToolboxTalks: Prisma.JsonValue;
                    enforcementRulesJson: Prisma.JsonValue;
                    zoneRulesJson: Prisma.JsonValue;
                    equipmentRulesJson: Prisma.JsonValue;
                    trainingRulesJson: Prisma.JsonValue;
                    emergencyRulesJson: Prisma.JsonValue;
                    environmentalJson: Prisma.JsonValue;
                    subcontractorIds: Prisma.JsonValue;
                    autoGenerated: boolean;
                    publishedAt: Date | null;
                    publishedById: number | null;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                };
                hazards: {
                    id: string;
                    companyId: number;
                    projectId: number;
                    profileId: string | null;
                    category: import(".prisma/client").$Enums.PmProjectHazardCategory;
                    subcategory: string | null;
                    title: string;
                    description: string;
                    severity: number;
                    likelihood: number;
                    sifPotential: boolean;
                    hecaCategoryKey: string | null;
                    requiredControlIds: Prisma.JsonValue;
                    sourceType: string | null;
                    sourceId: string | null;
                    version: number;
                    status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                    publishedAt: Date | null;
                    active: boolean;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
                controls: {
                    id: string;
                    companyId: number;
                    projectId: number;
                    profileId: string | null;
                    controlType: import(".prisma/client").$Enums.PmProjectControlType;
                    title: string;
                    description: string;
                    hazardCategoryKeys: Prisma.JsonValue;
                    ppeRequired: boolean;
                    equipmentRuleJson: Prisma.JsonValue;
                    version: number;
                    status: import(".prisma/client").$Enums.PmProjectSafetyPublishStatus;
                    publishedAt: Date | null;
                    active: boolean;
                    clientSyncId: string | null;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
                overrides: {
                    id: string;
                    companyId: number;
                    projectId: number;
                    profileId: string | null;
                    ruleType: import(".prisma/client").$Enums.PmProjectSafetyOverrideRuleType;
                    ruleKey: string;
                    overrideJson: Prisma.JsonValue;
                    reason: string;
                    expiresAt: Date | null;
                    approvedById: number | null;
                    active: boolean;
                    clientSyncId: string | null;
                    createdAt: Date;
                }[];
                zoneRules: {
                    id: string;
                    companyId: number | null;
                    projectId: number;
                    accessPointId: string | null;
                    zoneCode: string;
                    zoneType: import(".prisma/client").$Enums.PmAccessZoneType;
                    requiresFlhaHours: number;
                    requiresTrainingCodes: Prisma.JsonValue;
                    requiresOrientation: boolean;
                    requiresJha: boolean;
                    requiresSdsAck: boolean;
                    requiresPermitIds: Prisma.JsonValue;
                    requiredPpe: Prisma.JsonValue;
                    requirementsJson: Prisma.JsonValue;
                    equipmentCategoryIds: Prisma.JsonValue;
                    timeWindowStart: string | null;
                    timeWindowEnd: string | null;
                    highRisk: boolean;
                    active: boolean;
                    deletedAt: Date | null;
                    createdAt: Date;
                    updatedAt: Date;
                }[];
                syncedAt: string;
            };
        };
    }>;
    getAnalytics(filters: {
        companyId: number;
        projectId?: number;
    }): Promise<{
        companyId: number;
        projectId: number;
        metrics: {
            total: number;
            open: number;
            overdue: number;
            critical: number;
            escalated: number;
            companyCapaScore: number;
        };
        cail: {
            insights: import("./pm-unified-corrective-action-cail.service").UnifiedCapaInsight[];
        };
    } | {
        projectAnalytics: {
            total: number;
            open: number;
            overdue: number;
            verified: number;
            closureRate: number;
            byType: (Prisma.PickEnumerable<Prisma.PmCorrectiveActionGroupByOutputType, "actionType"[]> & {
                _count: number;
            })[];
            leadingIndicatorScore: number;
        };
        companyId: number;
        projectId: number;
        metrics: {
            total: number;
            open: number;
            overdue: number;
            critical: number;
            escalated: number;
            companyCapaScore: number;
        };
        cail: {
            insights: import("./pm-unified-corrective-action-cail.service").UnifiedCapaInsight[];
        };
    }>;
}
