import { PmContractorDispatchStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { PmInspectionContractorDispatchService } from '../pm-inspections/pm-inspection-contractor-dispatch.service';
import { PmCorrectiveActionsService } from '../pm-corrective-actions/pm-corrective-actions.service';
import { PmContractorPortalAccessService, type PortalActor } from './pm-contractor-portal-access.service';
import { SafetyEcosystemEventsService } from '../pm-safety-ecosystem/safety-ecosystem-events.service';
export declare class PmContractorPortalInboxService {
    private readonly prisma;
    private readonly access;
    private readonly dispatch;
    private readonly capa;
    private readonly ecosystem?;
    constructor(prisma: PrismaService, access: PmContractorPortalAccessService, dispatch: PmInspectionContractorDispatchService, capa: PmCorrectiveActionsService, ecosystem?: SafetyEcosystemEventsService);
    listInbox(actor: PortalActor, opts?: {
        status?: PmContractorDispatchStatus;
        overdueOnly?: boolean;
    }): Promise<{
        summary: {
            total: number;
            overdue: number;
            pendingAck: number;
        };
        items: {
            inspectionId: string;
            sourcePhotos: {
                id?: string;
                dataUrl?: string;
                fileName?: string;
            }[];
            smsRiskContext: {
                id: string;
                companyId: number;
                projectId: number | null;
                entityType: import(".prisma/client").$Enums.PmSmsEntityType;
                entityId: string;
                sclState: import(".prisma/client").$Enums.PmSclState | null;
                sclTriggersJson: Prisma.JsonValue;
                sclPrecursorsJson: Prisma.JsonValue;
                sclPotentialSeverity: string | null;
                hecaInvolved: boolean;
                hecaType: import(".prisma/client").$Enums.PmSmsHecaType | null;
                hecaCategoryCode: string | null;
                hecaLibraryEntryId: string | null;
                energyTypesJson: Prisma.JsonValue;
                energyControlState: import(".prisma/client").$Enums.PmEnergyControlState | null;
                highEnergyFlag: boolean;
                missingControlsJson: Prisma.JsonValue;
                escalationScore: number;
                requiresInvestigation: boolean;
                metadataJson: Prisma.JsonValue;
                clientSyncId: string | null;
                createdAt: Date;
                updatedAt: Date;
            };
            subcontractorCompany: {
                id: number;
                name: string;
            };
            correctiveAction: {
                project: {
                    id: number;
                    name: string;
                };
                id: string;
                status: import(".prisma/client").$Enums.PmCorrectiveActionStatus;
                projectId: number;
                title: string;
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
                description: string;
                dueAt: Date;
                severityLevel: string;
            };
            id: string;
            correctiveActionId: string;
            subcontractorCompanyId: number;
            status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
            packageJson: Prisma.JsonValue;
            sentAt: Date | null;
            acknowledgedAt: Date | null;
            completedAt: Date | null;
            overdueAt: Date | null;
            notificationIds: Prisma.JsonValue;
            clientSyncId: string | null;
            createdAt: Date;
            updatedAt: Date;
        }[];
    }>;
    acknowledgeDispatch(actor: PortalActor, dispatchId: string): Promise<{
        id: string;
        correctiveActionId: string;
        subcontractorCompanyId: number;
        status: import(".prisma/client").$Enums.PmContractorDispatchStatus;
        packageJson: Prisma.JsonValue;
        sentAt: Date | null;
        acknowledgedAt: Date | null;
        completedAt: Date | null;
        overdueAt: Date | null;
        notificationIds: Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
    uploadEvidence(actor: PortalActor, dispatchId: string, body: {
        dataUrl?: string;
        storageKey?: string;
        fileName?: string;
        mimeType?: string;
        notes?: string;
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
    completeDispatch(actor: PortalActor, dispatchId: string, proof?: {
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
            evidenceRequirementsJson: Prisma.JsonValue;
            verificationRequirementsJson: Prisma.JsonValue;
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
        packageJson: Prisma.JsonValue;
        sentAt: Date | null;
        acknowledgedAt: Date | null;
        completedAt: Date | null;
        overdueAt: Date | null;
        notificationIds: Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
