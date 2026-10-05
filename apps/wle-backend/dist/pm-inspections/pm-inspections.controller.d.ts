import { PmDeficiencySeverity, PmInspectionStatus, PmInspectionTemplateStatus } from '@prisma/client';
import { PermissionService } from '../security/permission.service';
import { TenantScopeService } from '../security/tenant-scope.service';
import type { SecurityActor } from '../security/security.types';
import { PmInspectionsService } from './pm-inspections.service';
import { PmInspectionTemplatesService } from './pm-inspection-templates.service';
import { PmInspectionsCailIntelligenceService } from './pm-inspections-cail-intelligence.service';
import { PmInspectionPhotoPipelineService } from './pm-inspection-photo-pipeline.service';
import { PmInspectionDashboardService } from './pm-inspection-dashboard.service';
import { PmInspectionContractorDispatchService } from './pm-inspection-contractor-dispatch.service';
import { PmInspectionSubcontractorResolverService } from './pm-inspection-subcontractor-resolver.service';
import { PmSafetyMeetingsService } from '../pm-safety-meetings/pm-safety-meetings.service';
import { AddInspectionSignatureDto } from './dto/add-inspection-signature.dto';
import { PmInspectionReportService } from './pm-inspection-report.service';
import { PmInspectionAccessService } from './pm-inspection-access.service';
import { PmInspectionFindingsLogService } from './pm-inspection-findings-log.service';
import { PmInspectionSharedService } from './pm-inspection-shared.service';
import { AuditInspectionCapaEngineService } from './audit-inspection-capa-engine.service';
import type { AuditInspectionCapaEngineInput } from './audit-inspection-capa-engine.types';
import { CreatePmInspectionTemplateDto, UpdatePmInspectionTemplateDto } from './dto/pm-inspection-template.dto';
export declare class PmInspectionsController {
    private readonly permissions;
    private readonly tenant;
    private readonly inspections;
    private readonly templates;
    private readonly cailIntelligence;
    private readonly photoPipeline;
    private readonly dashboard;
    private readonly contractorDispatch;
    private readonly subcontractorResolver;
    private readonly safetyMeetings;
    private readonly reportService;
    private readonly inspectionAccess;
    private readonly findingsLog;
    private readonly sharedReports;
    private readonly auditCapaEngine;
    constructor(permissions: PermissionService, tenant: TenantScopeService, inspections: PmInspectionsService, templates: PmInspectionTemplatesService, cailIntelligence: PmInspectionsCailIntelligenceService, photoPipeline: PmInspectionPhotoPipelineService, dashboard: PmInspectionDashboardService, contractorDispatch: PmInspectionContractorDispatchService, subcontractorResolver: PmInspectionSubcontractorResolverService, safetyMeetings: PmSafetyMeetingsService, reportService: PmInspectionReportService, inspectionAccess: PmInspectionAccessService, findingsLog: PmInspectionFindingsLogService, sharedReports: PmInspectionSharedService, auditCapaEngine: AuditInspectionCapaEngineService);
    generateAuditCapaEngine(body: AuditInspectionCapaEngineInput): import("./audit-inspection-capa-engine.types").AuditInspectionCapaEngineOutput;
    listTemplates(req: {
        user?: SecurityActor;
    }, companyId: string, projectId?: string, category?: string, status?: PmInspectionTemplateStatus): import(".prisma/client").Prisma.PrismaPromise<{
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
    }[]>;
    seedTemplates(req: {
        user?: SecurityActor;
    }, companyId: string, projectId?: string): Promise<{
        created: number;
        updated: number;
        total: number;
        checklistCount: number;
        focusAuditCount: number;
    }>;
    getTemplate(id: string, req: {
        user?: SecurityActor;
    }): Promise<{
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
    }>;
    createTemplate(req: {
        user?: SecurityActor;
    }, body: CreatePmInspectionTemplateDto): Promise<{
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
    }>;
    updateTemplate(id: string, req: {
        user?: SecurityActor;
    }, body: UpdatePmInspectionTemplateDto): Promise<{
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
    }>;
    publishTemplate(id: string, req: {
        user?: SecurityActor & {
            userId?: number;
        };
    }): Promise<{
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
    }>;
    newVersion(id: string, req: {
        user?: SecurityActor;
    }): Promise<{
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
    }>;
    archiveTemplate(id: string, req: {
        user?: SecurityActor;
    }): Promise<{
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
    }>;
    listSharedReports(req: {
        user?: SecurityActor;
    }, projectId?: string): Promise<{
        total: number;
        items: any[];
    }>;
    projectFindingsLog(projectId: string, req: {
        user?: SecurityActor;
    }, companyId?: string): Promise<{
        projectId: number;
        total: number;
        entries: import("./pm-inspection-findings-log.service").FindingsLogEntry[];
        sharingNote: string;
    }>;
    listContractorDispatches(projectId: string, companyId: string): Promise<({
        subcontractorCompany: {
            id: number;
            name: string;
        };
        correctiveAction: {
            id: string;
            status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
            title: string;
            description: string;
            dueAt: Date;
            sourceId: string;
            severityLevel: string;
        };
    } & {
        id: string;
        correctiveActionId: string;
        subcontractorCompanyId: number;
        status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
        packageJson: import(".prisma/client").Prisma.JsonValue;
        sentAt: Date | null;
        acknowledgedAt: Date | null;
        completedAt: Date | null;
        overdueAt: Date | null;
        notificationIds: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    list(projectId?: string, companyId?: string, status?: PmInspectionStatus, equipmentId?: string): Promise<({
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
    })[]>;
    analytics(projectId: string): Promise<{
        totalInspections: number;
        failedInspections: number;
        openDeficiencies: number;
        deficiencyBySeverity: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmInspectionDeficiencyGroupByOutputType, "severity"[]> & {
            _count: number;
        })[];
        inspectionsByTemplate: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmInspectionGroupByOutputType, "templateId"[]> & {
            _count: number;
        })[];
        passRate: number;
        trends: {
            inspections90d: number;
            deficienciesClosed90d: number;
            deficiencyRate90d: number;
        };
        complianceScore: number;
        inspectorCount: number;
    }>;
    correctiveBoard(projectId: string): Promise<{
        projectId: number;
        generatedAt: string;
        totals: {
            open: number;
            inProgress: number;
            verification: number;
            overdue: number;
        };
        columns: {
            open: ({
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
                contractorDispatches: {
                    id: string;
                    correctiveActionId: string;
                    subcontractorCompanyId: number;
                    status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
                    packageJson: import(".prisma/client").Prisma.JsonValue;
                    sentAt: Date | null;
                    acknowledgedAt: Date | null;
                    completedAt: Date | null;
                    overdueAt: Date | null;
                    notificationIds: import(".prisma/client").Prisma.JsonValue;
                    clientSyncId: string | null;
                    createdAt: Date;
                    updatedAt: Date;
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
            })[];
            in_progress: ({
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
                contractorDispatches: {
                    id: string;
                    correctiveActionId: string;
                    subcontractorCompanyId: number;
                    status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
                    packageJson: import(".prisma/client").Prisma.JsonValue;
                    sentAt: Date | null;
                    acknowledgedAt: Date | null;
                    completedAt: Date | null;
                    overdueAt: Date | null;
                    notificationIds: import(".prisma/client").Prisma.JsonValue;
                    clientSyncId: string | null;
                    createdAt: Date;
                    updatedAt: Date;
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
            })[];
            verification_pending: ({
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
                contractorDispatches: {
                    id: string;
                    correctiveActionId: string;
                    subcontractorCompanyId: number;
                    status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
                    packageJson: import(".prisma/client").Prisma.JsonValue;
                    sentAt: Date | null;
                    acknowledgedAt: Date | null;
                    completedAt: Date | null;
                    overdueAt: Date | null;
                    notificationIds: import(".prisma/client").Prisma.JsonValue;
                    clientSyncId: string | null;
                    createdAt: Date;
                    updatedAt: Date;
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
            })[];
            overdue: ({
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
                contractorDispatches: {
                    id: string;
                    correctiveActionId: string;
                    subcontractorCompanyId: number;
                    status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
                    packageJson: import(".prisma/client").Prisma.JsonValue;
                    sentAt: Date | null;
                    acknowledgedAt: Date | null;
                    completedAt: Date | null;
                    overdueAt: Date | null;
                    notificationIds: import(".prisma/client").Prisma.JsonValue;
                    clientSyncId: string | null;
                    createdAt: Date;
                    updatedAt: Date;
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
            })[];
        };
    }>;
    overdueAlerts(projectId: string): Promise<{
        correctiveActions: {
            id: string;
            title: string;
            subcontractorCompanyId: number;
            dueAt: Date;
            severityLevel: string;
        }[];
        contractorDispatches: ({
            subcontractorCompany: {
                name: string;
            };
            correctiveAction: {
                title: string;
                dueAt: Date;
            };
        } & {
            id: string;
            correctiveActionId: string;
            subcontractorCompanyId: number;
            status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
            packageJson: import(".prisma/client").Prisma.JsonValue;
            sentAt: Date | null;
            acknowledgedAt: Date | null;
            completedAt: Date | null;
            overdueAt: Date | null;
            notificationIds: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        alertCount: number;
    }>;
    contractorPerformance(projectId: string): Promise<{
        projectId: number;
        contractors: {
            score: number;
            completionRate: number;
            companyId: number;
            name: string;
            total: number;
            completed: number;
            overdue: number;
            onTime: number;
            avgAckHours: number | null;
        }[];
    }>;
    listProjectSubcontractors(projectId: string): Promise<{
        id: number;
        name: string;
    }[]>;
    projectIntelligence(projectId: string): Promise<{
        inspectionQualityScore: number;
        averageRiskScore: number;
        failureRate: number;
        openDeficiencies: number;
        hazardPatterns: {
            category: string;
            count: number;
            prediction: string;
        }[];
        explainability: {
            rule: string;
            detail: string;
        }[];
    }>;
    inspectorScore(userId: string, projectId: string): Promise<{
        inspectorUserId: number;
        inspectionsCompleted: number;
        passRate: number;
        reviewEscalationRate: number;
        score: number;
    }>;
    workerAccess(workerId: string, projectId: string): Promise<{
        allowed: boolean;
        openCriticalDeficiencies: number;
        overdueEquipmentCount: number;
    }>;
    sync(req: {
        user?: SecurityActor & {
            userId?: number;
        };
    }, body: Record<string, unknown>): Promise<{
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
    }>;
    get(id: string, req: {
        user?: SecurityActor;
    }): Promise<{
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
    }>;
    create(req: {
        user?: SecurityActor & {
            userId?: number;
        };
    }, body: {
        templateId: string;
        companyId: number;
        projectId: number;
        siteId?: number;
        equipmentId?: number;
        workerId?: number;
        title?: string;
        locationNote?: string;
        clientSyncId?: string;
    }): Promise<any>;
    private parseOptionalCompanyId;
    predict(body: {
        templateId: string;
        answers: Record<string, unknown>;
    }): Promise<{
        inspectionQualityScore: number;
        riskScore: number;
        scorePercent: number;
        passed: boolean;
        requiresSupervisorReview: boolean;
        predictedDeficiencyCount: number;
        predictedDeficiencies: {
            itemId: string;
            label: string;
            severity: import(".prisma/client").$Enums.PmDeficiencySeverity;
            notes: string;
            requiredActions: string[];
        }[];
        weakControlDetection: string[];
        explainability: {
            rule: string;
            detail: string;
        }[];
    }>;
    saveAnswers(id: string, req: {
        user?: SecurityActor & {
            userId?: number;
        };
    }, body: {
        answers: Record<string, unknown>;
    }): Promise<{
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
    }>;
    saveItems(id: string, req: {
        user?: SecurityActor & {
            userId?: number;
        };
    }, body: {
        answers?: Record<string, unknown>;
        items?: Record<string, unknown>;
    }): Promise<{
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
    }>;
    submit(id: string, req: {
        user?: SecurityActor & {
            userId?: number;
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
    }>;
    review(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        action: 'approve' | 'reject' | 'request_changes';
        notes?: string;
    }): Promise<{
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
    }>;
    addSignature(id: string, body: AddInspectionSignatureDto): Promise<{
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
    }>;
    addAttachment(id: string, body: Record<string, unknown>): Promise<{
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
    }>;
    generateAuditCapaEngineFromInspection(id: string): Promise<import("./audit-inspection-capa-engine.types").AuditInspectionCapaEngineOutput>;
    inspectionReport(id: string, req: {
        user?: SecurityActor;
    }): Promise<{
        inspectionId: string;
        title: string;
        status: import(".prisma/client").$Enums.PmInspectionStatus;
        submittedAt: Date;
        project: {
            id: number;
            name: string;
        };
        inspector: {
            id: number;
            username: string;
            email: string;
        };
        template: {
            name: string;
            category: import(".prisma/client").$Enums.PmInspectionTemplateCategory;
            inspectionKind: unknown;
            industry: unknown;
            focusArea: unknown;
        };
        siteAnswers: import(".prisma/client").Prisma.JsonValue;
        locationNote: string;
        totals: {
            photoCount: number;
            safeCount: number;
            atRiskCount: number;
        };
        photos: import("./pm-inspection-report.service").InspectionReportPhoto[];
        summarySheet: import("./pm-inspection-report.service").InspectionReportSummaryRow[];
        sharing: import("./pm-inspection-sharing.types").InspectionSharingConfig;
        generatedAt: string;
    }>;
    updateReportSharing(id: string, req: {
        user?: SecurityActor;
    }, body: {
        shareReportWithContractors?: boolean;
        shareReportWithWorkers?: boolean;
    }): Promise<{
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
    }>;
    savePhotoMetadata(id: string, attachmentId: string, req: {
        user?: SecurityActor & {
            userId?: number;
        };
    }, body: {
        locationDescription: string;
        pictureDescription: string;
        safetyStatus: 'safe' | 'at_risk';
        responsibleCompanyId?: number;
    }): Promise<{
        attachmentId: string;
        photoNumber: number;
        annotationJson: {
            photoNumber: number;
            locationDescription: string;
            pictureDescription: string;
            safetyStatus: "safe" | "at_risk";
            responsibleCompanyId: number;
            responsibleCompanyName: string;
        };
    }>;
    capturePhoto(id: string, req: {
        user?: SecurityActor & {
            userId?: number;
        };
    }, body: {
        dataUrl?: string;
        coreFileId?: number;
        fileName?: string;
        mimeType?: string;
        caption?: string;
        clientSyncId?: string;
        offline?: boolean;
        defaultSubcontractorCompanyId?: number;
        checklistItemId?: string;
        locationDescription?: string;
        pictureDescription?: string;
        safetyStatus?: 'safe' | 'at_risk';
        responsibleCompanyId?: number;
    }): Promise<{
        attachment: {
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
        };
        findings: any[];
        correctiveActions: any[];
        dispatches: any[];
        visionSummary: any;
        llmSummary: string;
        analysisEngine: string;
        analysisMode: string;
        analysisStatus: string;
        visionCapabilities: import("../modules/vision/vision-capabilities").VisionCapabilities;
    } | {
        attachment: any;
        findings: any;
        correctiveActions: any[];
        dispatches: any[];
        visionSummary: any;
        llmSummary: any;
        analysisEngine: string;
        analysisMode: any;
        analysisStatus: any;
        visionCapabilities: import("../modules/vision/vision-capabilities").VisionCapabilities;
    }>;
    photoFindings(id: string, req: {
        user?: SecurityActor;
    }): Promise<{
        checklistItemId: string;
        energyTypes: string[];
        correctiveAction: {
            id: string;
            status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
            title: string;
            dueAt: Date;
        };
        attachment: {
            id: string;
            coreFileId: number;
            mimeType: string;
            fileName: string;
            annotationJson: import(".prisma/client").Prisma.JsonValue;
            analysisStatus: string;
        };
        id: string;
        inspectionId: string;
        attachmentId: string | null;
        category: import(".prisma/client").$Enums.PmInspectionFindingCategory;
        title: string;
        description: string | null;
        severity: import(".prisma/client").$Enums.PmDeficiencySeverity;
        confidence: number;
        responsibleParty: import(".prisma/client").$Enums.PmInspectionResponsibleParty;
        evidenceRequired: import(".prisma/client").Prisma.JsonValue;
        deficiencyId: string | null;
        correctiveActionId: string | null;
        analysisJson: import(".prisma/client").Prisma.JsonValue | null;
        sclState: import(".prisma/client").$Enums.PmSclState | null;
        hecaInvolved: boolean;
        hecaType: string | null;
        hecaCategoryCode: string | null;
        energyTypesJson: import(".prisma/client").Prisma.JsonValue;
        energyControlState: import(".prisma/client").$Enums.PmEnergyControlState | null;
        highEnergyFlag: boolean;
        requiresInvestigation: boolean;
        escalatedSeverity: boolean;
        clientSyncId: string | null;
        createdAt: Date;
    }[]>;
    acknowledgeDispatch(dispatchId: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        id: string;
        correctiveActionId: string;
        subcontractorCompanyId: number;
        status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
        packageJson: import(".prisma/client").Prisma.JsonValue;
        sentAt: Date | null;
        acknowledgedAt: Date | null;
        completedAt: Date | null;
        overdueAt: Date | null;
        notificationIds: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    completeDispatch(dispatchId: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        storageKey?: string;
        dataUrl?: string;
        fileName?: string;
        mimeType?: string;
        notes?: string;
    }): Promise<{
        correctiveAction: {
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
        };
    } & {
        id: string;
        correctiveActionId: string;
        subcontractorCompanyId: number;
        status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
        packageJson: import(".prisma/client").Prisma.JsonValue;
        sentAt: Date | null;
        acknowledgedAt: Date | null;
        completedAt: Date | null;
        overdueAt: Date | null;
        notificationIds: import(".prisma/client").Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    dispatchContractor(actionId: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        clientSyncId?: string;
    }): Promise<{
        dispatch: {
            id: string;
            correctiveActionId: string;
            subcontractorCompanyId: number;
            status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
            packageJson: import(".prisma/client").Prisma.JsonValue;
            sentAt: Date | null;
            acknowledgedAt: Date | null;
            completedAt: Date | null;
            overdueAt: Date | null;
            notificationIds: import(".prisma/client").Prisma.JsonValue;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        };
        package: {
            correctiveActionId: string;
            title: string;
            description: string;
            severity: string;
            dueAt: string;
            evidenceRequirements: import(".prisma/client").Prisma.JsonValue;
            photos: ({
                id: string;
                storageKey: string;
                fileName: string;
            } | {
                id: string;
                dataUrl: string;
                fileName: string;
            })[];
            inspectionId: string;
            dispatchedByUserId: number;
            dispatchedAt: string;
        };
    }>;
    escalateToIncident(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body?: {
        title?: string;
        description?: string;
    }): Promise<{
        inspectionId: string;
        eventId: string;
        existing: boolean;
        event: unknown;
    }>;
    draftSafetyMeeting(id: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
        template: {
            id: string;
            companyId: number;
            projectId: number | null;
            meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
            name: string;
            description: string | null;
            version: number;
            status: import(".prisma/client").$Enums.SafetyMeetingTemplateStatus;
            agendaJson: import(".prisma/client").Prisma.JsonValue;
            requiredTopicIds: import(".prisma/client").Prisma.JsonValue;
            publishedAt: Date | null;
            publishedByUserId: number | null;
            parentTemplateId: string | null;
            deletedAt: Date | null;
            createdAt: Date;
            updatedAt: Date;
        };
        attachments: {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string | null;
            fileName: string | null;
            mimeType: string | null;
            storageKey: string | null;
            dataUrl: string | null;
            annotationJson: import(".prisma/client").Prisma.JsonValue | null;
            phase: string;
            clientSyncId: string | null;
            createdAt: Date;
        }[];
        signatures: {
            id: string;
            meetingId: string;
            attendeeId: string | null;
            role: string;
            signerUserId: number | null;
            signerWorkerId: number | null;
            signatureData: string | null;
            signedAt: Date;
            clientSyncId: string | null;
        }[];
        facilitator: {
            id: number;
            firstName: string;
            lastName: string;
        };
        topics: {
            id: string;
            meetingId: string;
            topicLibraryId: string | null;
            sortOrder: number;
            title: string;
            discussionPoints: import(".prisma/client").Prisma.JsonValue;
            requiredControls: import(".prisma/client").Prisma.JsonValue;
            requiredActions: import(".prisma/client").Prisma.JsonValue;
            notes: string | null;
            isHighRisk: boolean;
            sourceModule: string | null;
            sourceId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
        attendees: ({
            worker: {
                id: number;
                firstName: string;
                lastName: string;
            };
        } & {
            id: string;
            meetingId: string;
            workerId: number;
            status: import(".prisma/client").$Enums.SafetyMeetingAttendeeStatus;
            checkedInAt: Date | null;
            trainingValid: boolean | null;
            equipmentAuthorized: boolean | null;
            identityVerified: boolean;
            verificationMethod: string | null;
            notes: string | null;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        })[];
        correctiveLinks: ({
            correctiveAction: {
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                title: string;
            };
        } & {
            id: string;
            meetingId: string;
            topicId: string | null;
            correctiveActionId: string;
            origin: string;
            createdAt: Date;
        })[];
    } & {
        id: string;
        companyId: number;
        projectId: number;
        siteId: number | null;
        templateId: string | null;
        meetingType: import(".prisma/client").$Enums.SafetyMeetingType;
        customMeetingTypeLabel: string | null;
        status: import(".prisma/client").$Enums.SafetyMeetingStatus;
        title: string;
        locationNote: string | null;
        scheduledAt: Date | null;
        startedAt: Date | null;
        completedAt: Date | null;
        lockedAt: Date | null;
        facilitatorWorkerId: number | null;
        supervisorUserId: number | null;
        requiresSupervisorReview: boolean;
        reviewStatus: import(".prisma/client").$Enums.SafetyMeetingReviewStatus;
        reviewNotes: string | null;
        reviewedAt: Date | null;
        reviewedByUserId: number | null;
        qualityScore: number | null;
        engagementScore: number | null;
        cailEntryId: string | null;
        safetyStationId: number | null;
        discussionNotes: string | null;
        hazardsDiscussed: import(".prisma/client").Prisma.JsonValue;
        controlsDiscussed: import(".prisma/client").Prisma.JsonValue;
        metadata: import(".prisma/client").Prisma.JsonValue;
        pmInspectionId: string | null;
        clientSyncId: string | null;
        clientVersion: number;
        deletedAt: Date | null;
        createdByUserId: number;
        createdAt: Date;
        updatedAt: Date;
    }>;
    createDeficiency(id: string, req: {
        user?: {
            userId?: number;
        };
    }, body: {
        itemId: string;
        title: string;
        description?: string;
        severity?: PmDeficiencySeverity;
        assignedUserId?: number;
        assignedWorkerId?: number;
        subcontractorCompanyId?: number;
    }): Promise<{
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
    }>;
    verifyDeficiency(deficiencyId: string, req: {
        user?: {
            userId?: number;
        };
    }): Promise<{
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
    }>;
}
