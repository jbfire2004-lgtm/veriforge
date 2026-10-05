import { PmCorrectiveActionLinkType } from '@prisma/client';
import { PmUnifiedCorrectiveActionService } from './pm-unified-corrective-action.service';
import { PmUnifiedCorrectiveActionCailService } from './pm-unified-corrective-action-cail.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';
export declare class PmUnifiedCorrectiveActionController {
    private readonly unified;
    private readonly cail;
    private readonly capa;
    constructor(unified: PmUnifiedCorrectiveActionService, cail: PmUnifiedCorrectiveActionCailService, capa: PmCorrectiveActionsService);
    dashboard(companyId: string, projectId?: string): Promise<{
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
    analytics(companyId: string, projectId?: string): Promise<{
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
            byType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmCorrectiveActionGroupByOutputType, "actionType"[]> & {
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
    analyticsTrends(companyId: string, projectId?: string): Promise<{
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
            byType: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.PmCorrectiveActionGroupByOutputType, "actionType"[]> & {
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
    workerActions(workerId: string, projectId?: string): Promise<({
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
    })[]>;
    equipmentActions(equipmentId: string, projectId?: string): Promise<({
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
    })[]>;
    jhaApprovalGate(jhaId: string): Promise<import("./cross-module-integration.engine").IntegrationGateResult>;
    taskStartGate(projectId: string, workerId?: string): Promise<import("./cross-module-integration.engine").IntegrationGateResult>;
    list(companyId?: string, projectId?: string, overdueOnly?: string): Promise<({
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
    })[]>;
    offlineBundle(companyId: string, projectId?: string): Promise<{
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
                        requiredTraining: import(".prisma/client").Prisma.JsonValue;
                        requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                        requiredPpe: import(".prisma/client").Prisma.JsonValue;
                        requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
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
                requiredTraining: import(".prisma/client").Prisma.JsonValue;
                requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                requiredPpe: import(".prisma/client").Prisma.JsonValue;
                requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
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
                requiredTraining: import(".prisma/client").Prisma.JsonValue;
                requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                requiredPpe: import(".prisma/client").Prisma.JsonValue;
                requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
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
                        requiredJhaTypes: import(".prisma/client").Prisma.JsonValue;
                        requiredTraining: import(".prisma/client").Prisma.JsonValue;
                        enforcementRules: import(".prisma/client").Prisma.JsonValue;
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
                        requiresTrainingCodes: import(".prisma/client").Prisma.JsonValue;
                        requiresOrientation: boolean;
                        requiresJha: boolean;
                        requiresSdsAck: boolean;
                        requiresPermitIds: import(".prisma/client").Prisma.JsonValue;
                        requiredPpe: import(".prisma/client").Prisma.JsonValue;
                        requirementsJson: import(".prisma/client").Prisma.JsonValue;
                        equipmentCategoryIds: import(".prisma/client").Prisma.JsonValue;
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
                    scopeOfWorkJson: import(".prisma/client").Prisma.JsonValue;
                    requiredJhaTypes: import(".prisma/client").Prisma.JsonValue;
                    requiredInspections: import(".prisma/client").Prisma.JsonValue;
                    requiredTraining: import(".prisma/client").Prisma.JsonValue;
                    requiredEquipmentCerts: import(".prisma/client").Prisma.JsonValue;
                    requiredPpe: import(".prisma/client").Prisma.JsonValue;
                    requiredEmergencyPlans: import(".prisma/client").Prisma.JsonValue;
                    requiredSdsAcks: import(".prisma/client").Prisma.JsonValue;
                    requiredToolboxTalks: import(".prisma/client").Prisma.JsonValue;
                    enforcementRulesJson: import(".prisma/client").Prisma.JsonValue;
                    zoneRulesJson: import(".prisma/client").Prisma.JsonValue;
                    equipmentRulesJson: import(".prisma/client").Prisma.JsonValue;
                    trainingRulesJson: import(".prisma/client").Prisma.JsonValue;
                    emergencyRulesJson: import(".prisma/client").Prisma.JsonValue;
                    environmentalJson: import(".prisma/client").Prisma.JsonValue;
                    subcontractorIds: import(".prisma/client").Prisma.JsonValue;
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
                    requiredControlIds: import(".prisma/client").Prisma.JsonValue;
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
                    hazardCategoryKeys: import(".prisma/client").Prisma.JsonValue;
                    ppeRequired: boolean;
                    equipmentRuleJson: import(".prisma/client").Prisma.JsonValue;
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
                    overrideJson: import(".prisma/client").Prisma.JsonValue;
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
                    requiresTrainingCodes: import(".prisma/client").Prisma.JsonValue;
                    requiresOrientation: boolean;
                    requiresJha: boolean;
                    requiresSdsAck: boolean;
                    requiresPermitIds: import(".prisma/client").Prisma.JsonValue;
                    requiredPpe: import(".prisma/client").Prisma.JsonValue;
                    requirementsJson: import(".prisma/client").Prisma.JsonValue;
                    equipmentCategoryIds: import(".prisma/client").Prisma.JsonValue;
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
    cailInsights(companyId: string, projectId?: string): Promise<import("./pm-unified-corrective-action-cail.service").UnifiedCapaInsight[]>;
    cailBundle(companyId: string, projectId?: string): Promise<{
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
    applyOfflineSync(body: {
        companyId: number;
        projectId: number;
        actions?: Array<Record<string, unknown>>;
        clientSyncId?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
                            requiredTraining: import(".prisma/client").Prisma.JsonValue;
                            requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                            requiredPpe: import(".prisma/client").Prisma.JsonValue;
                            requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
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
                    requiredTraining: import(".prisma/client").Prisma.JsonValue;
                    requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                    requiredPpe: import(".prisma/client").Prisma.JsonValue;
                    requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
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
                    requiredTraining: import(".prisma/client").Prisma.JsonValue;
                    requiredEquipmentIds: import(".prisma/client").Prisma.JsonValue;
                    requiredPpe: import(".prisma/client").Prisma.JsonValue;
                    requiredPermitTypes: import(".prisma/client").Prisma.JsonValue;
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
                            requiredJhaTypes: import(".prisma/client").Prisma.JsonValue;
                            requiredTraining: import(".prisma/client").Prisma.JsonValue;
                            enforcementRules: import(".prisma/client").Prisma.JsonValue;
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
                            requiresTrainingCodes: import(".prisma/client").Prisma.JsonValue;
                            requiresOrientation: boolean;
                            requiresJha: boolean;
                            requiresSdsAck: boolean;
                            requiresPermitIds: import(".prisma/client").Prisma.JsonValue;
                            requiredPpe: import(".prisma/client").Prisma.JsonValue;
                            requirementsJson: import(".prisma/client").Prisma.JsonValue;
                            equipmentCategoryIds: import(".prisma/client").Prisma.JsonValue;
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
                        scopeOfWorkJson: import(".prisma/client").Prisma.JsonValue;
                        requiredJhaTypes: import(".prisma/client").Prisma.JsonValue;
                        requiredInspections: import(".prisma/client").Prisma.JsonValue;
                        requiredTraining: import(".prisma/client").Prisma.JsonValue;
                        requiredEquipmentCerts: import(".prisma/client").Prisma.JsonValue;
                        requiredPpe: import(".prisma/client").Prisma.JsonValue;
                        requiredEmergencyPlans: import(".prisma/client").Prisma.JsonValue;
                        requiredSdsAcks: import(".prisma/client").Prisma.JsonValue;
                        requiredToolboxTalks: import(".prisma/client").Prisma.JsonValue;
                        enforcementRulesJson: import(".prisma/client").Prisma.JsonValue;
                        zoneRulesJson: import(".prisma/client").Prisma.JsonValue;
                        equipmentRulesJson: import(".prisma/client").Prisma.JsonValue;
                        trainingRulesJson: import(".prisma/client").Prisma.JsonValue;
                        emergencyRulesJson: import(".prisma/client").Prisma.JsonValue;
                        environmentalJson: import(".prisma/client").Prisma.JsonValue;
                        subcontractorIds: import(".prisma/client").Prisma.JsonValue;
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
                        requiredControlIds: import(".prisma/client").Prisma.JsonValue;
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
                        hazardCategoryKeys: import(".prisma/client").Prisma.JsonValue;
                        ppeRequired: boolean;
                        equipmentRuleJson: import(".prisma/client").Prisma.JsonValue;
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
                        overrideJson: import(".prisma/client").Prisma.JsonValue;
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
                        requiresTrainingCodes: import(".prisma/client").Prisma.JsonValue;
                        requiresOrientation: boolean;
                        requiresJha: boolean;
                        requiresSdsAck: boolean;
                        requiresPermitIds: import(".prisma/client").Prisma.JsonValue;
                        requiredPpe: import(".prisma/client").Prisma.JsonValue;
                        requirementsJson: import(".prisma/client").Prisma.JsonValue;
                        equipmentCategoryIds: import(".prisma/client").Prisma.JsonValue;
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
    revokeExpiredOverrides(): Promise<{
        revoked: number;
    }>;
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
    }>;
    update(id: string, body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
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
    }>;
    create(body: Record<string, unknown>, req: {
        user: {
            id: number;
        };
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
    }>;
    publish(id: string, req: {
        user: {
            id: number;
        };
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
    }>;
    autoAssign(id: string, req: {
        user: {
            id: number;
        };
    }): Promise<{
        actionId: string;
        suggestions: import("../pm-corrective-actions/capa-assignment.engine").AssigneeSuggestion[];
    }>;
    submit(id: string, req: {
        user: {
            id: number;
        };
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
    }>;
    inProgress(id: string, req: {
        user: {
            id: number;
        };
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
    }>;
    signature(id: string, body: {
        role: string;
        signatureData?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        id: string;
        actionId: string;
        role: string;
        signerUserId: number | null;
        signatureData: string | null;
        signedAt: Date;
    }>;
    assign(id: string, body: {
        userId?: number;
        workerId?: number;
        role?: 'primary' | 'secondary';
    }, req: {
        user: {
            id: number;
        };
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
    }>;
    verify(id: string, body: {
        outcome: 'approve' | 'reject';
        role: string;
        notes?: string;
    }, req: {
        user: {
            id: number;
        };
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
    }>;
    addLink(id: string, body: {
        linkType: PmCorrectiveActionLinkType;
        linkedId: string;
    }): Promise<{
        id: string;
        actionId: string;
        linkType: import(".prisma/client").$Enums.PmCorrectiveActionLinkType;
        linkedId: string;
        linkedMeta: import(".prisma/client").Prisma.JsonValue;
        createdAt: Date;
    }>;
    generateBatch(body: {
        projectId: number;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
        projectId: number;
        results: Record<string, unknown>;
    }>;
    generateSource(body: {
        source: string;
        sourceId: string;
        rootCauseId?: string;
        deficiencyId?: string;
    }, req: {
        user: {
            id: number;
        };
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
        evidenceRequirementsJson: import(".prisma/client").Prisma.JsonValue;
        verificationRequirementsJson: import(".prisma/client").Prisma.JsonValue;
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
    })[]>;
    escalationSweep(body: {
        projectId: number;
    }): Promise<any[]>;
    enforcement(body: {
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
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
    addAttachment(body: {
        actionId: string;
        fileName?: string;
        mimeType?: string;
        dataUrl?: string;
        phase?: string;
    }, req: {
        user: {
            id: number;
        };
    }): Promise<{
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
}
