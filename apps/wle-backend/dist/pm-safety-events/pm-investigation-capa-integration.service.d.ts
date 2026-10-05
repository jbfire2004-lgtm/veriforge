import { PrismaService } from '../prisma/prisma.service';
import { PmCapaAutoGenerateService } from '../pm-corrective-actions/pm-capa-auto-generate.service';
import { PmInspectionContractorDispatchService } from '../pm-inspections/pm-inspection-contractor-dispatch.service';
import { PmInspectionSubcontractorResolverService } from '../pm-inspections/pm-inspection-subcontractor-resolver.service';
import { CapaDueDateEngine } from '../pm-corrective-actions/capa-due-date.engine';
import { RcaEngine, TaprootPathway } from './rca.engine';
export declare class PmInvestigationCapaIntegrationService {
    private readonly prisma;
    private readonly capaAuto;
    private readonly dueDate;
    private readonly rca;
    private readonly subcontractorResolver?;
    private readonly contractorDispatch?;
    constructor(prisma: PrismaService, capaAuto: PmCapaAutoGenerateService, dueDate: CapaDueDateEngine, rca: RcaEngine, subcontractorResolver?: PmInspectionSubcontractorResolverService, contractorDispatch?: PmInspectionContractorDispatchService);
    createFromRootCause(input: {
        eventId: string;
        rootCauseId: string;
        description: string;
        pathway?: TaprootPathway;
        severity?: 'low' | 'medium' | 'high' | 'critical';
        responsibleParty?: 'contractor' | 'supervisor' | 'company' | 'worker';
        actorId: number;
        linkToInspection?: boolean;
    }): Promise<{
        eventCapa: {
            id: string;
            eventId: string;
            rootCauseId: string | null;
            title: string;
            description: string | null;
            assignedUserId: number | null;
            cailEntryId: string | null;
            unifiedCorrectiveActionId: string | null;
            subcontractorCompanyId: number | null;
            status: string;
            dueAt: Date | null;
            verifiedAt: Date | null;
            createdAt: Date;
        };
        unifiedCorrectiveAction: {
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
        };
        subcontractorCompanyId: number;
        dueAt: Date;
    }>;
    buildTaprootJson(pathway: TaprootPathway, description: string, factors: string[]): {
        pathway: "equipment_failure" | "procedures" | "human_factors" | "training_gaps" | "management_systems" | "environmental_conditions";
        label: string;
        causalFactors: string[];
        rootCauseStatement: string;
        snapCharT: {
            sequenceOfEvents: any[];
            changeAnalysis: string[];
            correctiveActions: any[];
        };
    };
}
