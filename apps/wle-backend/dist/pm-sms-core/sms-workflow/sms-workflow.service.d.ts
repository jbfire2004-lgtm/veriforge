import { JhaFlhaService } from '../../jha-flha/jha-flha.service';
import { PmInspectionsService } from '../../pm-inspections/pm-inspections.service';
import { PmCorrectiveActionsService } from '../../pm-corrective-actions/pm-corrective-actions.service';
import { PmSafetyEventsInvestigationService } from '../../pm-safety-events/pm-safety-events-investigation.service';
import { PrismaService } from '../../prisma/prisma.service';
import { type SmsWorkflowEntity } from './sms-workflow.constants';
import type { SmsWorkflowCreateDto } from './dto/sms-workflow-create.dto';
import type { SmsWorkflowListQueryDto } from './dto/sms-workflow-list-query.dto';
import type { SmsWorkflowUpdateDto } from './dto/sms-workflow-update.dto';
export declare class SmsWorkflowService {
    private readonly jhaFlha;
    private readonly inspections;
    private readonly capa;
    private readonly investigation;
    private readonly prisma;
    private readonly logger;
    constructor(jhaFlha: JhaFlhaService, inspections: PmInspectionsService, capa: PmCorrectiveActionsService, investigation: PmSafetyEventsInvestigationService, prisma: PrismaService);
    parseEntity(entity: string): SmsWorkflowEntity;
    list(entityInput: string, query: SmsWorkflowListQueryDto): Promise<({
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: import(".prisma/client").Prisma.JsonValue;
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
        evidenceRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        verificationRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[] | ({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            name: string;
            catalogTypeKey: string;
        };
        project: {
            id: number;
            name: string;
        };
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            name: string;
            category: import(".prisma/client").$Enums.PmInspectionTemplateCategory;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.PmInspectionTemplateStatus;
            scoringMode: import(".prisma/client").$Enums.PmInspectionScoringMode;
            items: import(".prisma/client").Prisma.JsonValue;
            scoringRules: import(".prisma/client").Prisma.JsonValue;
            requiredAttachments: import(".prisma/client").Prisma.JsonValue;
            requiredSignatures: import(".prisma/client").Prisma.JsonValue;
            equipmentTypeKeys: import(".prisma/client").Prisma.JsonValue;
            parentTemplateId: string | null;
            seedKey: string | null;
            seedVersion: number;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        deficiencies: {
            id: string;
            inspectionId: string;
            itemId: string;
            title: string;
            description: string | null;
            severity: import(".prisma/client").$Enums.PmDeficiencySeverity;
            category: string | null;
            status: import(".prisma/client").$Enums.PmDeficiencyStatus;
            assignedUserId: number | null;
            assignedWorkerId: number | null;
            subcontractorCompanyId: number | null;
            dueAt: Date | null;
            verifiedAt: Date | null;
            closedAt: Date | null;
            cailEntryId: string | null;
            sifEventId: string | null;
            autoGenerated: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attachments: {
            id: string;
            inspectionId: string;
            deficiencyId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
            analysisStatus: string | null;
            analysisJson: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        signatures: ({
            coreFile: {
                id: number;
                mimeType: string;
                publicUrl: string;
            };
        } & {
            id: string;
            inspectionId: string;
            role: string;
            signerName: string | null;
            signerUserId: number | null;
            signatureData: string | null;
            coreFileId: number | null;
            signedAt: Date;
            clientSyncId: string | null;
        })[];
        correctiveActions: {
            id: string;
            inspectionId: string;
            deficiencyId: string | null;
            title: string;
            description: string | null;
            assignedUserId: number | null;
            cailEntryId: string | null;
            status: string;
            dueAt: Date | null;
            verifiedAt: Date | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        templateId: string;
        templateVersion: number;
        companyId: number;
        projectId: number;
        siteId: number | null;
        equipmentId: number | null;
        workerId: number | null;
        inspectorUserId: number;
        status: import(".prisma/client").$Enums.PmInspectionStatus;
        title: string | null;
        locationNote: string | null;
        answers: import(".prisma/client").Prisma.JsonValue;
        scorePercent: number | null;
        passed: boolean | null;
        riskScore: number | null;
        requiresSupervisorReview: boolean;
        reviewNotes: string | null;
        reviewedByUserId: number | null;
        reviewedAt: Date | null;
        submittedAt: Date | null;
        closedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        sharingJson: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    })[] | ({
        project: {
            id: number;
            name: string;
        };
        _count: {
            workers: number;
            hazards: number;
        };
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[] | ({
        event: {
            id: string;
            companyId: number;
            status: import(".prisma/client").$Enums.PmSafetyEventStatus;
            projectId: number;
            title: string;
        };
        leadInvestigator: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        eventId: string;
        status: import(".prisma/client").$Enums.PmInvestigationStatus;
        currentStep: number;
        narrative: string | null;
        immediateActions: string | null;
        guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
        causalTreeJson: import(".prisma/client").Prisma.JsonValue;
        sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
        hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
        energyWheelJson: import(".prisma/client").Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    create(entityInput: string, body: SmsWorkflowCreateDto, actorId?: number): Promise<any>;
    getById(entityInput: string, id: string): Promise<({
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: import(".prisma/client").Prisma.JsonValue;
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
        evidenceRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        verificationRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | ({
        leadInvestigator: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        eventId: string;
        status: import(".prisma/client").$Enums.PmInvestigationStatus;
        currentStep: number;
        narrative: string | null;
        immediateActions: string | null;
        guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
        causalTreeJson: import(".prisma/client").Prisma.JsonValue;
        sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
        hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
        energyWheelJson: import(".prisma/client").Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | ({
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: import(".prisma/client").Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | ({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            name: string;
            catalogTypeKey: string;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            inspectionId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            name: string;
            category: import(".prisma/client").$Enums.PmInspectionTemplateCategory;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.PmInspectionTemplateStatus;
            scoringMode: import(".prisma/client").$Enums.PmInspectionScoringMode;
            items: import(".prisma/client").Prisma.JsonValue;
            scoringRules: import(".prisma/client").Prisma.JsonValue;
            requiredAttachments: import(".prisma/client").Prisma.JsonValue;
            requiredSignatures: import(".prisma/client").Prisma.JsonValue;
            equipmentTypeKeys: import(".prisma/client").Prisma.JsonValue;
            parentTemplateId: string | null;
            seedKey: string | null;
            seedVersion: number;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        deficiencies: {
            id: string;
            inspectionId: string;
            itemId: string;
            title: string;
            description: string | null;
            severity: import(".prisma/client").$Enums.PmDeficiencySeverity;
            category: string | null;
            status: import(".prisma/client").$Enums.PmDeficiencyStatus;
            assignedUserId: number | null;
            assignedWorkerId: number | null;
            subcontractorCompanyId: number | null;
            dueAt: Date | null;
            verifiedAt: Date | null;
            closedAt: Date | null;
            cailEntryId: string | null;
            sifEventId: string | null;
            autoGenerated: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attachments: {
            id: string;
            inspectionId: string;
            deficiencyId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
            analysisStatus: string | null;
            analysisJson: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        signatures: ({
            coreFile: {
                id: number;
                mimeType: string;
                publicUrl: string;
            };
        } & {
            id: string;
            inspectionId: string;
            role: string;
            signerName: string | null;
            signerUserId: number | null;
            signatureData: string | null;
            coreFileId: number | null;
            signedAt: Date;
            clientSyncId: string | null;
        })[];
        correctiveActions: {
            id: string;
            inspectionId: string;
            deficiencyId: string | null;
            title: string;
            description: string | null;
            assignedUserId: number | null;
            cailEntryId: string | null;
            status: string;
            dueAt: Date | null;
            verifiedAt: Date | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        templateId: string;
        templateVersion: number;
        companyId: number;
        projectId: number;
        siteId: number | null;
        equipmentId: number | null;
        workerId: number | null;
        inspectorUserId: number;
        status: import(".prisma/client").$Enums.PmInspectionStatus;
        title: string | null;
        locationNote: string | null;
        answers: import(".prisma/client").Prisma.JsonValue;
        scorePercent: number | null;
        passed: boolean | null;
        riskScore: number | null;
        requiresSupervisorReview: boolean;
        reviewNotes: string | null;
        reviewedByUserId: number | null;
        reviewedAt: Date | null;
        submittedAt: Date | null;
        closedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        sharingJson: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    })>;
    patch(entityInput: string, id: string, body: SmsWorkflowUpdateDto, actorId?: number): Promise<({
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: import(".prisma/client").Prisma.JsonValue;
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
        evidenceRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        verificationRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | ({
        leadInvestigator: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        eventId: string;
        status: import(".prisma/client").$Enums.PmInvestigationStatus;
        currentStep: number;
        narrative: string | null;
        immediateActions: string | null;
        guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
        causalTreeJson: import(".prisma/client").Prisma.JsonValue;
        sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
        hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
        energyWheelJson: import(".prisma/client").Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | ({
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: import(".prisma/client").Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | ({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            name: string;
            catalogTypeKey: string;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            inspectionId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            name: string;
            category: import(".prisma/client").$Enums.PmInspectionTemplateCategory;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.PmInspectionTemplateStatus;
            scoringMode: import(".prisma/client").$Enums.PmInspectionScoringMode;
            items: import(".prisma/client").Prisma.JsonValue;
            scoringRules: import(".prisma/client").Prisma.JsonValue;
            requiredAttachments: import(".prisma/client").Prisma.JsonValue;
            requiredSignatures: import(".prisma/client").Prisma.JsonValue;
            equipmentTypeKeys: import(".prisma/client").Prisma.JsonValue;
            parentTemplateId: string | null;
            seedKey: string | null;
            seedVersion: number;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        deficiencies: {
            id: string;
            inspectionId: string;
            itemId: string;
            title: string;
            description: string | null;
            severity: import(".prisma/client").$Enums.PmDeficiencySeverity;
            category: string | null;
            status: import(".prisma/client").$Enums.PmDeficiencyStatus;
            assignedUserId: number | null;
            assignedWorkerId: number | null;
            subcontractorCompanyId: number | null;
            dueAt: Date | null;
            verifiedAt: Date | null;
            closedAt: Date | null;
            cailEntryId: string | null;
            sifEventId: string | null;
            autoGenerated: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attachments: {
            id: string;
            inspectionId: string;
            deficiencyId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
            analysisStatus: string | null;
            analysisJson: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        signatures: ({
            coreFile: {
                id: number;
                mimeType: string;
                publicUrl: string;
            };
        } & {
            id: string;
            inspectionId: string;
            role: string;
            signerName: string | null;
            signerUserId: number | null;
            signatureData: string | null;
            coreFileId: number | null;
            signedAt: Date;
            clientSyncId: string | null;
        })[];
        correctiveActions: {
            id: string;
            inspectionId: string;
            deficiencyId: string | null;
            title: string;
            description: string | null;
            assignedUserId: number | null;
            cailEntryId: string | null;
            status: string;
            dueAt: Date | null;
            verifiedAt: Date | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        templateId: string;
        templateVersion: number;
        companyId: number;
        projectId: number;
        siteId: number | null;
        equipmentId: number | null;
        workerId: number | null;
        inspectorUserId: number;
        status: import(".prisma/client").$Enums.PmInspectionStatus;
        title: string | null;
        locationNote: string | null;
        answers: import(".prisma/client").Prisma.JsonValue;
        scorePercent: number | null;
        passed: boolean | null;
        riskScore: number | null;
        requiresSupervisorReview: boolean;
        reviewNotes: string | null;
        reviewedByUserId: number | null;
        reviewedAt: Date | null;
        submittedAt: Date | null;
        closedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        sharingJson: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    })>;
    submit(entityInput: string, id: string, actorId?: number): Promise<({
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
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
            payload: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        verifications: {
            id: string;
            actionId: string;
            verifierUserId: number;
            role: string;
            outcome: string;
            notes: string | null;
            evidenceJson: import(".prisma/client").Prisma.JsonValue;
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
        evidenceRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        verificationRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | ({
        leadInvestigator: {
            id: number;
            username: string;
        };
    } & {
        id: string;
        eventId: string;
        status: import(".prisma/client").$Enums.PmInvestigationStatus;
        currentStep: number;
        narrative: string | null;
        immediateActions: string | null;
        guidedAnswersJson: import(".prisma/client").Prisma.JsonValue;
        causalTreeJson: import(".prisma/client").Prisma.JsonValue;
        sclClassificationJson: import(".prisma/client").Prisma.JsonValue;
        hecaVerificationJson: import(".prisma/client").Prisma.JsonValue;
        energyWheelJson: import(".prisma/client").Prisma.JsonValue;
        executiveSummary: string | null;
        leadInvestigatorId: number | null;
        startedAt: Date | null;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | ({
        project: {
            id: number;
            companyId: number;
            name: string;
        };
        attachments: {
            id: string;
            jhaFlhaId: string;
            fileName: string;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotation: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            jhaFlhaId: string;
            role: import(".prisma/client").$Enums.JhaFlhaSignatureRole;
            signerUserId: number | null;
            signerName: string | null;
            signatureData: string;
            signedAt: Date;
        }[];
        correctiveActions: {
            id: string;
            jhaFlhaId: string;
            title: string;
            description: string | null;
            cailEntryId: string | null;
            status: string;
            createdAt: Date;
        }[];
        equipmentLinks: ({
            equipment: {
                id: number;
                name: string;
                assetTag: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            equipmentId: number;
            authorized: boolean;
            preUseInspectionOk: boolean | null;
        })[];
        workers: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            jhaFlhaId: string;
            workerId: number;
            role: string;
            trainingVerified: boolean;
            competencyVerified: boolean;
            equipmentAuthorized: boolean;
            hazardAcknowledged: boolean;
            signedAt: Date | null;
        })[];
        hazards: {
            id: string;
            jhaFlhaId: string;
            sortOrder: number;
            libraryEntryId: string | null;
            category: string | null;
            subcategory: string | null;
            description: string;
            severity: number;
            likelihood: number;
            riskScore: number;
            energyTypes: import(".prisma/client").Prisma.JsonValue;
            sifIndicator: boolean;
            createdAt: Date;
        }[];
        controls: {
            id: string;
            jhaFlhaId: string;
            hazardId: string | null;
            libraryEntryId: string | null;
            controlType: string;
            description: string;
            adequate: boolean | null;
            effectivenessScore: number | null;
            verified: boolean;
            verifiedAt: Date | null;
            ppeRequired: boolean;
            createdAt: Date;
        }[];
        energySources: {
            id: string;
            jhaFlhaId: string;
            energyType: import(".prisma/client").$Enums.JhaEnergyType;
            exposureLevel: number;
            controlsSummary: string | null;
        }[];
    } & {
        id: string;
        kind: import(".prisma/client").$Enums.JhaFlhaKind;
        status: import(".prisma/client").$Enums.JhaFlhaStatus;
        companyId: number;
        projectId: number;
        siteId: number | null;
        workPackageId: string | null;
        taskId: string | null;
        taskLibraryId: string | null;
        taskDescription: string;
        workScope: string | null;
        locationNote: string | null;
        environmentalJson: import(".prisma/client").Prisma.JsonValue;
        sifPotential: boolean;
        sifScore: number;
        hecaCategoryKey: string | null;
        highEnergyFlag: boolean;
        qualityScore: number | null;
        riskScore: number | null;
        taskRiskScore: number | null;
        aiAnalysis: import(".prisma/client").Prisma.JsonValue | null;
        requiresSupervisorReview: boolean;
        controlsAdequate: boolean | null;
        reviewNotes: string | null;
        createdByUserId: number | null;
        submittedAt: Date | null;
        approvedAt: Date | null;
        lockedAt: Date | null;
        clientSyncId: string | null;
        clientVersion: number;
        currentVersion: number;
        deletedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }) | ({
        worker: {
            id: number;
            firstName: string;
            lastName: string;
        };
        equipment: {
            id: number;
            name: string;
            catalogTypeKey: string;
        };
        project: {
            id: number;
            name: string;
        };
        auditLogs: {
            id: string;
            inspectionId: string;
            eventType: string;
            actorId: number | null;
            payload: import(".prisma/client").Prisma.JsonValue | null;
            createdAt: Date;
        }[];
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            name: string;
            category: import(".prisma/client").$Enums.PmInspectionTemplateCategory;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.PmInspectionTemplateStatus;
            scoringMode: import(".prisma/client").$Enums.PmInspectionScoringMode;
            items: import(".prisma/client").Prisma.JsonValue;
            scoringRules: import(".prisma/client").Prisma.JsonValue;
            requiredAttachments: import(".prisma/client").Prisma.JsonValue;
            requiredSignatures: import(".prisma/client").Prisma.JsonValue;
            equipmentTypeKeys: import(".prisma/client").Prisma.JsonValue;
            parentTemplateId: string | null;
            seedKey: string | null;
            seedVersion: number;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            clientSyncId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        deficiencies: {
            id: string;
            inspectionId: string;
            itemId: string;
            title: string;
            description: string | null;
            severity: import(".prisma/client").$Enums.PmDeficiencySeverity;
            category: string | null;
            status: import(".prisma/client").$Enums.PmDeficiencyStatus;
            assignedUserId: number | null;
            assignedWorkerId: number | null;
            subcontractorCompanyId: number | null;
            dueAt: Date | null;
            verifiedAt: Date | null;
            closedAt: Date | null;
            cailEntryId: string | null;
            sifEventId: string | null;
            autoGenerated: boolean;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attachments: {
            id: string;
            inspectionId: string;
            deficiencyId: string | null;
            correctiveId: string | null;
            storageKey: string | null;
            fileName: string | null;
            mimeType: string | null;
            dataUrl: string | null;
            coreFileId: number | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            clientSyncId: string | null;
            createdAt: Date;
            analysisStatus: string | null;
            analysisJson: import(".prisma/client").Prisma.JsonValue | null;
        }[];
        signatures: ({
            coreFile: {
                id: number;
                mimeType: string;
                publicUrl: string;
            };
        } & {
            id: string;
            inspectionId: string;
            role: string;
            signerName: string | null;
            signerUserId: number | null;
            signatureData: string | null;
            coreFileId: number | null;
            signedAt: Date;
            clientSyncId: string | null;
        })[];
        correctiveActions: {
            id: string;
            inspectionId: string;
            deficiencyId: string | null;
            title: string;
            description: string | null;
            assignedUserId: number | null;
            cailEntryId: string | null;
            status: string;
            dueAt: Date | null;
            verifiedAt: Date | null;
            createdAt: Date;
        }[];
    } & {
        id: string;
        templateId: string;
        templateVersion: number;
        companyId: number;
        projectId: number;
        siteId: number | null;
        equipmentId: number | null;
        workerId: number | null;
        inspectorUserId: number;
        status: import(".prisma/client").$Enums.PmInspectionStatus;
        title: string | null;
        locationNote: string | null;
        answers: import(".prisma/client").Prisma.JsonValue;
        scorePercent: number | null;
        passed: boolean | null;
        riskScore: number | null;
        requiresSupervisorReview: boolean;
        reviewNotes: string | null;
        reviewedByUserId: number | null;
        reviewedAt: Date | null;
        submittedAt: Date | null;
        closedAt: Date | null;
        clientSyncId: string | null;
        deletedAt: Date | null;
        sharingJson: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
        updatedAt: Date;
    })>;
    private createJhaFlha;
    private createInspection;
    private createCapa;
    private openInvestigation;
    private filterInspectionsByKind;
    private listInvestigations;
    private isInvestigationStatus;
    private log;
}
