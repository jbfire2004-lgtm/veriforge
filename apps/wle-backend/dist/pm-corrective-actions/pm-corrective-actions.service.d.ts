import { CailSeverity, PmCorrectiveActionStatus, PmCorrectiveActionType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CailEmitterService } from '../safety-intelligence/cail/cail-emitter.service';
import { InactivationService } from '../modules/vera-core/inactivation.service';
import { CapaPriorityEngine } from './capa-priority.engine';
import { CapaDueDateEngine } from './capa-due-date.engine';
import { CapaAssignmentEngine } from './capa-assignment.engine';
import { CapaEscalationEngine } from './capa-escalation.engine';
import { CapaVerificationEngine } from './capa-verification.engine';
export declare class PmCorrectiveActionsService {
    private readonly prisma;
    private readonly emitter;
    private readonly priority;
    private readonly dueDate;
    private readonly assignment;
    private readonly escalation;
    private readonly verification;
    private readonly inactivation;
    constructor(prisma: PrismaService, emitter: CailEmitterService, priority: CapaPriorityEngine, dueDate: CapaDueDateEngine, assignment: CapaAssignmentEngine, escalation: CapaEscalationEngine, verification: CapaVerificationEngine, inactivation: InactivationService);
    private audit;
    getCompanyConfig(companyId: number): Promise<{
        id: number;
        companyId: number;
        dueDaysLow: number;
        dueDaysMedium: number;
        dueDaysHigh: number;
        dueDaysCritical: number;
        escalationRules: Prisma.JsonValue;
        assignmentRules: Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    }>;
    list(filters: {
        projectId?: number;
        companyId?: number;
        status?: PmCorrectiveActionStatus;
        overdueOnly?: boolean;
    }): Promise<({
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
    get(id: string): Promise<{
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
    create(input: {
        companyId: number;
        projectId: number;
        siteId?: number;
        sourceModule: string;
        sourceId: string;
        sourceItemId?: string;
        deficiencyId?: string;
        title: string;
        description?: string;
        actionType?: PmCorrectiveActionType;
        severity?: CailSeverity | string;
        createdByUserId: number;
        assignUserId?: number;
        equipmentId?: number;
        workerId?: number;
        subcontractorCompanyId?: number;
        sifLinked?: boolean;
        hecaLinked?: boolean;
        clientSyncId?: string;
        publish?: boolean;
    }): Promise<{
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
    assign(actionId: string, data: {
        userId?: number;
        workerId?: number;
        role?: 'primary' | 'secondary' | 'delegate' | 'verifier';
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
    delegate(actionId: string, toUserId: number, actorId: number): Promise<{
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
    updateDraft(actionId: string, data: {
        title?: string;
        description?: string;
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
    verify(actionId: string, input: {
        outcome: 'approve' | 'reject';
        role: string;
        notes?: string;
        evidenceJson?: unknown[];
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
    private tryUnblockEquipment;
    runEscalations(projectId: number): Promise<any[]>;
    addAttachment(actionId: string, data: {
        storageKey?: string;
        fileName?: string;
        mimeType?: string;
        dataUrl?: string;
        coreFileId?: number;
        phase?: string;
        clientSyncId?: string;
    }, actorId?: number): Promise<{
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
    }>;
    addSignature(actionId: string, data: {
        role: string;
        signatureData?: string;
        signerUserId?: number;
    }, actorId?: number): Promise<{
        id: string;
        actionId: string;
        role: string;
        signerUserId: number | null;
        signatureData: string | null;
        signedAt: Date;
    }>;
    workerAccessCheck(workerId: number, projectId: number): Promise<{
        allowed: boolean;
        openAssigned: number;
        criticalOpen: number;
        overdueCount: number;
    }>;
    analytics(projectId: number): Promise<{
        total: number;
        open: number;
        overdue: number;
        verified: number;
        closureRate: number;
        byType: (Prisma.PickEnumerable<Prisma.PmCorrectiveActionGroupByOutputType, "actionType"[]> & {
            _count: number;
        })[];
        leadingIndicatorScore: number;
    }>;
    syncOffline(payload: {
        clientSyncId: string;
        companyId: number;
        projectId: number;
        createdByUserId: number;
        title: string;
        description?: string;
        sourceModule: string;
        sourceId: string;
        actionType?: PmCorrectiveActionType;
        severity?: string;
        assignUserId?: number;
        publish?: boolean;
    }): Promise<{
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
}
