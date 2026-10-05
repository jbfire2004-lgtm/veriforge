import { DefinitionsService } from './definitions/definitions.service';
import { SafetyFormSubmissionsService } from './submissions/submissions.service';
import { SafetyFormWorkflowsService } from './workflows/workflows.service';
import { SafetyFormAttachmentsService } from './attachments/attachments.service';
import { SafetyFormAnalyticsService } from './analytics/analytics.service';
import { AutoPopulateService } from './integration/auto-populate.service';
import { SafetyFormCorrectiveActionsService } from './corrective-actions/corrective-actions.service';
import { AddAttachmentDto, CreateSafetyFormDto, OfflineSyncDto, SaveSafetyFormDraftDto, SubmitSafetyFormDto, TransitionSafetyFormDto } from './dto/safety-forms.dto';
export declare class SafetyFormsController {
    private readonly definitions;
    private readonly submissions;
    private readonly workflows;
    private readonly attachments;
    private readonly analytics;
    private readonly autoPopulate;
    private readonly correctiveActions;
    constructor(definitions: DefinitionsService, submissions: SafetyFormSubmissionsService, workflows: SafetyFormWorkflowsService, attachments: SafetyFormAttachmentsService, analytics: SafetyFormAnalyticsService, autoPopulate: AutoPopulateService, correctiveActions: SafetyFormCorrectiveActionsService);
    workflowDefinition(): {
        statuses: string[];
        transitions: Record<string, string[]>;
    };
    listDefinitions(category?: string): {
        id: string;
        name: string;
        category: string;
        version: number;
        workflow: import("./engine/form-engine.types").SafetyFormWorkflowDefinition;
    }[];
    getDefinition(id: string): import("./engine/form-engine.types").SafetyFormDefinitionJson;
    autoPopulateContext(workerId?: string, projectId?: string, companyId?: string, equipmentId?: string): Promise<Record<string, unknown>>;
    dashboard(companyId?: string): Promise<{
        total: number;
        byStatus: {
            [k: string]: number;
        };
        byDefinition: {
            [k: string]: number;
        };
        sifCount: number;
        hecaCount: number;
        openCorrectiveActions: number;
    }>;
    indicators(companyId?: string): Promise<{
        indicators: {
            submittedAt: Date;
            definitionId: string;
            formData: import(".prisma/client").Prisma.JsonValue;
        }[];
    }>;
    list(companyId?: string, projectId?: string, definitionId?: string, status?: string, workerId?: string): Promise<({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        project: {
            id: number;
            name: string;
        };
        formDefinition: {
            id: string;
            name: string;
            category: string;
        };
    } & {
        id: string;
        definitionId: string;
        definitionVersion: number;
        formType: import(".prisma/client").$Enums.SafetyFormType | null;
        status: import(".prisma/client").$Enums.SafetyFormStatus;
        title: string | null;
        formData: import(".prisma/client").Prisma.JsonValue;
        sifFlag: boolean;
        hecaFlag: boolean;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        workerId: number | null;
        equipmentId: number | null;
        incidentId: number | null;
        supervisorId: number | null;
        createdById: number | null;
        submittedById: number | null;
        reviewedById: number | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        offlinePending: boolean;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    getOne(id: string): Promise<{
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            name: string;
            assetTag: string;
        };
        project: {
            id: number;
            name: string;
            code: string;
        };
        auditLogs: {
            id: string;
            formId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            formId: string;
            fieldId: string | null;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            sizeBytes: number | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            formId: string;
            fieldId: string | null;
            role: import(".prisma/client").$Enums.SafetyFormSignatureRole;
            signerName: string | null;
            signerUserId: number | null;
            signatureData: string;
            signedAt: Date;
        }[];
        formDefinition: {
            id: string;
            name: string;
            category: string;
            version: number;
            definition: import(".prisma/client").Prisma.JsonValue;
            isActive: boolean;
            companyId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
        submissions: {
            id: string;
            formId: string;
            versionNumber: number;
            formData: import(".prisma/client").Prisma.JsonValue;
            status: import(".prisma/client").$Enums.SafetyFormStatus;
            submittedAt: Date;
            submittedById: number | null;
        }[];
        actions: {
            id: string;
            formId: string;
            title: string;
            description: string | null;
            status: import(".prisma/client").$Enums.SafetyFormActionStatus;
            priority: string;
            dueAt: Date | null;
            assignedToId: number | null;
            coreActionItemId: string | null;
            autoGenerated: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        definitionId: string;
        definitionVersion: number;
        formType: import(".prisma/client").$Enums.SafetyFormType | null;
        status: import(".prisma/client").$Enums.SafetyFormStatus;
        title: string | null;
        formData: import(".prisma/client").Prisma.JsonValue;
        sifFlag: boolean;
        hecaFlag: boolean;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        workerId: number | null;
        equipmentId: number | null;
        incidentId: number | null;
        supervisorId: number | null;
        createdById: number | null;
        submittedById: number | null;
        reviewedById: number | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        offlinePending: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    listActions(id: string): Promise<{
        actions: {
            id: string;
            formId: string;
            title: string;
            description: string | null;
            status: import(".prisma/client").$Enums.SafetyFormActionStatus;
            priority: string;
            dueAt: Date | null;
            assignedToId: number | null;
            coreActionItemId: string | null;
            autoGenerated: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        cailLinks: ({
            cailEntry: {
                id: string;
                status: import(".prisma/client").$Enums.CailStatus;
                title: string;
            };
        } & {
            safetyFormId: string;
            fieldId: string | null;
            cailEntryId: string;
        })[];
    }>;
    create(dto: CreateSafetyFormDto, req: {
        user?: {
            id: number;
        };
    }): Promise<{
        id: string;
        definitionId: string;
        definitionVersion: number;
        formType: import(".prisma/client").$Enums.SafetyFormType | null;
        status: import(".prisma/client").$Enums.SafetyFormStatus;
        title: string | null;
        formData: import(".prisma/client").Prisma.JsonValue;
        sifFlag: boolean;
        hecaFlag: boolean;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        workerId: number | null;
        equipmentId: number | null;
        incidentId: number | null;
        supervisorId: number | null;
        createdById: number | null;
        submittedById: number | null;
        reviewedById: number | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        offlinePending: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    offlineSync(dto: OfflineSyncDto, req: {
        user?: {
            id: number;
        };
    }): Promise<{
        id: string;
        definitionId: string;
        definitionVersion: number;
        formType: import(".prisma/client").$Enums.SafetyFormType | null;
        status: import(".prisma/client").$Enums.SafetyFormStatus;
        title: string | null;
        formData: import(".prisma/client").Prisma.JsonValue;
        sifFlag: boolean;
        hecaFlag: boolean;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        workerId: number | null;
        equipmentId: number | null;
        incidentId: number | null;
        supervisorId: number | null;
        createdById: number | null;
        submittedById: number | null;
        reviewedById: number | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        offlinePending: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    saveDraft(id: string, dto: SaveSafetyFormDraftDto, req: {
        user?: {
            id: number;
        };
    }): Promise<{
        id: string;
        definitionId: string;
        definitionVersion: number;
        formType: import(".prisma/client").$Enums.SafetyFormType | null;
        status: import(".prisma/client").$Enums.SafetyFormStatus;
        title: string | null;
        formData: import(".prisma/client").Prisma.JsonValue;
        sifFlag: boolean;
        hecaFlag: boolean;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        workerId: number | null;
        equipmentId: number | null;
        incidentId: number | null;
        supervisorId: number | null;
        createdById: number | null;
        submittedById: number | null;
        reviewedById: number | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        offlinePending: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    submit(id: string, dto: SubmitSafetyFormDto, req: {
        user?: {
            id: number;
        };
    }): Promise<{
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            name: string;
            assetTag: string;
        };
        project: {
            id: number;
            name: string;
            code: string;
        };
        auditLogs: {
            id: string;
            formId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        attachments: {
            id: string;
            formId: string;
            fieldId: string | null;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            sizeBytes: number | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            formId: string;
            fieldId: string | null;
            role: import(".prisma/client").$Enums.SafetyFormSignatureRole;
            signerName: string | null;
            signerUserId: number | null;
            signatureData: string;
            signedAt: Date;
        }[];
        formDefinition: {
            id: string;
            name: string;
            category: string;
            version: number;
            definition: import(".prisma/client").Prisma.JsonValue;
            isActive: boolean;
            companyId: number | null;
            createdAt: Date;
            updatedAt: Date;
        };
        submissions: {
            id: string;
            formId: string;
            versionNumber: number;
            formData: import(".prisma/client").Prisma.JsonValue;
            status: import(".prisma/client").$Enums.SafetyFormStatus;
            submittedAt: Date;
            submittedById: number | null;
        }[];
        actions: {
            id: string;
            formId: string;
            title: string;
            description: string | null;
            status: import(".prisma/client").$Enums.SafetyFormActionStatus;
            priority: string;
            dueAt: Date | null;
            assignedToId: number | null;
            coreActionItemId: string | null;
            autoGenerated: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        id: string;
        definitionId: string;
        definitionVersion: number;
        formType: import(".prisma/client").$Enums.SafetyFormType | null;
        status: import(".prisma/client").$Enums.SafetyFormStatus;
        title: string | null;
        formData: import(".prisma/client").Prisma.JsonValue;
        sifFlag: boolean;
        hecaFlag: boolean;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        workerId: number | null;
        equipmentId: number | null;
        incidentId: number | null;
        supervisorId: number | null;
        createdById: number | null;
        submittedById: number | null;
        reviewedById: number | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        offlinePending: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    transition(id: string, dto: TransitionSafetyFormDto, req: {
        user?: {
            id: number;
        };
    }): Promise<{
        id: string;
        definitionId: string;
        definitionVersion: number;
        formType: import(".prisma/client").$Enums.SafetyFormType | null;
        status: import(".prisma/client").$Enums.SafetyFormStatus;
        title: string | null;
        formData: import(".prisma/client").Prisma.JsonValue;
        sifFlag: boolean;
        hecaFlag: boolean;
        companyId: number | null;
        projectId: number | null;
        siteId: number | null;
        workerId: number | null;
        equipmentId: number | null;
        incidentId: number | null;
        supervisorId: number | null;
        createdById: number | null;
        submittedById: number | null;
        reviewedById: number | null;
        submittedAt: Date | null;
        reviewedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        offlinePending: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    addAttachment(id: string, dto: AddAttachmentDto): Promise<{
        id: string;
        formId: string;
        fieldId: string | null;
        fileName: string;
        mimeType: string | null;
        storageKey: string | null;
        dataUrl: string | null;
        sizeBytes: number | null;
        createdAt: Date;
    }>;
}
