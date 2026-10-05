import { PrismaService } from '../prisma/prisma.service';
export declare class PmInspectionDashboardService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    correctiveActionBoard(projectId: number): Promise<{
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
    overdueAlerts(projectId: number): Promise<{
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
    contractorPerformance(projectId: number): Promise<{
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
    photoFindingsSummary(inspectionId: string): Promise<{
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
}
