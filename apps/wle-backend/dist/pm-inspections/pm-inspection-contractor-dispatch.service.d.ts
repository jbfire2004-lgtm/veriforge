import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { EventBusService } from '../modules/api-platform/events/event-bus.service';
export declare class PmInspectionContractorDispatchService {
    private readonly prisma;
    private readonly notifications?;
    private readonly eventBus?;
    constructor(prisma: PrismaService, notifications?: NotificationsService, eventBus?: EventBusService);
    dispatchForCorrectiveAction(correctiveActionId: string, actorId: number, clientSyncId?: string): Promise<{
        dispatch: {
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
        };
        package: {
            correctiveActionId: string;
            title: string;
            description: string;
            severity: string;
            dueAt: string;
            evidenceRequirements: Prisma.JsonValue;
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
    acknowledge(dispatchId: string, userId: number): Promise<{
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
    complete(dispatchId: string, userId: number, proof?: {
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
    listForContractorCompany(projectId: number, companyId: number): Promise<({
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
        packageJson: Prisma.JsonValue;
        sentAt: Date | null;
        acknowledgedAt: Date | null;
        completedAt: Date | null;
        overdueAt: Date | null;
        notificationIds: Prisma.JsonValue;
        clientSyncId: string | null;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    markOverdueDispatches(): Promise<{
        marked: number;
    }>;
    private notifyContractorUsers;
}
